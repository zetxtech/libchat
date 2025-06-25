import type {
  LLMModelItemType,
  EmbeddingModelItemType,
  AudioSpeechModels,
  STTModelType,
  RerankModelItemType
} from '@libchat/global/core/ai/model.d';

import type { LibChatFeConfigsType } from '@libchat/global/common/system/types/index.d';
import type { SubPlanType } from '@libchat/global/support/wallet/sub/type';
import type { SystemDefaultModelType, SystemModelItemType } from '@libchat/service/core/ai/type';

export type InitDateResponse = {
  bufferId?: string;

  feConfigs?: LibChatFeConfigsType;
  subPlans?: SubPlanType;
  systemVersion?: string;

  activeModelList?: SystemModelItemType[];
  defaultModels?: SystemDefaultModelType;
};
