import { authUserPer } from '@libchat/service/support/permission/user/auth';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { httpApiSchema2Plugins } from '@libchat/global/core/app/httpPlugin/utils';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';

import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { onCreateApp, type CreateAppBody } from '../create';
import { type AppSchema } from '@libchat/global/core/app/type';
import { AppTypeEnum } from '@libchat/global/core/app/constants';
import { pushTrack } from '@libchat/service/common/middle/tracks/utils';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { TeamAppCreatePermissionVal } from '@libchat/global/support/permission/user/constant';
import { checkTeamAppLimit } from '@libchat/service/support/permission/teamLimit';

export type createHttpPluginQuery = {};

export type createHttpPluginBody = Omit<CreateAppBody, 'type' | 'modules' | 'edges'> & {
  intro?: string;
  pluginData: AppSchema['pluginData'];
};

export type createHttpPluginResponse = {};

async function handler(
  req: ApiRequestProps<createHttpPluginBody, createHttpPluginQuery>,
  res: ApiResponseType<any>
): Promise<createHttpPluginResponse> {
  const { parentId, name, intro, avatar, pluginData } = req.body;

  if (!name || !pluginData) {
    return Promise.reject('缺少参数');
  }

  const { teamId, tmbId, userId } = parentId
    ? await authApp({ req, appId: parentId, per: TeamAppCreatePermissionVal, authToken: true })
    : await authUserPer({ req, authToken: true, per: TeamAppCreatePermissionVal });

  await checkTeamAppLimit(teamId);

  const httpPluginId = await mongoSessionRun(async (session) => {
    // create http plugin folder
    const httpPluginId = await onCreateApp({
      parentId,
      name,
      avatar,
      intro,
      teamId,
      tmbId,
      type: AppTypeEnum.httpPlugin,
      pluginData,
      session
    });

    // compute children plugins
    const childrenPlugins = await httpApiSchema2Plugins({
      parentId: httpPluginId,
      apiSchemaStr: pluginData.apiSchemaStr,
      customHeader: pluginData.customHeaders
    });

    // create children plugins
    for await (const item of childrenPlugins) {
      await onCreateApp({
        ...item,
        teamId,
        tmbId,
        session
      });
    }

    return httpPluginId;
  });

  pushTrack.createApp({
    type: AppTypeEnum.httpPlugin,
    appId: httpPluginId,
    uid: userId,
    teamId,
    tmbId
  });

  return {};
}

export default NextAPI(handler);
