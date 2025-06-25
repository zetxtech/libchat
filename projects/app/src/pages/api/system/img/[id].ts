import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';

import { readMongoImg } from '@libchat/service/common/file/image/controller';

// get the models available to the system
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query as { id: string };

    const { binary, mime } = await readMongoImg({ id });

    res.setHeader('Content-Type', mime);
    res.send(binary);
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error
    });
  }
}
