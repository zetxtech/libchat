import type { NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { MongoAppVersion } from '@libchat/service/core/app/version/schema';
import { type PaginationProps, type PaginationResponse } from '@libchat/web/common/fetch/type';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { authApp } from '@libchat/service/support/permission/app/auth';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { type VersionListItemType } from '@libchat/global/core/app/version';
import { parsePaginationRequest } from '@libchat/service/common/api/pagination';
import { addSourceMember } from '@libchat/service/support/user/utils';

export type versionListBody = PaginationProps<{
  appId: string;
  isPublish?: boolean;
}>;

export type versionListResponse = PaginationResponse<VersionListItemType>;

async function handler(
  req: ApiRequestProps<versionListBody>,
  _res: NextApiResponse<any>
): Promise<versionListResponse> {
  const { appId, isPublish } = req.body;
  const { offset, pageSize } = parsePaginationRequest(req);

  await authApp({ appId, req, per: WritePermissionVal, authToken: true });

  const match = {
    appId,
    ...(isPublish !== undefined && { isPublish })
  };

  const [result, total] = await Promise.all([
    (async () => {
      const versions = await MongoAppVersion.find(match)
        .sort({
          time: -1
        })
        .skip(offset)
        .limit(pageSize)
        .lean();

      return addSourceMember({
        list: versions
      }).then((list) =>
        list.map((item) => ({
          ...item,
          isPublish: !!item.isPublish
        }))
      );
    })(),
    MongoAppVersion.countDocuments(match)
  ]);

  return {
    total,
    list: result
  };
}

export default NextAPI(handler);
