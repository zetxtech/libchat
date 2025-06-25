import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { getAppLatestVersion } from '@libchat/service/core/app/version/controller';
import { type AppChatConfigType } from '@libchat/global/core/app/type';
import { type StoreEdgeItemType } from '@libchat/global/core/workflow/type/edge';
import { type StoreNodeItemType } from '@libchat/global/core/workflow/type/node';
import { rewriteAppWorkflowToDetail } from '@libchat/service/core/app/utils';

export type getLatestVersionQuery = {
  appId: string;
};

export type getLatestVersionBody = {};

export type getLatestVersionResponse = {
  nodes: StoreNodeItemType[];
  edges: StoreEdgeItemType[];
  chatConfig: AppChatConfigType;
};

async function handler(
  req: ApiRequestProps<getLatestVersionBody, getLatestVersionQuery>,
  res: ApiResponseType<any>
): Promise<getLatestVersionResponse> {
  const { app, isRoot, teamId } = await authApp({
    req,
    authToken: true,
    appId: req.query.appId,
    per: WritePermissionVal
  });

  const version = await getAppLatestVersion(req.query.appId, app);

  await rewriteAppWorkflowToDetail({
    nodes: version.nodes,
    teamId,
    isRoot,
    ownerTmbId: app.tmbId
  });

  return version;
}

export default NextAPI(handler);
