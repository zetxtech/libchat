import type { NextApiRequest } from 'next';
import type { CreateDatasetCollectionParams } from '@libchat/global/core/dataset/api.d';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { createOneCollection } from '@libchat/service/core/dataset/collection/controller';
import { NextAPI } from '@/service/middleware/entry';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nDatasetType } from '@libchat/service/support/user/audit/util';

async function handler(req: NextApiRequest) {
  const body = req.body as CreateDatasetCollectionParams;

  const { teamId, tmbId, dataset } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId: body.datasetId,
    per: WritePermissionVal
  });

  const { _id } = await createOneCollection({
    ...body,
    teamId,
    tmbId
  });

  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.CREATE_COLLECTION,
      params: {
        collectionName: body.name,
        datasetName: dataset.name,
        datasetType: getI18nDatasetType(dataset.type)
      }
    });
  })();

  return _id;
}

export default NextAPI(handler);
