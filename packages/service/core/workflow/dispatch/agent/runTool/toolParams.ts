import { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';
import type { ModuleDispatchProps } from '@libchat/global/core/workflow/runtime/type';
import { type DispatchNodeResultType } from '@libchat/global/core/workflow/runtime/type';

export type Props = ModuleDispatchProps<{}>;
export type Response = DispatchNodeResultType<{}>;

export const dispatchToolParams = (props: Props): Response => {
  const { params } = props;

  return {
    ...params,
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      toolParamsResult: params
    }
  };
};
