// pages/api/fetchContent.ts
import { type NextApiRequest, type NextApiResponse } from 'next';
import { jsonRes } from '@libchat/service/common/response';
import { authCert } from '@libchat/service/support/permission/auth/common';

import { type UrlFetchParams, type UrlFetchResponse } from '@libchat/global/common/file/api.d';
import { urlsFetch } from '@libchat/service/common/string/cheerio';

const fetchContent = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    let { urlList = [], selector } = req.body as UrlFetchParams;

    if (!urlList || urlList.length === 0) {
      throw new Error('urlList is empty');
    }

    await authCert({ req, authToken: true });

    jsonRes<UrlFetchResponse>(res, {
      data: await urlsFetch({
        urlList,
        selector
      })
    });
  } catch (error: any) {
    jsonRes(res, {
      code: 500,
      error: error
    });
  }
};

export default fetchContent;
