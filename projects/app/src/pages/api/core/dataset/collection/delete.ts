import type { NextApiRequest } from 'next';
import { findCollectionAndChild } from '@libchat/service/core/dataset/collection/utils';
import { delCollection } from '@libchat/service/core/dataset/collection/controller';
import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { NextAPI } from '@/service/middleware/entry';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nDatasetType } from '@libchat/service/support/user/audit/util';

async function handler(req: NextApiRequest) {
  const { id: collectionId } = req.query as { id: string };

  if (!collectionId) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  const { teamId, collection, tmbId } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId,
    per: WritePermissionVal
  });

  // find all delete id
  const collections = await findCollectionAndChild({
    teamId,
    datasetId: collection.datasetId,
    collectionId,
    fields: '_id teamId datasetId fileId metadata'
  });

  // delete
  await mongoSessionRun((session) =>
    delCollection({
      collections,
      delImg: true,
      delFile: true,
      session
    })
  );

  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.DELETE_COLLECTION,
      params: {
        collectionName: collection.name,
        datasetName: collection.dataset?.name || '',
        datasetType: getI18nDatasetType(collection.dataset?.type || '')
      }
    });
  })();
}

export default NextAPI(handler);
