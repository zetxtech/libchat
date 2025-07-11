import type { NextApiResponse } from 'next';
import type { HttpBodyType } from '@libchat/global/core/workflow/api.d';
import { getErrText } from '@libchat/global/common/error/utils';
import { replaceVariable } from '@libchat/global/common/string/tools';
import { authRequestFromLocal } from '@libchat/service/support/permission/auth/common';
import { type ApiRequestProps } from '@libchat/service/type/next';

type Props = HttpBodyType<{
  text: string;
  customInputs: Record<string, any>;
}>;

export default async function handler(req: ApiRequestProps<Props>, res: NextApiResponse<any>) {
  try {
    const { text, customInputs: obj = {} } = req.body;

    await authRequestFromLocal({ req });

    // string all value
    Object.keys(obj).forEach((key) => {
      let val = obj[key];

      if (typeof val === 'object') {
        val = JSON.stringify(val);
      } else if (typeof val === 'number') {
        val = String(val);
      } else if (typeof val === 'boolean') {
        val = val ? 'true' : 'false';
      }

      obj[key] = val;
    });

    const textResult = replaceVariable(text, obj);
    res.json({
      text: textResult
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(getErrText(err));
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16mb'
    },
    responseLimit: '16mb'
  }
};
