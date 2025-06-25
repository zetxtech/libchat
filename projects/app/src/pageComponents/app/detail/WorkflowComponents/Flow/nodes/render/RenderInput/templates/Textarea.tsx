import React, { useCallback, useMemo } from 'react';
import type { RenderInputProps } from '../type';
import { useTranslation } from 'next-i18next';
import PromptEditor from '@libchat/web/components/common/Textarea/PromptEditor';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext } from '@/pageComponents/app/detail/WorkflowComponents/context';
import { useCreation } from 'ahooks';
import { AppContext } from '@/pageComponents/app/detail/context';
import { getEditorVariables } from '../../../../../utils';
import { WorkflowNodeEdgeContext } from '../../../../../context/workflowInitContext';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import VariableTip from '@/components/common/Textarea/MyTextarea/VariableTip';

const TextareaRender = ({ item, nodeId }: RenderInputProps) => {
  const { t } = useTranslation();
  const edges = useContextSelector(WorkflowNodeEdgeContext, (v) => v.edges);
  const nodeList = useContextSelector(WorkflowContext, (v) => v.nodeList);
  const onChangeNode = useContextSelector(WorkflowContext, (v) => v.onChangeNode);

  const { appDetail } = useContextSelector(AppContext, (v) => v);

  const { feConfigs } = useSystemStore();

  // get variable
  const variables = useCreation(() => {
    return getEditorVariables({
      nodeId,
      nodeList,
      edges,
      appDetail,
      t
    });
  }, [nodeId, nodeList, edges, appDetail, t]);

  const externalProviderWorkflowVariables = useMemo(() => {
    return (
      feConfigs?.externalProviderWorkflowVariables?.map((item) => ({
        key: item.key,
        label: item.name
      })) || []
    );
  }, [feConfigs?.externalProviderWorkflowVariables]);

  const onChange = useCallback(
    (e: string) => {
      onChangeNode({
        nodeId,
        type: 'updateInput',
        key: item.key,
        value: {
          ...item,
          value: e
        }
      });
    },
    [item, nodeId, onChangeNode]
  );

  const Render = useMemo(() => {
    return (
      <PromptEditor
        variableLabels={variables}
        variables={[...variables, ...externalProviderWorkflowVariables]}
        title={t(item.label as any)}
        maxLength={item.maxLength}
        minH={100}
        maxH={300}
        placeholder={t((item.placeholder as any) || '')}
        value={item.value}
        onChange={onChange}
      />
    );
  }, [
    externalProviderWorkflowVariables,
    item.label,
    item.maxLength,
    item.placeholder,
    item.value,
    onChange,
    t,
    variables
  ]);

  return Render;
};

export default React.memo(TextareaRender);

export const TextareaRightComponent = React.memo(function TextareaRightComponent({
  item,
  nodeId
}: RenderInputProps) {
  return <VariableTip transform={'translateY(2px)'} />;
});
