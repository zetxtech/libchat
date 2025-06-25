import { chatValue2RuntimePrompt } from '@libchat/global/core/chat/adapt';
import type { NodeInputKeyEnum } from '@libchat/global/core/workflow/constants';
import { NodeOutputKeyEnum } from '@libchat/global/core/workflow/constants';
import { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';
import type {
  DispatchNodeResultType,
  ModuleDispatchProps
} from '@libchat/global/core/workflow/runtime/type';
import type {
  UserInputFormItemType,
  UserInputInteractive
} from '@libchat/global/core/workflow/template/system/interactive/type';
import { addLog } from '../../../../common/system/log';

type Props = ModuleDispatchProps<{
  [NodeInputKeyEnum.description]: string;
  [NodeInputKeyEnum.userInputForms]: UserInputFormItemType[];
}>;
type FormInputResponse = DispatchNodeResultType<{
  [DispatchNodeResponseKeyEnum.interactive]?: UserInputInteractive;
  [NodeOutputKeyEnum.formInputResult]?: Record<string, any>;
}>;

/* 
  用户输入都内容，将会以 JSON 字符串格式进入工作流，可以从 query 的 text 中获取。
*/
export const dispatchFormInput = async (props: Props): Promise<FormInputResponse> => {
  const {
    histories,
    node,
    params: { description, userInputForms },
    query,
    lastInteractive
  } = props;
  const { isEntry } = node;

  // Interactive node is not the entry node, return interactive result
  if (!isEntry || lastInteractive?.type !== 'userInput') {
    return {
      [DispatchNodeResponseKeyEnum.interactive]: {
        type: 'userInput',
        params: {
          description,
          inputForm: userInputForms
        }
      }
    };
  }

  node.isEntry = false;

  const { text } = chatValue2RuntimePrompt(query);
  const userInputVal = (() => {
    try {
      return JSON.parse(text);
    } catch (error) {
      addLog.warn('formInput error', { error });
      return {};
    }
  })();

  return {
    [DispatchNodeResponseKeyEnum.rewriteHistories]: histories.slice(0, -2), // Removes the current session record as the history of subsequent nodes
    ...userInputVal,
    [NodeOutputKeyEnum.formInputResult]: userInputVal,
    [DispatchNodeResponseKeyEnum.toolResponses]: userInputVal,
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      formInputResult: userInputVal
    }
  };
};
