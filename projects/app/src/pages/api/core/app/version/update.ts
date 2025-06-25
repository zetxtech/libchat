import { NextAPI } from '@/service/middleware/entry';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { MongoAppVersion } from '@libchat/service/core/app/version/schema';

export type UpdateAppVersionBody = {
  appId: string;
  versionId: string;
  versionName: string;
};

async function handler(req: ApiRequestProps<UpdateAppVersionBody>) {
  const { appId, versionId, versionName } = req.body;
  await authApp({ appId, req, per: WritePermissionVal, authToken: true });

  await MongoAppVersion.findByIdAndUpdate(
    { _id: versionId },
    {
      versionName
    }
  );

  return {};
}

export default NextAPI(handler);
