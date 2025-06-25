import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { NextAPI } from '@/service/middleware/entry';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { syncCollection } from '@libchat/service/core/dataset/collection/utils';

/* 
  Collection sync
  1. Check collection type: link, api dataset collection
  2. Get collection and raw text
  3. Check whether the original text is the same: skip if same
  4. Create new collection
  5. Delete old collection
*/
export type CollectionSyncBody = {
  collectionId: string;
};

async function handler(req: ApiRequestProps<CollectionSyncBody>) {
  const { collectionId } = req.body;

  if (!collectionId) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  const { collection } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId,
    per: WritePermissionVal
  });

  return syncCollection(collection);
}

export default NextAPI(handler);
