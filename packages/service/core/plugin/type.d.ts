import { PluginTemplateType } from '@libchat/global/core/plugin/type.d';
import type { SystemPluginTemplateItemType } from '@libchat/global/core/workflow/type';

declare global {
  var communityPlugins: SystemPluginTemplateItemType[];
}
