import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { MongoChatInputGuide } from '@libchat/service/core/chat/inputGuide/schema';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';

export type createChatInputGuideQuery = {};

export type createInputGuideBody = {
  appId: string;
  textList: string[];
};

export type createInputGuideResponse = {
  insertLength: number;
};

async function handler(
  req: ApiRequestProps<createInputGuideBody, createChatInputGuideQuery>,
  res: ApiResponseType<any>
): Promise<createInputGuideResponse> {
  const { appId, textList } = req.body;
  await authApp({ req, appId, authToken: true, per: WritePermissionVal });

  try {
    const result = await MongoChatInputGuide.insertMany(
      textList.map((text) => ({
        appId,
        text
      })),
      {
        ordered: false
      }
    );
    return {
      insertLength: result.length
    };
  } catch (error: any) {
    const errLength = error.writeErrors?.length ?? textList.length;
    return {
      insertLength: textList.length - errLength
    };
  }
}

export default NextAPI(handler);
