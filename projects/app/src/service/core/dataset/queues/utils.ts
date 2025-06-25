import { TeamErrEnum } from '@libchat/global/common/error/code/team';
import { checkTeamAIPoints } from '@libchat/service/support/permission/teamLimit';
import { sendOneInform } from '../../../support/user/inform/api';
import { lockTrainingDataByTeamId } from '@libchat/service/core/dataset/training/controller';
import { InformLevelEnum } from '@libchat/global/support/user/inform/constants';

export const checkTeamAiPointsAndLock = async (teamId: string) => {
  try {
    await checkTeamAIPoints(teamId);
    return true;
  } catch (error: any) {
    if (error === TeamErrEnum.aiPointsNotEnough) {
      // send inform and lock data
      try {
        sendOneInform({
          level: InformLevelEnum.emergency,
          templateCode: 'LACK_OF_POINTS',
          templateParam: {},
          teamId
        });
        console.log('余额不足，暂停知识库处理');
        await lockTrainingDataByTeamId(teamId);
      } catch (error) {}
    }
    return false;
  }
};
