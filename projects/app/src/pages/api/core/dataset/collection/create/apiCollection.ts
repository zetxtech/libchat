import type { ApiDatasetCreateDatasetCollectionParams } from '@libchat/global/core/dataset/api.d';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { createCollectionAndInsertData } from '@libchat/service/core/dataset/collection/controller';
import { DatasetCollectionTypeEnum } from '@libchat/global/core/dataset/constants';

import { NextAPI } from '@/service/middleware/entry';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { type CreateCollectionResponse } from '@/global/core/dataset/api';
import { MongoDatasetCollection } from '@libchat/service/core/dataset/collection/schema';
import { DatasetErrEnum } from '@libchat/global/common/error/code/dataset';
import type { ApiRequestProps } from '@libchat/service/type/next';
import { getApiDatasetRequest } from '@libchat/service/core/dataset/apiDataset';

async function handler(
  req: ApiRequestProps<ApiDatasetCreateDatasetCollectionParams>
): CreateCollectionResponse {
  const { name, apiFileId, customPdfParse, ...body } = req.body;

  const { teamId, tmbId, dataset } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId: body.datasetId,
    per: WritePermissionVal
  });

  // Auth same apiFileId
  const storeCol = await MongoDatasetCollection.findOne(
    {
      teamId,
      datasetId: dataset._id,
      apiFileId
    },
    '_id'
  ).lean();

  if (storeCol) {
    return Promise.reject(DatasetErrEnum.sameApiCollection);
  }

  const fileDetail = await (
    await getApiDatasetRequest(dataset.apiDatasetServer)
  ).getFileDetail({
    apiFileId
  });

  const { collectionId, insertResults } = await createCollectionAndInsertData({
    dataset,
    createCollectionParams: {
      ...body,
      teamId,
      tmbId,
      type: DatasetCollectionTypeEnum.apiFile,
      name: fileDetail.name || name,
      apiFileId,
      metadata: {
        relatedImgId: apiFileId
      },
      customPdfParse
    }
  });

  return { collectionId, results: insertResults };
}

export default NextAPI(handler);
