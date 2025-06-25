import {
  DispatchNodeResponseKeyEnum,
  SseResponseEventEnum
} from '@libchat/global/core/workflow/runtime/constants';
import { textAdaptGptResponse } from '@libchat/global/core/workflow/runtime/utils';
import type { ModuleDispatchProps } from '@libchat/global/core/workflow/runtime/type';
import { NodeOutputKeyEnum } from '@libchat/global/core/workflow/constants';
import { type DispatchNodeResultType } from '@libchat/global/core/workflow/runtime/type';
export type AnswerProps = ModuleDispatchProps<{
  text: string;
}>;
export type AnswerResponse = DispatchNodeResultType<{
  [NodeOutputKeyEnum.answerText]: string;
}>;

export const dispatchAnswer = (props: Record<string, any>): AnswerResponse => {
  const {
    workflowStreamResponse,
    params: { text = '' }
  } = props as AnswerProps;

  const formatText = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
  const responseText = `\n${formatText}`;

  workflowStreamResponse?.({
    event: SseResponseEventEnum.fastAnswer,
    data: textAdaptGptResponse({
      text: responseText
    })
  });

  return {
    [NodeOutputKeyEnum.answerText]: responseText,
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      textOutput: formatText
    }
  };
};
