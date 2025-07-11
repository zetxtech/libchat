import type {
  UpdateDatasetCollaboratorBody,
  DatasetCollaboratorDeleteParams
} from '@libchat/global/core/dataset/collaborator';
import { DELETE, GET, POST } from '@/web/common/api/request';
import type { CollaboratorItemType } from '@libchat/global/support/permission/collaborator';

export const getCollaboratorList = (datasetId: string) =>
  GET<CollaboratorItemType[]>('/proApi/core/dataset/collaborator/list', { datasetId });

export const postUpdateDatasetCollaborators = (body: UpdateDatasetCollaboratorBody) =>
  POST('/proApi/core/dataset/collaborator/update', body);

export const deleteDatasetCollaborators = (params: DatasetCollaboratorDeleteParams) =>
  DELETE('/proApi/core/dataset/collaborator/delete', params);
