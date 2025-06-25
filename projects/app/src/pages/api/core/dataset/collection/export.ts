import { NextAPI } from '@/service/middleware/entry';
import { authChatCrud, authCollectionInChat } from '@/service/support/permission/auth/chat';
import { DatasetErrEnum } from '@libchat/global/common/error/code/dataset';
import { type OutLinkChatAuthProps } from '@libchat/global/support/permission/chat';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { useIPFrequencyLimit } from '@libchat/service/common/middle/reqFrequencyLimit';
import { readFromSecondary } from '@libchat/service/common/mongo/utils';
import { responseWriteController } from '@libchat/service/common/response';
import { addLog } from '@libchat/service/common/system/log';
import { getCollectionWithDataset } from '@libchat/service/core/dataset/controller';
import { MongoDatasetData } from '@libchat/service/core/dataset/data/schema';
import { authDatasetCollection } from '@libchat/service/support/permission/dataset/auth';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { type NextApiResponse } from 'next';

export type ExportCollectionBody = {
  collectionId: string;

  appId?: string;
  chatId?: string;
  chatItemDataId?: string;
  chatTime: Date;
} & OutLinkChatAuthProps;

async function handler(req: ApiRequestProps<ExportCollectionBody, {}>, res: NextApiResponse) {
  const {
    collectionId,
    appId,
    chatId,
    chatItemDataId,
    shareId,
    outLinkUid,
    teamId,
    teamToken,
    chatTime
  } = req.body;

  const { collection, teamId: userTeamId } = await (async () => {
    if (!appId || !chatId || !chatItemDataId) {
      return authDatasetCollection({
        req,
        authToken: true,
        authApiKey: true,
        collectionId: req.body.collectionId,
        per: ReadPermissionVal
      });
    }

    /* 
      1. auth chat read permission
      2. auth collection quote in chat
      3. auth outlink open show quote
    */
    const [authRes, collection] = await Promise.all([
      authChatCrud({
        req,
        authToken: true,
        appId,
        chatId,
        shareId,
        outLinkUid,
        teamId,
        teamToken
      }),
      getCollectionWithDataset(collectionId),
      authCollectionInChat({ appId, chatId, chatItemDataId, collectionIds: [collectionId] })
    ]);

    if (!authRes.showRawSource) {
      return Promise.reject(DatasetErrEnum.unAuthDatasetFile);
    }

    return {
      ...authRes,
      collection
    };
  })();

  const where = {
    teamId: userTeamId,
    datasetId: collection.datasetId,
    collectionId,
    ...(chatTime
      ? {
          $or: [
            { updateTime: { $lt: new Date(chatTime) } },
            { history: { $elemMatch: { updateTime: { $lt: new Date(chatTime) } } } }
          ]
        }
      : {})
  };

  res.setHeader('Content-Type', 'text/csv; charset=utf-8;');
  res.setHeader('Content-Disposition', 'attachment; filename=data.csv; ');

  const cursor = MongoDatasetData.find(where, 'q a', {
    ...readFromSecondary,
    batchSize: 1000
  })
    .sort({ chunkIndex: 1 })
    .limit(50000)
    .cursor();

  const write = responseWriteController({
    res,
    readStream: cursor
  });

  write(`\uFEFFindex,content`);

  cursor.on('data', (doc) => {
    const q = doc.q.replace(/"/g, '""') || '';
    const a = doc.a.replace(/"/g, '""') || '';

    write(`\n"${q}","${a}"`);
  });

  cursor.on('end', () => {
    cursor.close();
    res.end();
  });

  cursor.on('error', (err) => {
    addLog.error(`export usage error`, err);
    res.status(500);
    res.end();
  });
}

export default NextAPI(
  useIPFrequencyLimit({ id: 'export-usage', seconds: 60, limit: 1, force: true }),
  handler
);
