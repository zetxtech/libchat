export enum SystemConfigsTypeEnum {
  libchat = 'libchat',
  libchatPro = 'libchatPro',
  systemMsgModal = 'systemMsgModal',
  license = 'license'
}

export const SystemConfigsTypeMap = {
  [SystemConfigsTypeEnum.libchat]: {
    label: 'libchat'
  },
  [SystemConfigsTypeEnum.libchatPro]: {
    label: 'libchatPro'
  },
  [SystemConfigsTypeEnum.systemMsgModal]: {
    label: 'systemMsgModal'
  },
  [SystemConfigsTypeEnum.license]: {
    label: 'license'
  }
};
