'use client';
import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import Loading from '@libchat/web/components/common/MyLoading';
import { serviceSideProps } from '@/web/common/i18n/utils';
import NextHead from '@/components/common/NextHead';
import { useContextSelector } from 'use-context-selector';
import AppContextProvider, { AppContext } from '@/pageComponents/app/detail/context';
import { AppTypeEnum } from '@libchat/global/core/app/constants';
import { useChatStore } from '@/web/core/chat/context/useChatStore';

const SimpleEdit = dynamic(() => import('@/pageComponents/app/detail/SimpleApp'), {
  ssr: false,
  loading: () => <Loading fixed={false} />
});
const Workflow = dynamic(() => import('@/pageComponents/app/detail/Workflow'), {
  ssr: false,
  loading: () => <Loading fixed={false} />
});
const Plugin = dynamic(() => import('@/pageComponents/app/detail/Plugin'), {
  ssr: false,
  loading: () => <Loading fixed={false} />
});
const MCPTools = dynamic(() => import('@/pageComponents/app/detail/MCPTools'), {
  ssr: false,
  loading: () => <Loading fixed={false} />
});

const AppDetail = () => {
  const { setAppId, setSource } = useChatStore();
  const appDetail = useContextSelector(AppContext, (e) => e.appDetail);

  useEffect(() => {
    setSource('test');
    appDetail._id && setAppId(appDetail._id);
  }, [appDetail._id, setSource, setAppId]);

  return (
    <>
      <NextHead title={appDetail.name} icon={appDetail.avatar}></NextHead>
      <Box h={'100%'} position={'relative'}>
        {!appDetail._id ? (
          <Loading fixed={false} />
        ) : (
          <>
            {appDetail.type === AppTypeEnum.simple && <SimpleEdit />}
            {appDetail.type === AppTypeEnum.workflow && <Workflow />}
            {appDetail.type === AppTypeEnum.plugin && <Plugin />}
            {appDetail.type === AppTypeEnum.toolSet && <MCPTools />}
          </>
        )}
      </Box>
    </>
  );
};

const Provider = () => {
  return (
    <AppContextProvider>
      <AppDetail />
    </AppContextProvider>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: {
      ...(await serviceSideProps(context, ['app', 'chat', 'user', 'file', 'publish', 'workflow']))
    }
  };
}

export default Provider;
