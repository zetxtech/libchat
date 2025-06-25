import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { UserAuthTypeEnum } from '@libchat/global/support/user/auth/constants';
import { getNanoid } from '@libchat/global/common/string/tools';
import { addSeconds } from 'date-fns';
import { addAuthCode } from '@libchat/service/support/user/auth/controller';

export type preLoginQuery = {
  username: string;
};

export type preLoginBody = {};

export type preLoginResponse = { code: string };

async function handler(
  req: ApiRequestProps<preLoginBody, preLoginQuery>,
  res: ApiResponseType<any>
): Promise<preLoginResponse> {
  const { username } = req.query;

  if (!username) {
    return Promise.reject('username is required');
  }

  const code = getNanoid(6);

  await addAuthCode({
    type: UserAuthTypeEnum.login,
    key: username,
    code,
    expiredTime: addSeconds(new Date(), 30)
  });

  return {
    code
  };
}

export default NextAPI(handler);
