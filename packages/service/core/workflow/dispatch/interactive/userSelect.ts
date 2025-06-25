import { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';
import type {
  DispatchNodeResultType,
  ModuleDispatchProps
} from '@libchat/global/core/workflow/runtime/type';
import type { NodeInputKeyEnum } from '@libchat/global/core/workflow/constants';
import { NodeOutputKeyEnum } from '@libchat/global/core/workflow/constants';
import { getHandleId } from '@libchat/global/core/workflow/utils';
import type {
  UserSelectInteractive,
  UserSelectOptionItemType
} from '@libchat/global/core/workflow/template/system/interactive/type';
import { chatValue2RuntimePrompt } from '@libchat/global/core/chat/adapt';

type Props = ModuleDispatchProps<{
  [NodeInputKeyEnum.description]: string;
  [NodeInputKeyEnum.userSelectOptions]: UserSelectOptionItemType[];
}>;
type UserSelectResponse = DispatchNodeResultType<{
  [NodeOutputKeyEnum.answerText]?: string;
  [DispatchNodeResponseKeyEnum.interactive]?: UserSelectInteractive;
  [NodeOutputKeyEnum.selectResult]?: string;
}>;

export const dispatchUserSelect = async (props: Props): Promise<UserSelectResponse> => {
  const {
    histories,
    node,
    params: { description, userSelectOptions },
    query,
    lastInteractive
  } = props;
  const { nodeId, isEntry } = node;

  // Interactive node is not the entry node, return interactive result
  if (!isEntry || lastInteractive?.type !== 'userSelect') {
    return {
      [DispatchNodeResponseKeyEnum.interactive]: {
        type: 'userSelect',
        params: {
          description,
          userSelectOptions
        }
      }
    };
  }

  node.isEntry = false;

  const { text: userSelectedVal } = chatValue2RuntimePrompt(query);

  // Error status
  if (userSelectedVal === undefined) {
    return {
      [DispatchNodeResponseKeyEnum.skipHandleId]: userSelectOptions.map((item) =>
        getHandleId(nodeId, 'source', item.value)
      )
    };
  }

  return {
    [DispatchNodeResponseKeyEnum.rewriteHistories]: histories.slice(0, -2), // Removes the current session record as the history of subsequent nodes
    [DispatchNodeResponseKeyEnum.skipHandleId]: userSelectOptions
      .filter((item) => item.value !== userSelectedVal)
      .map((item: any) => getHandleId(nodeId, 'source', item.key)),
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      userSelectResult: userSelectedVal
    },
    [DispatchNodeResponseKeyEnum.toolResponses]: userSelectedVal,
    [NodeOutputKeyEnum.selectResult]: userSelectedVal
  };
};
