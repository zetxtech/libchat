import type { OpenApiSchema } from '@libchat/global/support/openapi/type';

export type GetApiKeyProps = {
  appId?: string;
};

export type EditApiKeyProps = {
  appId?: string;
  name: string;
  limit: OpenApiSchema['limit'];
};
