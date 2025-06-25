import { getApiDatasetRequest } from '@libchat/service/core/dataset/apiDataset';
import { NextAPI } from '@/service/middleware/entry';
import type { ParentIdType } from '@libchat/global/common/parentFolder/type';
import { type NextApiRequest } from 'next';
import { authCert } from '@libchat/service/support/permission/auth/common';
import type {
  ApiDatasetServerType,
  APIFileItem
} from '@libchat/global/core/dataset/apiDataset/type';

export type GetApiDatasetCataLogProps = {
  parentId?: ParentIdType;
  apiDatasetServer?: ApiDatasetServerType;
};

export type GetApiDatasetCataLogResponse = APIFileItem[];

async function handler(req: NextApiRequest) {
  let { searchKey = '', parentId = null, apiDatasetServer } = req.body;

  await authCert({ req, authToken: true });

  // Remove basePath from apiDatasetServer
  Object.values(apiDatasetServer).forEach((server: any) => {
    if (server.basePath) {
      delete server.basePath;
    }
  });

  const data = await (
    await getApiDatasetRequest(apiDatasetServer)
  ).listFiles({ parentId, searchKey });

  return data?.filter((item: APIFileItem) => item.hasChild === true) || [];
}

export default NextAPI(handler);
