import { ChatSiteItemType } from '@libchat/global/core/chat/type';
import { FlowNodeInputItemType } from '@libchat/global/core/workflow/type/io';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import type { PluginRunBoxTabEnum } from './constants';
import type { OutLinkChatAuthProps } from '@libchat/global/support/permission/chat';
import React from 'react';
import type { onStartChatType } from '../type';
import { ChatBoxInputFormType } from '../ChatBox/type';

export type PluginRunBoxProps = {
  appId: string;
  chatId: string;
  outLinkAuthData?: OutLinkChatAuthProps;

  onStartChat?: onStartChatType;
  onNewChat?: () => void;
  showTab?: PluginRunBoxTabEnum; // 如何设置了该字段，全局都 tab 不生效
};
