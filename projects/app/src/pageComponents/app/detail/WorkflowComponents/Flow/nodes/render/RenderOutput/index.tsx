import React, { useEffect, useMemo, useState } from 'react';
import type { FlowNodeOutputItemType } from '@libchat/global/core/workflow/type/io.d';
import { Box, Button, Flex } from '@chakra-ui/react';
import { FlowNodeOutputTypeEnum } from '@libchat/global/core/workflow/node/constant';
import { NodeOutputKeyEnum } from '@libchat/global/core/workflow/constants';
import OutputLabel from './Label';
import { useTranslation } from 'next-i18next';
import { SmallAddIcon } from '@chakra-ui/icons';
import VariableTable from '../../NodePluginIO/VariableTable';
import { FlowValueTypeMap } from '@libchat/global/core/workflow/node/constant';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext } from '@/pageComponents/app/detail/WorkflowComponents/context';
import QuestionTip from '@libchat/web/components/common/MyTooltip/QuestionTip';
import FormLabel from '@libchat/web/components/common/MyBox/FormLabel';
import dynamic from 'next/dynamic';
import { defaultOutput } from './FieldEditModal';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const FieldEditModal = dynamic(() => import('./FieldEditModal'));

const RenderOutput = ({
  nodeId,
  flowOutputList
}: {
  nodeId: string;
  flowOutputList: FlowNodeOutputItemType[];
}) => {
  const { t } = useTranslation();
  const { llmModelList } = useSystemStore();
  const onChangeNode = useContextSelector(WorkflowContext, (v) => v.onChangeNode);

  const outputString = useMemo(() => JSON.stringify(flowOutputList), [flowOutputList]);
  const copyOutputs = useMemo(() => {
    return JSON.parse(outputString) as FlowNodeOutputItemType[];
  }, [outputString]);

  // Condition check
  const inputs = useContextSelector(WorkflowContext, (v) => {
    const node = v.nodeList.find((node) => node.nodeId === nodeId);
    return JSON.stringify(node?.inputs);
  });
  useEffect(() => {
    flowOutputList.forEach((output) => {
      if (!output.invalidCondition || !inputs) return;
      const parsedInputs = JSON.parse(inputs);

      const invalid = output.invalidCondition({
        inputs: parsedInputs,
        llmModelList
      });
      onChangeNode({
        nodeId,
        type: 'replaceOutput',
        key: output.key,
        value: {
          ...output,
          invalid
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyOutputs, nodeId, inputs, llmModelList]);

  const [editField, setEditField] = useState<FlowNodeOutputItemType>();

  const RenderDynamicOutputs = useMemo(() => {
    const dynamicOutputs = copyOutputs.filter(
      (item) => item.type === FlowNodeOutputTypeEnum.dynamic
    );
    const addOutput = dynamicOutputs.find((item) => item.key === NodeOutputKeyEnum.addOutputParam);
    const filterAddOutput = dynamicOutputs.filter(
      (item) => item.key !== NodeOutputKeyEnum.addOutputParam
    );

    const onSubmit = ({ data }: { data: FlowNodeOutputItemType }) => {
      if (!editField) return;

      if (editField.key) {
        onChangeNode({
          nodeId,
          type: 'replaceOutput',
          key: editField.key,
          value: data
        });
      } else {
        onChangeNode({
          nodeId,
          type: 'addOutput',
          value: data
        });
      }
    };

    return !addOutput?.customFieldConfig ? null : (
      <Box mb={5}>
        <Flex
          mb={2}
          className="nodrag"
          cursor={'default'}
          alignItems={'center'}
          position={'relative'}
        >
          <Box position={'relative'} fontWeight={'medium'} fontSize={'sm'}>
            {t((addOutput.label || 'common:core.workflow.Custom outputs') as any)}
          </Box>
          {addOutput.description && <QuestionTip ml={1} label={addOutput.description} />}
          <Box flex={'1 0 0'} />
          <Button
            variant={'whitePrimary'}
            leftIcon={<SmallAddIcon />}
            iconSpacing={1}
            size={'sm'}
            onClick={() => {
              setEditField(defaultOutput);
            }}
          >
            {t('common:add_new')}
          </Button>
        </Flex>
        <VariableTable
          variables={filterAddOutput.map((output) => ({
            label: output.label || '-',
            type: output.valueType ? t(FlowValueTypeMap[output.valueType]?.label as any) : '-',
            key: output.key
          }))}
          onEdit={(key) => {
            const output = copyOutputs.find((output) => output.key === key);
            if (!output) return;
            setEditField(output);
          }}
          onDelete={(key) => {
            onChangeNode({
              nodeId,
              type: 'delOutput',
              key
            });
          }}
        />

        {!!editField && (
          <FieldEditModal
            customFieldConfig={addOutput?.customFieldConfig}
            defaultValue={editField}
            keys={copyOutputs.map((output) => output.key)}
            onClose={() => setEditField(undefined)}
            onSubmit={onSubmit}
          />
        )}
      </Box>
    );
  }, [copyOutputs, editField, nodeId, onChangeNode, t]);

  const RenderCommonOutputs = useMemo(() => {
    const renderOutputs = copyOutputs.filter(
      (item) =>
        item.type !== FlowNodeOutputTypeEnum.dynamic && item.type !== FlowNodeOutputTypeEnum.hidden
    );

    return (
      <>
        {renderOutputs.map((output, i) => {
          return output.label && output.invalid !== true ? (
            <FormLabel
              key={output.key}
              required={output.required}
              position={'relative'}
              _notLast={{
                mb: i !== renderOutputs.length - 1 ? 4 : 0
              }}
            >
              <OutputLabel nodeId={nodeId} output={output} />
            </FormLabel>
          ) : null;
        })}
      </>
    );
  }, [copyOutputs, nodeId]);

  return (
    <>
      {RenderDynamicOutputs}
      {RenderCommonOutputs}
    </>
  );
};

export default React.memo(RenderOutput);
