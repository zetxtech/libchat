import type { NodeInputKeyEnum } from '@libchat/global/core/workflow/constants';
import { NodeOutputKeyEnum } from '@libchat/global/core/workflow/constants';
import { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';
import {
  type DispatchNodeResultType,
  type ModuleDispatchProps
} from '@libchat/global/core/workflow/runtime/type';

type Props = ModuleDispatchProps<{
  [NodeInputKeyEnum.loopStartInput]: any;
  [NodeInputKeyEnum.loopStartIndex]: number;
}>;
type Response = DispatchNodeResultType<{
  [NodeOutputKeyEnum.loopStartInput]: any;
  [NodeOutputKeyEnum.loopStartIndex]: number;
}>;

export const dispatchLoopStart = async (props: Props): Promise<Response> => {
  const { params } = props;
  return {
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      loopInputValue: params.loopStartInput
    },
    [NodeOutputKeyEnum.loopStartInput]: params.loopStartInput,
    [NodeOutputKeyEnum.loopStartIndex]: params.loopStartIndex
  };
};
