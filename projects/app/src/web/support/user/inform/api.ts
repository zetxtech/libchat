import { GET, POST } from '@/web/common/api/request';
import type { UserInformType } from '@libchat/global/support/user/inform/type';
import type { SystemMsgModalValueType } from '@libchat/service/support/user/inform/type';
import type { PaginationProps, PaginationResponse } from '@libchat/web/common/fetch/type';

export const getInforms = (data: PaginationProps) =>
  POST<PaginationResponse<UserInformType>>(`/proApi/support/user/inform/list`, data);

export const getUnreadCount = () =>
  GET<{
    unReadCount: number;
    importantInforms: UserInformType[];
  }>(`/proApi/support/user/inform/countUnread`);
export const readInform = (id: string) => GET(`/proApi/support/user/inform/read`, { id });

export const getSystemMsgModalData = () =>
  GET<SystemMsgModalValueType>(`/proApi/support/user/inform/getSystemMsgModal`);
