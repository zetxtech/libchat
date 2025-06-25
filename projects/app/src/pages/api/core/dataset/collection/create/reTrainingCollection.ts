import { type reTrainingDatasetFileCollectionParams } from '@libchat/global/core/dataset/api';
import { createCollectionAndInsertData } from '@libchat/service/core/dataset/collection/controller';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { delCollection } from '@libchat/service/core/dataset/collection/controller';
import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nDatasetType } from '@libchat/service/support/user/audit/util';

type RetrainingCollectionResponse = {
  collectionId: string;
};

// 获取集合并处理
async function handler(
  req: ApiRequestProps<reTrainingDatasetFileCollectionParams>
): Promise<RetrainingCollectionResponse> {
  const { collectionId, ...data } = req.body;

  if (!collectionId) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  // 凭证校验
  const { collection, teamId, tmbId } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId: collectionId,
    per: WritePermissionVal
  });

  return mongoSessionRun(async (session) => {
    await delCollection({
      collections: [collection],
      session,
      delImg: false,
      delFile: false
    });

    const { collectionId } = await createCollectionAndInsertData({
      dataset: collection.dataset,
      createCollectionParams: {
        ...collection,
        ...data,
        updateTime: new Date()
      }
    });

    (async () => {
      addAuditLog({
        tmbId,
        teamId,
        event: AuditEventEnum.RETRAIN_COLLECTION,
        params: {
          collectionName: collection.name,
          datasetName: collection.dataset?.name || '',
          datasetType: getI18nDatasetType(collection.dataset?.type || '')
        }
      });
    })();

    return { collectionId };
  });
}

export default NextAPI(handler);
