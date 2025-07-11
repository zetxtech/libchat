import MyBox from '@libchat/web/components/common/MyBox';
import React, { useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { EDGE_TYPE, FlowNodeTypeEnum } from '@libchat/global/core/workflow/node/constant';
import type { FlowNodeItemType } from '@libchat/global/core/workflow/type/node';
import { type Node, useReactFlow } from 'reactflow';
import { WorkflowInitContext, WorkflowNodeEdgeContext } from '../context/workflowInitContext';
import { useMemoizedFn } from 'ahooks';
import NodeTemplateListHeader from './components/NodeTemplates/header';
import NodeTemplateList from './components/NodeTemplates/list';
import { Popover, PopoverContent, PopoverBody } from '@chakra-ui/react';
import { WorkflowEventContext } from '../context/workflowEventContext';
import { useNodeTemplates } from './components/NodeTemplates/useNodeTemplates';
import { getNanoid } from '@libchat/global/common/string/tools';
import { popoverHeight, popoverWidth } from './hooks/useWorkflow';

const NodeTemplatesPopover = () => {
  const handleParams = useContextSelector(WorkflowEventContext, (v) => v.handleParams);
  const setHandleParams = useContextSelector(WorkflowEventContext, (v) => v.setHandleParams);

  const setNodes = useContextSelector(WorkflowNodeEdgeContext, (v) => v.setNodes);
  const setEdges = useContextSelector(WorkflowNodeEdgeContext, (v) => v.setEdges);

  const {
    templateType,
    parentId,
    templatesIsLoading,
    templates,
    loadNodeTemplates,
    onUpdateParentId
  } = useNodeTemplates();

  const onAddNode = useMemoizedFn(async ({ newNodes }: { newNodes: Node<FlowNodeItemType>[] }) => {
    setNodes((state) => {
      const newState = state
        .map((node) => ({
          ...node,
          selected: false
        }))
        // @ts-ignore
        .concat(newNodes);
      return newState;
    });

    if (!handleParams) return;
    const isToolHandle = handleParams?.handleId === 'selectedTools';

    const newEdges = newNodes
      .filter((node) => {
        // Exclude nodes that don't meet the conditions
        // 1. Tool set nodes must be connected through tool handle
        if (!isToolHandle && node.data.flowNodeType === FlowNodeTypeEnum.toolSet) {
          return false;
        }

        // 2. Exclude loop start and end nodes
        if (
          [FlowNodeTypeEnum.loopStart, FlowNodeTypeEnum.loopEnd].includes(node.data.flowNodeType)
        ) {
          return false;
        }

        // 3. Tool handle can only connect to tool nodes
        if (isToolHandle && !node.data.isTool) {
          return false;
        }

        return true;
      })
      .map((node) => ({
        id: getNanoid(),
        source: handleParams.nodeId as string,
        sourceHandle: handleParams.handleId,
        target: node.id,
        targetHandle: isToolHandle ? 'selectedTools' : `${node.id}-target-left`,
        type: EDGE_TYPE
      }));

    setEdges((state) => {
      const newState = state.concat(newEdges);
      return newState;
    });

    setHandleParams(null);
  });

  if (!handleParams) return null;

  return (
    <Popover
      isOpen={!!handleParams}
      onClose={() => setHandleParams(null)}
      closeOnBlur={true}
      closeOnEsc={true}
      autoFocus={true}
      isLazy
    >
      <PopoverContent
        position="fixed"
        top={`${handleParams.popoverPosition.y}px`}
        left={`${handleParams.popoverPosition.x + 10}px`}
        width={popoverWidth}
        height={popoverHeight}
        boxShadow="3px 0 20px rgba(0,0,0,0.2)"
        border={'none'}
      >
        <PopoverBody padding={0} h={'full'}>
          <MyBox
            isLoading={templatesIsLoading}
            display={'flex'}
            flexDirection={'column'}
            py={4}
            h={'full'}
            userSelect="none"
          >
            <NodeTemplateListHeader
              isPopover={true}
              templateType={templateType}
              loadNodeTemplates={loadNodeTemplates}
              parentId={parentId || ''}
              onUpdateParentId={onUpdateParentId}
            />
            <NodeTemplateList
              onAddNode={onAddNode}
              isPopover={true}
              templates={templates}
              templateType={templateType}
              onUpdateParentId={onUpdateParentId}
            />
          </MyBox>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(NodeTemplatesPopover);
