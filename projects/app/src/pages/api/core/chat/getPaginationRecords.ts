import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { type GetChatRecordsProps } from '@/global/core/chat/api';
import { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';
import { transformPreviewHistories } from '@/global/core/chat/utils';
import { AppTypeEnum } from '@libchat/global/core/app/constants';
import { getChatItems } from '@libchat/service/core/chat/controller';
import { authChatCrud } from '@/service/support/permission/auth/chat';
import { MongoApp } from '@libchat/service/core/app/schema';
import { AppErrEnum } from '@libchat/global/common/error/code/app';
import { ChatItemValueTypeEnum, ChatRoleEnum } from '@libchat/global/core/chat/constants';
import {
  filterPublicNodeResponseData,
  removeAIResponseCite
} from '@libchat/global/core/chat/utils';
import { GetChatTypeEnum } from '@/global/core/chat/constants';
import { type PaginationProps, type PaginationResponse } from '@libchat/web/common/fetch/type';
import { type ChatItemType } from '@libchat/global/core/chat/type';
import { parsePaginationRequest } from '@libchat/service/common/api/pagination';

export type getPaginationRecordsQuery = {};

export type getPaginationRecordsBody = PaginationProps & GetChatRecordsProps;

export type getPaginationRecordsResponse = PaginationResponse<ChatItemType>;

async function handler(
  req: ApiRequestProps<getPaginationRecordsBody, getPaginationRecordsQuery>,
  _res: ApiResponseType<any>
): Promise<getPaginationRecordsResponse> {
  const { appId, chatId, loadCustomFeedbacks, type = GetChatTypeEnum.normal } = req.body;

  const { offset, pageSize } = parsePaginationRequest(req);

  if (!appId || !chatId) {
    return {
      list: [],
      total: 0
    };
  }

  const [app, { responseDetail, showNodeStatus, authType }] = await Promise.all([
    MongoApp.findById(appId, 'type').lean(),
    authChatCrud({
      req,
      authToken: true,
      authApiKey: true,
      ...req.body
    })
  ]);

  if (!app) {
    return Promise.reject(AppErrEnum.unExist);
  }
  const isPlugin = app.type === AppTypeEnum.plugin;
  const isOutLink = authType === GetChatTypeEnum.outLink;

  const commonField =
    'dataId obj value adminFeedback userGoodFeedback userBadFeedback time hideInUI durationSeconds errorMsg';
  const fieldMap = {
    [GetChatTypeEnum.normal]: `${commonField} ${
      DispatchNodeResponseKeyEnum.nodeResponse
    } ${loadCustomFeedbacks ? 'customFeedbacks' : ''}`,
    [GetChatTypeEnum.outLink]: `${commonField} ${DispatchNodeResponseKeyEnum.nodeResponse}`,
    [GetChatTypeEnum.team]: `${commonField} ${DispatchNodeResponseKeyEnum.nodeResponse}`
  };

  const { total, histories } = await getChatItems({
    appId,
    chatId,
    field: fieldMap[type],
    offset,
    limit: pageSize
  });

  // Remove important information
  if (isOutLink && app.type !== AppTypeEnum.plugin) {
    histories.forEach((item) => {
      if (item.obj === ChatRoleEnum.AI) {
        item.responseData = filterPublicNodeResponseData({
          flowResponses: item.responseData,
          responseDetail
        });

        if (showNodeStatus === false) {
          item.value = item.value.filter((v) => v.type !== ChatItemValueTypeEnum.tool);
        }
      }
    });
  }
  if (!responseDetail) {
    histories.forEach((item) => {
      if (item.obj === ChatRoleEnum.AI) {
        item.value = removeAIResponseCite(item.value, false);
      }
    });
  }

  return {
    list: isPlugin ? histories : transformPreviewHistories(histories, responseDetail),
    total
  };
}

export default NextAPI(handler);
