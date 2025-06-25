import type { NextApiResponse } from 'next';
import { MongoChat } from '@libchat/service/core/chat/chatSchema';
import { MongoChatItem } from '@libchat/service/core/chat/chatItemSchema';
import { type ClearHistoriesProps } from '@/global/core/chat/api';
import { ChatSourceEnum } from '@libchat/global/core/chat/constants';
import { NextAPI } from '@/service/middleware/entry';
import { deleteChatFiles } from '@libchat/service/core/chat/controller';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { authChatCrud } from '@/service/support/permission/auth/chat';

/* clear chat history */
async function handler(req: ApiRequestProps<{}, ClearHistoriesProps>, res: NextApiResponse) {
  const { appId, shareId, outLinkUid, teamId, teamToken } = req.query;

  const {
    teamId: chatTeamId,
    tmbId,
    uid,
    authType
  } = await authChatCrud({
    req,
    authToken: true,
    authApiKey: true,
    ...req.query
  });

  const match = await (async () => {
    if (shareId && outLinkUid && authType === 'outLink') {
      return {
        teamId: chatTeamId,
        appId,
        outLinkUid: uid
      };
    }
    if (teamId && teamToken && authType === 'teamDomain') {
      return {
        teamId: chatTeamId,
        appId,
        outLinkUid: uid
      };
    }
    if (authType === 'token') {
      return {
        teamId: chatTeamId,
        tmbId,
        appId,
        source: ChatSourceEnum.online
      };
    }
    if (authType === 'apikey') {
      return {
        teamId: chatTeamId,
        appId,
        source: ChatSourceEnum.api
      };
    }

    return Promise.reject('Param are error');
  })();

  // find chatIds
  const list = await MongoChat.find(match, 'chatId').lean();
  const idList = list.map((item) => item.chatId);

  await deleteChatFiles({ chatIdList: idList });

  return mongoSessionRun(async (session) => {
    await MongoChatItem.deleteMany(
      {
        appId,
        chatId: { $in: idList }
      },
      { session }
    );
    await MongoChat.deleteMany(
      {
        appId,
        chatId: { $in: idList }
      },
      { session }
    );
  });
}

export default NextAPI(handler);
