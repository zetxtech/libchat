import OpenAI from '@libchat/global/core/ai';
import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  StreamChatType,
  UnStreamChatType
} from '@libchat/global/core/ai/type';
import { getErrText } from '@libchat/global/common/error/utils';
import { addLog } from '../../common/system/log';
import { i18nT } from '../../../web/i18n/utils';
import { type OpenaiAccountType } from '@libchat/global/support/user/team/type';
import { getLLMModel } from './model';
import { type LLMModelItemType } from '@libchat/global/core/ai/model.d';

const aiProxyBaseUrl = process.env.AIPROXY_API_ENDPOINT
  ? `${process.env.AIPROXY_API_ENDPOINT}/v1`
  : undefined;
const openaiBaseUrl = aiProxyBaseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const openaiBaseKey = process.env.AIPROXY_API_TOKEN || process.env.CHAT_API_KEY || '';

export const getAIApi = (props?: { userKey?: OpenaiAccountType; timeout?: number }) => {
  const { userKey, timeout } = props || {};

  const baseUrl = userKey?.baseUrl || global?.systemEnv?.oneapiUrl || openaiBaseUrl;
  const apiKey = userKey?.key || global?.systemEnv?.chatApiKey || openaiBaseKey;
  return new OpenAI({
    baseURL: baseUrl,
    apiKey,
    httpAgent: global.httpsAgent,
    timeout,
    maxRetries: 2
  });
};

export const getAxiosConfig = (props?: { userKey?: OpenaiAccountType }) => {
  const { userKey } = props || {};

  const baseUrl = userKey?.baseUrl || global?.systemEnv?.oneapiUrl || openaiBaseUrl;
  const apiKey = userKey?.key || global?.systemEnv?.chatApiKey || openaiBaseKey;

  return {
    baseUrl,
    authorization: `Bearer ${apiKey}`
  };
};

export const createChatCompletion = async ({
  modelData,
  body,
  userKey,
  timeout,
  options
}: {
  modelData?: LLMModelItemType;
  body: ChatCompletionCreateParamsNonStreaming | ChatCompletionCreateParamsStreaming;
  userKey?: OpenaiAccountType;
  timeout?: number;
  options?: OpenAI.RequestOptions;
}): Promise<
  {
    getEmptyResponseTip: () => string;
  } & (
    | {
        response: StreamChatType;
        isStreamResponse: true;
      }
    | {
        response: UnStreamChatType;
        isStreamResponse: false;
      }
  )
> => {
  try {
    // Rewrite model
    const modelConstantsData = modelData || getLLMModel(body.model);
    if (!modelConstantsData) {
      return Promise.reject(`${body.model} not found`);
    }
    body.model = modelConstantsData.model;

    const formatTimeout = timeout ? timeout : 600000;
    const ai = getAIApi({
      userKey,
      timeout: formatTimeout
    });

    addLog.debug(`Start create chat completion`, {
      model: body.model
    });

    const response = await ai.chat.completions.create(body, {
      ...options,
      ...(modelConstantsData.requestUrl ? { path: modelConstantsData.requestUrl } : {}),
      headers: {
        ...options?.headers,
        ...(modelConstantsData.requestAuth
          ? { Authorization: `Bearer ${modelConstantsData.requestAuth}` }
          : {})
      }
    });

    const isStreamResponse =
      typeof response === 'object' &&
      response !== null &&
      ('iterator' in response || 'controller' in response);

    const getEmptyResponseTip = () => {
      addLog.warn(`LLM response empty`, {
        baseUrl: userKey?.baseUrl,
        requestBody: body
      });
      if (userKey?.baseUrl) {
        return `您的 OpenAI key 没有响应: ${JSON.stringify(body)}`;
      }
      return i18nT('chat:LLM_model_response_empty');
    };

    if (isStreamResponse) {
      return {
        response,
        isStreamResponse: true,
        getEmptyResponseTip
      };
    }

    return {
      response,
      isStreamResponse: false,
      getEmptyResponseTip
    };
  } catch (error) {
    addLog.error(`LLM response error`, error);
    addLog.warn(`LLM response error`, {
      baseUrl: userKey?.baseUrl,
      requestBody: body
    });
    if (userKey?.baseUrl) {
      return Promise.reject(`您的 OpenAI key 出错了: ${getErrText(error)}`);
    }
    return Promise.reject(error);
  }
};
