import type { NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';
import { MongoChat } from '@libchat/service/core/chat/chatSchema';
import { MongoChatItem } from '@libchat/service/core/chat/chatItemSchema';
import { type DelHistoryProps } from '@/global/core/chat/api';
import { authChatCrud } from '@/service/support/permission/auth/chat';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { deleteChatFiles } from '@libchat/service/core/chat/controller';

/* clear chat history */
async function handler(req: ApiRequestProps<{}, DelHistoryProps>, res: NextApiResponse) {
  const { appId, chatId } = req.query;

  await authChatCrud({
    req,
    authToken: true,
    authApiKey: true,
    ...req.query
  });

  await deleteChatFiles({ chatIdList: [chatId] });
  await mongoSessionRun(async (session) => {
    await MongoChatItem.deleteMany(
      {
        appId,
        chatId
      },
      { session }
    );
    await MongoChat.deleteOne(
      {
        appId,
        chatId
      },
      { session }
    );
  });

  jsonRes(res);
}

export default NextAPI(handler);
