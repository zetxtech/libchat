import { NextAPI } from '@/service/middleware/entry';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { FolderImgUrl } from '@libchat/global/common/file/image/constants';
import { type ParentIdType } from '@libchat/global/common/parentFolder/type';
import { parseParentIdInMongo } from '@libchat/global/common/parentFolder/utils';
import { AppTypeEnum } from '@libchat/global/core/app/constants';
import {
  OwnerPermissionVal,
  PerResourceTypeEnum,
  WritePermissionVal
} from '@libchat/global/support/permission/constant';
import { TeamAppCreatePermissionVal } from '@libchat/global/support/permission/user/constant';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { MongoApp } from '@libchat/service/core/app/schema';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { getResourceClbsAndGroups } from '@libchat/service/support/permission/controller';
import { syncCollaborators } from '@libchat/service/support/permission/inheritPermission';
import { MongoResourcePermission } from '@libchat/service/support/permission/schema';
import { authUserPer } from '@libchat/service/support/permission/user/auth';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
export type CreateAppFolderBody = {
  parentId?: ParentIdType;
  name: string;
  intro?: string;
};

async function handler(req: ApiRequestProps<CreateAppFolderBody>) {
  const { name, intro, parentId } = req.body;

  if (!name) {
    Promise.reject(CommonErrEnum.missingParams);
  }

  // 凭证校验
  const { teamId, tmbId } = parentId
    ? await authApp({ req, appId: parentId, per: WritePermissionVal, authToken: true })
    : await authUserPer({ req, authToken: true, per: TeamAppCreatePermissionVal });

  // Create app
  await mongoSessionRun(async (session) => {
    const app = await MongoApp.create({
      ...parseParentIdInMongo(parentId),
      avatar: FolderImgUrl,
      name,
      intro,
      teamId,
      tmbId,
      type: AppTypeEnum.folder
    });

    if (parentId) {
      const parentClbsAndGroups = await getResourceClbsAndGroups({
        teamId,
        resourceId: parentId,
        resourceType: PerResourceTypeEnum.app,
        session
      });

      await syncCollaborators({
        resourceType: PerResourceTypeEnum.app,
        teamId,
        resourceId: app._id,
        collaborators: parentClbsAndGroups,
        session
      });
    } else {
      // Create default permission
      await MongoResourcePermission.create(
        [
          {
            resourceType: PerResourceTypeEnum.app,
            teamId,
            resourceId: app._id,
            tmbId,
            permission: OwnerPermissionVal
          }
        ],
        {
          session,
          ordered: true
        }
      );
    }
  });
  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.CREATE_APP_FOLDER,
      params: {
        folderName: name
      }
    });
  })();
}

export default NextAPI(handler);
