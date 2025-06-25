import type { ChatSourceEnum } from '@libchat/global/core/chat/constants';
import { UsageSourceEnum } from '@libchat/global/support/wallet/usage/constants';
import type { PaginationProps } from '@libchat/web/common/fetch/type';

export type GetAppChatLogsProps = {
  appId: string;
  dateStart: Date;
  dateEnd: Date;
  sources?: ChatSourceEnum[];
  logTitle?: string;
};

export type GetAppChatLogsParams = PaginationProps<GetAppChatLogsProps>;
