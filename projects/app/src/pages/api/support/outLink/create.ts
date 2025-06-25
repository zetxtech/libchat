import { MongoOutLink } from '@libchat/service/support/outLink/schema';
import { authApp } from '@libchat/service/support/permission/app/auth';
import type { OutLinkEditType } from '@libchat/global/support/outLink/type.d';
import type { PublishChannelEnum } from '@libchat/global/support/outLink/constant';
import { ManagePermissionVal } from '@libchat/global/support/permission/constant';
import type { ApiRequestProps } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nAppType } from '@libchat/service/support/user/audit/util';
import { getNanoid } from '@libchat/global/common/string/tools';

export type OutLinkCreateQuery = {};
export type OutLinkCreateBody = OutLinkEditType &
  OutLinkEditType & {
    appId: string;
    type: PublishChannelEnum;
  };
export type OutLinkCreateResponse = string;

async function handler(
  req: ApiRequestProps<OutLinkCreateBody, OutLinkCreateQuery>
): Promise<OutLinkCreateResponse> {
  const { appId, ...props } = req.body;

  const { teamId, tmbId, app } = await authApp({
    req,
    authToken: true,
    appId,
    per: ManagePermissionVal
  });

  const shareId = getNanoid(24);
  await MongoOutLink.create({
    shareId,
    teamId,
    tmbId,
    appId,
    ...props
  });

  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.CREATE_APP_PUBLISH_CHANNEL,
      params: {
        appName: app.name,
        channelName: props.name,
        appType: getI18nAppType(app.type)
      }
    });
  })();

  return shareId;
}

export default NextAPI(handler);
