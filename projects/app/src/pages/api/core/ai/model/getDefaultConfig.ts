import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authSystemAdmin } from '@libchat/service/support/permission/user/auth';
import { getSystemModelConfig } from '@libchat/service/core/ai/config/utils';
import { type SystemModelItemType } from '@libchat/service/core/ai/type';

export type getDefaultQuery = { model: string };

export type getDefaultBody = {};

async function handler(
  req: ApiRequestProps<getDefaultBody, getDefaultQuery>,
  res: ApiResponseType<any>
): Promise<SystemModelItemType> {
  await authSystemAdmin({ req });

  const model = req.query.model;

  return getSystemModelConfig(model);
}

export default NextAPI(handler);
