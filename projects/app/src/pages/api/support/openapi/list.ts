import { MongoOpenApi } from '@libchat/service/support/openapi/schema';
import type { GetApiKeyProps } from '@/global/support/openapi/api';
import { authUserPer } from '@libchat/service/support/permission/user/auth';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { ManagePermissionVal } from '@libchat/global/support/permission/constant';
import type { ApiRequestProps } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';

async function handler(req: ApiRequestProps<any, GetApiKeyProps>) {
  const { appId } = req.query;

  if (appId) {
    // app-level apikey
    await authApp({
      req,
      authToken: true,
      appId,
      per: ManagePermissionVal
    });

    const findResponse = await MongoOpenApi.find({
      appId
    }).sort({ _id: -1 });

    return findResponse.map((item) => item.toObject());
  }
  // global apikey
  const { teamId, tmbId, permission } = await authUserPer({
    req,
    authToken: true
  });

  const findResponse = await MongoOpenApi.find({
    appId,
    teamId,
    ...(!permission.hasManagePer && { tmbId }) // if not manager, read own key
  }).sort({ _id: -1 });

  return findResponse.map((item) => item.toObject());
}

export default NextAPI(handler);
