import type { FlowNodeOutputItemType } from '@libchat/global/core/workflow/type/io.d';

export type RenderOutputProps = {
  outputs?: FlowNodeOutputItemType[];
  item: FlowNodeOutputItemType;
  nodeId: string;
};
