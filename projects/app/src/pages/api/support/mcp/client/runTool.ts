import { NextAPI } from '@/service/middleware/entry';
import type { ApiRequestProps, ApiResponseType } from '@libchat/service/type/next';
import { MCPClient } from '@libchat/service/core/app/mcp';
import { type StoreSecretValueType } from '@libchat/global/common/secret/type';
import { getSecretValue } from '@libchat/service/common/secret/utils';

export type RunMCPToolQuery = {};

export type RunMCPToolBody = {
  url: string;
  toolName: string;
  headerSecret: StoreSecretValueType;
  params: Record<string, any>;
};

export type RunMCPToolResponse = any;

async function handler(
  req: ApiRequestProps<RunMCPToolBody, RunMCPToolQuery>,
  res: ApiResponseType<RunMCPToolResponse>
): Promise<RunMCPToolResponse> {
  const { url, toolName, headerSecret, params } = req.body;

  const mcpClient = new MCPClient({
    url,
    headers: getSecretValue({
      storeSecret: headerSecret
    })
  });

  return mcpClient.toolCall(toolName, params);
}

export default NextAPI(handler);
