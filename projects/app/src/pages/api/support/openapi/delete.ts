import { MongoOpenApi } from '@libchat/service/support/openapi/schema';
import { authOpenApiKeyCrud } from '@libchat/service/support/permission/auth/openapi';
import { OwnerPermissionVal } from '@libchat/global/support/permission/constant';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
export type OpenAPIDeleteQuery = { id: string };
export type OpenAPIDeleteBody = {};
export type OpenAPIDeleteResponse = {};

async function handler(
  req: ApiRequestProps<OpenAPIDeleteBody, OpenAPIDeleteQuery>,
  _res: ApiResponseType<any>
): Promise<OpenAPIDeleteResponse> {
  const { id } = req.query as { id: string };

  if (!id) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  const { tmbId, teamId, openapi } = await authOpenApiKeyCrud({
    req,
    authToken: true,
    id,
    per: OwnerPermissionVal
  });

  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.DELETE_API_KEY,
      params: {
        keyName: openapi.name
      }
    });
  })();

  await MongoOpenApi.deleteOne({ _id: id });

  return {};
}

export default NextAPI(handler);
