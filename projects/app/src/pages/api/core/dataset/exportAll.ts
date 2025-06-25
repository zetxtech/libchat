import type { NextApiRequest, NextApiResponse } from 'next';
import { responseWriteController } from '@libchat/service/common/response';
import { addLog } from '@libchat/service/common/system/log';
import { authDataset } from '@libchat/service/support/permission/dataset/auth';
import { MongoDatasetData } from '@libchat/service/core/dataset/data/schema';
import { findDatasetAndAllChildren } from '@libchat/service/core/dataset/controller';
import {
  checkExportDatasetLimit,
  updateExportDatasetLimit
} from '@libchat/service/support/user/utils';
import { NextAPI } from '@/service/middleware/entry';
import { WritePermissionVal } from '@libchat/global/support/permission/constant';
import { CommonErrEnum } from '@libchat/global/common/error/code/common';
import { readFromSecondary } from '@libchat/service/common/mongo/utils';
import type { DatasetDataSchemaType } from '@libchat/global/core/dataset/type';

type DataItemType = {
  _id: string;
  q: string;
  a: string;
  indexes: DatasetDataSchemaType['indexes'];
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  let { datasetId } = req.query as {
    datasetId: string;
  };

  if (!datasetId) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  // 凭证校验
  const { teamId, dataset } = await authDataset({
    req,
    authToken: true,
    datasetId,
    per: WritePermissionVal
  });

  await checkExportDatasetLimit({
    teamId,
    limitMinutes: global.feConfigs?.limit?.exportDatasetLimitMinutes
  });

  const datasets = await findDatasetAndAllChildren({
    teamId,
    datasetId,
    fields: '_id'
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8;');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${encodeURIComponent(dataset.name)}-backup.csv;`
  );

  const cursor = MongoDatasetData.find<DataItemType>(
    {
      teamId,
      datasetId: { $in: datasets.map((d) => d._id) }
    },
    'q a indexes',
    {
      ...readFromSecondary
    }
  )
    .limit(50000)
    .cursor();

  const write = responseWriteController({
    res,
    readStream: cursor
  });

  write(`\uFEFFq,a,indexes`);

  cursor.on('data', (doc: DataItemType) => {
    const q = doc.q.replace(/"/g, '""') || '';
    const a = doc.a.replace(/"/g, '""') || '';
    const indexes = doc.indexes.map((i) => `"${i.text.replace(/"/g, '""')}"`).join(',');

    write(`\n"${q}","${a}",${indexes}`);
  });

  cursor.on('end', () => {
    cursor.close();
    res.end();
  });

  cursor.on('error', (err) => {
    addLog.error(`export dataset error`, err);
    res.status(500);
    res.end();
  });

  updateExportDatasetLimit(teamId);
}

export default NextAPI(handler);

export const config = {
  api: {
    responseLimit: '100mb'
  }
};
