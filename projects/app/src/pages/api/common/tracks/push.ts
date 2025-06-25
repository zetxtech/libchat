import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { addLog } from '@libchat/service/common/system/log';
import type { TrackEnum } from '@libchat/global/common/middle/tracks/constants';
import { TrackModel } from '@libchat/service/common/middle/tracks/schema';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { useIPFrequencyLimit } from '@libchat/service/common/middle/reqFrequencyLimit';

export type pushQuery = {};

export type pushBody = {
  event: TrackEnum;
  data: any;
};

export type pushResponse = {};

async function handler(
  req: ApiRequestProps<pushBody, pushQuery>,
  res: ApiResponseType<any>
): Promise<pushResponse> {
  if (!global.feConfigs?.isPlus) return {};

  const { teamId, tmbId, userId } = await authCert({
    req,
    authToken: true
  });

  const data = {
    teamId,
    tmbId,
    uid: userId,
    event: req.body.event,
    data: req.body.data
  };

  addLog.info('Push tracks', data);
  return TrackModel.create(data);
}

export default NextAPI(useIPFrequencyLimit({ id: 'push-tracks', seconds: 1, limit: 5 }), handler);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5kb'
    }
  }
};
