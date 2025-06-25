import { SystemConfigsTypeEnum } from '@libchat/global/common/system/config/constants';
import { MongoSystemConfigs } from './schema';
import { type LibChatConfigFileType } from '@libchat/global/common/system/types';
import { LibChatProUrl } from '../constants';
import { type LicenseDataType } from '@libchat/global/common/system/types';

export const getLibChatConfigFromDB = async (): Promise<{
  libchatConfig: LibChatConfigFileType;
  licenseData?: LicenseDataType;
}> => {
  if (!LibChatProUrl) {
    return {
      libchatConfig: {} as LibChatConfigFileType
    };
  }

  const [libchatConfig, licenseConfig] = await Promise.all([
    MongoSystemConfigs.findOne({
      type: SystemConfigsTypeEnum.libchat
    }).sort({
      createTime: -1
    }),
    MongoSystemConfigs.findOne({
      type: SystemConfigsTypeEnum.license
    }).sort({
      createTime: -1
    })
  ]);

  const config = libchatConfig?.value || {};
  const licenseData = licenseConfig?.value?.data as LicenseDataType | undefined;

  const libchatConfigTime = libchatConfig?.createTime.getTime().toString();
  const licenseConfigTime = licenseConfig?.createTime.getTime().toString();
  // 利用配置文件的创建时间（更新时间）来做缓存，如果前端命中缓存，则不需要再返回配置文件
  global.systemInitBufferId = libchatConfigTime
    ? `${libchatConfigTime}-${licenseConfigTime}`
    : undefined;

  return {
    libchatConfig: config as LibChatConfigFileType,
    licenseData
  };
};

export const updateLibChatConfigBuffer = async () => {
  const res = await MongoSystemConfigs.findOne({
    type: SystemConfigsTypeEnum.libchat
  }).sort({
    createTime: -1
  });

  if (!res) return;

  res.createTime = new Date();
  await res.save();

  global.systemInitBufferId = res.createTime.getTime().toString();
};

export const reloadLibChatConfigBuffer = async () => {
  const res = await MongoSystemConfigs.findOne({
    type: SystemConfigsTypeEnum.libchat
  }).sort({
    createTime: -1
  });
  if (!res) return;
  global.systemInitBufferId = res.createTime.getTime().toString();
};
