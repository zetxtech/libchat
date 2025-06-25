import { type IconProps } from '@chakra-ui/react';
import MyIcon from '@libchat/web/components/common/Icon';
import type { IconNameType } from '@libchat/web/components/common/Icon/type';

function IconButton({
  name,
  w = '1rem',
  ...props
}: {
  name: IconNameType;
} & IconProps) {
  return (
    <MyIcon
      name={name}
      w={w}
      h={w}
      transition={'background 0.1s'}
      cursor={'pointer'}
      p="1"
      rounded={'sm'}
      _hover={{
        bg: 'myGray.05',
        color: 'primary.600'
      }}
      {...props}
    />
  );
}

export default IconButton;
