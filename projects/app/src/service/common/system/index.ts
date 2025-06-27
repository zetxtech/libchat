import { initHttpAgent } from '@libchat/service/common/middle/httpAgent';
import fs, { existsSync } from 'fs';
import type { LibChatFeConfigsType } from '@libchat/global/common/system/types/index.d';
import type { LibChatConfigFileType } from '@libchat/global/common/system/types/index.d';
import { getLibChatConfigFromDB } from '@libchat/service/common/system/config/controller';
import { LibChatProUrl } from '@libchat/service/common/system/constants';
import { isProduction } from '@libchat/global/common/system/constants';
import { initLibChatConfig } from '@libchat/service/common/system/tools';
import json5 from 'json5';
import { defaultGroup, defaultTemplateTypes } from '@libchat/web/core/workflow/constants';
import { MongoPluginGroups } from '@libchat/service/core/app/plugin/pluginGroupSchema';
import { MongoTemplateTypes } from '@libchat/service/core/app/templates/templateTypeSchema';
import { POST } from '@libchat/service/common/api/plusRequest';
import {
  type DeepRagSearchProps,
  type SearchDatasetDataResponse
} from '@libchat/service/core/dataset/search/controller';
import { type AuthOpenApiLimitProps } from '@libchat/service/support/openapi/auth';
import {
  type ConcatUsageProps,
  type CreateUsageProps
} from '@libchat/global/support/wallet/usage/api';
import { isProVersion } from './constants';

export const readConfigData = async (name: string) => {
  const splitName = name.split('.');
  const devName = `${splitName[0]}.local.${splitName[1]}`;

  const filename = (() => {
    if (!isProduction) {
      // check local file exists
      const hasLocalFile = existsSync(`data/${devName}`);
      if (hasLocalFile) {
        return `data/${devName}`;
      }
      return `data/${name}`;
    }
    // Fallback to default production path
    const envPath = process.env.CONFIG_JSON_PATH || '/app/data';
    return `${envPath}/${name}`;
  })();

  const content = await fs.promises.readFile(filename, 'utf-8');

  return content;
};

/* Init global variables */
export function initGlobalVariables() {
  function initPlusRequest() {
    global.textCensorHandler = function textCensorHandler({ text }: { text: string }) {
      if (!isProVersion()) return Promise.resolve({ code: 200 });
      return POST<{ code: number; message?: string }>('/common/censor/check', { text });
    };

    global.deepRagHandler = function deepRagHandler(data: DeepRagSearchProps) {
      return POST<SearchDatasetDataResponse>('/core/dataset/deepRag', data);
    };

    global.authOpenApiHandler = function authOpenApiHandler(data: AuthOpenApiLimitProps) {
      if (!isProVersion()) return Promise.resolve();
      return POST<AuthOpenApiLimitProps>('/support/openapi/authLimit', data);
    };

    global.createUsageHandler = function createUsageHandler(data: CreateUsageProps) {
      if (!isProVersion()) return;
      return POST('/support/wallet/usage/createUsage', data);
    };

    global.concatUsageHandler = function concatUsageHandler(data: ConcatUsageProps) {
      if (!isProVersion()) return;
      return POST('/support/wallet/usage/concatUsage', data);
    };
  }

  global.communityPlugins = [];
  global.qaQueueLen = global.qaQueueLen ?? 0;
  global.vectorQueueLen = global.vectorQueueLen ?? 0;
  initHttpAgent();
  initPlusRequest();
}

/* Init system data(Need to connected db). It only needs to run once */
export async function getInitConfig() {
  const getSystemVersion = async () => {
    if (global.systemVersion) return;
    try {
      if (process.env.NODE_ENV === 'development') {
        global.systemVersion = process.env.npm_package_version || '0.0.0';
      } else {
        const packageJson = json5.parse(await fs.promises.readFile('/app/package.json', 'utf-8'));

        global.systemVersion = packageJson?.version;
      }
      console.log(`System Version: ${global.systemVersion}`);
    } catch (error) {
      console.log(error);

      global.systemVersion = '0.0.0';
    }
  };

  await Promise.all([initSystemConfig(), getSystemVersion()]);
}

const defaultFeConfigs: LibChatFeConfigsType = {
  show_emptyChat: true,
  show_git: true,
  docUrl: 'https://doc.tryfastgpt.ai',
  openAPIDocUrl: 'https://doc.tryfastgpt.ai/docs/development/openapi',
  systemPluginCourseUrl: 'https://fael3z0zfze.feishu.cn/wiki/ERZnw9R26iRRG0kXZRec6WL9nwh',
  appTemplateCourse:
    'https://fael3z0zfze.feishu.cn/wiki/CX9wwMGyEi5TL6koiLYcg7U0nWb?fromScene=spaceOverview',
  systemTitle: 'LibChat',
  concatMd:
    '项目开源地址: [LibChat GitHub](https://github.com/zetxtech/libchat)\n交流群: ![](https://oss.laf.run/otnvvf-imgs/libchat-feishu1.png)',
  limit: {
    exportDatasetLimitMinutes: 0,
    websiteSyncLimitMinuted: 0
  },
  scripts: [],
  favicon: '/favicon.ico',
  uploadFileMaxSize: 500
};

export async function initSystemConfig() {
  // load config
  const [{ libchatConfig, licenseData }, fileConfig] = await Promise.all([
    getLibChatConfigFromDB(),
    readConfigData('config.json')
  ]);
  global.licenseData = licenseData;

  const fileRes = json5.parse(fileConfig) as LibChatConfigFileType;

  // get config from database
  const config: LibChatConfigFileType = {
    feConfigs: {
      ...fileRes?.feConfigs,
      ...defaultFeConfigs,
      ...(libchatConfig.feConfigs || {}),
      isPlus: true,
      show_aiproxy: !!process.env.AIPROXY_API_ENDPOINT,
      show_coupon: process.env.SHOW_COUPON === 'true',
      show_dataset_enhance: true,
      show_batch_eval: true,
    },
    systemEnv: {
      ...fileRes.systemEnv,
      ...(libchatConfig.systemEnv || {})
    },
    subPlans: libchatConfig.subPlans
  };

  // set config
  initLibChatConfig(config);

  console.log({
    feConfigs: global.feConfigs,
    systemEnv: global.systemEnv,
    subPlans: global.subPlans,
    licenseData: global.licenseData
  });
}

export async function initSystemPluginGroups() {
  try {
    const { groupOrder, ...restDefaultGroup } = defaultGroup;
    await MongoPluginGroups.updateOne(
      {
        groupId: defaultGroup.groupId
      },
      {
        $set: restDefaultGroup
      },
      {
        upsert: true
      }
    );
  } catch (error) {
    console.error('Error initializing system plugins:', error);
  }
}

export async function initAppTemplateTypes() {
  try {
    await Promise.all(
      defaultTemplateTypes.map((templateType) => {
        const { typeOrder, ...rest } = templateType;

        return MongoTemplateTypes.updateOne(
          {
            typeId: templateType.typeId
          },
          {
            $set: rest
          },
          {
            upsert: true
          }
        );
      })
    );
  } catch (error) {
    console.error('Error initializing system templates:', error);
  }
}
