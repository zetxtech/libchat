import { NextAPI } from '@/service/middleware/entry';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { authDatasetData } from '@libchat/service/support/permission/dataset/auth';
import type { ApiRequestProps } from '@libchat/service/type/next';

export type Response = {
  id: string;
  q: string;
  a: string;
  imageId?: string;
  source: string;
};

async function handler(
  req: ApiRequestProps<
    {},
    {
      id: string;
    }
  >
) {
  const { id: dataId } = req.query;

  const { datasetData } = await authDatasetData({
    req,
    authToken: true,
    authApiKey: true,
    dataId,
    per: ReadPermissionVal
  });

  return datasetData;
}

export default NextAPI(handler);
