import { type TeamTmbItemType } from '@libchat/global/support/user/team/type';
import { parseHeaderCert } from '../controller';
import { getTmbInfoByTmbId } from '../../user/team/controller';
import { TeamErrEnum } from '@libchat/global/common/error/code/team';
import { type AuthModeType, type AuthResponseType } from '../type';
import { NullPermission } from '@libchat/global/support/permission/constant';
import { TeamPermission } from '@libchat/global/support/permission/user/controller';
import { authCert } from '../auth/common';
import { MongoUser } from '../../user/schema';
import { ERROR_ENUM } from '@libchat/global/common/error/errorCode';
import { type ApiRequestProps } from '../../../type/next';

/* auth user role  */
export async function authUserPer(props: AuthModeType): Promise<
  AuthResponseType<TeamPermission> & {
    tmb: TeamTmbItemType;
  }
> {
  const result = await parseHeaderCert(props);
  const tmb = await getTmbInfoByTmbId({ tmbId: result.tmbId });

  if (result.isRoot) {
    return {
      ...result,
      permission: new TeamPermission({
        isOwner: true
      }),
      tmb
    };
  }
  if (!tmb.permission.checkPer(props.per ?? NullPermission)) {
    return Promise.reject(TeamErrEnum.unAuthTeam);
  }

  return {
    ...result,
    permission: tmb.permission,
    tmb
  };
}

export const authSystemAdmin = async ({ req }: { req: ApiRequestProps }) => {
  try {
    const result = await authCert({ req, authToken: true });
    const user = await MongoUser.findOne({
      _id: result.userId
    });

    if (user && user.username !== 'root') {
      return Promise.reject(ERROR_ENUM.unAuthorization);
    }
    return result;
  } catch (error) {
    throw error;
  }
};
