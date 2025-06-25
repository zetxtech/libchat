import { getLLMModel, getEmbeddingModel, getVlmModel } from '@libchat/service/core/ai/model';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { NextAPI } from '@/service/middleware/entry';
import { type DatasetItemType } from '@libchat/global/core/dataset/type';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { getWebsiteSyncDatasetStatus } from '@libchat/service/core/dataset/websiteSync';
import { DatasetStatusEnum, DatasetTypeEnum } from '@libchat/global/core/dataset/constants';
import { filterApiDatasetServerPublicData } from '@libchat/global/core/dataset/apiDataset/utils';

type Query = {
  id: string;
};

async function handler(req: ApiRequestProps<Query>): Promise<DatasetItemType> {
  const { id: datasetId } = req.query as {
    id: string;
  };

  if (!datasetId) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  // 凭证校验
  const { dataset, permission } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId,
    per: ReadPermissionVal
  });

  const { status, errorMsg } = await (async () => {
    if (dataset.type === DatasetTypeEnum.websiteDataset) {
      return await getWebsiteSyncDatasetStatus(datasetId);
    }

    return {
      status: DatasetStatusEnum.active,
      errorMsg: undefined
    };
  })();
  console.log(filterApiDatasetServerPublicData(dataset.apiDatasetServer));
  return {
    ...dataset,
    status,
    errorMsg,
    permission,
    vectorModel: getEmbeddingModel(dataset.vectorModel),
    agentModel: getLLMModel(dataset.agentModel),
    vlmModel: getVlmModel(dataset.vlmModel),
    apiDatasetServer: filterApiDatasetServerPublicData(dataset.apiDatasetServer)
  };
}

export default NextAPI(handler);
