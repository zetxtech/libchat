/* Auth app permission */
import { MongoApp } from '../../../core/app/schema';
import { type AppDetailType } from '@libchat/global/core/app/type.d';
import { parseHeaderCert } from '../controller';
import { PerResourceTypeEnum } from '@libchat/global/support/permission/constant';
import { AppErrEnum } from '@libchat/global/common/error/code/app';
import { getTmbInfoByTmbId } from '../../user/team/controller';
import { getResourcePermission } from '../controller';
import { AppPermission } from '@libchat/global/support/permission/app/controller';
import { type PermissionValueType } from '@libchat/global/support/permission/type';
import { AppFolderTypeList } from '@libchat/global/core/app/constants';
import { type ParentIdType } from '@libchat/global/common/parentFolder/type';
import { splitCombineToolId } from '../../../core/app/plugin/controller';
import { PluginSourceEnum } from '@libchat/global/core/plugin/constants';
import { type AuthModeType, type AuthResponseType } from '../type';
import { AppDefaultPermissionVal } from '@libchat/global/support/permission/app/constant';

export const authPluginByTmbId = async ({
  tmbId,
  appId,
  per
}: {
  tmbId: string;
  appId: string;
  per: PermissionValueType;
}) => {
  const { source } = splitCombineToolId(appId);
  if (source === PluginSourceEnum.personal) {
    const { app } = await authAppByTmbId({
      appId,
      tmbId,
      per
    });

    return app;
  }

  // commercial custom plugin already checked in "getSystemPluginTemplateById"
};

export const authAppByTmbId = async ({
  tmbId,
  appId,
  per,
  isRoot
}: {
  tmbId: string;
  appId: string;
  per: PermissionValueType;
  isRoot?: boolean;
}): Promise<{
  app: AppDetailType;
}> => {
  const { teamId, permission: tmbPer } = await getTmbInfoByTmbId({ tmbId });

  const app = await (async () => {
    const app = await MongoApp.findOne({ _id: appId }).lean();

    if (!app) {
      return Promise.reject(AppErrEnum.unExist);
    }

    if (isRoot) {
      return {
        ...app,
        permission: new AppPermission({ isOwner: true })
      };
    }

    if (String(app.teamId) !== teamId) {
      return Promise.reject(AppErrEnum.unAuthApp);
    }

    const isOwner = tmbPer.isOwner || String(app.tmbId) === String(tmbId);

    const { Per } = await (async () => {
      if (isOwner) {
        return {
          Per: new AppPermission({ isOwner: true })
        };
      }

      if (
        AppFolderTypeList.includes(app.type) ||
        app.inheritPermission === false ||
        !app.parentId
      ) {
        // 1. is a folder. (Folders have compeletely permission)
        // 2. inheritPermission is false.
        // 3. is root folder/app.
        const rp = await getResourcePermission({
          teamId,
          tmbId,
          resourceId: appId,
          resourceType: PerResourceTypeEnum.app
        });
        const Per = new AppPermission({ per: rp ?? AppDefaultPermissionVal, isOwner });
        return {
          Per
        };
      } else {
        // is not folder and inheritPermission is true and is not root folder.
        const { app: parent } = await authAppByTmbId({
          tmbId,
          appId: app.parentId,
          per
        });

        const Per = new AppPermission({
          per: parent.permission.value,
          isOwner
        });
        return {
          Per
        };
      }
    })();

    if (!Per.checkPer(per)) {
      return Promise.reject(AppErrEnum.unAuthApp);
    }

    return {
      ...app,
      permission: Per
    };
  })();

  return { app };
};

export const authApp = async ({
  appId,
  per,
  ...props
}: AuthModeType & {
  appId: ParentIdType;
  per: PermissionValueType;
}): Promise<
  AuthResponseType & {
    app: AppDetailType;
  }
> => {
  const result = await parseHeaderCert(props);
  const { tmbId } = result;

  if (!appId) {
    return Promise.reject(AppErrEnum.unExist);
  }

  const { app } = await authAppByTmbId({
    tmbId,
    appId,
    per,
    isRoot: result.isRoot
  });

  return {
    ...result,
    permission: app.permission,
    app
  };
};
