import type {
  ChatCompletionMessageParam,
  CompletionFinishReason
} from '@libchat/global/core/ai/type';
import type { NodeInputKeyEnum } from '@libchat/global/core/workflow/constants';
import { NodeOutputKeyEnum } from '@libchat/global/core/workflow/constants';
import type {
  ModuleDispatchProps,
  DispatchNodeResponseType
} from '@libchat/global/core/workflow/runtime/type';
import type { RuntimeNodeItemType } from '@libchat/global/core/workflow/runtime/type';
import { ChatNodeUsageType } from '@libchat/global/support/wallet/bill/type';
import type { DispatchFlowResponse } from '../../type.d';
import type { AIChatItemValueItemType } from '@libchat/global/core/chat/type';
import { ChatItemValueItemType } from '@libchat/global/core/chat/type';
import type { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';
import type { WorkflowInteractiveResponseType } from '@libchat/global/core/workflow/template/system/interactive/type';
import type { LLMModelItemType } from '@libchat/global/core/ai/model';
import type { JSONSchemaInputType } from '@libchat/global/core/app/jsonschema';

export type DispatchToolModuleProps = ModuleDispatchProps<{
  [NodeInputKeyEnum.history]?: ChatItemType[];
  [NodeInputKeyEnum.userChatInput]: string;

  [NodeInputKeyEnum.fileUrlList]?: string[];
  [NodeInputKeyEnum.aiModel]: string;
  [NodeInputKeyEnum.aiSystemPrompt]: string;
  [NodeInputKeyEnum.aiChatTemperature]: number;
  [NodeInputKeyEnum.aiChatMaxToken]: number;
  [NodeInputKeyEnum.aiChatVision]?: boolean;
  [NodeInputKeyEnum.aiChatReasoning]?: boolean;
  [NodeInputKeyEnum.aiChatTopP]?: number;
  [NodeInputKeyEnum.aiChatStopSign]?: string;
  [NodeInputKeyEnum.aiChatResponseFormat]?: string;
  [NodeInputKeyEnum.aiChatJsonSchema]?: string;
}> & {
  messages: ChatCompletionMessageParam[];
  toolNodes: ToolNodeItemType[];
  toolModel: LLMModelItemType;
  interactiveEntryToolParams?: WorkflowInteractiveResponseType['toolParams'];
};

export type RunToolResponse = {
  dispatchFlowResponse: DispatchFlowResponse[];
  toolNodeInputTokens: number;
  toolNodeOutputTokens: number;
  completeMessages?: ChatCompletionMessageParam[];
  assistantResponses?: AIChatItemValueItemType[];
  toolWorkflowInteractiveResponse?: WorkflowInteractiveResponseType;
  [DispatchNodeResponseKeyEnum.runTimes]: number;
  finish_reason?: CompletionFinishReason;
};
export type ToolNodeItemType = RuntimeNodeItemType & {
  toolParams: RuntimeNodeItemType['inputs'];
  jsonSchema?: JSONSchemaInputType;
};
