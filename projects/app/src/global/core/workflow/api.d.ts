import { AppSchema } from '@libchat/global/core/app/type';
import type { ChatHistoryItemResType } from '@libchat/global/core/chat/type';
import type { RuntimeNodeItemType } from '@libchat/global/core/workflow/runtime/type';
import type { WorkflowInteractiveResponseType } from '@libchat/global/core/workflow/template/system/interactive/type';
import { StoreNodeItemType } from '@libchat/global/core/workflow/type';
import type { RuntimeEdgeItemType } from '@libchat/global/core/workflow/type/edge';
import { StoreEdgeItemType } from '@libchat/global/core/workflow/type/edge';

export type PostWorkflowDebugProps = {
  nodes: RuntimeNodeItemType[];
  edges: RuntimeEdgeItemType[];
  variables: Record<string, any>;
  appId: string;
  query?: UserChatItemValueItemType[];
  history?: ChatItemType[];
};

export type PostWorkflowDebugResponse = {
  finishedNodes: RuntimeNodeItemType[];
  finishedEdges: RuntimeEdgeItemType[];
  nextStepRunNodes: RuntimeNodeItemType[];
  flowResponses: ChatHistoryItemResType[];
  workflowInteractiveResponse?: WorkflowInteractiveResponseType;
  newVariables: Record<string, any>;
};
