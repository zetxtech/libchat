import { NextAPI } from '@/service/middleware/entry';
import { type DatasetTrainingSchemaType } from '@libchat/global/core/dataset/type';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { parsePaginationRequest } from '@libchat/service/common/api/pagination';
import { readFromSecondary } from '@libchat/service/common/mongo/utils';
import { MongoDatasetTraining } from '@libchat/service/core/dataset/training/schema';
import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { type PaginationProps, type PaginationResponse } from '@libchat/web/common/fetch/type';

export type getTrainingErrorBody = PaginationProps<{
  collectionId: string;
}>;

export type getTrainingErrorResponse = PaginationResponse<DatasetTrainingSchemaType>;

async function handler(req: ApiRequestProps<getTrainingErrorBody, {}>) {
  const { collectionId } = req.body;
  const { offset, pageSize } = parsePaginationRequest(req);

  const { collection } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId,
    per: ReadPermissionVal
  });

  const match = {
    teamId: collection.teamId,
    datasetId: collection.datasetId,
    collectionId: collection._id,
    errorMsg: { $exists: true }
  };

  const [errorList, total] = await Promise.all([
    MongoDatasetTraining.find(match, undefined, {
      ...readFromSecondary
    })
      .skip(offset)
      .limit(pageSize)
      .lean(),
    MongoDatasetTraining.countDocuments(match, { ...readFromSecondary })
  ]);

  return {
    list: errorList,
    total
  };
}

export default NextAPI(handler);
