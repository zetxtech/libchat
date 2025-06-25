import type { SearchTestProps, SearchTestResponse } from '@/global/core/dataset/api.d';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { pushGenerateVectorUsage, pushRerankUsage } from '@/service/support/wallet/usage/push';
import {
  deepRagSearch,
  defaultSearchDatasetData
} from '@libchat/service/core/dataset/search/controller';
import { updateApiKeyUsage } from '@libchat/service/support/openapi/tools';
import { UsageSourceEnum } from '@libchat/global/support/wallet/usage/constants';
import { checkTeamAIPoints } from '@libchat/service/support/permission/teamLimit';
import { NextAPI } from '@/service/middleware/entry';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { useIPFrequencyLimit } from '@libchat/service/common/middle/reqFrequencyLimit';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { getRerankModel } from '@libchat/service/core/ai/model';
import { addAuditLog } from '@libchat/service/support/user/audit/util';
import { AuditEventEnum } from '@libchat/global/support/user/audit/constants';
import { getI18nDatasetType } from '@libchat/service/support/user/audit/util';
async function handler(req: ApiRequestProps<SearchTestProps>): Promise<SearchTestResponse> {
  const {
    datasetId,
    text,
    limit = 5000,
    similarity,
    searchMode,
    embeddingWeight,

    usingReRank,
    rerankModel,
    rerankWeight,

    datasetSearchUsingExtensionQuery = false,
    datasetSearchExtensionModel,
    datasetSearchExtensionBg,

    datasetDeepSearch = false,
    datasetDeepSearchModel,
    datasetDeepSearchMaxTimes,
    datasetDeepSearchBg
  } = req.body;

  if (!datasetId || !text) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  const start = Date.now();

  // auth dataset role
  const { dataset, teamId, tmbId, apikey } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId,
    per: ReadPermissionVal
  });
  // auth balance
  await checkTeamAIPoints(teamId);

  const rerankModelData = getRerankModel(rerankModel);

  const searchData = {
    histories: [],
    teamId,
    reRankQuery: text,
    queries: [text],
    model: dataset.vectorModel,
    limit: Math.min(limit, 20000),
    similarity,
    datasetIds: [datasetId],
    searchMode,
    embeddingWeight,
    usingReRank,
    rerankModel: rerankModelData,
    rerankWeight
  };
  const {
    searchRes,
    embeddingTokens,
    reRankInputTokens,
    usingReRank: searchUsingReRank,
    queryExtensionResult,
    deepSearchResult,
    ...result
  } = datasetDeepSearch
    ? await deepRagSearch({
        ...searchData,
        datasetDeepSearchModel,
        datasetDeepSearchMaxTimes,
        datasetDeepSearchBg
      })
    : await defaultSearchDatasetData({
        ...searchData,
        datasetSearchUsingExtensionQuery,
        datasetSearchExtensionModel,
        datasetSearchExtensionBg
      });

  // push bill
  const source = apikey ? UsageSourceEnum.api : UsageSourceEnum.libchat;
  const { totalPoints: embeddingTotalPoints } = pushGenerateVectorUsage({
    teamId,
    tmbId,
    inputTokens: embeddingTokens,
    model: dataset.vectorModel,
    source,

    ...(queryExtensionResult && {
      extensionModel: queryExtensionResult.model,
      extensionInputTokens: queryExtensionResult.inputTokens,
      extensionOutputTokens: queryExtensionResult.outputTokens
    }),
    ...(deepSearchResult && {
      deepSearchModel: deepSearchResult.model,
      deepSearchInputTokens: deepSearchResult.inputTokens,
      deepSearchOutputTokens: deepSearchResult.outputTokens
    })
  });
  const { totalPoints: reRankTotalPoints } = searchUsingReRank
    ? pushRerankUsage({
        teamId,
        tmbId,
        inputTokens: reRankInputTokens,
        model: rerankModelData.model,
        source
      })
    : { totalPoints: 0 };

  if (apikey) {
    updateApiKeyUsage({
      apikey,
      totalPoints: embeddingTotalPoints + reRankTotalPoints
    });
  }
  (async () => {
    addAuditLog({
      tmbId,
      teamId,
      event: AuditEventEnum.SEARCH_TEST,
      params: {
        datasetName: dataset.name,
        datasetType: getI18nDatasetType(dataset.type)
      }
    });
  })();

  return {
    list: searchRes,
    duration: `${((Date.now() - start) / 1000).toFixed(3)}s`,
    queryExtensionModel: queryExtensionResult?.model,
    usingReRank: searchUsingReRank,
    ...result
  };
}

export default NextAPI(useIPFrequencyLimit({ id: 'search-test', seconds: 1, limit: 15 }), handler);
