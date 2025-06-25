import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { MongoAppVersion } from '@libchat/service/core/app/version/schema';
import { LibChatProUrl } from '@libchat/service/common/system/constants';
import { POST } from '@libchat/service/common/api/plusRequest';

/* 初始化发布的版本 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await authCert({ req, authRoot: true });

    await MongoAppVersion.updateMany(
      {},
      {
        $set: {
          isPublish: true
        }
      }
    );

    if (LibChatProUrl) {
      await POST('/admin/init/4810');
    }

    jsonRes(res, {
      message: 'success'
    });
  } catch (error) {
    console.log(error);

    jsonRes(res, {
      code: 500,
      error
    });
  }
}
