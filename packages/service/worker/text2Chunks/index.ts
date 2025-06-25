import { parentPort } from 'worker_threads';
import type { SplitProps } from '@libchat/global/common/string/textSplitter';
import { splitText2Chunks } from '@libchat/global/common/string/textSplitter';
import { workerResponse } from '../controller';

parentPort?.on('message', async (props: SplitProps) => {
  const result = splitText2Chunks(props);

  workerResponse({
    parentPort,
    status: 'success',
    data: result
  });
});
