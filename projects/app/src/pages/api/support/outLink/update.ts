import { MongoOutLink } from '@libchat/service/support/outLink/schema';
import type { OutLinkEditType } from '@libchat/global/support/outLink/type.d';
import { authOutLinkCrud } from '@libchat/service/support/permission/publish/authLink';
import { ManagePermissionVal } from '@libchat/global/support/permission/constant';
import type { ApiRequestProps } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nAppType } from '@libchat/service/support/user/audit/util';
export type OutLinkUpdateQuery = {};

// {
// _id?: string; // Outlink 的 ID
// name: string; // Outlink 的名称
// responseDetail?: boolean; // 是否开启详细回复
// immediateResponse?: string; // 立即回复的内容
// defaultResponse?: string; // 默认回复的内容
// limit?: OutLinkSchema<T>['limit']; // 限制
// app?: T; // 平台的配置
// }
export type OutLinkUpdateBody = OutLinkEditType;

export type OutLinkUpdateResponse = {};

async function handler(
  req: ApiRequestProps<OutLinkUpdateBody, OutLinkUpdateQuery>
): Promise<OutLinkUpdateResponse> {
  const { _id, name, responseDetail, limit, app, showRawSource, showNodeStatus } = req.body;

  if (!_id) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  const {
    tmbId,
    teamId,
    outLink,
    app: logApp
  } = await authOutLinkCrud({
    req,
    outLinkId: _id,
    authToken: true,
    per: ManagePermissionVal
  });

  await MongoOutLink.findByIdAndUpdate(_id, {
    name,
    responseDetail,
    showRawSource,
    showNodeStatus,
    // showFullText,
    limit,
    app
  });

  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.UPDATE_APP_PUBLISH_CHANNEL,
      params: {
        appName: logApp.name,
        channelName: outLink.name,
        appType: getI18nAppType(logApp.type)
      }
    });
  })();
  return {};
}
export default NextAPI(handler);
