import { NodeInputKeyEnum } from '@libchat/global/core/workflow/constants';
import type { StoreNodeItemType } from '@libchat/global/core/workflow/type/node.d';
import { getLLMModel } from '@libchat/service/core/ai/model';

export const getChatModelNameListByModules = (nodes: StoreNodeItemType[]): string[] => {
  const modelList = nodes
    .map((item) => {
      const model = item.inputs.find((input) => input.key === NodeInputKeyEnum.aiModel)?.value;
      return model ? getLLMModel(model)?.name : '';
    })
    .filter(Boolean);

  return Array.from(new Set(modelList));
};
