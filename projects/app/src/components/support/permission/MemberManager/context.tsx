import { useDisclosure } from '@chakra-ui/react';
import type {
  CollaboratorItemType,
  UpdateClbPermissionProps
} from '@libchat/global/support/permission/collaborator';
import { PermissionList } from '@libchat/global/support/permission/constant';
import { Permission } from '@libchat/global/support/permission/controller';
import type {
  PermissionListType,
  PermissionValueType
} from '@libchat/global/support/permission/type';
import { type ReactNode, useCallback } from 'react';
import { createContext } from 'use-context-selector';
import dynamic from 'next/dynamic';

import MemberListCard, { type MemberListCardProps } from './MemberListCard';
import { useRequest2 } from '@libchat/web/hooks/useRequest';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useConfirm } from '@libchat/web/hooks/useConfirm';
import type { RequireOnlyOne } from '@libchat/global/common/type/utils';
import { useTranslation } from 'next-i18next';

const MemberModal = dynamic(() => import('./MemberModal'));
const ManageModal = dynamic(() => import('./ManageModal'));

export type MemberManagerInputPropsType = {
  permission: Permission;
  onGetCollaboratorList: () => Promise<CollaboratorItemType[]>;
  permissionList?: PermissionListType;
  onUpdateCollaborators: (props: UpdateClbPermissionProps) => Promise<any>;
  onDelOneCollaborator: (
    props: RequireOnlyOne<{ tmbId: string; groupId: string; orgId: string }>
  ) => Promise<any>;
  refreshDeps?: any[];
};

export type MemberManagerPropsType = MemberManagerInputPropsType & {
  collaboratorList: CollaboratorItemType[];
  refetchCollaboratorList: () => void;
  isFetchingCollaborator: boolean;
  getPerLabelList: (per: PermissionValueType) => string[];
};
export type ChildrenProps = {
  onOpenAddMember: () => void;
  onOpenManageModal: () => void;
  MemberListCard: (props: MemberListCardProps) => JSX.Element;
};

type CollaboratorContextType = MemberManagerPropsType & {};

export const CollaboratorContext = createContext<CollaboratorContextType>({
  collaboratorList: [],
  permissionList: PermissionList,
  onUpdateCollaborators: () => {
    throw new Error('Function not implemented.');
  },
  onDelOneCollaborator: () => {
    throw new Error('Function not implemented.');
  },
  getPerLabelList: (): string[] => {
    throw new Error('Function not implemented.');
  },
  refetchCollaboratorList: (): void => {
    throw new Error('Function not implemented.');
  },
  onGetCollaboratorList: (): Promise<CollaboratorItemType[]> => {
    throw new Error('Function not implemented.');
  },
  isFetchingCollaborator: false,
  permission: new Permission()
});

const CollaboratorContextProvider = ({
  permission,
  onGetCollaboratorList,
  permissionList,
  onUpdateCollaborators,
  onDelOneCollaborator,
  children,
  refetchResource,
  refreshDeps = [],
  isInheritPermission,
  hasParent,
  addPermissionOnly
}: MemberManagerInputPropsType & {
  children: (props: ChildrenProps) => ReactNode;
  refetchResource?: () => void;
  isInheritPermission?: boolean;
  hasParent?: boolean;
  addPermissionOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const onUpdateCollaboratorsThen = async (props: UpdateClbPermissionProps) => {
    await onUpdateCollaborators(props);
    refetchCollaboratorList();
  };
  const onDelOneCollaboratorThen = async (
    props: RequireOnlyOne<{ tmbId: string; groupId: string; orgId: string }>
  ) => {
    await onDelOneCollaborator(props);
    refetchCollaboratorList();
  };

  const { feConfigs } = useSystemStore();

  const {
    data: collaboratorList = [],
    runAsync: refetchCollaboratorList,
    loading: isFetchingCollaborator
  } = useRequest2(
    async () => {
      if (feConfigs.isPlus) {
        const data = await onGetCollaboratorList();
        return data.map((item) => {
          return {
            ...item,
            permission: new Permission({
              per: item.permission.value
            })
          };
        });
      }
      return [];
    },
    {
      manual: false,
      refreshDeps: refreshDeps
    }
  );

  const getPerLabelList = useCallback(
    (per: PermissionValueType) => {
      if (!permissionList) return [];

      const Per = new Permission({ per });
      const labels: string[] = [];

      if (Per.hasManagePer) {
        labels.push(permissionList['manage'].name);
      } else if (Per.hasWritePer) {
        labels.push(permissionList['write'].name);
      } else if (Per.hasReadPer) {
        labels.push(permissionList['read'].name);
      }

      Object.values(permissionList).forEach((item) => {
        if (item.checkBoxType === 'multiple') {
          if (Per.checkPer(item.value)) {
            labels.push(item.name);
          }
        }
      });

      return labels;
    },
    [permissionList]
  );

  const { ConfirmModal, openConfirm } = useConfirm({});
  const {
    isOpen: isOpenAddMember,
    onOpen: onOpenAddMember,
    onClose: onCloseAddMember
  } = useDisclosure();
  const {
    isOpen: isOpenManageModal,
    onOpen: onOpenManageModal,
    onClose: onCloseManageModal
  } = useDisclosure();

  const contextValue = {
    permission,
    onGetCollaboratorList,
    collaboratorList,
    refetchCollaboratorList,
    isFetchingCollaborator,
    permissionList,
    onUpdateCollaborators: onUpdateCollaboratorsThen,
    onDelOneCollaborator: onDelOneCollaboratorThen,
    getPerLabelList
  };

  const onOpenAddMemberModal = () => {
    if (isInheritPermission && hasParent) {
      openConfirm(
        () => {
          onOpenAddMember();
        },
        undefined,
        t('common:permission.Remove InheritPermission Confirm')
      )();
    } else {
      onOpenAddMember();
    }
  };
  const onOpenManageModalModal = () => {
    if (isInheritPermission && hasParent) {
      openConfirm(
        () => {
          onOpenManageModal();
        },
        undefined,
        t('common:permission.Remove InheritPermission Confirm')
      )();
    } else {
      onOpenManageModal();
    }
  };
  return (
    <CollaboratorContext.Provider value={contextValue}>
      {children({
        onOpenAddMember: onOpenAddMemberModal,
        onOpenManageModal: onOpenManageModalModal,
        MemberListCard
      })}
      {isOpenAddMember && (
        <MemberModal
          onClose={() => {
            onCloseAddMember();
            refetchResource?.();
          }}
          addPermissionOnly={addPermissionOnly}
        />
      )}
      {isOpenManageModal && (
        <ManageModal
          onClose={() => {
            onCloseManageModal();
            refetchResource?.();
          }}
        />
      )}
      <ConfirmModal />
    </CollaboratorContext.Provider>
  );
};

export default CollaboratorContextProvider;
