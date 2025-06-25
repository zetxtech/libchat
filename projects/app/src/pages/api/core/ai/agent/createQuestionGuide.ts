import type { NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';

import { pushQuestionGuideUsage } from '@/service/support/wallet/usage/push';
import { createQuestionGuide } from '@libchat/service/core/ai/functions/createQuestionGuide';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { type OutLinkChatAuthProps } from '@libchat/global/support/permission/chat';
import { type ChatCompletionMessageParam } from '@libchat/global/core/ai/type';
import { type AuthModeType } from '@libchat/service/support/permission/type';
import { AuthUserTypeEnum } from '@libchat/global/support/permission/constant';
import { authOutLinkValid } from '@libchat/service/support/permission/publish/authLink';
import { authOutLinkInit } from '@/service/support/permission/auth/outLink';
import { authTeamSpaceToken } from '@/service/support/permission/auth/team';
import { MongoTeamMember } from '@libchat/service/support/user/team/teamMemberSchema';
import { TeamMemberRoleEnum } from '@libchat/global/support/user/team/constant';
import { ChatErrEnum } from '@libchat/global/common/error/code/chat';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { getDefaultLLMModel } from '@libchat/service/core/ai/model';

async function handler(
  req: ApiRequestProps<
    OutLinkChatAuthProps & {
      messages: ChatCompletionMessageParam[];
    }
  >,
  res: NextApiResponse<any>
) {
  try {
    const { messages } = req.body;

    const { tmbId, teamId } = await authChatCert({
      req,
      authToken: true,
      authApiKey: true
    });

    const qgModel = getDefaultLLMModel();

    const { result, inputTokens, outputTokens } = await createQuestionGuide({
      messages,
      model: qgModel.model
    });

    jsonRes(res, {
      data: result
    });

    pushQuestionGuideUsage({
      model: qgModel.model,
      inputTokens,
      outputTokens,
      teamId,
      tmbId
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

export default NextAPI(handler);

/* 
  Abandoned
  Different chat source
  1. token (header)
  2. apikey (header)
  3. share page (body: shareId outLinkUid)
  4. team chat page (body: teamId teamToken)
*/
async function authChatCert(props: AuthModeType): Promise<{
  teamId: string;
  tmbId: string;
  authType: AuthUserTypeEnum;
  apikey: string;
  isOwner: boolean;
  canWrite: boolean;
  outLinkUid?: string;
}> {
  const { teamId, teamToken, shareId, outLinkUid } = props.req.body as OutLinkChatAuthProps;

  if (shareId && outLinkUid) {
    const { outLinkConfig } = await authOutLinkValid({ shareId });
    const { uid } = await authOutLinkInit({
      outLinkUid,
      tokenUrl: outLinkConfig.limit?.hookUrl
    });

    return {
      teamId: String(outLinkConfig.teamId),
      tmbId: String(outLinkConfig.tmbId),
      authType: AuthUserTypeEnum.outLink,
      apikey: '',
      isOwner: false,
      canWrite: false,
      outLinkUid: uid
    };
  }
  if (teamId && teamToken) {
    const { uid } = await authTeamSpaceToken({ teamId, teamToken });
    const tmb = await MongoTeamMember.findOne(
      { teamId, role: TeamMemberRoleEnum.owner },
      'tmbId'
    ).lean();

    if (!tmb) return Promise.reject(ChatErrEnum.unAuthChat);

    return {
      teamId,
      tmbId: String(tmb._id),
      authType: AuthUserTypeEnum.teamDomain,
      apikey: '',
      isOwner: false,
      canWrite: false,
      outLinkUid: uid
    };
  }

  return authCert(props);
}
