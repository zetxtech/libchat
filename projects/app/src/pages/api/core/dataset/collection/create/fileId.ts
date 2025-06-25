import { getFileById } from '@libchat/service/common/file/gridfs/controller';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { type FileIdCreateDatasetCollectionParams } from '@libchat/global/core/dataset/api';
import { createCollectionAndInsertData } from '@libchat/service/core/dataset/collection/controller';
import { DatasetCollectionTypeEnum } from '@libchat/global/core/dataset/constants';
import { BucketNameEnum } from '@libchat/global/common/file/constants';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { type CreateCollectionResponse } from '@/global/core/dataset/api';
import { deleteRawTextBuffer } from '@libchat/service/common/buffer/rawText/controller';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';

async function handler(
  req: ApiRequestProps<FileIdCreateDatasetCollectionParams>
): CreateCollectionResponse {
  const { fileId, customPdfParse, ...body } = req.body;

  const { teamId, tmbId, dataset } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    per: WritePermissionVal,
    datasetId: body.datasetId
  });

  // 1. read file
  const file = await getFileById({
    bucketName: BucketNameEnum.dataset,
    fileId
  });

  if (!file) {
    return Promise.reject(CommonErrEnum.fileNotFound);
  }

  const filename = file.filename;

  const { collectionId, insertResults } = await createCollectionAndInsertData({
    dataset,
    createCollectionParams: {
      ...body,
      teamId,
      tmbId,
      type: DatasetCollectionTypeEnum.file,
      name: filename,
      fileId,
      metadata: {
        relatedImgId: fileId
      },
      customPdfParse
    }
  });

  // remove buffer
  await deleteRawTextBuffer(fileId);

  return {
    collectionId,
    results: insertResults
  };
}

export default NextAPI(handler);
