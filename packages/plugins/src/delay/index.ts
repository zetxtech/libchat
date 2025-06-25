import { delay } from '@libchat/global/common/system/utils';

type Props = {
  ms: number;
};
type Response = Promise<Number>;

const main = async ({ ms }: Props): Response => {
  if (typeof ms !== 'number' || ms <= 0 || ms > 300000) {
    return ms;
  }

  await delay(ms);

  return ms;
};

export default main;
