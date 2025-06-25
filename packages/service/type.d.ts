import type {
  LibChatFeConfigsType,
  LicenseDataType,
  SystemEnvType
} from '@libchat/global/common/system/types';
import {
  TTSModelType,
  RerankModelItemType,
  STTModelType,
  EmbeddingModelItemType,
  LLMModelItemType
} from '@libchat/global/core/ai/model.d';
import type { SubPlanType } from '@libchat/global/support/wallet/sub/type';
import type { WorkerNameEnum, WorkerPool } from './worker/utils';
import { Worker } from 'worker_threads';

declare global {
  var systemInitBufferId: string | undefined;

  var systemVersion: string;
  var feConfigs: LibChatFeConfigsType;
  var systemEnv: SystemEnvType;
  var subPlans: SubPlanType | undefined;
  var licenseData: LicenseDataType | undefined;

  var workerPoll: Record<WorkerNameEnum, WorkerPool>;
}
