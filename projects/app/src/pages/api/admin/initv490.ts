import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { type NextApiRequest, type NextApiResponse } from 'next';
import { MongoDatasetCollection } from '@libchat/service/core/dataset/collection/schema';
import { DatasetCollectionDataProcessModeEnum } from '@libchat/global/core/dataset/constants';
import { MongoDatasetData } from '@libchat/service/core/dataset/data/schema';
import { DatasetDataIndexTypeEnum } from '@libchat/global/core/dataset/data/constants';
import { PgClient } from '@libchat/service/common/vectorDB/pg/controller';
import { PG_ADDRESS } from '@libchat/service/common/vectorDB/constants';

// 所有 trainingType=auto 的 collection，都改成 trainingType=chunk
const updateCollections = async () => {
  await MongoDatasetCollection.updateMany(
    {
      trainingType: DatasetCollectionDataProcessModeEnum.auto
    },
    {
      $set: {
        trainingType: DatasetCollectionDataProcessModeEnum.chunk,
        autoIndexes: true
      }
    }
  );
};
const updateData = async () => {
  await MongoDatasetData.updateMany({}, [
    {
      $set: {
        indexes: {
          $map: {
            input: '$indexes',
            as: 'index',
            in: {
              $mergeObjects: [
                '$$index',
                {
                  type: {
                    $cond: {
                      if: { $eq: ['$$index.defaultIndex', true] },
                      then: DatasetDataIndexTypeEnum.default,
                      else: DatasetDataIndexTypeEnum.custom
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]);
};
const upgradePgVector = async () => {
  if (!PG_ADDRESS) return;
  await PgClient.query(`
      ALTER EXTENSION vector UPDATE;
    `);
};

async function handler(req: NextApiRequest, _res: NextApiResponse) {
  await authCert({ req, authRoot: true });

  console.log('升级 PG vector 插件');
  await upgradePgVector();

  console.log('变更所有 collection 的 trainingType 为 chunk');
  await updateCollections();

  console.log(
    "更新所有 data 的 index, autoIndex=true 的，增加type='default'，其他的增加 type='custom'"
  );
  await updateData();
  return { success: true };
}

export default NextAPI(handler);
