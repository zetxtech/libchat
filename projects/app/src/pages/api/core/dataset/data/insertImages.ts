import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authFrequencyLimit } from '@/service/common/frequencyLimit/api';
import { addSeconds } from 'date-fns';
import { removeFilesByPaths } from '@libchat/service/common/file/utils';
import { getUploadModel } from '@libchat/service/common/file/multer';
import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { createDatasetImage } from '@libchat/service/core/dataset/image/controller';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { createTrainingUsage } from '@libchat/service/support/wallet/usage/controller';
import { UsageSourceEnum } from '@libchat/global/support/wallet/usage/constants';
import { getEmbeddingModel, getLLMModel, getVlmModel } from '@libchat/service/core/ai/model';
import { pushDataListToTrainingQueue } from '@libchat/service/core/dataset/training/controller';
import { TrainingModeEnum } from '@libchat/global/core/dataset/constants';
import { removeDatasetImageExpiredTime } from '@libchat/service/core/dataset/image/utils';

export type insertImagesQuery = {};

export type insertImagesBody = {
  collectionId: string;
};

export type insertImagesResponse = {};

const authUploadLimit = (tmbId: string, num: number) => {
  if (!global.feConfigs.uploadFileMaxAmount) return;
  return authFrequencyLimit({
    eventId: `${tmbId}-uploadfile`,
    maxAmount: global.feConfigs.uploadFileMaxAmount * 2,
    expiredTime: addSeconds(new Date(), 30), // 30s
    num
  });
};

async function handler(
  req: ApiRequestProps<insertImagesBody, insertImagesQuery>,
  res: ApiResponseType<any>
): Promise<insertImagesResponse> {
  const filePaths: string[] = [];

  try {
    const upload = getUploadModel({
      maxSize: global.feConfigs?.uploadFileMaxSize
    });
    const {
      files,
      data: { collectionId }
    } = await upload.getUploadFiles<insertImagesBody>(req, res);
    filePaths.push(...files.map((item) => item.path));

    const { collection, teamId, tmbId } = await authDatasetCollection({
      collectionId,
      per: WritePermissionVal,
      req,
      authToken: true,
      authApiKey: true
    });
    const dataset = collection.dataset;

    await authUploadLimit(tmbId, files.length);

    // 1. Upload images to db
    const imageIds = await Promise.all(
      files.map(async (file) => {
        return (
          await createDatasetImage({
            teamId,
            datasetId: dataset._id,
            file
          })
        ).imageId;
      })
    );

    // 2. Insert images to training queue
    await mongoSessionRun(async (session) => {
      const traingBillId = await (async () => {
        const { billId } = await createTrainingUsage({
          teamId,
          tmbId,
          appName: collection.name,
          billSource: UsageSourceEnum.training,
          vectorModel: getEmbeddingModel(dataset.vectorModel)?.name,
          agentModel: getLLMModel(dataset.agentModel)?.name,
          vllmModel: getVlmModel(dataset.vlmModel)?.name,
          session
        });
        return billId;
      })();

      await pushDataListToTrainingQueue({
        teamId,
        tmbId,
        datasetId: dataset._id,
        collectionId,
        agentModel: dataset.agentModel,
        vectorModel: dataset.vectorModel,
        vlmModel: dataset.vlmModel,
        mode: TrainingModeEnum.imageParse,
        billId: traingBillId,
        data: imageIds.map((item, index) => ({
          imageId: item
        })),
        session
      });

      // 3. Clear ttl
      await removeDatasetImageExpiredTime({
        ids: imageIds,
        collectionId,
        session
      });
    });

    return {};
  } catch (error) {
    return Promise.reject(error);
  } finally {
    removeFilesByPaths(filePaths);
  }
}

export default NextAPI(handler);

export const config = {
  api: {
    bodyParser: false
  }
};
