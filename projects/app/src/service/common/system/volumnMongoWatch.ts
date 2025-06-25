import { getSystemPluginCb } from '@/service/core/app/plugin';
import { initSystemConfig } from '.';
import { createDatasetTrainingMongoWatch } from '@/service/core/dataset/training/utils';
import { MongoSystemConfigs } from '@libchat/service/common/system/config/schema';
import { MongoSystemPlugin } from '@libchat/service/core/app/plugin/systemPluginSchema';
import { debounce } from 'lodash';
import { MongoAppTemplate } from '@libchat/service/core/app/templates/templateSchema';
import { getAppTemplatesAndLoadThem } from '@libchat/templates/register';
import { watchSystemModelUpdate } from '@libchat/service/core/ai/config/utils';
import { SystemConfigsTypeEnum } from '@libchat/global/common/system/config/constants';

export const startMongoWatch = async () => {
  reloadConfigWatch();
  refetchSystemPlugins();
  createDatasetTrainingMongoWatch();
  refetchAppTemplates();
  watchSystemModelUpdate();
};

const reloadConfigWatch = () => {
  const changeStream = MongoSystemConfigs.watch();

  changeStream.on('change', async (change) => {
    try {
      if (
        change.operationType === 'update' ||
        (change.operationType === 'insert' &&
          [SystemConfigsTypeEnum.libchatPro, SystemConfigsTypeEnum.license].includes(
            change.fullDocument.type
          ))
      ) {
        await initSystemConfig();
        console.log('refresh system config');
      }
    } catch (error) {}
  });
};

const refetchSystemPlugins = () => {
  const changeStream = MongoSystemPlugin.watch();

  changeStream.on(
    'change',
    debounce(async (change) => {
      setTimeout(() => {
        try {
          getSystemPluginCb(true);
        } catch (error) {}
      }, 5000);
    }, 500)
  );
};

const refetchAppTemplates = () => {
  const changeStream = MongoAppTemplate.watch();

  changeStream.on(
    'change',
    debounce(async (change) => {
      setTimeout(() => {
        try {
          getAppTemplatesAndLoadThem(true);
        } catch (error) {}
      }, 5000);
    }, 500)
  );
};
