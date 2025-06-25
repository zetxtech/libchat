import { NextAPI } from '@/service/middleware/entry';
import { DatasetErrEnum } from '@libchat/global/common/error/code/dataset';
import type { ParentIdType } from '@libchat/global/common/parentFolder/type';
import type {
  ApiDatasetDetailResponse,
  ApiDatasetServerType
} from '@libchat/global/core/dataset/apiDataset/type';
import { getApiDatasetRequest } from '@libchat/service/core/dataset/apiDataset';
import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { ManagePermissionVal } from '@libchat/global/support/permission/constant';

export type GetApiDatasetPathQuery = {};

export type GetApiDatasetPathBody = {
  datasetId?: string;
  parentId?: ParentIdType;
  apiDatasetServer?: ApiDatasetServerType;
};

export type GetApiDatasetPathResponse = string;

const getFullPath = async (
  currentId: string,
  getFileDetail: ({ apiFileId }: { apiFileId: string }) => Promise<ApiDatasetDetailResponse>
): Promise<string> => {
  const response = await getFileDetail({ apiFileId: currentId });

  if (!response) {
    return '';
  }

  if (response.parentId && response.parentId !== null) {
    const parentPath = await getFullPath(response.parentId, getFileDetail);
    return `${parentPath}/${response.name}`;
  }

  return `/${response.name}`;
};

async function handler(
  req: ApiRequestProps<GetApiDatasetPathBody, any>,
  res: ApiResponseType<GetApiDatasetPathResponse>
): Promise<GetApiDatasetPathResponse> {
  const { datasetId, parentId } = req.body;
  if (!parentId) return '';

  const apiDatasetServer = await (async () => {
    if (datasetId) {
      const { dataset } = await authDataset({
        req,
        authToken: true,
        authApiKey: true,
        per: ManagePermissionVal,
        datasetId
      });

      return dataset.apiDatasetServer;
    } else {
      await authCert({ req, authToken: true });

      return req.body.apiDatasetServer;
    }
  })();

  const apiDataset = await getApiDatasetRequest(apiDatasetServer);

  if (!apiDataset?.getFileDetail) {
    return Promise.reject(DatasetErrEnum.noApiServer);
  }

  return await getFullPath(parentId, apiDataset.getFileDetail);
}

export default NextAPI(handler);
