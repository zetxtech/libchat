import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadFile } from '@libchat/service/common/file/gridfs/controller';
import { getUploadModel } from '@libchat/service/common/file/multer';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { type FileCreateDatasetCollectionParams } from '@libchat/global/core/dataset/api';
import { removeFilesByPaths } from '@libchat/service/common/file/utils';
import { createCollectionAndInsertData } from '@libchat/service/core/dataset/collection/controller';
import { DatasetCollectionTypeEnum } from '@libchat/global/core/dataset/constants';
import { getNanoid } from '@libchat/global/common/string/tools';
import { BucketNameEnum } from '@libchat/global/common/file/constants';
import { NextAPI } from '@/service/middleware/entry';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { type CreateCollectionResponse } from '@/global/core/dataset/api';

async function handler(req: NextApiRequest, res: NextApiResponse<any>): CreateCollectionResponse {
  let filePaths: string[] = [];

  try {
    // Create multer uploader
    const upload = getUploadModel({
      maxSize: global.feConfigs?.uploadFileMaxSize
    });
    const { file, data, bucketName } =
      await upload.getUploadFile<FileCreateDatasetCollectionParams>(
        req,
        res,
        BucketNameEnum.dataset
      );
    filePaths = [file.path];

    if (!file || !bucketName) {
      throw new Error('file is empty');
    }

    const { teamId, tmbId, dataset } = await authDataset({
      req,
      authToken: true,
      authApiKey: true,
      per: WritePermissionVal,
      datasetId: data.datasetId
    });

    const { fileMetadata, collectionMetadata, ...collectionData } = data;
    const collectionName = file.originalname;

    const relatedImgId = getNanoid();

    // 1. upload file
    const fileId = await uploadFile({
      teamId,
      uid: tmbId,
      bucketName,
      path: file.path,
      filename: file.originalname,
      contentType: file.mimetype,
      metadata: fileMetadata
    });

    // 2. delete tmp file
    removeFilesByPaths(filePaths);

    // 3. Create collection
    const { collectionId, insertResults } = await createCollectionAndInsertData({
      dataset,
      createCollectionParams: {
        ...collectionData,
        name: collectionName,
        teamId,
        tmbId,
        type: DatasetCollectionTypeEnum.file,
        fileId,
        metadata: {
          ...collectionMetadata,
          relatedImgId
        }
      }
    });

    return { collectionId, results: insertResults };
  } catch (error) {
    removeFilesByPaths(filePaths);

    return Promise.reject(error);
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};

export default NextAPI(handler);
