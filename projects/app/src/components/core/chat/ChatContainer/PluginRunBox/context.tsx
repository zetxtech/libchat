import React, { type ReactNode, useCallback, useMemo, useRef } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { type PluginRunBoxProps } from './type';
import {
  type AIChatItemValueItemType,
  type RuntimeUserPromptType
} from '@libchat/global/core/chat/type';
import { type FieldValues } from 'react-hook-form';
import { PluginRunBoxTabEnum } from './constants';
import { useToast } from '@libchat/web/hooks/useToast';
import { getNanoid } from '@libchat/global/common/string/tools';
import { ChatItemValueTypeEnum, ChatRoleEnum } from '@libchat/global/core/chat/constants';
import { type generatingMessageProps } from '../type';
import { SseResponseEventEnum } from '@libchat/global/core/workflow/runtime/constants';
import { useTranslation } from 'next-i18next';
import { type ChatBoxInputFormType } from '../ChatBox/type';
import { chats2GPTMessages } from '@libchat/global/core/chat/adapt';
import { getPluginRunUserQuery } from '@libchat/global/core/workflow/utils';
import { cloneDeep } from 'lodash';
import { ChatItemContext } from '@/web/core/chat/context/chatItemContext';
import { ChatRecordContext } from '@/web/core/chat/context/chatRecordContext';
import { type AppFileSelectConfigType } from '@libchat/global/core/app/type';
import { defaultAppSelectFileConfig } from '@libchat/global/core/app/constants';
import { mergeChatResponseData } from '@libchat/global/core/chat/utils';
import { getErrText } from '@libchat/global/common/error/utils';

type PluginRunContextType = PluginRunBoxProps & {
  isChatting: boolean;
  onSubmit: (e: ChatBoxInputFormType) => Promise<any>;
  instruction: string;
  fileSelectConfig: AppFileSelectConfigType;
};

export const PluginRunContext = createContext<PluginRunContextType>({
  isChatting: false,
  onSubmit: function (e: FieldValues): Promise<any> {
    throw new Error('Function not implemented.');
  },
  instruction: '',
  fileSelectConfig: defaultAppSelectFileConfig,
  appId: '',
  chatId: '',
  outLinkAuthData: {}
});

