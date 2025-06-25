import type {
  PushDatasetDataChunkProps,
  PushDatasetDataResponse
} from '@libchat/global/core/dataset/api';
import type {
  APIFileServer,
  FeishuServer,
  YuqueServer
} from '@libchat/global/core/dataset/apiDataset/type';
import type {
  DatasetSearchModeEnum,
  DatasetTypeEnum
} from '@libchat/global/core/dataset/constants';
import {
  DatasetSourceReadTypeEnum,
  ImportDataSourceEnum,
  TrainingModeEnum
} from '@libchat/global/core/dataset/constants';
import type { SearchDataResponseItemType } from '@libchat/global/core/dataset/type';
import type { ApiDatasetServerType } from '@libchat/global/core/dataset/apiDataset/type';
import { DatasetDataIndexItemType } from '@libchat/global/core/dataset/type';
import type { NodeInputKeyEnum } from '@libchat/global/core/workflow/constants';
import { PermissionValueType } from '@libchat/global/support/permission/type';

/* ================= dataset ===================== */
export type CreateDatasetParams = {
  parentId?: string;
  type: DatasetTypeEnum;
  name: string;
  intro: string;
  avatar: string;
  vectorModel?: string;
  agentModel?: string;
  vlmModel?: string;
  apiDatasetServer?: ApiDatasetServerType;
};

export type RebuildEmbeddingProps = {
  datasetId: string;
  vectorModel: string;
};

/* ================= collection ===================== */
export type CreateCollectionResponse = Promise<{
  collectionId: string;
  results: PushDatasetDataResponse;
}>;

/* ================= data ===================== */
export type InsertOneDatasetDataProps = PushDatasetDataChunkProps & {
  collectionId: string;
};

/* -------------- search ---------------- */
export type SearchTestProps = {
  datasetId: string;
  text: string;
  [NodeInputKeyEnum.datasetSimilarity]?: number;
  [NodeInputKeyEnum.datasetMaxTokens]?: number;

  [NodeInputKeyEnum.datasetSearchMode]?: `${DatasetSearchModeEnum}`;
  [NodeInputKeyEnum.datasetSearchEmbeddingWeight]?: number;

  [NodeInputKeyEnum.datasetSearchUsingReRank]?: boolean;
  [NodeInputKeyEnum.datasetSearchRerankModel]?: string;
  [NodeInputKeyEnum.datasetSearchRerankWeight]?: number;

  [NodeInputKeyEnum.datasetSearchUsingExtensionQuery]?: boolean;
  [NodeInputKeyEnum.datasetSearchExtensionModel]?: string;
  [NodeInputKeyEnum.datasetSearchExtensionBg]?: string;

  [NodeInputKeyEnum.datasetDeepSearch]?: boolean;
  [NodeInputKeyEnum.datasetDeepSearchModel]?: string;
  [NodeInputKeyEnum.datasetDeepSearchMaxTimes]?: number;
  [NodeInputKeyEnum.datasetDeepSearchBg]?: string;
};
export type SearchTestResponse = {
  list: SearchDataResponseItemType[];
  duration: string;
  limit: number;
  searchMode: `${DatasetSearchModeEnum}`;
  usingReRank: boolean;
  similarity: number;
  queryExtensionModel?: string;
};

/* =========== training =========== */
