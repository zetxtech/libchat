import type { ApiRequestProps } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authApp } from '@libchat/service/support/permission/app/auth';
import {
  ManagePermissionVal,
  PerResourceTypeEnum
} from '@libchat/global/support/permission/constant';
import { resumeInheritPermission } from '@libchat/service/support/permission/inheritPermission';
import { MongoApp } from '@libchat/service/core/app/schema';
import { AppFolderTypeList } from '@libchat/global/core/app/constants';
export type ResumeInheritPermissionQuery = {
  appId: string;
};
export type ResumeInheritPermissionBody = {};
// resume the app's inherit permission.
async function handler(
  req: ApiRequestProps<ResumeInheritPermissionBody, ResumeInheritPermissionQuery>
) {
  const { appId } = req.query;
  const { app } = await authApp({
    appId,
    req,
    authToken: true,
    per: ManagePermissionVal
  });

  if (app.parentId) {
    await resumeInheritPermission({
      resource: app,
      folderTypeList: AppFolderTypeList,
      resourceType: PerResourceTypeEnum.app,
      resourceModel: MongoApp
    });
  } else {
    await MongoApp.updateOne(
      {
        _id: appId
      },
      {
        inheritPermission: true
      }
    );
  }
}
export default NextAPI(handler);
