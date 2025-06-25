import { POST } from '@libchat/service/common/api/plusRequest';
import { type SendInform2UserProps } from '@libchat/global/support/user/inform/type';
import { LibChatProUrl } from '@libchat/service/common/system/constants';

export function sendOneInform(data: SendInform2UserProps) {
  if (!LibChatProUrl) return;
  return POST('/support/user/inform/create', data);
}
