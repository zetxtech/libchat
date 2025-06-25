import { NextAPI } from '@/service/middleware/entry';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { FolderImgUrl } from '@libchat/global/common/file/image/constants';
import { parseParentIdInMongo } from '@libchat/global/common/parentFolder/utils';
import { DatasetTypeEnum } from '@libchat/global/core/dataset/constants';
import {
  OwnerPermissionVal,
  PerResourceTypeEnum,
  WritePermissionVal
} from '@libchat/global/support/permission/constant';
import { TeamDatasetCreatePermissionVal } from '@libchat/global/support/permission/user/constant';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { MongoDataset } from '@libchat/service/core/dataset/schema';
import { getResourceClbsAndGroups } from '@libchat/service/support/permission/controller';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { syncCollaborators } from '@libchat/service/support/permission/inheritPermission';
import { MongoResourcePermission } from '@libchat/service/support/permission/schema';
import { authUserPer } from '@libchat/service/support/permission/user/auth';
import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
export type DatasetFolderCreateQuery = {};
export type DatasetFolderCreateBody = {
  parentId?: string;
  name: string;
  intro: string;
};
export type DatasetFolderCreateResponse = {};
async function handler(
  req: ApiRequestProps<DatasetFolderCreateBody, DatasetFolderCreateQuery>,
  _res: ApiResponseType<any>
): Promise<DatasetFolderCreateResponse> {
  const { parentId, name, intro } = req.body;

  if (!name) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  const { teamId, tmbId } = parentId
    ? await authDataset({
        req,
        datasetId: parentId,
        authToken: true,
        authApiKey: true,
        per: WritePermissionVal
      })
    : await authUserPer({
        req,
        authToken: true,
        authApiKey: true,
        per: TeamDatasetCreatePermissionVal
      });

  await mongoSessionRun(async (session) => {
    const dataset = await MongoDataset.create({
      ...parseParentIdInMongo(parentId),
      avatar: FolderImgUrl,
      name,
      intro,
      teamId,
      tmbId,
      type: DatasetTypeEnum.folder
    });

    if (parentId) {
      const parentClbsAndGroups = await getResourceClbsAndGroups({
        teamId,
        resourceId: parentId,
        resourceType: PerResourceTypeEnum.dataset,
        session
      });

      await syncCollaborators({
        resourceType: PerResourceTypeEnum.dataset,
        teamId,
        resourceId: dataset._id,
        collaborators: parentClbsAndGroups,
        session
      });
    }

    if (!parentId) {
      await MongoResourcePermission.create(
        [
          {
            resourceType: PerResourceTypeEnum.dataset,
            teamId,
            resourceId: dataset._id,
            tmbId,
            permission: OwnerPermissionVal
          }
        ],
        { session, ordered: true }
      );
    }
  });
  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.CREATE_DATASET_FOLDER,
      params: {
        folderName: name
      }
    });
  })();

  return {};
}
export default NextAPI(handler);
