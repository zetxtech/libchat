import type {
  UpdateAppCollaboratorBody,
  AppCollaboratorDeleteParams
} from '@libchat/global/core/app/collaborator';
import { DELETE, GET, POST } from '@/web/common/api/request';
import type { CollaboratorItemType } from '@libchat/global/support/permission/collaborator';

export const getCollaboratorList = (appId: string) =>
  GET<CollaboratorItemType[]>('/proApi/core/app/collaborator/list', { appId });

export const postUpdateAppCollaborators = (body: UpdateAppCollaboratorBody) =>
  POST('/proApi/core/app/collaborator/update', body);

export const deleteAppCollaborators = (params: AppCollaboratorDeleteParams) =>
  DELETE('/proApi/core/app/collaborator/delete', params);
