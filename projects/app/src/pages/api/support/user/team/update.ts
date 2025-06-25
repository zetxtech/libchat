import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { type UpdateTeamProps } from '@libchat/global/support/user/team/controller';
import { authUserPer } from '@libchat/service/support/permission/user/auth';
import { updateTeam } from '@libchat/service/support/user/team/controller';
import { ManagePermissionVal } from '@libchat/global/support/permission/constant';

export type updateQuery = {};

export type updateBody = {};

export type updateResponse = {};

async function handler(req: ApiRequestProps<updateBody, updateQuery>, res: ApiResponseType<any>) {
  const body = req.body as UpdateTeamProps;

  const { teamId } = await authUserPer({ req, authToken: true, per: ManagePermissionVal });

  await updateTeam({ teamId, ...body });
}

export default NextAPI(handler);
