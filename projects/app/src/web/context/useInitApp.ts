import { useEffect, useState } from 'react';
import { clientInitData } from '@/web/common/system/staticData';
import { useRouter } from 'next/router';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import type { LibChatFeConfigsType } from '@libchat/global/common/system/types/index.d';
import { useMemoizedFn, useMount } from 'ahooks';
import { TrackEventName } from '../common/system/constants';
import { useRequest2 } from '@libchat/web/hooks/useRequest';
import { useUserStore } from '../support/user/useUserStore';
import {
  setBdVId,
  setLibChatSem,
  setInviterId,
  setSourceDomain,
  setUtmParams,
  setUtmWorkflow
} from '../support/marketing/utils';
import { type ShortUrlParams } from '@libchat/global/support/marketing/type';

type MarketingQueryParams = {
  hiId?: string;
  bd_vid?: string;
  k?: string;
  sourceDomain?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_workflow?: string;
};

const MARKETING_PARAMS: (keyof MarketingQueryParams)[] = [
  'hiId',
  'bd_vid',
  'k',
  'sourceDomain',
  'utm_source',
  'utm_medium',
  'utm_content',
  'utm_workflow'
];

export const useInitApp = () => {
  const router = useRouter();
  const { hiId, bd_vid, k, sourceDomain, utm_source, utm_medium, utm_content, utm_workflow } =
    router.query as MarketingQueryParams;

  const { loadGitStar, setInitd, feConfigs } = useSystemStore();
  const { userInfo } = useUserStore();
  const [scripts, setScripts] = useState<LibChatFeConfigsType['scripts']>([]);
  const [title, setTitle] = useState(process.env.SYSTEM_NAME || 'AI');

  const getPathWithoutMarketingParams = () => {
    const filteredQuery = { ...router.query };
    MARKETING_PARAMS.forEach((param) => {
      delete filteredQuery[param];
    });

    const newQuery = new URLSearchParams();
    Object.entries(filteredQuery).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => newQuery.append(key, v));
        } else {
          newQuery.append(key, value);
        }
      }
    });

    return `${router.pathname}${newQuery.toString() ? `?${newQuery.toString()}` : ''}`;
  };

  const initFetch = useMemoizedFn(async () => {
    const {
      feConfigs: { scripts, isPlus, systemTitle }
    } = await clientInitData();

    setTitle(systemTitle || 'LibChat');

    // log libchat
    if (!isPlus) {
      console.log(
        '%cWelcome to LibChat',
        'font-family:Arial; color:#3370ff ; font-size:18px; font-weight:bold;',
        `GitHub：https://github.com/zetxtech/libchat`
      );
    }

    loadGitStar();

    setScripts(scripts || []);
    setInitd();
  });

  useMount(() => {
    const errorTrack = (event: ErrorEvent) => {
      window.umami?.track(TrackEventName.windowError, {
        device: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          appName: navigator.appName
        },
        error: event,
        url: location.href
      });
    };
    // add window error track
    window.addEventListener('error', errorTrack);

    return () => {
      window.removeEventListener('error', errorTrack);
    };
  });

  useRequest2(initFetch, {
    refreshDeps: [userInfo?.username],
    manual: false,
    pollingInterval: 300000 // 5 minutes refresh
  });

  // Marketing data track
  useMount(() => {
    setInviterId(hiId);
    setBdVId(bd_vid);
    setUtmWorkflow(utm_workflow);
    setSourceDomain(sourceDomain);

    const utmParams: ShortUrlParams = {
      ...(utm_source && { shortUrlSource: utm_source }),
      ...(utm_medium && { shortUrlMedium: utm_medium }),
      ...(utm_content && { shortUrlContent: utm_content })
    };
    if (utm_workflow) {
      setUtmParams(utmParams);
    }
    setLibChatSem({ keyword: k, ...utmParams });

    const newPath = getPathWithoutMarketingParams();
    router.replace(newPath);
  });

  return {
    feConfigs,
    scripts,
    title
  };
};
