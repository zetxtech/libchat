import { DELETE, GET, POST, PUT } from '@/web/common/api/request';
import type {
  postCreateOrgData,
  putUpdateOrgData,
  putUpdateOrgMembersData
} from '@libchat/global/support/user/team/org/api';
import type { OrgListItemType } from '@libchat/global/support/user/team/org/type';
import type { putMoveOrgType } from '@libchat/global/support/user/team/org/api';
import { type PaginationProps, type PaginationResponse } from '@libchat/web/common/fetch/type';
import { type TeamMemberItemType } from '@libchat/global/support/user/team/type';
import { type ParentIdType } from '@libchat/global/common/parentFolder/type';

export const getOrgList = (params: {
  orgId: string;
  withPermission?: boolean;
  searchKey?: string;
}) => POST<OrgListItemType[]>(`/proApi/support/user/team/org/list`, params);

export const postCreateOrg = (data: postCreateOrgData) =>
  POST('/proApi/support/user/team/org/create', data);

export const deleteOrg = (orgId: string) =>
  DELETE('/proApi/support/user/team/org/delete', { orgId });

export const putMoveOrg = (data: putMoveOrgType) => PUT('/proApi/support/user/team/org/move', data);

export const putUpdateOrg = (data: putUpdateOrgData) =>
  PUT('/proApi/support/user/team/org/update', data);

// org members
export const putUpdateOrgMembers = (data: putUpdateOrgMembersData) =>
  PUT('/proApi/support/user/team/org/updateMembers', data);

export const getOrgMembers = (data: PaginationProps<{ orgPath?: string }>) =>
  GET<PaginationResponse<TeamMemberItemType>>(`/proApi/support/user/team/org/members`, data);

export const deleteOrgMember = (orgId: string, tmbId: string) =>
  DELETE('/proApi/support/user/team/org/deleteMember', { orgId, tmbId });
