import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  GetPathProps,
  ParentIdType,
  ParentTreePathItemType
} from '@libchat/global/common/parentFolder/type.d';
import { NextAPI } from '@/service/middleware/entry';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { MongoApp } from '@libchat/service/core/app/schema';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
): Promise<ParentTreePathItemType[]> {
  const { sourceId: appId, type } = req.query as GetPathProps;

  if (!appId) {
    return [];
  }

  const { app } = await authApp({ req, authToken: true, appId, per: ReadPermissionVal });

  return await getParents(type === 'current' ? appId : app.parentId);
}

export default NextAPI(handler);

async function getParents(parentId: ParentIdType): Promise<ParentTreePathItemType[]> {
  if (!parentId) {
    return [];
  }

  const parent = await MongoApp.findById(parentId, 'name parentId');

  if (!parent) return [];

  const paths = await getParents(parent.parentId);
  paths.push({ parentId, parentName: parent.name });

  return paths;
}
