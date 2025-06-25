import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { TeamAppCreatePermissionVal } from '@libchat/global/support/permission/user/constant';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { authUserPer } from '@libchat/service/support/permission/user/auth';
import { type CreateAppBody, onCreateApp } from '../create';
import { type McpToolConfigType } from '@libchat/global/core/app/type';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { AppTypeEnum } from '@libchat/global/core/app/constants';
import {
  getMCPToolRuntimeNode,
  getMCPToolSetRuntimeNode
} from '@libchat/global/core/app/mcpTools/utils';
import { pushTrack } from '@libchat/service/common/middle/tracks/utils';
import { checkTeamAppLimit } from '@libchat/service/support/permission/teamLimit';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { type StoreSecretValueType } from '@libchat/global/common/secret/type';
import { storeSecretValue } from '@libchat/service/common/secret/utils';

export type createMCPToolsQuery = {};

export type createMCPToolsBody = Omit<
  CreateAppBody,
  'type' | 'modules' | 'edges' | 'chatConfig'
> & {
  url: string;
  headerSecret?: StoreSecretValueType;
  toolList: McpToolConfigType[];
};

export type createMCPToolsResponse = {};

async function handler(
  req: ApiRequestProps<createMCPToolsBody, createMCPToolsQuery>,
  res: ApiResponseType<createMCPToolsResponse>
): Promise<createMCPToolsResponse> {
  const { name, avatar, toolList, url, headerSecret = {}, parentId } = req.body;

  const { teamId, tmbId, userId } = parentId
    ? await authApp({ req, appId: parentId, per: WritePermissionVal, authToken: true })
    : await authUserPer({ req, authToken: true, per: TeamAppCreatePermissionVal });

  await checkTeamAppLimit(teamId);

  const formatedHeaderAuth = storeSecretValue(headerSecret);

  const mcpToolsId = await mongoSessionRun(async (session) => {
    const mcpToolsId = await onCreateApp({
      name,
      avatar,
      parentId,
      teamId,
      tmbId,
      type: AppTypeEnum.toolSet,
      modules: [
        getMCPToolSetRuntimeNode({
          url,
          toolList,
          name,
          avatar,
          headerSecret: formatedHeaderAuth
        })
      ],
      session
    });

    for (const tool of toolList) {
      await onCreateApp({
        name: tool.name,
        avatar,
        parentId: mcpToolsId,
        teamId,
        tmbId,
        type: AppTypeEnum.tool,
        intro: tool.description,
        modules: [
          getMCPToolRuntimeNode({
            tool,
            url,
            headerSecret: formatedHeaderAuth
          })
        ],
        session
      });
    }

    return mcpToolsId;
  });

  pushTrack.createApp({
    type: AppTypeEnum.toolSet,
    appId: mcpToolsId,
    uid: userId,
    teamId,
    tmbId
  });

  return {};
}

export default NextAPI(handler);
