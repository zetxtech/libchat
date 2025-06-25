import { create, devtools, persist, immer } from '@libchat/web/common/zustand';
import type { DatasetListItemType } from '@libchat/global/core/dataset/type.d';
import { getDatasets } from '@/web/core/dataset/api';

type State = {
  myDatasets: DatasetListItemType[];
  loadMyDatasets: (parentId?: string) => Promise<DatasetListItemType[]>;
};

export const useDatasetStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        myDatasets: [],
        async loadMyDatasets(parentId = '') {
          const res = await getDatasets({ parentId });
          set((state) => {
            state.myDatasets = res;
          });
          return res;
        }
      })),
      {
        name: 'datasetStore',
        partialize: (state) => ({})
      }
    )
  )
);
