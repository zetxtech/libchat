import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { MongoChatInputGuide } from '@libchat/service/core/chat/inputGuide/schema';
import { authCert } from '@libchat/service/support/permission/auth/common';

export type countChatInputGuideTotalQuery = { appId: string };

export type countChatInputGuideTotalBody = {};

export type countChatInputGuideTotalResponse = { total: number };

async function handler(
  req: ApiRequestProps<countChatInputGuideTotalBody, countChatInputGuideTotalQuery>,
  res: ApiResponseType<any>
): Promise<countChatInputGuideTotalResponse> {
  await authCert({ req, authToken: true });

  const appId = req.query.appId;
  if (!appId) {
    return {
      total: 0
    };
  }

  return {
    total: await MongoChatInputGuide.countDocuments({ appId })
  };
}

export default NextAPI(handler);
