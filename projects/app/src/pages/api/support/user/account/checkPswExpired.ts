import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { checkPswExpired } from '@/service/support/user/account/password';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { MongoUser } from '@libchat/service/support/user/schema';

export type getTimeQuery = {};

export type getTimeBody = {};

export type getTimeResponse = boolean;

async function handler(
  req: ApiRequestProps<getTimeBody, getTimeQuery>,
  res: ApiResponseType<getTimeResponse>
): Promise<getTimeResponse> {
  const { userId } = await authCert({ req, authToken: true });

  const user = await MongoUser.findById(userId, 'passwordUpdateTime');

  if (!user) {
    return false;
  }

  return checkPswExpired({ updateTime: user.passwordUpdateTime });
}

export default NextAPI(handler);
