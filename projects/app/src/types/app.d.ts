import { FlowNodeTypeEnum } from '@libchat/global/core/workflow/node/constant';
import { WorkflowIOValueTypeEnum } from '@libchat/global/core/workflow/constants';
import { XYPosition } from 'reactflow';
import { AppModuleItemTypeEnum, ModulesInputItemTypeEnum } from '../constants/app';
import { AppTypeEnum } from '@libchat/global/core/app/constants';
import type { FlowNodeOutputTargetItemType } from '@libchat/global/core/workflow/node/type.d';
import {
  FlowNodeInputItemType,
  FlowNodeOutputItemType
} from '@libchat/global/core/workflow/type/io.d';
import type { StoreNodeItemType } from '@libchat/global/core/workflow/type/node.d';
import type { FlowNodeTemplateType } from '@libchat/global/core/workflow/type/node';
import type { ChatSchema } from '@libchat/global/core/chat/type';
import type { AppSchema } from '@libchat/global/core/app/type';
import { ChatModelType } from '@/constants/model';
import { TeamMemberStatusEnum } from '@libchat/global/support/user/team/constant';
import type { SourceMember } from '@libchat/global/support/user/type';

export interface ShareAppItem {
  _id: string;
  avatar: string;
  name: string;
  intro: string;
  userId: string;
  share: AppSchema['share'];
  isCollection: boolean;
}

/* app module */
export type AppItemType = {
  id: string;
  name: string;
  modules: StoreNodeItemType[];
  edges: StoreEdgeItemType[];
};

export type AppLogsListItemType = {
  _id: string;
  id: string;
  source: string;
  time: Date;
  title: string;
  customTitle: string;
  messageCount: number;
  userGoodFeedbackCount: number;
  userBadFeedbackCount: number;
  customFeedbacksCount: number;
  markCount: number;
  outLinkUid?: string;
  tmbId: string;
  sourceMember: SourceMember;
};
