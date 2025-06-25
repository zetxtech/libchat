import type { NextApiResponse } from 'next';
import { MongoChatInputGuide } from '@libchat/service/core/chat/inputGuide/schema';
import { type PaginationProps, type PaginationResponse } from '@libchat/web/common/fetch/type';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { type ChatInputGuideSchemaType } from '@libchat/global/core/chat/inputGuide/type';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { parsePaginationRequest } from '@libchat/service/common/api/pagination';

export type ChatInputGuideProps = PaginationProps<{
  appId: string;
  searchKey: string;
}>;
export type ChatInputGuideResponse = PaginationResponse<ChatInputGuideSchemaType>;

async function handler(
  req: ApiRequestProps<ChatInputGuideProps>,
  res: NextApiResponse<any>
): Promise<ChatInputGuideResponse> {
  const { appId, searchKey } = req.body;
  const { offset, pageSize } = parsePaginationRequest(req);

  await authApp({ req, appId, authToken: true, per: ReadPermissionVal });

  const params = {
    appId,
    ...(searchKey && { text: { $regex: new RegExp(searchKey, 'i') } })
  };

  const [result, total] = await Promise.all([
    MongoChatInputGuide.find(params).sort({ _id: -1 }).skip(offset).limit(pageSize),
    MongoChatInputGuide.countDocuments(params)
  ]);

  return {
    list: result,
    total
  };
}

export default NextAPI(handler);
