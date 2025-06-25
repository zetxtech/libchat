import type { NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';
import { pushQuestionGuideUsage } from '@/service/support/wallet/usage/push';
import { createQuestionGuide } from '@libchat/service/core/ai/functions/createQuestionGuide';
import { authChatCrud } from '@/service/support/permission/auth/chat';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { type OutLinkChatAuthProps } from '@libchat/global/support/permission/chat';
import { getChatItems } from '@libchat/service/core/chat/controller';
import { chats2GPTMessages } from '@libchat/global/core/chat/adapt';
import { getAppLatestVersion } from '@libchat/service/core/app/version/controller';
import { getDefaultLLMModel } from '@libchat/service/core/ai/model';

export type CreateQuestionGuideParams = OutLinkChatAuthProps & {
  appId: string;
  chatId: string;
  questionGuide?: {
    open: boolean;
    model?: string;
    customPrompt?: string;
  };
};

async function handler(req: ApiRequestProps<CreateQuestionGuideParams>, res: NextApiResponse<any>) {
  const { appId, chatId, questionGuide: inputQuestionGuide } = req.body;
  const [{ tmbId, teamId }] = await Promise.all([
    authChatCrud({
      req,
      authToken: true,
      authApiKey: true,
      ...req.body
    })
  ]);

  // Auth app and get questionGuide config
  const questionGuide = await (async () => {
    if (inputQuestionGuide) {
      return inputQuestionGuide;
    }
    const { chatConfig } = await getAppLatestVersion(appId);
    return chatConfig.questionGuide;
  })();

  // Get histories
  const { histories } = await getChatItems({
    appId,
    chatId,
    offset: 0,
    limit: 6,
    field: 'obj value time'
  });
  const messages = chats2GPTMessages({ messages: histories, reserveId: false });

  const qgModel = questionGuide?.model || getDefaultLLMModel().model;

  const { result, inputTokens, outputTokens } = await createQuestionGuide({
    messages,
    model: qgModel,
    customPrompt: questionGuide?.customPrompt
  });

  pushQuestionGuideUsage({
    model: qgModel,
    inputTokens,
    outputTokens,
    teamId,
    tmbId
  });

  return result;
}

export default NextAPI(handler);
