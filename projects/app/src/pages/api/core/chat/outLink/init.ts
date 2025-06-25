import type { NextApiRequest, NextApiResponse } from 'next';
import type { InitOutLinkChatProps } from '@/global/core/chat/api.d';
import { getGuideModule, getAppChatConfig } from '@libchat/global/core/workflow/utils';
import { authOutLink } from '@/service/support/permission/auth/outLink';
import { MongoApp } from '@libchat/service/core/app/schema';
import { AppErrEnum } from '@libchat/global/common/error/code/app';
import { MongoChat } from '@libchat/service/core/chat/chatSchema';
import { ChatErrEnum } from '@libchat/global/common/error/code/chat';
import { getAppLatestVersion } from '@libchat/service/core/app/version/controller';
import { FlowNodeTypeEnum } from '@libchat/global/core/workflow/node/constant';
import { NextAPI } from '@/service/middleware/entry';
import { getRandomUserAvatar } from '@libchat/global/support/user/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { chatId, shareId, outLinkUid } = req.query as InitOutLinkChatProps;

  // auth link permission
  const { uid, appId } = await authOutLink({ shareId, outLinkUid });

  // auth app permission
  const [chat, app] = await Promise.all([
    MongoChat.findOne({ appId, chatId, shareId }).lean(),
    MongoApp.findById(appId).lean()
  ]);

  if (!app) {
    throw new Error(AppErrEnum.unExist);
  }

  // auth chat permission
  if (chat && chat.outLinkUid !== uid) {
    return Promise.reject(ChatErrEnum.unAuthChat);
  }

  const { nodes, chatConfig } = await getAppLatestVersion(app._id, app);
  const pluginInputs =
    chat?.pluginInputs ??
    nodes?.find((node) => node.flowNodeType === FlowNodeTypeEnum.pluginInput)?.inputs ??
    [];

  return {
    chatId,
    appId: app._id,
    title: chat?.title,
    userAvatar: getRandomUserAvatar(),
    variables: chat?.variables,
    app: {
      chatConfig: getAppChatConfig({
        chatConfig,
        systemConfigNode: getGuideModule(nodes),
        storeVariables: chat?.variableList,
        storeWelcomeText: chat?.welcomeText,
        isPublicFetch: false
      }),
      name: app.name,
      avatar: app.avatar,
      intro: app.intro,
      type: app.type,
      pluginInputs
    }
  };
}

export default NextAPI(handler);
