import type { NextApiResponse } from 'next';
import { authCert } from '@libchat/service/support/permission/auth/common';
import { type NodeTemplateListItemType } from '@libchat/global/core/workflow/type/node.d';
import { NextAPI } from '@/service/middleware/entry';
import { getSystemPluginCb, getSystemPlugins } from '@/service/core/app/plugin';
import { FlowNodeTypeEnum } from '@libchat/global/core/workflow/node/constant';
import { type ParentIdType } from '@libchat/global/common/parentFolder/type';
import { type ApiRequestProps } from '@libchat/service/type/next';
import { replaceRegChars } from '@libchat/global/common/string/tools';
import { FlowNodeTemplateTypeEnum } from '@libchat/global/core/workflow/constants';

export type GetSystemPluginTemplatesBody = {
  searchKey?: string;
  parentId: ParentIdType;
};

async function handler(
  req: ApiRequestProps<GetSystemPluginTemplatesBody>,
  res: NextApiResponse<any>
): Promise<NodeTemplateListItemType[]> {
  await authCert({ req, authToken: true });

  const { searchKey, parentId } = req.body;

  const formatParentId = parentId || null;

  // Make sure system plugin callbacks are loaded
  if (!global.systemPluginCb || Object.keys(global.systemPluginCb).length === 0)
    await getSystemPluginCb();

  return getSystemPlugins().then((res) =>
    res
      // Just show the active plugins
      .filter((item) => item.isActive)
      .map<NodeTemplateListItemType>((plugin) => ({
        id: plugin.id,
        isFolder: plugin.isFolder,
        parentId: plugin.parentId,
        templateType: plugin.templateType ?? FlowNodeTemplateTypeEnum.other,
        flowNodeType: FlowNodeTypeEnum.pluginModule,
        avatar: plugin.avatar,
        name: plugin.name,
        intro: plugin.intro,
        isTool: plugin.isTool,
        currentCost: plugin.currentCost,
        hasTokenFee: plugin.hasTokenFee,
        author: plugin.author,
        instructions: plugin.userGuide,
        courseUrl: plugin.courseUrl
      }))
      .filter((item) => {
        if (searchKey) {
          if (item.isFolder) return false;
          const regx = new RegExp(`${replaceRegChars(searchKey)}`, 'i');
          return regx.test(item.name) || regx.test(item.intro || '');
        }
        return item.parentId === formatParentId;
      })
  );
}

export default NextAPI(handler);
