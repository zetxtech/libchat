import { ERROR_ENUM } from '@libchat/global/common/error/errorCode';
import { updateApiKeyUsedTime } from './tools';
import { MongoOpenApi } from './schema';
import type { OpenApiSchema } from '@libchat/global/support/openapi/type';

export type AuthOpenApiLimitProps = { openApi: OpenApiSchema };

export async function authOpenApiKey({ apikey }: { apikey: string }) {
  if (!apikey) {
    return Promise.reject(ERROR_ENUM.unAuthApiKey);
  }
  try {
    const openApi = await MongoOpenApi.findOne({ apiKey: apikey.trim() }).lean();
    if (!openApi) {
      return Promise.reject(ERROR_ENUM.unAuthApiKey);
    }

    // auth limit
    await global.authOpenApiHandler({
      openApi
    });

    updateApiKeyUsedTime(openApi._id);

    return {
      apikey,
      teamId: String(openApi.teamId),
      tmbId: String(openApi.tmbId),
      appId: openApi.appId || '',
      sourceName: openApi.name
    };
  } catch (error) {
    return Promise.reject(error);
  }
}
