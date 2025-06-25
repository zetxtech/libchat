import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { MongoDatasetData } from '@libchat/service/core/dataset/data/schema';
import { replaceRegChars } from '@libchat/global/common/string/tools';
import { NextAPI } from '@/service/middleware/entry';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import type { ApiRequestProps } from '@libchat/service/type/next';
import type { DatasetDataListItemType } from '@/global/core/dataset/type';
import type { PaginationProps, PaginationResponse } from '@libchat/web/common/fetch/type';
import { parsePaginationRequest } from '@libchat/service/common/api/pagination';
import { MongoDatasetImageSchema } from '@libchat/service/core/dataset/image/schema';
import { readFromSecondary } from '@libchat/service/common/mongo/utils';
import { getDatasetImagePreviewUrl } from '@libchat/service/core/dataset/image/utils';

export type GetDatasetDataListProps = PaginationProps & {
  searchText?: string;
  collectionId: string;
};
export type GetDatasetDataListRes = PaginationResponse<DatasetDataListItemType>;

async function handler(
  req: ApiRequestProps<GetDatasetDataListProps>
): Promise<GetDatasetDataListRes> {
  let { searchText = '', collectionId } = req.body;
  let { offset, pageSize } = parsePaginationRequest(req);

  pageSize = Math.min(pageSize, 30);

  const { teamId, collection } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId,
    per: ReadPermissionVal
  });

  const queryReg = new RegExp(`${replaceRegChars(searchText)}`, 'i');
  const match = {
    teamId,
    datasetId: collection.datasetId,
    collectionId,
    ...(searchText.trim()
      ? {
          $or: [{ q: queryReg }, { a: queryReg }]
        }
      : {})
  };

  const [list, total] = await Promise.all([
    MongoDatasetData.find(match, '_id datasetId collectionId q a chunkIndex imageId teamId')
      .sort({ chunkIndex: 1, _id: -1 })
      .skip(offset)
      .limit(pageSize)
      .lean(),
    MongoDatasetData.countDocuments(match)
  ]);

  const imageIds = list.map((item) => item.imageId!).filter(Boolean);
  const imageSizeMap = new Map<string, number>();

  if (imageIds.length > 0) {
    const imageInfos = await MongoDatasetImageSchema.find(
      { _id: { $in: imageIds } },
      '_id length',
      {
        ...readFromSecondary
      }
    ).lean();

    imageInfos.forEach((item) => {
      imageSizeMap.set(String(item._id), item.length);
    });
  }

  return {
    list: list.map((item) => {
      const imageSize = item.imageId ? imageSizeMap.get(String(item.imageId)) : undefined;
      const imagePreviewUrl = item.imageId
        ? getDatasetImagePreviewUrl({
            imageId: item.imageId,
            teamId,
            datasetId: collection.datasetId,
            expiredMinutes: 30
          })
        : undefined;

      return {
        ...item,
        imageSize,
        imagePreviewUrl
      };
    }),
    total
  };
}

export default NextAPI(handler);
