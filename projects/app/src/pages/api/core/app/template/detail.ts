import type { NextApiRequest, NextApiResponse } from 'next';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { NextAPI } from '@/service/middleware/entry';
import { type AppTemplateSchemaType } from '@libchat/global/core/app/type';
import { getAppTemplatesAndLoadThem } from '@libchat/templates/register';

type Props = {
  templateId: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
): Promise<AppTemplateSchemaType | undefined> {
  await authCert({ req, authToken: true });
  const { templateId } = req.query as Props;

  const templateMarketItems: AppTemplateSchemaType[] = await getAppTemplatesAndLoadThem();

  return templateMarketItems.find((item) => item.templateId === templateId);
}

export default NextAPI(handler);
