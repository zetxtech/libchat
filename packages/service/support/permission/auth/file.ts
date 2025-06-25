import { type AuthModeType, type AuthResponseType } from '../type';
import { type DatasetFileSchema } from '@libchat/global/core/dataset/type';
import { parseHeaderCert } from '../controller';
import { getFileById } from '../../../common/file/gridfs/controller';
import { BucketNameEnum } from '@libchat/global/common/file/constants';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { OwnerPermissionVal, ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { Permission } from '@libchat/global/support/permission/controller';

export const authCollectionFile = async ({
  fileId,
  per = OwnerPermissionVal,
  ...props
}: AuthModeType & {
  fileId: string;
}): Promise<
  AuthResponseType & {
    file: DatasetFileSchema;
  }
> => {
  const authRes = await parseHeaderCert(props);
  const { teamId, tmbId } = authRes;

  const file = await getFileById({ bucketName: BucketNameEnum.dataset, fileId });

  if (!file) {
    return Promise.reject(CommonErrEnum.fileNotFound);
  }

  if (file.metadata?.teamId !== teamId) {
    return Promise.reject(CommonErrEnum.unAuthFile);
  }

  const permission = new Permission({
    per: ReadPermissionVal,
    isOwner: file.metadata?.uid === tmbId || file.metadata?.tmbId === tmbId
  });

  if (!permission.checkPer(per)) {
    return Promise.reject(CommonErrEnum.unAuthFile);
  }

  return {
    ...authRes,
    permission,
    file
  };
};
