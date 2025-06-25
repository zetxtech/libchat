import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { plusRequest } from '@libchat/service/common/api/plusRequest';

export type OutLinkOffiAccountQuery = any;
export type OutLinkOffiAccountBody = any;
export type OutLinkOffiAccountResponse = {};

async function handler(
  req: ApiRequestProps<OutLinkOffiAccountBody, OutLinkOffiAccountQuery>,
  res: ApiResponseType<any>
): Promise<any> {
  const { token } = req.query;
  const result = await plusRequest({
    method: req.method,
    url: `support/outLink/offiaccount/${token}`,
    params: req.query,
    data: req.body
  });

  if (result.data?.data?.message) {
    res.send(result.data.data.message);
  }

  res.send('');
}

export default handler;
