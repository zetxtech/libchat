import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { MongoSystemModel } from '@libchat/service/core/ai/config/schema';
import { authSystemAdmin } from '@libchat/service/support/permission/user/auth';
import { findModelFromAlldata } from '@libchat/service/core/ai/model';
import { updateLibChatConfigBuffer } from '@libchat/service/common/system/config/controller';
import { loadSystemModels, updatedReloadSystemModel } from '@libchat/service/core/ai/config/utils';

export type deleteQuery = {
  model: string;
};

export type deleteBody = {};

export type deleteResponse = {};

async function handler(
  req: ApiRequestProps<deleteBody, deleteQuery>,
  res: ApiResponseType<any>
): Promise<deleteResponse> {
  await authSystemAdmin({ req });

  const { model } = req.query;

  const modelData = findModelFromAlldata(model);

  if (!modelData) {
    return Promise.reject('Model not found');
  }

  if (!modelData.isCustom) {
    return Promise.reject('System model cannot be deleted');
  }

  await MongoSystemModel.deleteOne({ model });

  await updatedReloadSystemModel();

  return {};
}

export default NextAPI(handler);
