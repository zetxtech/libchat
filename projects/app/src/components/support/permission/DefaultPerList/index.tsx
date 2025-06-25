import { Box, type BoxProps } from '@chakra-ui/react';
import MySelect from '@libchat/web/components/common/MySelect';
import React from 'react';
import type { PermissionValueType } from '@libchat/global/support/permission/type';
import { ReadPermissionVal, WritePermissionVal } from '@libchat/global/support/permission/constant';
import { useRequest2 } from '@libchat/web/hooks/useRequest';
import { useConfirm } from '@libchat/web/hooks/useConfirm';
import { useTranslation } from 'next-i18next';

export enum defaultPermissionEnum {
  private = 'private',
  read = 'read',
  edit = 'edit'
}

type Props = Omit<BoxProps, 'onChange'> & {
  per: PermissionValueType;
  defaultPer: PermissionValueType;
  readPer?: PermissionValueType;
  writePer?: PermissionValueType;
  onChange: (v: PermissionValueType) => Promise<any> | any;
  isInheritPermission?: boolean;
  hasParent?: boolean;
};

const DefaultPermissionList = ({
  per,
  defaultPer,
  readPer = ReadPermissionVal,
  writePer = WritePermissionVal,
  onChange,
  isInheritPermission = false,
  hasParent,
  ...styles
}: Props) => {
  const { ConfirmModal, openConfirm } = useConfirm({});
  const { t } = useTranslation();
  const defaultPermissionSelectList = [
    { label: t('user:permission.only_collaborators'), value: defaultPer },
    { label: t('user:permission.team_read'), value: readPer },
    { label: t('user:permission.team_write'), value: writePer }
  ];

  const { runAsync: onRequestChange } = useRequest2((v: PermissionValueType) => onChange(v));

  return (
    <>
      <Box {...styles}>
        <MySelect
          list={defaultPermissionSelectList}
          value={per}
          onChange={(per) => {
            if (isInheritPermission && hasParent) {
              openConfirm(
                () => onRequestChange(per),
                undefined,
                t('common:permission.Remove InheritPermission Confirm')
              )();
            } else {
              return onRequestChange(per);
            }
          }}
          fontSize={styles?.fontSize}
          fontWeight={styles?.fontWeight}
        />
      </Box>
      <ConfirmModal />
    </>
  );
};

export default DefaultPermissionList;
