import { SystemPluginListItemType } from '@libchat/global/core/app/type';
import { FlowNodeTemplateTypeEnum } from '@libchat/global/core/workflow/constants';
import type {
  SystemPluginTemplateItemType,
  WorkflowTemplateBasicType
} from '@libchat/global/core/workflow/type';

export type SystemPluginConfigSchemaType = {
  pluginId: string;

  originCost: number; // n points/one time
  currentCost: number;
  hasTokenFee: boolean;
  isActive: boolean;
  pluginOrder: number;
  inputConfig?: SystemPluginTemplateItemType['inputConfig'];

  customConfig?: {
    name: string;
    avatar: string;
    intro?: string;
    version: string;
    weight?: number;
    workflow: WorkflowTemplateBasicType;
    templateType: string;
    associatedPluginId: string;
    userGuide: string;
    author?: string;
  };
};

export type TGroupType = {
  typeName: string;
  typeId: string;
};

export type PluginGroupSchemaType = {
  groupId: string;
  groupAvatar: string;
  groupName: string;
  groupTypes: TGroupType[];
  groupOrder: number;
};
