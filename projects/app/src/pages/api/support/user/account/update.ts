import { MongoUser } from '@libchat/service/support/user/schema';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { type UserUpdateParams } from '@/types/user';

/* update user info */
import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { refreshSourceAvatar } from '@libchat/service/common/file/image/controller';
import { MongoTeamMember } from '@libchat/service/support/user/team/teamMemberSchema';

export type UserAccountUpdateQuery = {};
export type UserAccountUpdateBody = UserUpdateParams;
export type UserAccountUpdateResponse = {};

async function handler(
  req: ApiRequestProps<UserAccountUpdateBody, UserAccountUpdateQuery>,
  _res: ApiResponseType<any>
): Promise<UserAccountUpdateResponse> {
  const { avatar, timezone } = req.body;

  const { tmbId } = await authCert({ req, authToken: true });
  // const user = await getUserDetail({ tmbId });

  // 更新对应的记录
  await mongoSessionRun(async (session) => {
    const tmb = await MongoTeamMember.findById(tmbId).session(session);
    if (timezone) {
      await MongoUser.updateOne(
        {
          _id: tmb?.userId
        },
        {
          timezone
        }
      ).session(session);
    }
    // if avatar, update team member avatar
    if (avatar) {
      await MongoTeamMember.updateOne(
        {
          _id: tmbId
        },
        {
          avatar
        }
      ).session(session);
      await refreshSourceAvatar(avatar, tmb?.avatar, session);
    }
  });

  return {};
}
export default NextAPI(handler);
