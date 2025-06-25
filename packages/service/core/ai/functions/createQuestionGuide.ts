import type { ChatCompletionMessageParam } from '@libchat/global/core/ai/type.d';
import { createChatCompletion } from '../config';
import { countGptMessagesTokens, countPromptTokens } from '../../../common/string/tiktoken/index';
import { loadRequestMessages } from '../../chat/utils';
import { llmCompletionsBodyFormat, formatLLMResponse } from '../utils';
import {
  QuestionGuidePrompt,
  QuestionGuideFooterPrompt
} from '@libchat/global/core/ai/prompt/agent';
import { addLog } from '../../../common/system/log';
import json5 from 'json5';

export async function createQuestionGuide({
  messages,
  model,
  customPrompt
}: {
  messages: ChatCompletionMessageParam[];
  model: string;
  customPrompt?: string;
}): Promise<{
  result: string[];
  inputTokens: number;
  outputTokens: number;
}> {
  const concatMessages: ChatCompletionMessageParam[] = [
    ...messages,
    {
      role: 'user',
      content: `${customPrompt || QuestionGuidePrompt}\n${QuestionGuideFooterPrompt}`
    }
  ];
  const requestMessages = await loadRequestMessages({
    messages: concatMessages,
    useVision: false
  });

  const { response } = await createChatCompletion({
    body: llmCompletionsBodyFormat(
      {
        model,
        temperature: 0.1,
        max_tokens: 200,
        messages: requestMessages,
        stream: true
      },
      model
    )
  });
  const { text: answer, usage } = await formatLLMResponse(response);

  const start = answer.indexOf('[');
  const end = answer.lastIndexOf(']');

  const inputTokens = usage?.prompt_tokens || (await countGptMessagesTokens(requestMessages));
  const outputTokens = usage?.completion_tokens || (await countPromptTokens(answer));

  if (start === -1 || end === -1) {
    addLog.warn('Create question guide error', { answer });
    return {
      result: [],
      inputTokens,
      outputTokens
    };
  }

  const jsonStr = answer
    .substring(start, end + 1)
    .replace(/(\\n|\\)/g, '')
    .replace(/  /g, '');

  try {
    return {
      result: json5.parse(jsonStr),
      inputTokens,
      outputTokens
    };
  } catch (error) {
    console.log(error);

    return {
      result: [],
      inputTokens,
      outputTokens
    };
  }
}
