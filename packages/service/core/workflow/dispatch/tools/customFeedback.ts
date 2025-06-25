import {
  DispatchNodeResponseKeyEnum,
  SseResponseEventEnum
} from '@libchat/global/core/workflow/runtime/constants';
import type { ModuleDispatchProps } from '@libchat/global/core/workflow/runtime/type';
import type { NodeInputKeyEnum } from '@libchat/global/core/workflow/constants';
import { type DispatchNodeResultType } from '@libchat/global/core/workflow/runtime/type';
import { addCustomFeedbacks } from '../../../chat/controller';
import { textAdaptGptResponse } from '@libchat/global/core/workflow/runtime/utils';

type Props = ModuleDispatchProps<{
  [NodeInputKeyEnum.textareaInput]: string;
}>;
type Response = DispatchNodeResultType<{}>;

export const dispatchCustomFeedback = (props: Record<string, any>): Response => {
  const {
    runningAppInfo: { id: appId },
    chatId,
    responseChatItemId: dataId,
    stream,
    workflowStreamResponse,
    params: { system_textareaInput: feedbackText = '' }
  } = props as Props;

  setTimeout(() => {
    addCustomFeedbacks({
      appId,
      chatId,
      dataId,
      feedbacks: [feedbackText]
    });
  }, 60000);

  if (stream) {
    if (!chatId || !dataId) {
      workflowStreamResponse?.({
        event: SseResponseEventEnum.fastAnswer,
        data: textAdaptGptResponse({
          text: `\n\n**自定义反馈成功: (仅调试模式下展示该内容)**: "${feedbackText}"\n\n`
        })
      });
    }
  }

  return {
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      textOutput: feedbackText
    }
  };
};
