import { POST } from '@libchat/service/common/api/plusRequest';
import type {
  AuthOutLinkChatProps,
  AuthOutLinkLimitProps,
  AuthOutLinkInitProps,
  AuthOutLinkResponse
} from '@libchat/global/support/outLink/api.d';
import { type ShareChatAuthProps } from '@libchat/global/support/permission/chat';
import { authOutLinkValid } from '@libchat/service/support/permission/publish/authLink';
import { getUserChatInfoAndAuthTeamPoints } from '@libchat/service/support/permission/auth/team';
import { AuthUserTypeEnum } from '@libchat/global/support/permission/constant';
import { OutLinkErrEnum } from '@libchat/global/common/error/code/outLink';
import { type OutLinkSchema } from '@libchat/global/support/outLink/type';

export function authOutLinkInit(data: AuthOutLinkInitProps): Promise<AuthOutLinkResponse> {
  if (!global.feConfigs?.isPlus) return Promise.resolve({ uid: data.outLinkUid });
  return POST<AuthOutLinkResponse>('/support/outLink/authInit', data);
}
export function authOutLinkChatLimit(data: AuthOutLinkLimitProps): Promise<AuthOutLinkResponse> {
  if (!global.feConfigs?.isPlus) return Promise.resolve({ uid: data.outLinkUid });
  return POST<AuthOutLinkResponse>('/support/outLink/authChatStart', data);
}

export const authOutLink = async ({
  shareId,
  outLinkUid
}: ShareChatAuthProps): Promise<{
  uid: string;
  appId: string;
  outLinkConfig: OutLinkSchema;
}> => {
  if (!outLinkUid) {
    return Promise.reject(OutLinkErrEnum.linkUnInvalid);
  }
  const result = await authOutLinkValid({ shareId });

  const { uid } = await authOutLinkInit({
    outLinkUid,
    tokenUrl: result.outLinkConfig.limit?.hookUrl
  });

  return {
    ...result,
    uid
  };
};

export async function authOutLinkChatStart({
  shareId,
  ip,
  outLinkUid,
  question
}: AuthOutLinkChatProps & {
  shareId: string;
}) {
  // get outLink and app
  const { outLinkConfig, appId } = await authOutLinkValid({ shareId });

  // check ai points and chat limit
  const [{ timezone, externalProvider }, { uid }] = await Promise.all([
    getUserChatInfoAndAuthTeamPoints(outLinkConfig.tmbId),
    authOutLinkChatLimit({ outLink: outLinkConfig, ip, outLinkUid, question })
  ]);

  return {
    sourceName: outLinkConfig.name,
    teamId: outLinkConfig.teamId,
    tmbId: outLinkConfig.tmbId,
    authType: AuthUserTypeEnum.token,
    responseDetail: outLinkConfig.responseDetail,
    showNodeStatus: outLinkConfig.showNodeStatus,
    timezone,
    externalProvider,
    appId,
    uid
  };
}
