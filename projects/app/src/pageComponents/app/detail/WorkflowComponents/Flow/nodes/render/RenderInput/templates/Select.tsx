import React, { useMemo } from 'react';
import type { RenderInputProps } from '../type';
import MySelect from '@libchat/web/components/common/MySelect';
import { WorkflowContext } from '@/pageComponents/app/detail/WorkflowComponents/context';
import { useContextSelector } from 'use-context-selector';

const SelectRender = ({ item, nodeId }: RenderInputProps) => {
  const onChangeNode = useContextSelector(WorkflowContext, (v) => v.onChangeNode);

  const Render = useMemo(() => {
    return (
      <MySelect
        className="nowheel"
        width={'100%'}
        value={item.value}
        list={item.list || []}
        onChange={(e) => {
          onChangeNode({
            nodeId,
            type: 'updateInput',
            key: item.key,
            value: {
              ...item,
              value: e
            }
          });
        }}
      />
    );
  }, [item, nodeId, onChangeNode]);

  return Render;
};

export default React.memo(SelectRender);
