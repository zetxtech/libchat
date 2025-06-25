import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { type ChatCompletionMessageParam } from '@libchat/global/core/ai/type';
import { countGptMessagesTokens } from '@libchat/service/common/string/tiktoken';

export type tokenQuery = {};

export type tokenBody = {
  messages: ChatCompletionMessageParam[];
};

export type tokenResponse = {};

async function handler(
  req: ApiRequestProps<tokenBody, tokenQuery>,
  res: ApiResponseType<any>
): Promise<tokenResponse> {
  const start = Date.now();
  await authCert({ req, authRoot: true });

  const tokens = await countGptMessagesTokens(req.body.messages);

  return {
    tokens,
    time: Date.now() - start,

    memory: process.memoryUsage()
  };
}

export default NextAPI(handler);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    },
    responseLimit: '20mb'
  }
};
