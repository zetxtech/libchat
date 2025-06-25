import type { ListParams } from '@/pages/api/core/app/template/list';
import { GET } from '@/web/common/api/request';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import type { AppTemplateSchemaType, TemplateTypeSchemaType } from '@libchat/global/core/app/type';
import { defaultTemplateTypes } from '@libchat/web/core/workflow/constants';

export const getTemplateMarketItemList = (data: ListParams) =>
  GET<AppTemplateSchemaType[]>(`/core/app/template/list`, data);

export const getTemplateMarketItemDetail = (templateId: string) =>
  GET<AppTemplateSchemaType>(`/core/app/template/detail?templateId=${templateId}`);

export const getTemplateTagList = () => {
  return useSystemStore.getState()?.feConfigs?.isPlus
    ? GET<TemplateTypeSchemaType[]>('/proApi/core/app/template/getTemplateTypes')
    : Promise.resolve(defaultTemplateTypes);
};
