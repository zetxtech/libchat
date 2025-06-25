import { GET, POST, PUT } from '@/web/common/api/request';
import type { PaginationProps, PaginationResponse } from '@libchat/web/common/fetch/type';
import type { OperationListItemType } from '@libchat/global/support/user/audit/type';
import type { AuditEventEnum } from '@libchat/global/support/user/audit/constants';

export const getOperationLogs = (
  props: PaginationProps & {
    tmbIds?: string[];
    events?: AuditEventEnum[];
  }
) => POST<PaginationResponse<OperationListItemType>>(`/proApi/support/user/audit/list`, props);
