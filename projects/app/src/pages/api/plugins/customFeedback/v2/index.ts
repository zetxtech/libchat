import type { NextApiRequest, NextApiResponse } from 'next';
import type { HttpBodyType } from '@libchat/global/core/workflow/api.d';
import { getErrText } from '@libchat/global/common/error/utils';
import { addCustomFeedbacks } from '@libchat/service/core/chat/controller';
import { authRequestFromLocal } from '@libchat/service/support/permission/auth/common';
import { NodeOutputKeyEnum } from '@libchat/global/core/workflow/constants';
import { type SystemVariablesType } from '@libchat/global/core/workflow/runtime/type';
import { replaceVariable } from '@libchat/global/common/string/tools';

type Props = HttpBodyType<
  SystemVariablesType & {
    customFeedback: string;
    customInputs: Record<string, any>;
  }
>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const {
      customFeedback,
      appId,
      chatId,
      responseChatItemId: dataId,
      customInputs
    } = req.body as Props;

    await authRequestFromLocal({ req });

    if (!customFeedback) {
      return res.json({});
    }

    const feedbackText = replaceVariable(customFeedback, customInputs);

    // wait the chat finish
    setTimeout(() => {
      addCustomFeedbacks({
        appId,
        chatId,
        dataId,
        feedbacks: [feedbackText]
      });
    }, 60000);

    if (!chatId || !dataId) {
      return res.json({
        [NodeOutputKeyEnum.answerText]: `\\n\\n**自动反馈调试**: "${feedbackText}"\\n\\n`,
        text: feedbackText
      });
    }

    res.json({
      text: feedbackText
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(getErrText(err));
  }
}
