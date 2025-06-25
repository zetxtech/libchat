import type {
  AIChatItemValueItemType,
  ChatHistoryItemResType,
  ToolRunResponseItemType
} from '@libchat/global/core/chat/type';
import { ChatItemValueItemType } from '@libchat/global/core/chat/type';
import type {
  DispatchNodeResponseKeyEnum,
  SseResponseEventEnum
} from '@libchat/global/core/workflow/runtime/constants';
import type { RuntimeNodeItemType } from '@libchat/global/core/workflow/runtime/type';
import type { WorkflowInteractiveResponseType } from '@libchat/global/core/workflow/template/system/interactive/type';
import type { RuntimeEdgeItemType } from '@libchat/global/core/workflow/type/edge';
import type { ChatNodeUsageType } from '@libchat/global/support/wallet/bill/type';

export type DispatchFlowResponse = {
  flowResponses: ChatHistoryItemResType[];
  flowUsages: ChatNodeUsageType[];
  debugResponse: {
    finishedNodes: RuntimeNodeItemType[];
    finishedEdges: RuntimeEdgeItemType[];
    nextStepRunNodes: RuntimeNodeItemType[];
  };
  workflowInteractiveResponse?: WorkflowInteractiveResponseType;
  [DispatchNodeResponseKeyEnum.toolResponses]: ToolRunResponseItemType;
  [DispatchNodeResponseKeyEnum.assistantResponses]: AIChatItemValueItemType[];
  [DispatchNodeResponseKeyEnum.runTimes]: number;
  [DispatchNodeResponseKeyEnum.memories]?: Record<string, any>;
  [DispatchNodeResponseKeyEnum.newVariables]: Record<string, string>;
  durationSeconds: number;
};

export type WorkflowResponseType = ({
  write,
  event,
  data,
  stream
}: {
  write?: ((text: string) => void) | undefined;
  event: SseResponseEventEnum;
  data: Record<string, any>;
  stream?: boolean | undefined;
}) => void;
