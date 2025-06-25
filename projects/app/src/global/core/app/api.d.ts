import type { ParentIdType } from '@libchat/global/common/parentFolder/type';
import type { AppTypeEnum } from '@libchat/global/core/app/constants';
import type { AppSchema } from '@libchat/global/core/app/type';

export type AppUpdateParams = {
  parentId?: ParentIdType;
  name?: string;
  type?: AppTypeEnum;
  avatar?: string;
  intro?: string;
  nodes?: AppSchema['modules'];
  edges?: AppSchema['edges'];
  chatConfig?: AppSchema['chatConfig'];
  teamTags?: AppSchema['teamTags'];
};

export type PostPublishAppProps = {
  nodes: AppSchema['modules'];
  edges: AppSchema['edges'];
  chatConfig: AppSchema['chatConfig'];
  isPublish?: boolean;
  versionName?: string;
  autoSave?: boolean; // If it is automatically saved, only one copy of the entire app will be stored, overwriting the old version
};

export type PostRevertAppProps = {
  versionId: string;
  // edit workflow
  editNodes: AppSchema['modules'];
  editEdges: AppSchema['edges'];
  editChatConfig: AppSchema['chatConfig'];
};

export type AppChangeOwnerBody = {
  appId: string;
  ownerId: string;
};
