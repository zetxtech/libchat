import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoChat } from '@libchat/service/core/chat/chatSchema';
import { MongoApp } from '@libchat/service/core/app/schema';
import { MongoOutLink } from '@libchat/service/support/outLink/schema';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { MongoChatItem } from '@libchat/service/core/chat/chatItemSchema';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { MongoAppVersion } from '@libchat/service/core/app/version/schema';
import { NextAPI } from '@/service/middleware/entry';
import { MongoChatInputGuide } from '@libchat/service/core/chat/inputGuide/schema';
import {
  OwnerPermissionVal,
  PerResourceTypeEnum
} from '@libchat/global/support/permission/constant';
import { findAppAndAllChildren } from '@libchat/service/core/app/controller';
import { MongoResourcePermission } from '@libchat/service/support/permission/schema';
import { type ClientSession } from '@libchat/service/common/mongo';
import { deleteChatFiles } from '@libchat/service/core/chat/controller';
import { pushTrack } from '@libchat/service/common/middle/tracks/utils';
import { MongoOpenApi } from '@libchat/service/support/openapi/schema';
import { removeImageByPath } from '@libchat/service/common/file/image/controller';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nAppType } from '@libchat/service/support/user/audit/util';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { appId } = req.query as { appId: string };

  if (!appId) {
    throw new Error('参数错误');
  }

  // Auth owner (folder owner, can delete all apps in the folder)
  const { teamId, tmbId, userId, app } = await authApp({
    req,
    authToken: true,
    appId,
    per: OwnerPermissionVal
  });

  await onDelOneApp({
    teamId,
    appId
  });
  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.DELETE_APP,
      params: {
        appName: app.name,
        appType: getI18nAppType(app.type)
      }
    });
  })();

  // Tracks
  pushTrack.countAppNodes({ teamId, tmbId, uid: userId, appId });
}

export default NextAPI(handler);

export const onDelOneApp = async ({
  teamId,
  appId,
  session
}: {
  teamId: string;
  appId: string;
  session?: ClientSession;
}) => {
  const apps = await findAppAndAllChildren({
    teamId,
    appId,
    fields: '_id avatar'
  });

  const del = async (session: ClientSession) => {
    for await (const app of apps) {
      const appId = app._id;
      // Chats
      await deleteChatFiles({ appId });
      await MongoChatItem.deleteMany(
        {
          appId
        },
        { session }
      );
      await MongoChat.deleteMany(
        {
          appId
        },
        { session }
      );

      // 删除分享链接
      await MongoOutLink.deleteMany({
        appId
      }).session(session);
      // Openapi
      await MongoOpenApi.deleteMany({
        appId
      }).session(session);

      // delete version
      await MongoAppVersion.deleteMany({
        appId
      }).session(session);

      await MongoChatInputGuide.deleteMany({
        appId
      }).session(session);

      await MongoResourcePermission.deleteMany({
        resourceType: PerResourceTypeEnum.app,
        teamId,
        resourceId: appId
      }).session(session);

      // delete app
      await MongoApp.deleteOne(
        {
          _id: appId
        },
        { session }
      );

      await removeImageByPath(app.avatar, session);
    }
  };

  if (session) {
    return del(session);
  }

  return mongoSessionRun(del);
};
