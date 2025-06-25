import type { NextApiRequest } from 'next';
import type { LinkCreateDatasetCollectionParams } from '@libchat/global/core/dataset/api.d';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { createCollectionAndInsertData } from '@libchat/service/core/dataset/collection/controller';
import { DatasetCollectionTypeEnum } from '@libchat/global/core/dataset/constants';
import { NextAPI } from '@/service/middleware/entry';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { type CreateCollectionResponse } from '@/global/core/dataset/api';

async function handler(req: NextApiRequest): CreateCollectionResponse {
  const { link, ...body } = req.body as LinkCreateDatasetCollectionParams;

  const { teamId, tmbId, dataset } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId: body.datasetId,
    per: WritePermissionVal
  });

  const { collectionId, insertResults } = await createCollectionAndInsertData({
    dataset,
    createCollectionParams: {
      ...body,
      name: link,
      teamId,
      tmbId,
      type: DatasetCollectionTypeEnum.link,
      metadata: {
        relatedImgId: link,
        webPageSelector: body?.metadata?.webPageSelector
      },
      rawLink: link
    }
  });

  return {
    collectionId,
    results: insertResults
  };
}

export default NextAPI(handler);
