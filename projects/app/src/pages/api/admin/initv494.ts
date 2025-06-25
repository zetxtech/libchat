import { NextAPI } from '@/service/middleware/entry';
import { retryFn } from '@libchat/global/common/system/utils';
import { DatasetTypeEnum } from '@libchat/global/core/dataset/constants';
import { MongoDatasetCollection } from '@libchat/service/core/dataset/collection/schema';
import { MongoDataset } from '@libchat/service/core/dataset/schema';
import { upsertWebsiteSyncJobScheduler } from '@libchat/service/core/dataset/websiteSync';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { addHours } from 'date-fns';
import { type NextApiRequest, type NextApiResponse } from 'next';

const initWebsiteSyncData = async () => {
  // find out all website dataset
  const datasets = await MongoDataset.find({ type: DatasetTypeEnum.websiteDataset }).lean();

  console.log('更新站点同步的定时器');
  // Add scheduler for all website dataset
  await Promise.all(
    datasets.map((dataset) => {
      if (dataset.autoSync) {
        // 随机生成一个往后 1～24 小时的时间
        const time = addHours(new Date(), Math.floor(Math.random() * 23) + 1);
        return retryFn(() =>
          upsertWebsiteSyncJobScheduler({ datasetId: String(dataset._id) }, time.getTime())
        );
      }
    })
  );

  console.log('移除站点同步集合的定时器');
  // Remove all nextSyncTime
  await retryFn(() =>
    MongoDatasetCollection.updateMany(
      {
        teamId: datasets.map((dataset) => dataset.teamId),
        datasetId: datasets.map((dataset) => dataset._id)
      },
      {
        $unset: {
          nextSyncTime: 1
        }
      }
    )
  );
};
async function handler(req: NextApiRequest, _res: NextApiResponse) {
  await authCert({ req, authRoot: true });

  await initWebsiteSyncData();

  return { success: true };
}

export default NextAPI(handler);
