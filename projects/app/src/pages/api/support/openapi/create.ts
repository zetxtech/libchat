import { MongoOpenApi } from '@libchat/service/support/openapi/schema';
import type { EditApiKeyProps } from '@/global/support/openapi/api';
import { authUserPer } from '@libchat/service/support/permission/user/auth';
import { getNanoid } from '@libchat/global/common/string/tools';
import type { ApiRequestProps } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { ManagePermissionVal } from '@libchat/global/support/permission/constant';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { OpenApiErrEnum } from '@libchat/global/common/error/code/openapi';
import { TeamApikeyCreatePermissionVal } from '@libchat/global/support/permission/user/constant';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
async function handler(req: ApiRequestProps<EditApiKeyProps>): Promise<string> {
  const { appId, name, limit } = req.body;
  const { tmbId, teamId } = await (async () => {
    if (!appId) {
      // global apikey is being created, auth the tmb
      const { teamId, tmbId } = await authUserPer({
        req,
        authToken: true,
        per: TeamApikeyCreatePermissionVal
      });
      return { teamId, tmbId };
    } else {
      const { teamId, tmbId } = await authApp({
        req,
        per: ManagePermissionVal,
        appId,
        authToken: true
      });
      return { teamId, tmbId };
    }
  })();

  const count = await MongoOpenApi.find({ tmbId, appId }).countDocuments();

  if (count >= 10) {
    return Promise.reject(OpenApiErrEnum.exceedLimit);
  }

  const nanoid = getNanoid(Math.floor(Math.random() * 14) + 52);
  const apiKey = `${global.systemEnv?.openapiPrefix || 'libchat'}-${nanoid}`;

  await MongoOpenApi.create({
    teamId,
    tmbId,
    apiKey,
    appId,
    name,
    limit
  });

  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.CREATE_API_KEY,
      params: {
        keyName: name
      }
    });
  })();

  return apiKey;
}

export default NextAPI(handler);
