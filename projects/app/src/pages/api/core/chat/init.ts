import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { getGuideModule, getAppChatConfig } from '@libchat/global/core/workflow/utils';
import { getChatModelNameListByModules } from '@/service/core/app/workflow';
import type { InitChatProps, InitChatResponse } from '@/global/core/chat/api.d';
import { MongoChat } from '@libchat/service/core/chat/chatSchema';
import { ChatErrEnum } from '@libchat/global/common/error/code/chat';
import { getAppLatestVersion } from '@libchat/service/core/app/version/controller';
import { NextAPI } from '@/service/middleware/entry';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { FlowNodeTypeEnum } from '@libchat/global/core/workflow/node/constant';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<InitChatResponse | void> {
  let { appId, chatId } = req.query as InitChatProps;

  if (!appId) {
    return jsonRes(res, {
      code: 501,
      message: "You don't have an app yet"
    });
  }

  // auth app permission
  const [{ app, tmbId }, chat] = await Promise.all([
    authApp({
      req,
      authToken: true,
      authApiKey: true,
      appId,
      per: ReadPermissionVal
    }),
    chatId ? MongoChat.findOne({ appId, chatId }) : undefined
  ]);

  // auth chat permission
  if (chat && !app.permission.hasManagePer && String(tmbId) !== String(chat?.tmbId)) {
    return Promise.reject(ChatErrEnum.unAuthChat);
  }

  // get app and history
  const { nodes, chatConfig } = await getAppLatestVersion(app._id, app);
  const pluginInputs =
    chat?.pluginInputs ??
    nodes?.find((node) => node.flowNodeType === FlowNodeTypeEnum.pluginInput)?.inputs ??
    [];

  return {
    chatId,
    appId,
    title: chat?.title,
    userAvatar: undefined,
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
  };
}

export default NextAPI(handler);

export const config = {
  api: {
    responseLimit: '10mb'
  }
};
