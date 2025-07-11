import type { NextApiRequest } from 'next';
import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { type ParentTreePathItemType } from '@libchat/global/common/parentFolder/type';
import { MongoDatasetCollection } from '@libchat/service/core/dataset/collection/schema';
import { NextAPI } from '@/service/middleware/entry';

export async function handler(req: NextApiRequest) {
  const { parentId } = req.query as { parentId: string };

  if (!parentId) {
    return [];
  }

  await authDatasetCollection({
    req,
    authToken: true,
    collectionId: parentId,
    per: ReadPermissionVal
  });

  const paths = await getDatasetCollectionPaths({
    parentId
  });

  return paths;
}

export default NextAPI(handler);

export async function getDatasetCollectionPaths({
  parentId = ''
}: {
  parentId?: string;
}): Promise<ParentTreePathItemType[]> {
  async function find(parentId?: string): Promise<ParentTreePathItemType[]> {
    if (!parentId) {
      return [];
    }
    const parent = await MongoDatasetCollection.findOne({ _id: parentId }, 'name parentId');

    if (!parent) return [];

    const paths = await find(parent.parentId);
    paths.push({ parentId, parentName: parent.name });

    return paths;
  }

  return find(parentId);
}
