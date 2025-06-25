import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { MongoChatInputGuide } from '@libchat/service/core/chat/inputGuide/schema';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';

export type deleteAllInputGuideBody = { appId: string };

async function handler(
  req: ApiRequestProps<deleteAllInputGuideBody, ''>,
  res: ApiResponseType<any>
) {
  const { appId } = req.body;
  await authApp({ req, appId, authToken: true, per: WritePermissionVal });

  await MongoChatInputGuide.deleteMany({
    appId
  });

  return {};
}

export default NextAPI(handler);
