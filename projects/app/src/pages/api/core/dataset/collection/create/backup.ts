import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { getUploadModel } from '@libchat/service/common/file/multer';
import { removeFilesByPaths } from '@libchat/service/common/file/utils';
import { addLog } from '@libchat/service/common/system/log';
import { readRawTextByLocalFile } from '@libchat/service/common/file/read/utils';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { createCollectionAndInsertData } from '@libchat/service/core/dataset/collection/controller';
import {
  DatasetCollectionDataProcessModeEnum,
  DatasetCollectionTypeEnum
} from '@libchat/global/core/dataset/constants';
import { i18nT } from '@libchat/web/i18n/utils';
import { uploadFile } from '@libchat/service/common/file/gridfs/controller';

export type backupQuery = {};

export type backupBody = {};

export type backupResponse = {};

async function handler(req: ApiRequestProps<backupBody, backupQuery>, res: ApiResponseType<any>) {
  const filePaths: string[] = [];

  try {
    const upload = getUploadModel({
      maxSize: global.feConfigs?.uploadFileMaxSize
    });
    const { file, data } = await upload.getUploadFile<{ datasetId: string }>(req, res);
    filePaths.push(file.path);

    if (file.mimetype !== 'text/csv') {
      throw new Error('File must be a CSV file');
    }

    const { teamId, tmbId, dataset } = await authDataset({
      req,
      authToken: true,
      authApiKey: true,
      per: WritePermissionVal,
      datasetId: data.datasetId
    });

    // 1. Read
    const { rawText } = await readRawTextByLocalFile({
      teamId,
      tmbId,
      path: file.path,
      encoding: file.encoding,
      getFormatText: false
    });
    if (!rawText.trim().startsWith('q,a,indexes')) {
      return Promise.reject(i18nT('dataset:backup_template_invalid'));
    }

    // 2. Upload file
    const fileId = await uploadFile({
      teamId,
      uid: tmbId,
      bucketName: 'dataset',
      path: file.path,
      filename: file.originalname,
      contentType: file.mimetype
    });

    // 2. delete tmp file
    removeFilesByPaths(filePaths);

    // 3. Create collection
    await createCollectionAndInsertData({
      dataset,
      rawText,
      backupParse: true,
      createCollectionParams: {
        teamId,
        tmbId,
        datasetId: dataset._id,
        name: file.originalname,
        type: DatasetCollectionTypeEnum.file,
        fileId,
        trainingType: DatasetCollectionDataProcessModeEnum.backup
      }
    });

    return {};
  } catch (error) {
    addLog.error(`Backup dataset collection create error: ${error}`);
    removeFilesByPaths(filePaths);
    return Promise.reject(error);
  }
}

export default NextAPI(handler);

export const config = {
  api: {
    bodyParser: false
  }
};
