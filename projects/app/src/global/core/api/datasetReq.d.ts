import {
  TrainingModeEnum,
  DatasetCollectionTypeEnum,
  DatasetTypeEnum
} from '@libchat/global/core/dataset/constants';
import { TrainingModeEnum } from '@libchat/global/core/dataset/constants';
import type { SearchTestItemType } from '@/types/core/dataset';
import { UploadChunkItemType } from '@libchat/global/core/dataset/type';
import { DatasetCollectionSchemaType } from '@libchat/global/core/dataset/type';
import { PermissionTypeEnum } from '@libchat/global/support/permission/constant';
import type { LLMModelItemType } from '@libchat/global/core/ai/model.d';
import type { PaginationProps } from '@libchat/web/common/fetch/type';

/* ===== dataset ===== */

/* ======= collections =========== */
export type GetDatasetCollectionsProps = PaginationProps<{
  datasetId: string;
  parentId?: string;
  searchText?: string;
  filterTags?: string[];
  simple?: boolean;
  selectFolder?: boolean;
}>;

/* ==== data ===== */
