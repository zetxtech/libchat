import { MongoTeamMember } from '@libchat/service/support/user/team/teamMemberSchema';
import { GET } from '@libchat/service/common/api/plusRequest';
import {
  type AuthTeamTagTokenProps,
  type AuthTokenFromTeamDomainResponse
} from '@libchat/global/support/user/team/tag';
import { TeamMemberRoleEnum } from '@libchat/global/support/user/team/constant';

export function authTeamTagToken(data: AuthTeamTagTokenProps) {
  return GET<AuthTokenFromTeamDomainResponse['data']>('/support/user/team/tag/authTeamToken', data);
}
export async function authTeamSpaceToken({
  teamId,
  teamToken
}: {
  teamId: string;
  teamToken: string;
}) {
  // get outLink and app
  const [{ uid }, member] = await Promise.all([
    authTeamTagToken({ teamId, teamToken }),
    MongoTeamMember.findOne({ teamId, role: TeamMemberRoleEnum.owner }, 'tmbId').lean()
  ]);

  return {
    uid,
    tmbId: member?._id!
  };
}
