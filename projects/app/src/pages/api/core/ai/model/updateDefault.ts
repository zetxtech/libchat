import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';
import { MongoSystemModel } from '@libchat/service/core/ai/config/schema';
import { loadSystemModels, updatedReloadSystemModel } from '@libchat/service/core/ai/config/utils';
import { updateLibChatConfigBuffer } from '@libchat/service/common/system/config/controller';
import type { ModelTypeEnum } from '@libchat/global/core/ai/model';
import { authSystemAdmin } from '@libchat/service/support/permission/user/auth';

export type updateDefaultQuery = {};

export type updateDefaultBody = {
  [ModelTypeEnum.llm]?: string;
  [ModelTypeEnum.embedding]?: string;
  [ModelTypeEnum.tts]?: string;
  [ModelTypeEnum.stt]?: string;
  [ModelTypeEnum.rerank]?: string;
  datasetTextLLM?: string;
  datasetImageLLM?: string;
};

export type updateDefaultResponse = {};

async function handler(
  req: ApiRequestProps<updateDefaultBody, updateDefaultQuery>,
  res: ApiResponseType<any>
): Promise<updateDefaultResponse> {
  await authSystemAdmin({ req });

  const { llm, embedding, tts, stt, rerank, datasetTextLLM, datasetImageLLM } = req.body;

  await mongoSessionRun(async (session) => {
    // Remove all default flags
    await MongoSystemModel.updateMany(
      {},
      {
        $unset: {
          'metadata.isDefault': 1,
          'metadata.isDefaultDatasetTextModel': 1,
          'metadata.isDefaultDatasetImageModel': 1
        }
      },
      { session }
    );

    if (llm) {
      await MongoSystemModel.updateOne(
        { model: llm },
        { $set: { 'metadata.isDefault': true } },
        { session }
      );
    }
    if (datasetTextLLM) {
      await MongoSystemModel.updateOne(
        { model: datasetTextLLM },
        { $set: { 'metadata.isDefaultDatasetTextModel': true } },
        { session }
      );
    }
    if (datasetImageLLM) {
      await MongoSystemModel.updateOne(
        { model: datasetImageLLM },
        { $set: { 'metadata.isDefaultDatasetImageModel': true } },
        { session }
      );
    }
    if (embedding) {
      await MongoSystemModel.updateOne(
        { model: embedding },
        { $set: { 'metadata.isDefault': true } },
        { session }
      );
    }
    if (tts) {
      await MongoSystemModel.updateOne(
        { model: tts },
        { $set: { 'metadata.isDefault': true } },
        { session }
      );
    }
    if (stt) {
      await MongoSystemModel.updateOne(
        { model: stt },
        { $set: { 'metadata.isDefault': true } },
        { session }
      );
    }
    if (rerank) {
      await MongoSystemModel.updateOne(
        { model: rerank },
        { $set: { 'metadata.isDefault': true } },
        { session }
      );
    }
  });

  await updatedReloadSystemModel();

  return {};
}

export default NextAPI(handler);
