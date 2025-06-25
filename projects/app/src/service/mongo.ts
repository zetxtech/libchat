import { MongoUser } from '@libchat/service/support/user/schema';
import { hashStr } from '@libchat/global/common/string/tools';
import { createDefaultTeam } from '@libchat/service/support/user/team/controller';
import { exit } from 'process';
import { mongoSessionRun } from '@libchat/service/common/mongo/sessionRun';

export async function initRootUser(retry = 3): Promise<any> {
  try {
    const rootUser = await MongoUser.findOne({
      username: 'root'
    });
    const psw = process.env.DEFAULT_ROOT_PSW || '123456';

    let rootId = rootUser?._id || '';

    await mongoSessionRun(async (session) => {
      // init root user
      if (rootUser) {
        await rootUser.updateOne({
          password: hashStr(psw)
        });
      } else {
        const [{ _id }] = await MongoUser.create(
          [
            {
              username: 'root',
              password: hashStr(psw)
            }
          ],
          { session, ordered: true }
        );
        rootId = _id;
      }
      // init root team
      await createDefaultTeam({ userId: rootId, session });
    });

    console.log(`root user init:`, {
      username: 'root',
      password: psw
    });
  } catch (error) {
    if (retry > 0) {
      console.log('retry init root user');
      return initRootUser(retry - 1);
    } else {
      console.error('init root user error', error);
      exit(1);
    }
  }
}
