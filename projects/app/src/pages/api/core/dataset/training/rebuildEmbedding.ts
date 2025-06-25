import { NextAPI } from '@/service/middleware/entry';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { MongoDataset } from '@libchat/service/core/dataset/schema';
import { MongoDatasetData } from '@libchat/service/core/dataset/data/schema';
import { MongoDatasetTraining } from '@libchat/service/core/dataset/training/schema';
import { createTrainingUsage } from '@libchat/service/support/wallet/usage/controller';
import { UsageSourceEnum } from '@libchat/global/support/wallet/usage/constants';
import { getLLMModel, getEmbeddingModel, getVlmModel } from '@libchat/service/core/ai/model';
import { TrainingModeEnum } from '@libchat/global/core/dataset/constants';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { OwnerPermissionVal } from '@libchat/global/support/permission/constant';

export type rebuildEmbeddingBody = {
  datasetId: string;
  vectorModel: string;
};

export type Response = {};

async function handler(req: ApiRequestProps<rebuildEmbeddingBody>): Promise<Response> {
  const { datasetId, vectorModel } = req.body;

  const { teamId, tmbId, dataset } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId,
    per: OwnerPermissionVal
  });

  // check vector model
  if (!vectorModel || dataset.vectorModel === vectorModel) {
    return Promise.reject('vectorModel 不合法');
  }

  // check rebuilding or training
  const [rebuilding, training] = await Promise.all([
    MongoDatasetData.findOne({ teamId, datasetId, rebuilding: true }),
    MongoDatasetTraining.findOne({ teamId, datasetId })
  ]);

  if (rebuilding || training) {
    return Promise.reject('数据集正在训练或者重建中，请稍后再试');
  }

  const { billId } = await createTrainingUsage({
    teamId,
    tmbId,
    appName: '切换索引模型',
    billSource: UsageSourceEnum.training,
    vectorModel: getEmbeddingModel(dataset.vectorModel)?.name,
    agentModel: getLLMModel(dataset.agentModel)?.name,
    vllmModel: getVlmModel(dataset.vlmModel)?.name
  });

  // update vector model and dataset.data rebuild field
  await mongoSessionRun(async (session) => {
    await MongoDataset.findByIdAndUpdate(
      datasetId,
      {
        vectorModel
      },
      { session }
    );
    await MongoDatasetData.updateMany(
      {
        teamId,
        datasetId
      },
      {
        $set: {
          rebuilding: true
        }
      },
      {
        session
      }
    );
  });

  // get 10 init dataset.data
  const max = global.systemEnv?.vectorMaxProcess || 10;
  const arr = new Array(max * 2).fill(0);

  for await (const _ of arr) {
    try {
      const hasNext = await mongoSessionRun(async (session) => {
        // get next dataset.data
        const data = await MongoDatasetData.findOneAndUpdate(
          {
            rebuilding: true,
            teamId,
            datasetId
          },
          {
            $unset: {
              rebuilding: null
            },
            updateTime: new Date()
          },
          {
            session
          }
        ).select({
          _id: 1,
          collectionId: 1
        });

        if (data) {
          await MongoDatasetTraining.create(
            [
              {
                teamId,
                tmbId,
                datasetId,
                collectionId: data.collectionId,
                billId,
                mode: TrainingModeEnum.chunk,
                model: vectorModel,
                dataId: data._id,
                retryCount: 50
              }
            ],
            {
              session,
              ordered: true
            }
          );
        }

        return !!data;
      });

      if (!hasNext) {
        break;
      }
    } catch (error) {}
  }

  return {};
}

export default NextAPI(handler);
