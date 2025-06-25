import { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';
import type { ModuleDispatchProps } from '@libchat/global/core/workflow/runtime/type';
import { type DispatchNodeResultType } from '@libchat/global/core/workflow/runtime/type';

export type AnswerProps = ModuleDispatchProps<{}>;
export type AnswerResponse = DispatchNodeResultType<{}>;

export const dispatchStopToolCall = (props: Record<string, any>): AnswerResponse => {
  return {
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      toolStop: true
    }
  };
};
