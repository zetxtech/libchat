import { getUserChatInfoAndAuthTeamPoints } from '@libchat/service/support/permission/auth/team';
import { createChatUsage } from '@libchat/service/support/wallet/usage/controller';
import { getNextTimeByCronStringAndTimezone } from '@libchat/global/common/string/time';
import { getNanoid } from '@libchat/global/common/string/tools';
import { delay, retryFn } from '@libchat/global/common/system/utils';
import {
  ChatItemValueTypeEnum,
  ChatRoleEnum,
  ChatSourceEnum
} from '@libchat/global/core/chat/constants';
import {
  getWorkflowEntryNodeIds,
  storeEdges2RuntimeEdges,
  storeNodes2RuntimeNodes
} from '@libchat/global/core/workflow/runtime/utils';
import { UsageSourceEnum } from '@libchat/global/support/wallet/usage/constants';
import { addLog } from '@libchat/service/common/system/log';
import { MongoApp } from '@libchat/service/core/app/schema';
import { WORKFLOW_MAX_RUN_TIMES } from '@libchat/service/core/workflow/constants';
import { dispatchWorkFlow } from '@libchat/service/core/workflow/dispatch';
import { DispatchNodeResponseKeyEnum } from '@libchat/global/core/workflow/runtime/constants';
import { type UserChatItemValueItemType } from '@libchat/global/core/chat/type';
import { saveChat } from '@libchat/service/core/chat/saveChat';
import { getAppLatestVersion } from '@libchat/service/core/app/version/controller';
import {
  getChildAppPreviewNode,
  splitCombineToolId
} from '@libchat/service/core/app/plugin/controller';
import { PluginSourceEnum } from '@libchat/global/core/plugin/constants';
import { authAppByTmbId } from '@libchat/service/support/permission/app/auth';
import { ReadPermissionVal } from '@libchat/global/support/permission/constant';
import { type StoreNodeItemType } from '@libchat/global/core/workflow/type/node';
import { getErrText } from '@libchat/global/common/error/utils';

export const getScheduleTriggerApp = async () => {
  // 1. Find all the app
  const apps = await retryFn(() => {
    return MongoApp.find({
      scheduledTriggerConfig: { $exists: true },
      scheduledTriggerNextTime: { $lte: new Date() }
    });
  });

  // 2. Run apps
  await Promise.allSettled(
    apps.map(async (app) => {
      try {
        if (!app.scheduledTriggerConfig) return;
        // random delay 0 ~ 60s
        await delay(Math.floor(Math.random() * 60 * 1000));
        const { timezone, externalProvider } = await getUserChatInfoAndAuthTeamPoints(app.tmbId);

        // Get app latest version
        const { nodes, edges, chatConfig } = await getAppLatestVersion(app._id, app);

        const chatId = getNanoid();
        const userQuery: UserChatItemValueItemType[] = [
          {
            type: ChatItemValueTypeEnum.text,
            text: {
              content: app.scheduledTriggerConfig?.defaultPrompt
            }
          }
        ];

        const { flowUsages, assistantResponses, flowResponses, durationSeconds, system_memories } =
          await retryFn(() => {
            return dispatchWorkFlow({
              chatId,
              timezone,
              externalProvider,
              mode: 'chat',
              runningAppInfo: {
                id: String(app._id),
                teamId: String(app.teamId),
                tmbId: String(app.tmbId)
              },
              runningUserInfo: {
                teamId: String(app.teamId),
                tmbId: String(app.tmbId)
              },
              uid: String(app.tmbId),
              runtimeNodes: storeNodes2RuntimeNodes(nodes, getWorkflowEntryNodeIds(nodes)),
              runtimeEdges: storeEdges2RuntimeEdges(edges),
              variables: {},
              query: userQuery,
              chatConfig,
              histories: [],
              stream: false,
              maxRunTimes: WORKFLOW_MAX_RUN_TIMES
            });
          });

        // Save chat
        await saveChat({
          chatId,
          appId: app._id,
          teamId: String(app.teamId),
          tmbId: String(app.tmbId),
          nodes,
          appChatConfig: chatConfig,
          variables: {},
          isUpdateUseTime: false, // owner update use time
          newTitle: 'Cron Job',
          source: ChatSourceEnum.cronJob,
          content: [
            {
              obj: ChatRoleEnum.Human,
              value: userQuery
            },
            {
              obj: ChatRoleEnum.AI,
              value: assistantResponses,
              [DispatchNodeResponseKeyEnum.nodeResponse]: flowResponses,
              memories: system_memories
            }
          ],
          durationSeconds
        });
        createChatUsage({
          appName: app.name,
          appId: app._id,
          teamId: String(app.teamId),
          tmbId: String(app.tmbId),
          source: UsageSourceEnum.cronJob,
          flowUsages
        });

        // update next time
        app.scheduledTriggerNextTime = getNextTimeByCronStringAndTimezone(
          app.scheduledTriggerConfig
        );
        await app.save();
      } catch (error) {
        addLog.warn('Schedule trigger error', { error });
      }
    })
  );
};
