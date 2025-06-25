import type { NextApiRequest } from 'next';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { delDatasetRelevantData } from '@libchat/service/core/dataset/controller';
import { findDatasetAndAllChildren } from '@libchat/service/core/dataset/controller';
import { MongoDataset } from '@libchat/service/core/dataset/schema';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { NextAPI } from '@/service/middleware/entry';
import { OwnerPermissionVal } from '@libchat/global/support/permission/constant';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { MongoDatasetCollectionTags } from '@libchat/service/core/dataset/tag/schema';
import { removeImageByPath } from '@libchat/service/common/file/image/controller';
import { DatasetTypeEnum } from '@libchat/global/core/dataset/constants';
import { removeWebsiteSyncJobScheduler } from '@libchat/service/core/dataset/websiteSync';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nDatasetType } from '@libchat/service/support/user/audit/util';

async function handler(req: NextApiRequest) {
  const { id: datasetId } = req.query as {
    id: string;
  };

  if (!datasetId) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  // auth owner
  const { teamId, tmbId, dataset } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId,
    per: OwnerPermissionVal
  });

  const datasets = await findDatasetAndAllChildren({
    teamId,
    datasetId
  });
  const datasetIds = datasets.map((d) => d._id);

  // delete collection.tags
  await MongoDatasetCollectionTags.deleteMany({
    teamId,
    datasetId: { $in: datasetIds }
  });

  // Remove cron job
  await Promise.all(
    datasets.map((dataset) => {
      if (dataset.type === DatasetTypeEnum.websiteDataset)
        return removeWebsiteSyncJobScheduler(dataset._id);
    })
  );

  // delete all dataset.data and pg data
  await mongoSessionRun(async (session) => {
    // delete dataset data
    await delDatasetRelevantData({ datasets, session });

    // delete dataset
    await MongoDataset.deleteMany(
      {
        _id: { $in: datasetIds }
      },
      { session }
    );

    for await (const dataset of datasets) {
      await removeImageByPath(dataset.avatar, session);
    }
  });

  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.DELETE_DATASET,
      params: {
        datasetName: dataset.name,
        datasetType: getI18nDatasetType(dataset.type)
      }
    });
  })();
}

export default NextAPI(handler);
