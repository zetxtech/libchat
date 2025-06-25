import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { MongoApp } from '@libchat/service/core/app/schema';

/* pg 中的数据搬到 mongo dataset.datas 中，并做映射 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await authCert({ req, authRoot: true });

    await MongoApp.updateMany(
      {},
      {
        $set: {
          inheritPermission: true
        }
      }
    );

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
