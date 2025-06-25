import { AuthUserTypeEnum } from '@libchat/global/support/permission/constant';
import { UsageSourceEnum } from '@libchat/global/support/wallet/usage/constants';

export function authType2UsageSource({
  authType,
  shareId,
  source
}: {
  authType?: `${AuthUserTypeEnum}`;
  shareId?: string;
  source?: UsageSourceEnum;
}) {
  if (source) return source;
  if (shareId) return UsageSourceEnum.shareLink;
  if (authType === AuthUserTypeEnum.apikey) return UsageSourceEnum.api;
  return UsageSourceEnum.libchat;
}
