import { PluginTemplateType } from '@libchat/global/core/plugin/type.d';
import { systemPluginResponseEnum } from '@libchat/global/core/workflow/runtime/constants';
import type { SystemPluginTemplateItemType } from '@libchat/global/core/workflow/type';
import type { PluginGroupSchemaType } from '@libchat/service/core/app/plugin/type';

export type SystemPluginResponseType = Promise<Record<string, any>>;
export type SystemPluginSpecialResponse = {
  type: 'SYSTEM_PLUGIN_BASE64';
  value: string;
  extension: string;
};

declare global {
  var pluginGroups: PluginGroupSchemaType[];
  var systemPlugins: SystemPluginTemplateItemType[];
  var systemPluginCb: Record<string, (e: any) => SystemPluginResponseType>;
}
