import type { ModuleDispatchProps } from '@libchat/global/core/workflow/runtime/type';
import { type DispatchNodeResultType } from '@libchat/global/core/workflow/runtime/type.d';
import { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';

export type PluginOutputProps = ModuleDispatchProps<{
  [key: string]: any;
}>;
export type PluginOutputResponse = DispatchNodeResultType<{}>;

export const dispatchPluginOutput = (props: PluginOutputProps): PluginOutputResponse => {
  const { params } = props;

  return {
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      totalPoints: 0,
      pluginOutput: params
    }
  };
};
