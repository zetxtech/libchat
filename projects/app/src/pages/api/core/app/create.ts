import { NextAPI } from '@/service/middleware/entry';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import type { ParentIdType } from '@libchat/global/common/parentFolder/type';
import { parseParentIdInMongo } from '@libchat/global/common/parentFolder/utils';
import type { AppTypeEnum } from '@libchat/global/core/app/constants';
import { AppFolderTypeList } from '@libchat/global/core/app/constants';
import type { AppSchema } from '@libchat/global/core/app/type';
import { type ShortUrlParams } from '@libchat/global/support/marketing/type';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { TeamAppCreatePermissionVal } from '@libchat/global/support/permission/user/constant';
import { refreshSourceAvatar } from '@libchat/service/common/file/image/controller';
import { pushTrack } from '@libchat/service/common/middle/tracks/utils';
import { type ClientSession } from '@libchat/service/common/mongo';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { MongoApp } from '@libchat/service/core/app/schema';
import { MongoAppVersion } from '@libchat/service/core/app/version/schema';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { checkTeamAppLimit } from '@libchat/service/support/permission/teamLimit';
import { authUserPer } from '@libchat/service/support/permission/user/auth';
import { MongoTeamMember } from '@libchat/service/support/user/team/teamMemberSchema';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nAppType } from '@libchat/service/support/user/audit/util';

export type CreateAppBody = {
  parentId?: ParentIdType;
  name?: string;
  avatar?: string;
  type?: AppTypeEnum;
  modules: AppSchema['modules'];
  edges?: AppSchema['edges'];
  chatConfig?: AppSchema['chatConfig'];
  utmParams?: ShortUrlParams;
};

async function handler(req: ApiRequestProps<CreateAppBody>) {
  const { parentId, name, avatar, type, modules, edges, chatConfig, utmParams } = req.body;

  if (!name || !type || !Array.isArray(modules)) {
    return Promise.reject(CommonErrEnum.inheritPermissionError);
  }

  // 凭证校验
  const { teamId, tmbId, userId } = parentId
    ? await authApp({ req, appId: parentId, per: WritePermissionVal, authToken: true })
    : await authUserPer({ req, authToken: true, per: TeamAppCreatePermissionVal });

  // 上限校验
  await checkTeamAppLimit(teamId);
  const tmb = await MongoTeamMember.findById({ _id: tmbId }, 'userId').populate<{
    user: { username: string };
  }>('user', 'username');

  // 创建app
  const appId = await onCreateApp({
    parentId,
    name,
    avatar,
    type,
    modules,
    edges,
    chatConfig,
    teamId,
    tmbId,
    userAvatar: tmb?.avatar,
    username: tmb?.user?.username
  });

  pushTrack.createApp({
    type,
    uid: userId,
    teamId,
    tmbId,
    appId,
    ...utmParams
  });

  return appId;
}

export default NextAPI(handler);

export const onCreateApp = async ({
  parentId,
  name,
  intro,
  avatar,
  type,
  modules,
  edges,
  chatConfig,
  teamId,
  tmbId,
  pluginData,
  username,
  userAvatar,
  session
}: {
  parentId?: ParentIdType;
  name?: string;
  avatar?: string;
  type?: AppTypeEnum;
  modules?: AppSchema['modules'];
  edges?: AppSchema['edges'];
  chatConfig?: AppSchema['chatConfig'];
  intro?: string;
  teamId: string;
  tmbId: string;
  pluginData?: AppSchema['pluginData'];
  username?: string;
  userAvatar?: string;
  session?: ClientSession;
}) => {
  const create = async (session: ClientSession) => {
    const [{ _id: appId }] = await MongoApp.create(
      [
        {
          ...parseParentIdInMongo(parentId),
          avatar,
          name,
          intro,
          teamId,
          tmbId,
          modules,
          edges,
          chatConfig,
          type,
          version: 'v2',
          pluginData
        }
      ],
      { session, ordered: true }
    );

    if (!AppFolderTypeList.includes(type!)) {
      await MongoAppVersion.create(
        [
          {
            tmbId,
            appId,
            nodes: modules,
            edges,
            chatConfig,
            versionName: name,
            username,
            avatar: userAvatar,
            isPublish: true
          }
        ],
        { session, ordered: true }
      );
    }
    (async () => {
      addAuditLog({
        tmbId,
        teamId,
        event: AuditEventEnum.CREATE_APP,
        params: {
          appName: name!,
          appType: getI18nAppType(type!)
        }
      });
    })();

    await refreshSourceAvatar(avatar, undefined, session);

    return appId;
  };

  if (session) {
    return create(session);
  } else {
    return await mongoSessionRun(create);
  }
};
