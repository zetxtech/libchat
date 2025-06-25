import { ManagePermissionVal } from '@libchat/global/support/permission/constant';
import { MongoDatasetTraining } from '@libchat/service/core/dataset/training/schema';
import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@libchat/service/type/next';

export type deleteTrainingDataBody = {
  datasetId: string;
  collectionId: string;
  dataId: string;
};

export type deleteTrainingDataQuery = {};

export type deleteTrainingDataResponse = {};

async function handler(
  req: ApiRequestProps<deleteTrainingDataBody, deleteTrainingDataQuery>
): Promise<deleteTrainingDataResponse> {
  const { datasetId, collectionId, dataId } = req.body;

  const { teamId } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId,
    per: ManagePermissionVal
  });

  await MongoDatasetTraining.deleteOne({
    teamId,
    datasetId,
    _id: dataId
  });

  return {};
}

export default NextAPI(handler);
