import type { PostPublishAppProps } from '@/global/core/app/api';
import { GET, POST } from '@/web/common/api/request';
import type { AppVersionSchemaType } from '@libchat/global/core/app/version';
import type { PaginationProps } from '@libchat/web/common/fetch/type';
import type {
  getLatestVersionQuery,
  getLatestVersionResponse
} from '@/pages/api/core/app/version/latest';
import type { UpdateAppVersionBody } from '@/pages/api/core/app/version/update';
import type { versionListResponse } from '@/pages/api/core/app/version/list';

export const getAppLatestVersion = (data: getLatestVersionQuery) =>
  GET<getLatestVersionResponse>('/core/app/version/latest', data);

export const postPublishApp = (appId: string, data: PostPublishAppProps) =>
  POST(`/core/app/version/publish?appId=${appId}`, data);

export const getAppVersionList = (data: PaginationProps<{ appId: string }>) =>
  POST<versionListResponse>('/core/app/version/list', data);

export const getAppVersionDetail = (versionId: string, appId: string) =>
  GET<AppVersionSchemaType>(`/core/app/version/detail?versionId=${versionId}&appId=${appId}`);

export const updateAppVersion = (data: UpdateAppVersionBody) =>
  POST(`/core/app/version/update`, data);
