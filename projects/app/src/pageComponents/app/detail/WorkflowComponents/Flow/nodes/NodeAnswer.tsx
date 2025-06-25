import React, { useMemo } from 'react';
import { type NodeProps } from 'reactflow';
import NodeCard from './render/NodeCard';
import { type FlowNodeItemType } from '@libchat/global/core/workflow/type/node.d';
import Container from '../components/Container';
import RenderInput from './render/RenderInput';
import RenderToolInput from './render/RenderToolInput';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext } from '../../context';

const NodeAnswer = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { nodeId, inputs } = data;
  const splitToolInputs = useContextSelector(WorkflowContext, (ctx) => ctx.splitToolInputs);

  const Render = useMemo(() => {
    const { isTool, commonInputs } = splitToolInputs(inputs, nodeId);

    return (
      <NodeCard selected={selected} {...data}>
        <Container>
          {isTool && (
            <>
              <Container>
                <RenderToolInput nodeId={nodeId} inputs={inputs} />
              </Container>
            </>
          )}
          <RenderInput nodeId={nodeId} flowInputList={commonInputs} />
          {/* <RenderOutput nodeId={nodeId} flowOutputList={outputs} /> */}
        </Container>
      </NodeCard>
    );
  }, [splitToolInputs, inputs, nodeId, selected, data]);

  return Render;
};
export default React.memo(NodeAnswer);
