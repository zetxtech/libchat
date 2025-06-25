import { MongoOutLink } from '@libchat/service/support/outLink/schema';
import { authOutLinkCrud } from '@libchat/service/support/permission/publish/authLink';
import { OwnerPermissionVal } from '@libchat/global/support/permission/constant';
import type { ApiRequestProps } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nAppType } from '@libchat/service/support/user/audit/util';

export type OutLinkDeleteQuery = {
  id: string;
};
export type OutLinkDeleteBody = {};
export type OutLinkDeleteResponse = {};

/* delete a shareChat by shareChatId */
async function handler(
  req: ApiRequestProps<OutLinkDeleteBody, OutLinkDeleteQuery>
): Promise<OutLinkDeleteResponse> {
  const { id } = req.query;
  const { tmbId, teamId, outLink, app } = await authOutLinkCrud({
    req,
    outLinkId: id,
    authToken: true,
    per: OwnerPermissionVal
  });

  await MongoOutLink.findByIdAndDelete(id);

  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.DELETE_APP_PUBLISH_CHANNEL,
      params: {
        appName: app.name,
        channelName: outLink.name,
        appType: getI18nAppType(app.type)
      }
    });
  })();

  return {};
}

export default NextAPI(handler);
