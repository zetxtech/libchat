import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { authUserPer } from '@libchat/service/support/permission/user/auth';
import { MongoMcpKey } from '@libchat/service/support/mcp/schema';
import { type McpKeyType } from '@libchat/global/support/mcp/type';

export type listQuery = {};

export type listBody = {};

export type listResponse = McpKeyType[];

async function handler(
  req: ApiRequestProps<listBody, listQuery>,
  res: ApiResponseType<any>
): Promise<listResponse> {
  const { teamId, tmbId, permission } = await authUserPer({
    req,
    authToken: true,
    authApiKey: true
  });

  const list = await (async () => {
    if (permission.hasManagePer) {
      return await MongoMcpKey.find({ teamId }).lean().sort({ _id: -1 });
    }
    return await MongoMcpKey.find({ teamId, tmbId }).lean().sort({ _id: -1 });
  })();

  return list;
}

export default NextAPI(handler);
