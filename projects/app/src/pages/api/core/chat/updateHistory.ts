import type { NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';
import { type UpdateHistoryProps } from '@/global/core/chat/api.d';
import { MongoChat } from '@libchat/service/core/chat/chatSchema';
import { authChatCrud } from '@/service/support/permission/auth/chat';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';

/* update chat top, custom title */
async function handler(req: ApiRequestProps<UpdateHistoryProps>, res: NextApiResponse) {
  const { appId, chatId, title, customTitle, top } = req.body;
  await authChatCrud({
    req,
    authToken: true,
    authApiKey: true,
    ...req.body,
    per: WritePermissionVal
  });

  await MongoChat.findOneAndUpdate(
    { appId, chatId },
    {
      updateTime: new Date(),
      ...(title !== undefined && { title }),
      ...(customTitle !== undefined && { customTitle }),
      ...(top !== undefined && { top })
    }
  );
  jsonRes(res);
}

export default NextAPI(handler);
