'use client';
import { serviceSideProps } from '@/web/common/i18n/utils';
import React, { useState } from 'react';
import DashboardContainer from '@/pageComponents/dashboard/Container';
import {
  Box,
  Button,
  Flex,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { useRequest2 } from '@libchat/web/hooks/useRequest';
import { deleteMcpServer, getMcpServerList } from '@/web/support/mcp/api';
import MyBox from '@libchat/web/components/common/MyBox';
import EditMcpModal, {
  defaultForm,
  type EditMcForm
} from '@/pageComponents/dashboard/mcp/EditModal';
import EmptyTip from '@libchat/web/components/common/EmptyTip';
import MyIconButton from '@libchat/web/components/common/Icon/button';
import dynamic from 'next/dynamic';
import { type McpKeyType } from '@libchat/global/support/mcp/type';
import { useSystem } from '@libchat/web/hooks/useSystem';
import { useUserStore } from '@/web/support/user/useUserStore';
import PopoverConfirm from '@libchat/web/components/common/MyPopover/PopoverConfirm';

const UsageWay = dynamic(() => import('@/pageComponents/dashboard/mcp/usageWay'), {
  ssr: false
});

const McpServer = () => {
  const { t } = useTranslation();
  const { isPc } = useSystem();
  const { userInfo } = useUserStore();

  const {
    data: mcpServerList = [],
    loading: loadingList,
    refresh: loadMcpList
  } = useRequest2(getMcpServerList, {
    manual: false
  });

  const [editMcp, setEditMcp] = useState<EditMcForm>();
  const [usageWay, setUsageWay] = useState<McpKeyType>();

  const { runAsync: onDeleteMcpServer } = useRequest2(deleteMcpServer, {
    manual: true,
    onSuccess: () => {
      loadMcpList();
    }
  });

  const isLoading = loadingList;

  return (
    <>
      <DashboardContainer>
        {({ MenuIcon }) => (
          <MyBox isLoading={isLoading} h={'100%'} p={6}>
            {isPc ? (
              <Flex alignItems={'flex-end'} justifyContent={'space-between'}>
                <Box>
                  <Box fontSize={'lg'} color={'myGray.900'} fontWeight={500}>
                    {t('dashboard_mcp:mcp_server')}
                  </Box>
                  <Box fontSize={'xs'} color={'myGray.500'}>
                    {t('dashboard_mcp:mcp_server_description')}
                  </Box>
                </Box>
                <Button
                  isDisabled={!userInfo?.permission.hasApikeyCreatePer}
                  onClick={() => setEditMcp(defaultForm)}
                >
                  {t('dashboard_mcp:create_mcp_server')}
                </Button>
              </Flex>
            ) : (
              <>
                <HStack>
                  <Box>{MenuIcon}</Box>
                  <Box fontSize={'lg'} color={'myGray.900'} fontWeight={500}>
                    {t('dashboard_mcp:mcp_server')}
                  </Box>
                </HStack>
                <Box fontSize={'xs'} color={'myGray.500'}>
                  {t('dashboard_mcp:mcp_server_description')}
                </Box>
                <Flex mt={2} justifyContent={'flex-end'}>
                  <Button
                    isDisabled={!userInfo?.permission.hasApikeyCreatePer}
                    onClick={() => setEditMcp(defaultForm)}
                  >
                    {t('dashboard_mcp:create_mcp_server')}
                  </Button>
                </Flex>
              </>
            )}

            {/* table */}
            <TableContainer mt={4} bg={'white'} borderRadius={'md'}>
              <Table>
                <Thead>
                  <Tr borderBottom={'base'}>
                    <Th bg={'white'}>{t('dashboard_mcp:mcp_name')}</Th>
                    <Th bg={'white'}>{t('dashboard_mcp:mcp_apps')}</Th>
                    <Th bg={'white'}></Th>
                  </Tr>
                </Thead>
                <Tbody fontSize={'sm'}>
                  {mcpServerList.map((mcp) => {
                    return (
                      <Tr key={mcp._id} fontWeight={500} fontSize={'sm'} color={'myGray.900'}>
                        <Td>{mcp.name}</Td>
                        <Td>{mcp.apps.length}</Td>
                        <Td>
                          <HStack>
                            <Button
                              mr={4}
                              variant={'whiteBase'}
                              size={'sm'}
                              onClick={() => setUsageWay(mcp)}
                            >
                              {t('dashboard_mcp:start_use')}
                            </Button>
                            <MyIconButton
                              icon="edit"
                              onClick={() =>
                                setEditMcp({
                                  id: mcp._id,
                                  name: mcp.name,
                                  apps: mcp.apps
                                })
                              }
                            />

                            <PopoverConfirm
                              Trigger={
                                <Box>
                                  <MyIconButton
                                    icon="delete"
                                    hoverBg="red.50"
                                    hoverColor={'red.600'}
                                  />
                                </Box>
                              }
                              type="delete"
                              content={t('dashboard_mcp:delete_mcp_server_confirm_tip')}
                              onConfirm={() => onDeleteMcpServer(mcp._id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
              {mcpServerList.length === 0 && <EmptyTip />}
            </TableContainer>
          </MyBox>
        )}
      </DashboardContainer>

      {!!usageWay && <UsageWay mcp={usageWay} onClose={() => setUsageWay(undefined)} />}
      {!!editMcp && (
        <EditMcpModal
          editMcp={editMcp}
          onClose={() => setEditMcp(undefined)}
          onSuccess={() => {
            setEditMcp(undefined);
            loadMcpList();
          }}
        />
      )}
    </>
  );
};

export default McpServer;

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['dashboard_mcp']))
    }
  };
}
