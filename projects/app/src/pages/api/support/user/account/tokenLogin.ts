import { authCert } from '@libchat/service/support/permission/auth/common';
import { getUserDetail } from '@libchat/service/support/user/controller';
import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { type UserType } from '@libchat/global/support/user/type';

export type TokenLoginQuery = {};
export type TokenLoginBody = {};
export type TokenLoginResponse = UserType;

async function handler(
  req: ApiRequestProps<TokenLoginBody, TokenLoginQuery>,
  _res: ApiResponseType<any>
): Promise<TokenLoginResponse> {
  const { tmbId } = await authCert({ req, authToken: true });
  const user = await getUserDetail({ tmbId });

  // Remove sensitive information
  // if (user.team.lafAccount) {
  //   user.team.lafAccount = {
  //     appid: user.team.lafAccount.appid,
  //     token: '',
  //     pat: ''
  //   };
  // }
  if (user.team.openaiAccount) {
    user.team.openaiAccount = {
      key: '',
      baseUrl: user.team.openaiAccount.baseUrl
    };
  }
  if (user.team.externalWorkflowVariables) {
    user.team.externalWorkflowVariables = Object.fromEntries(
      Object.entries(user.team.externalWorkflowVariables).map(([key, value]) => [key, ''])
    );
  }

  return user;
}
export default NextAPI(handler);
