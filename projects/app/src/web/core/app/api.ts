import { GET, POST, DELETE, PUT } from '@/web/common/api/request';
import type { AppDetailType, AppListItemType } from '@libchat/global/core/app/type.d';
import type { GetAppChatLogsParams } from '@/global/core/api/appReq.d';
import type { AppUpdateParams, AppChangeOwnerBody } from '@/global/core/app/api';
import type { CreateAppBody } from '@/pages/api/core/app/create';
import type { ListAppBody } from '@/pages/api/core/app/list';
import type { AppLogsListItemType } from '@/types/app';
import type { PaginationResponse } from '@libchat/web/common/fetch/type';
import type { getBasicInfoResponse } from '@/pages/api/core/app/getBasicInfo';

/**
 * 获取应用列表
 */
export const getMyApps = (data?: ListAppBody) =>
  POST<AppListItemType[]>('/core/app/list', data, {
    maxQuantity: 1
  });

/**
 * 创建一个应用
 */
export const postCreateApp = (data: CreateAppBody) => POST<string>('/core/app/create', data);

export const getMyAppsByTags = (data: {}) => POST(`/proApi/core/chat/team/getApps`, data);
/**
 * 根据 ID 删除应用
 */
export const delAppById = (id: string) => DELETE(`/core/app/del?appId=${id}`);

/**
 * 根据 ID 获取应用
 */
export const getAppDetailById = (id: string) => GET<AppDetailType>(`/core/app/detail?appId=${id}`);

/**
 * 根据 ID 更新应用
 */
export const putAppById = (id: string, data: AppUpdateParams) =>
  PUT(`/core/app/update?appId=${id}`, data);

/**
 * Get app basic info by ids
 */
export const getAppBasicInfoByIds = (ids: string[]) =>
  POST<getBasicInfoResponse>(`/core/app/getBasicInfo`, { ids });

// =================== chat logs
export const getAppChatLogs = (data: GetAppChatLogsParams) =>
  POST<PaginationResponse<AppLogsListItemType>>(`/core/app/getChatLogs`, data, { maxQuantity: 1 });

export const resumeInheritPer = (appId: string) =>
  GET(`/core/app/resumeInheritPermission`, { appId });

export const changeOwner = (data: AppChangeOwnerBody) => POST(`/proApi/core/app/changeOwner`, data);
