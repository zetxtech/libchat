import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';

import { authCert } from '@libchat/service/support/permission/auth/common';
import { startTrainingQueue } from '@/service/core/dataset/training/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await authCert({ req, authToken: true });
    startTrainingQueue();
  } catch (error) {}
  jsonRes(res);
}
