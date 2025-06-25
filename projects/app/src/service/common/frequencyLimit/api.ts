import { type AuthFrequencyLimitProps } from '@libchat/global/common/frequenctLimit/type';
import { POST } from '@libchat/service/common/api/plusRequest';

export const authFrequencyLimit = (data: AuthFrequencyLimitProps) => {
  if (!global.feConfigs.isPlus) return;

  return POST('/common/freequencyLimit/auth', data);
};
