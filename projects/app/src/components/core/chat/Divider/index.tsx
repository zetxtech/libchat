import { Box, Flex } from '@chakra-ui/react';
import React from 'react';
import MyIcon from '@libchat/web/components/common/Icon';
import type { IconNameType } from '@libchat/web/components/common/Icon/type.d';

const ChatBoxDivider = ({
  icon,
  text,
  iconColor
}: {
  icon: IconNameType;
  text: string;
  iconColor?: string;
}) => {
  return (
    <Box>
      <Flex alignItems={'center'} py={2} gap={2}>
        <MyIcon name={icon} w={'14px'} color={iconColor || 'myGray.900'} />
        <Box color={'myGray.500'} fontSize={'sm'}>
          {text}
        </Box>
        <Box h={'1px'} mt={1} bg={'myGray.200'} flex={'1'} />
      </Flex>
    </Box>
  );
};

export default ChatBoxDivider;
