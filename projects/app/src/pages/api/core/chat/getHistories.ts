import { MongoChat } from '@libchat/service/core/chat/chatSchema';
import { ChatSourceEnum } from '@libchat/global/core/chat/constants';
import { authOutLink } from '@/service/support/permission/auth/outLink';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { authTeamSpaceToken } from '@/service/support/permission/auth/team';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps, type ApiResponseType } from '@libchat/service/type/next';
import { type PaginationProps, type PaginationResponse } from '@libchat/web/common/fetch/type';
import { type GetHistoriesProps } from '@/global/core/chat/api';
import { parsePaginationRequest } from '@libchat/service/common/api/pagination';
import { addMonths } from 'date-fns';

export type getHistoriesQuery = {};

export type getHistoriesBody = PaginationProps<GetHistoriesProps>;

export type getHistoriesResponse = {};

async function handler(
  req: ApiRequestProps<getHistoriesBody, getHistoriesQuery>,
  _res: ApiResponseType<any>
): Promise<PaginationResponse<getHistoriesResponse>> {
  const {
    appId,
    shareId,
    outLinkUid,
    teamId,
    teamToken,
    source,
    startCreateTime,
    endCreateTime,
    startUpdateTime,
    endUpdateTime
  } = req.body;
  const { offset, pageSize } = parsePaginationRequest(req);

  const match = await (async () => {
    if (shareId && outLinkUid) {
      const { uid } = await authOutLink({ shareId, outLinkUid });

      return {
        shareId,
        outLinkUid: uid,
        updateTime: {
          $gte: addMonths(new Date(), -1)
        }
      };
    }
    if (appId && teamId && teamToken) {
      const { uid } = await authTeamSpaceToken({ teamId, teamToken });
      return {
        teamId,
        appId,
        outLinkUid: uid,
        source: ChatSourceEnum.team
      };
    }
    if (appId) {
      const { tmbId } = await authCert({ req, authToken: true, authApiKey: true });
      return {
        tmbId,
        appId,
        ...(source && { source })
      };
    }
  })();

  if (!match) {
    return {
      list: [],
      total: 0
    };
  }

  const timeMatch: Record<string, any> = {};
  if (startCreateTime || endCreateTime) {
    timeMatch.createTime = {
      ...(startCreateTime && { $gte: new Date(startCreateTime) }),
      ...(endCreateTime && { $lte: new Date(endCreateTime) })
    };
  }
  if (startUpdateTime || endUpdateTime) {
    timeMatch.updateTime = {
      ...(startUpdateTime && { $gte: new Date(startUpdateTime) }),
      ...(endUpdateTime && { $lte: new Date(endUpdateTime) })
    };
  }

  const mergeMatch = { ...match, ...timeMatch };

  const [data, total] = await Promise.all([
    await MongoChat.find(mergeMatch, 'chatId title top customTitle appId updateTime')
      .sort({ top: -1, updateTime: -1 })
      .skip(offset)
      .limit(pageSize)
      .lean(),
    MongoChat.countDocuments(mergeMatch)
  ]);

  return {
    list: data.map((item) => ({
      chatId: item.chatId,
      updateTime: item.updateTime,
      appId: item.appId,
      customTitle: item.customTitle,
      title: item.title,
      top: item.top
    })),
    total
  };
}

export default NextAPI(handler);
