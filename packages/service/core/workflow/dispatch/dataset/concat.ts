import type { SearchDataResponseItemType } from '@libchat/global/core/dataset/type';
import type {
  DispatchNodeResultType,
  ModuleDispatchProps
} from '@libchat/global/core/workflow/runtime/type';
import type { NodeInputKeyEnum } from '@libchat/global/core/workflow/constants';
import { NodeOutputKeyEnum } from '@libchat/global/core/workflow/constants';
import { datasetSearchResultConcat } from '@libchat/global/core/dataset/search/utils';
import { filterSearchResultsByMaxChars } from '../../utils';
import { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';

type DatasetConcatProps = ModuleDispatchProps<
  {
    [NodeInputKeyEnum.datasetMaxTokens]: number;
  } & { [key: string]: SearchDataResponseItemType[] }
>;
type DatasetConcatResponse = DispatchNodeResultType<{
  [NodeOutputKeyEnum.datasetQuoteQA]: SearchDataResponseItemType[];
}>;

export async function dispatchDatasetConcat(
  props: DatasetConcatProps
): Promise<DatasetConcatResponse> {
  const {
    params: { limit = 5000, ...quoteMap }
  } = props as DatasetConcatProps;

  const quoteList = Object.values(quoteMap).filter((list) => Array.isArray(list));

  const rrfConcatResults = datasetSearchResultConcat(
    quoteList.map((list) => ({
      k: 60,
      list
    }))
  );

  return {
    [NodeOutputKeyEnum.datasetQuoteQA]: await filterSearchResultsByMaxChars(
      rrfConcatResults,
      limit
    ),
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      concatLength: rrfConcatResults.length
    }
  };
}
