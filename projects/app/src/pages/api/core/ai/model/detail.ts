import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { type SystemModelItemType } from '@libchat/service/core/ai/type';
import { authSystemAdmin } from '@libchat/service/support/permission/user/auth';
import { findModelFromAlldata } from '@libchat/service/core/ai/model';

export type detailQuery = {
  model: string;
};

export type detailBody = {};

export type detailResponse = SystemModelItemType;

async function handler(
  req: ApiRequestProps<detailBody, detailQuery>,
  res: ApiResponseType<any>
): Promise<detailResponse> {
  await authSystemAdmin({ req });

  const { model } = req.query;
  const modelItem = findModelFromAlldata(model);
  if (!modelItem) {
    return Promise.reject('Model not found');
  }
  return modelItem;
}

export default NextAPI(handler);
