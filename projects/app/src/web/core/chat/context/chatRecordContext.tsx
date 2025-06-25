import { type getPaginationRecordsBody } from '@/pages/api/core/chat/getPaginationRecords';
import { type ChatSiteItemType } from '@libchat/global/core/chat/type';
import { type PaginationResponse } from '@libchat/web/common/fetch/type';
import { useScrollPagination } from '@libchat/web/hooks/useScrollPagination';
import React, { type ReactNode, useMemo, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { ChatItemContext } from './chatItemContext';
import { getChatRecords } from '../api';
import { ChatStatusEnum } from '@libchat/global/core/chat/constants';
import { getNanoid } from '@libchat/global/common/string/tools';
import { type BoxProps } from '@chakra-ui/react';

type ChatRecordContextType = {
  chatRecords: ChatSiteItemType[];
  setChatRecords: React.Dispatch<React.SetStateAction<ChatSiteItemType[]>>;
  isChatRecordsLoaded: boolean;
  totalRecordsCount: number;
  ScrollData: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    ScrollContainerRef?: React.RefObject<HTMLDivElement>;
  } & BoxProps) => React.JSX.Element;
};

export const ChatRecordContext = createContext<ChatRecordContextType>({
  chatRecords: [],
  setChatRecords: function (value: React.SetStateAction<ChatSiteItemType[]>): void {
    throw new Error('Function not implemented.');
  },
  isChatRecordsLoaded: false,

  totalRecordsCount: 0,
  ScrollData: function ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    ScrollContainerRef?: React.RefObject<HTMLDivElement>;
  } & BoxProps): React.JSX.Element {
    throw new Error('Function not implemented.');
  }
});

/* 
    具体对话记录的上下文
*/
const ChatRecordContextProvider = ({
  children,
  params
}: {
  children: ReactNode;
  params: Omit<getPaginationRecordsBody, 'offset' | 'pageSize'>;
}) => {
  const ChatBoxRef = useContextSelector(ChatItemContext, (v) => v.ChatBoxRef);
  const [isChatRecordsLoaded, setIsChatRecordsLoaded] = useState(false);

  const {
    data: chatRecords,
    ScrollData,
    setData: setChatRecords,
    total: totalRecordsCount
  } = useScrollPagination(
    async (data: getPaginationRecordsBody): Promise<PaginationResponse<ChatSiteItemType>> => {
      setIsChatRecordsLoaded(false);

      const res = await getChatRecords(data);

      // First load scroll to bottom
      if (Number(data.offset) === 0) {
        function scrollToBottom() {
          requestAnimationFrame(
            ChatBoxRef?.current ? () => ChatBoxRef?.current?.scrollToBottom?.() : scrollToBottom
          );
        }
        scrollToBottom();
      }

      setIsChatRecordsLoaded(true);

      return {
        ...res,
        list: res.list.map((item) => ({
          ...item,
          dataId: item.dataId || getNanoid(),
          status: ChatStatusEnum.finish
        }))
      };
    },
    {
      pageSize: 10,
      refreshDeps: [params],
      params,
      scrollLoadType: 'top',
      showErrorToast: false
    }
  );

  const contextValue = useMemo(() => {
    return {
      chatRecords,
      setChatRecords,
      totalRecordsCount,
      ScrollData,
      isChatRecordsLoaded
    };
  }, [ScrollData, chatRecords, setChatRecords, totalRecordsCount, isChatRecordsLoaded]);
  return <ChatRecordContext.Provider value={contextValue}>{children}</ChatRecordContext.Provider>;
};

export default ChatRecordContextProvider;
