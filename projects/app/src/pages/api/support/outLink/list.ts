import { MongoOutLink } from '@libchat/service/support/outLink/schema';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { ManagePermissionVal } from '@libchat/global/support/permission/constant';
import type { ApiRequestProps } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { type OutLinkSchema } from '@libchat/global/support/outLink/type';
import type { PublishChannelEnum } from '@libchat/global/support/outLink/constant';

export const ApiMetadata = {
  name: '获取应用内所有 Outlink',
  author: 'Finley',
  version: '0.1.0'
};

export type OutLinkListQuery = {
  appId: string; // 应用 ID
  type: `${PublishChannelEnum}`;
};

export type OutLinkListBody = {};

// 应用内全部 Outlink 列表
export type OutLinkListResponse = OutLinkSchema[];

// 查询应用的所有 OutLink
export async function handler(
  req: ApiRequestProps<OutLinkListBody, OutLinkListQuery>
): Promise<OutLinkListResponse> {
  const { appId, type } = req.query;
  await authApp({
    req,
    authToken: true,
    appId,
    per: ManagePermissionVal
  });

  const data = await MongoOutLink.find({
    appId,
    type: type
  }).sort({
    _id: -1
  });

  return data;
}

export default NextAPI(handler);
