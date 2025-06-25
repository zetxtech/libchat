/* 
  get plugin preview modules 
 */
import type { NextApiResponse } from 'next';
import {
  getChildAppPreviewNode,
  splitCombineToolId
} from '@libchat/service/core/app/plugin/controller';
import { type FlowNodeTemplateType } from '@libchat/global/core/workflow/type/node.d';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { PluginSourceEnum } from '@libchat/global/core/plugin/constants';

export type GetPreviewNodeQuery = { appId: string; versionId?: string };

async function handler(
  req: ApiRequestProps<{}, GetPreviewNodeQuery>,
  _res: NextApiResponse<any>
): Promise<FlowNodeTemplateType> {
  const { appId, versionId } = req.query;

  const { source } = splitCombineToolId(appId);

  if (source === PluginSourceEnum.personal) {
    await authApp({ req, authToken: true, appId, per: ReadPermissionVal });
  }

  return getChildAppPreviewNode({ appId, versionId });
}

export default NextAPI(handler);
