import type { NextApiRequest, NextApiResponse } from 'next';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { pushGenerateVectorUsage } from '@/service/support/wallet/usage/push';
import { getVectorsByText } from '@libchat/service/core/ai/embedding';
import { updateApiKeyUsage } from '@libchat/service/support/openapi/tools';
import { getUsageSourceByAuthType } from '@libchat/global/support/wallet/usage/tools';
import { getEmbeddingModel } from '@libchat/service/core/ai/model';
import { checkTeamAIPoints } from '@libchat/service/support/permission/teamLimit';
import type { EmbeddingTypeEnm } from '@libchat/global/core/ai/constants';
import { NextAPI } from '@/service/middleware/entry';

type Props = {
  input: string | string[];
  model: string;
  dimensions?: number;
  billId?: string;
  type: `${EmbeddingTypeEnm}`;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  let { input, model, billId, type } = req.body as Props;

  if (!Array.isArray(input) && typeof input !== 'string') {
    throw new Error('input is nor array or string');
  }

  const query = Array.isArray(input) ? input[0] : input;

  const { teamId, tmbId, apikey, authType } = await authCert({
    req,
    authToken: true,
    authApiKey: true
  });

  await checkTeamAIPoints(teamId);

  const { tokens, vectors } = await getVectorsByText({
    input: query,
    model: getEmbeddingModel(model),
    type
  });

  res.json({
    object: 'list',
    data: vectors.map((item, index) => ({
      object: 'embedding',
      index: index,
      embedding: item
    })),
    model,
    usage: {
      prompt_tokens: tokens,
      total_tokens: tokens
    }
  });

  const { totalPoints } = pushGenerateVectorUsage({
    teamId,
    tmbId,
    inputTokens: tokens,
    model,
    billId,
    source: getUsageSourceByAuthType({ authType })
  });

  if (apikey) {
    updateApiKeyUsage({
      apikey,
      totalPoints: totalPoints
    });
  }
}

export default NextAPI(handler);
