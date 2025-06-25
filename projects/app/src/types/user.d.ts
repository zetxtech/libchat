import { UsageSourceEnum } from '@libchat/global/support/wallet/usage/constants';
import type { UserModelSchema } from '@libchat/global/support/user/type';

export interface UserUpdateParams {
  balance?: number;
  avatar?: string;
  timezone?: string;
}