const PluginRunContextProvider = ({
  children,
  ...props
}: PluginRunBoxProps & { children: ReactNode }) => {
  const { onStartChat } = props;

  const pluginInputs = useContextSelector(ChatItemContext, (v) => v.chatBoxData?.app?.pluginInputs);
  const setTab = useContextSelector(ChatItemContext, (v) => v.setPluginRunTab);
  const variablesForm = useContextSelector(ChatItemContext, (v) => v.variablesForm);
  const chatConfig = useContextSelector(ChatItemContext, (v) => v.chatBoxData?.app?.chatConfig);

  const setChatRecords = useContextSelector(ChatRecordContext, (v) => v.setChatRecords);
  const chatRecords = useContextSelector(ChatRecordContext, (v) => v.chatRecords);

  const { instruction = '', fileSelectConfig = defaultAppSelectFileConfig } = useMemo(
    () => chatConfig || {},
    [chatConfig]
  );

  const { toast } = useToast();
  const chatController = useRef(new AbortController());
  const { t } = useTranslation();
  /* Abort chat completions, questionGuide */
  const abortRequest = useCallback(() => {
    chatController.current?.abort('stop');
  }, []);

  const generatingMessage = useCallback(
    ({ event, text = '', status, name, tool, nodeResponse, variables }: generatingMessageProps) => {
      setChatRecords((state) =>
        state.map((item, index) => {
          if (index !== state.length - 1 || item.obj !== ChatRoleEnum.AI) return item;

          const lastValue: AIChatItemValueItemType = JSON.parse(
            JSON.stringify(item.value[item.value.length - 1])
          );

          if (event === SseResponseEventEnum.flowNodeResponse && nodeResponse) {
            return {
              ...item,
              responseData: item.responseData
                ? [...item.responseData, nodeResponse]
                : [nodeResponse]
            };
          } else if (event === SseResponseEventEnum.flowNodeStatus && status) {
            return {
              ...item,
              status,
              moduleName: name
            };
          } else if (
            (event === SseResponseEventEnum.answer || event === SseResponseEventEnum.fastAnswer) &&
            text
          ) {
            if (!lastValue || !lastValue.text) {
              const newValue: AIChatItemValueItemType = {
                type: ChatItemValueTypeEnum.text,
                text: {
                  content: text
                }
              };
              return {
                ...item,
                value: item.value.concat(newValue)
              };
            } else {
              lastValue.text.content += text;
              return {
                ...item,
                value: item.value.slice(0, -1).concat(lastValue)
              };
            }
          } else if (event === SseResponseEventEnum.toolCall && tool) {
            const val: AIChatItemValueItemType = {
              type: ChatItemValueTypeEnum.tool,
              tools: [tool]
            };
            return {
              ...item,
              value: item.value.concat(val)
            };
          } else if (
            event === SseResponseEventEnum.toolParams &&
            tool &&
            lastValue.type === ChatItemValueTypeEnum.tool &&
            lastValue?.tools
          ) {
            lastValue.tools = lastValue.tools.map((item) => {
              if (item.id === tool.id) {
                item.params += tool.params;
              }
              return item;
            });
            return {
              ...item,
              value: item.value.slice(0, -1).concat(lastValue)
            };
          } else if (event === SseResponseEventEnum.toolResponse && tool) {
            // replace tool response
            return {
              ...item,
              value: item.value.map((val) => {
                if (val.type === ChatItemValueTypeEnum.tool && val.tools) {
                  const tools = val.tools.map((item) =>
                    item.id === tool.id ? { ...item, response: tool.response } : item
                  );
                  return {
                    ...val,
                    tools
                  };
                }
                return val;
              })
            };
          } else if (event === SseResponseEventEnum.updateVariables && variables) {
            variablesForm.setValue('variables', variables);
          }

          return item;
        })
      );
    },
    [setChatRecords, variablesForm]
  );

  const isChatting = useMemo(
    () =>
      chatRecords[chatRecords.length - 1] &&
      chatRecords[chatRecords.length - 1]?.status !== 'finish',
    [chatRecords]
  );

  const onSubmit = useCallback(
    async ({ variables, files }: ChatBoxInputFormType) => {
      if (!onStartChat) return;
      if (isChatting) {
        toast({
          title: t('chat:is_chatting'),
          status: 'warning'
        });
        return;
      }

      // reset controller
      abortRequest();
      const abortSignal = new AbortController();
      chatController.current = abortSignal;

      setChatRecords([
        {
          ...getPluginRunUserQuery({
            pluginInputs,
            variables,
            files: files as RuntimeUserPromptType['files']
          }),
          status: 'finish'
        },
        {
          dataId: getNanoid(24),
          obj: ChatRoleEnum.AI,
          value: [
            {
              type: ChatItemValueTypeEnum.text,
              text: {
                content: ''
              }
            }
          ],
          status: 'loading'
        }
      ]);
      setTab(PluginRunBoxTabEnum.output);

      const messages = chats2GPTMessages({
        messages: [
          {
            dataId: getNanoid(24),
            obj: ChatRoleEnum.Human,
            value: []
          }
        ],
        reserveId: true,
        reserveTool: true
      });

      try {
        // Remove files icon
        const formatVariables = cloneDeep(variables);
        for (const key in formatVariables) {
          if (Array.isArray(formatVariables[key])) {
            formatVariables[key].forEach((item) => {
              if (item.url && item.icon) {
                delete item.icon;
              }
            });
          }
        }

        await onStartChat({
          messages,
          controller: chatController.current,
          generatingMessage,
          variables: {
            files,
            ...formatVariables
          }
        });

        setChatRecords((state) =>
          state.map((item, index) => {
            if (index !== state.length - 1) return item;

            // Check node response error
            const responseData = mergeChatResponseData(item.responseData || []);
            if (responseData[responseData.length - 1]?.error) {
              toast({
                title: t(getErrText(responseData[responseData.length - 1].error)),
                status: 'error'
              });
            }

            return {
              ...item,
              status: 'finish',
              responseData
            };
          })
        );
      } catch (err: any) {
        toast({ title: err.message, status: 'error' });
        setChatRecords((state) =>
          state.map((item, index) => {
            if (index !== state.length - 1) return item;
            return {
              ...item,
              status: 'finish'
            };
          })
        );
      }
    },
    [
      abortRequest,
      generatingMessage,
      isChatting,
      onStartChat,
      pluginInputs,
      setChatRecords,
      setTab,
      t,
      toast
    ]
  );

  const contextValue: PluginRunContextType = {
    ...props,
    isChatting,
    onSubmit,
    instruction,
    fileSelectConfig
  };
  return <PluginRunContext.Provider value={contextValue}>{children}</PluginRunContext.Provider>;
};

export default PluginRunContextProvider;
