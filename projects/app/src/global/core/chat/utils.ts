import { ChatRoleEnum } from '@libchat/global/core/chat/constants';
import { type ChatHistoryItemResType, type ChatItemType } from '@libchat/global/core/chat/type';
import { type SearchDataResponseItemType } from '@libchat/global/core/dataset/type';
import { FlowNodeTypeEnum } from '@libchat/global/core/workflow/node/constant';

export const isLLMNode = (item: ChatHistoryItemResType) =>
  item.moduleType === FlowNodeTypeEnum.chatNode || item.moduleType === FlowNodeTypeEnum.tools;

export function transformPreviewHistories(
  histories: ChatItemType[],
  responseDetail: boolean
): ChatItemType[] {
  return histories.map((item) => {
    return {
      ...addStatisticalDataToHistoryItem(item),
      responseData: undefined,
      ...(responseDetail ? {} : { totalQuoteList: undefined })
    };
  });
}

export const getFlatAppResponses = (res: ChatHistoryItemResType[]): ChatHistoryItemResType[] => {
  return res
    .map((item) => {
      return [
        item,
        ...getFlatAppResponses(item.pluginDetail || []),
        ...getFlatAppResponses(item.toolDetail || []),
        ...getFlatAppResponses(item.loopDetail || [])
      ];
    })
    .flat();
};
export function addStatisticalDataToHistoryItem(historyItem: ChatItemType) {
  if (historyItem.obj !== ChatRoleEnum.AI) return historyItem;
  if (historyItem.totalQuoteList !== undefined) return historyItem;
  if (!historyItem.responseData) return historyItem;

  // Flat children
  const flatResData = getFlatAppResponses(historyItem.responseData || []);

  return {
    ...historyItem,
    llmModuleAccount: flatResData.filter(isLLMNode).length,
    totalQuoteList: flatResData
      .filter((item) => item.moduleType === FlowNodeTypeEnum.datasetSearchNode)
      .map((item) => item.quoteList)
      .flat()
      .filter(Boolean) as SearchDataResponseItemType[],
    historyPreviewLength: flatResData.find(isLLMNode)?.historyPreview?.length
  };
}
