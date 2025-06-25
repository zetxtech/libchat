import { FlowValueTypeMap } from '@libchat/global/core/workflow/node/constant';
import { Box } from '@chakra-ui/react';
import type { WorkflowIOValueTypeEnum } from '@libchat/global/core/workflow/constants';
import MyTooltip from '@libchat/web/components/common/MyTooltip';
import React from 'react';
import { useTranslation } from 'next-i18next';

const ValueTypeLabel = ({
  valueType,
  valueDesc
}: {
  valueType?: WorkflowIOValueTypeEnum;
  valueDesc?: string;
}) => {
  const valueTypeData = valueType ? FlowValueTypeMap[valueType] : undefined;
  const { t } = useTranslation();
  const label = valueTypeData?.label || '';

  return !!label ? (
    <MyTooltip label={valueDesc}>
      <Box
        bg={'myGray.100'}
        color={'myGray.500'}
        border={'1px solid'}
        borderColor={'myGray.200'}
        borderRadius={'sm'}
        ml={2}
        px={1}
        h={6}
        display={'flex'}
        alignItems={'center'}
        fontSize={'11px'}
      >
        {t(label as any)}
      </Box>
    </MyTooltip>
  ) : null;
};

export default React.memo(ValueTypeLabel);
