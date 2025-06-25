import type { NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';
import { getGuideModule, getAppChatConfig } from '@libchat/global/core/workflow/utils';
import { getChatModelNameListByModules } from '@/service/core/app/workflow';
import type { InitChatResponse, InitTeamChatProps } from '@/global/core/chat/api.d';
import { MongoChat } from '@libchat/service/core/chat/chatSchema';
import { MongoApp } from '@libchat/service/core/app/schema';
import { AppErrEnum } from '@libchat/global/common/error/code/app';
import { authTeamSpaceToken } from '@/service/support/permission/auth/team';
import { MongoTeam } from '@libchat/service/support/user/team/teamSchema';
import { ChatErrEnum } from '@libchat/global/common/error/code/chat';
import { getAppLatestVersion } from '@libchat/service/core/app/version/controller';
import { FlowNodeTypeEnum } from '@libchat/global/core/workflow/node/constant';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@libchat/service/type/next';

async function handler(req: ApiRequestProps<InitTeamChatProps>, res: NextApiResponse) {
  let { teamId, appId, chatId, teamToken } = req.query;

  if (!teamId || !appId || !teamToken) {
    return Promise.reject('teamId, appId, teamToken are required');
  }

  const { uid } = await authTeamSpaceToken({
    teamId,
    teamToken
  });

  const [team, chat, app] = await Promise.all([
    MongoTeam.findById(teamId, 'name avatar').lean(),
    MongoChat.findOne({ teamId, appId, chatId }).lean(),
    MongoApp.findById(appId).lean()
  ]);

  if (!app) {
    return Promise.reject(AppErrEnum.unExist);
  }

  // auth chat permission
  if (chat && chat.outLinkUid !== uid) {
    return Promise.reject(ChatErrEnum.unAuthChat);
  }

  // get app and history
  const { nodes, chatConfig } = await getAppLatestVersion(app._id, app);
  const pluginInputs =
    chat?.pluginInputs ??
    nodes?.find((node) => node.flowNodeType === FlowNodeTypeEnum.pluginInput)?.inputs ??
    [];

  jsonRes<InitChatResponse>(res, {
    data: {
      chatId,
      appId,
      title: chat?.title,
      userAvatar: team?.avatar,
      variables: chat?.variables,
      app: {
        chatConfig: getAppChatConfig({
          chatConfig,
          systemConfigNode: getGuideModule(nodes),
          storeVariables: chat?.variableList,
          storeWelcomeText: chat?.welcomeText,
          isPublicFetch: false
        }),
        chatModels: getChatModelNameListByModules(nodes),
        name: app.name,
        avatar: app.avatar,
        intro: app.intro,
        type: app.type,
        pluginInputs
      }
    }
  });
}

export default NextAPI(handler);
