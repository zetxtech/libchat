/* 
    Get one dataset collection detail
*/
import type { NextApiRequest } from 'next';
import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { BucketNameEnum } from '@libchat/global/common/file/constants';
import { getFileById } from '@libchat/service/common/file/gridfs/controller';
import { getCollectionSourceData } from '@libchat/global/core/dataset/collection/utils';
import { NextAPI } from '@/service/middleware/entry';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { type DatasetCollectionItemType } from '@libchat/global/core/dataset/type';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { collectionTagsToTagLabel } from '@libchat/service/core/dataset/collection/utils';
import { getVectorCountByCollectionId } from '@libchat/service/common/vectorDB/controller';
import { MongoDatasetTraining } from '@libchat/service/core/dataset/training/schema';
import { readFromSecondary } from '@libchat/service/common/mongo/utils';

async function handler(req: NextApiRequest): Promise<DatasetCollectionItemType> {
  const { id } = req.query as { id: string };

  if (!id) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  // 凭证校验
  const { collection, permission } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId: id,
    per: ReadPermissionVal
  });

  // get file
  const [file, indexAmount, errorCount] = await Promise.all([
    collection?.fileId
      ? await getFileById({ bucketName: BucketNameEnum.dataset, fileId: collection.fileId })
      : undefined,
    getVectorCountByCollectionId(collection.teamId, collection.datasetId, collection._id),
    MongoDatasetTraining.countDocuments(
      {
        teamId: collection.teamId,
        datasetId: collection.datasetId,
        collectionId: id,
        errorMsg: { $exists: true },
        retryCount: { $lte: 0 }
      },
      readFromSecondary
    )
  ]);

  return {
    ...collection,
    indexAmount: indexAmount ?? 0,
    ...getCollectionSourceData(collection),
    tags: await collectionTagsToTagLabel({
      datasetId: collection.datasetId,
      tags: collection.tags
    }),
    permission,
    file,
    errorCount
  };
}

export default NextAPI(handler);
