import type { NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';
import { MongoChatItem } from '@libchat/service/core/chat/chatItemSchema';
import { authChatCrud } from '@/service/support/permission/auth/chat';
import type { DeleteChatItemProps } from '@/global/core/chat/api.d';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@libchat/service/type/next';

async function handler(req: ApiRequestProps<{}, DeleteChatItemProps>, res: NextApiResponse) {
  const { appId, chatId, contentId } = req.query;

  if (!contentId || !chatId) {
    return Promise.reject('contentId or chatId is empty');
  }

  await authChatCrud({
    req,
    authToken: true,
    authApiKey: true,
    ...req.query
  });

  await MongoChatItem.deleteOne({
    appId,
    chatId,
    dataId: contentId
  });

  return;
}

export default NextAPI(handler);
