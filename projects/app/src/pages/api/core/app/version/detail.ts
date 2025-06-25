import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { MongoAppVersion } from '@libchat/service/core/app/version/schema';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { type AppVersionSchemaType } from '@libchat/global/core/app/version';
import { formatTime2YMDHM } from '@libchat/global/common/string/time';
import { rewriteAppWorkflowToDetail } from '@libchat/service/core/app/utils';

type Props = {
  versionId: string;
  appId: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
): Promise<AppVersionSchemaType> {
  const { versionId, appId } = req.query as Props;

  const { app, teamId, isRoot } = await authApp({
    req,
    authToken: true,
    appId,
    per: WritePermissionVal
  });
  const result = await MongoAppVersion.findById(versionId).lean();

  if (!result) {
    return Promise.reject('version not found');
  }

  await rewriteAppWorkflowToDetail({
    nodes: result.nodes,
    teamId,
    ownerTmbId: app.tmbId,
    isRoot
  });

  return {
    ...result,
    versionName: result?.versionName || formatTime2YMDHM(result?.time)
  };
}

export default NextAPI(handler);
