import type { NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';

import { type GetChatSpeechProps } from '@/global/core/chat/api.d';
import { text2Speech } from '@libchat/service/core/ai/audio/speech';
import { pushAudioSpeechUsage } from '@/service/support/wallet/usage/push';
import { authChatCrud } from '@/service/support/permission/auth/chat';
import { authType2UsageSource } from '@/service/support/wallet/usage/utils';
import { getTTSModel } from '@libchat/service/core/ai/model';
import { MongoTTSBuffer } from '@libchat/service/common/buffer/tts/schema';
import { type ApiRequestProps } from '@libchat/service/type/next';

/* 
1. get tts from chatItem store
2. get tts from ai
4. push bill
*/
async function handler(req: ApiRequestProps<GetChatSpeechProps>, res: NextApiResponse) {
  try {
    const { ttsConfig, input } = req.body;

    if (!ttsConfig.model || !ttsConfig.voice) {
      throw new Error('model or voice not found');
    }

    const { teamId, tmbId, authType } = await authChatCrud({
      req,
      authToken: true,
      authApiKey: true,
      ...req.body
    });

    const ttsModel = getTTSModel(ttsConfig.model);
    const voiceData = ttsModel.voices?.find((item) => item.value === ttsConfig.voice);

    if (!voiceData) {
      throw new Error('voice not found');
    }

    const bufferId = `${ttsModel.model}-${ttsConfig.voice}`;

    /* get audio from buffer */
    const ttsBuffer = await MongoTTSBuffer.findOne(
      {
        bufferId,
        text: JSON.stringify({ text: input, speed: ttsConfig.speed })
      },
      'buffer'
    );

    if (ttsBuffer?.buffer) {
      return res.end(new Uint8Array(ttsBuffer.buffer.buffer));
    }

    /* request audio */
    await text2Speech({
      res,
      input,
      model: ttsConfig.model,
      voice: ttsConfig.voice,
      speed: ttsConfig.speed,
      onSuccess: async ({ model, buffer }) => {
        try {
          /* bill */
          pushAudioSpeechUsage({
            model: model,
            charsLength: input.length,
            tmbId,
            teamId,
            source: authType2UsageSource({ authType })
          });

          /* create buffer */
          await MongoTTSBuffer.create(
            {
              bufferId,
              text: JSON.stringify({ text: input, speed: ttsConfig.speed }),
              buffer
            },
            ttsModel.requestUrl && ttsModel.requestAuth
              ? {
                  path: ttsModel.requestUrl,
                  headers: {
                    Authorization: `Bearer ${ttsModel.requestAuth}`
                  }
                }
              : {}
          );
        } catch (error) {}
      },
      onError: (err) => {
        jsonRes(res, {
          code: 500,
          error: err
        });
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

// 不能使用 NextApiResponse
export default handler;
