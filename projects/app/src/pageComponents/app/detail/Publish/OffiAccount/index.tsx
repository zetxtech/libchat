import React, { useMemo, useState } from 'react';
import {
  Flex,
  Box,
  Button,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  useDisclosure,
  Link,
  HStack
} from '@chakra-ui/react';
import MyIcon from '@libchat/web/components/common/Icon';
import { useLoading } from '@libchat/web/hooks/useLoading';
import { getShareChatList, delShareChatById } from '@/web/support/outLink/api';
import { formatTimeToChatTime } from '@libchat/global/common/string/time';
import { defaultOutLinkForm } from '@/web/core/app/constants';
import type { OutLinkEditType, OffiAccountAppType } from '@libchat/global/support/outLink/type.d';
import { PublishChannelEnum } from '@libchat/global/support/outLink/constant';
import { useTranslation } from 'next-i18next';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import MyMenu from '@libchat/web/components/common/MyMenu';
import EmptyTip from '@libchat/web/components/common/EmptyTip';
import { useRequest2 } from '@libchat/web/hooks/useRequest';
import { getDocPath } from '@/web/common/system/doc';

const OffiAccountEditModal = dynamic(() => import('./OffiAccountEditModal'));
const ShowShareLinkModal = dynamic(() => import('../components/showShareLinkModal'));

const OffiAccount = ({ appId }: { appId: string }) => {
  const { t } = useTranslation();
  const { Loading, setIsLoading } = useLoading();
  const { feConfigs } = useSystemStore();
  const [editOffiAccountData, setEditOffiAccountData] =
    useState<OutLinkEditType<OffiAccountAppType>>();
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const baseUrl = useMemo(
    () => feConfigs?.customApiDomain || `${location.origin}/api`,
    [feConfigs?.customApiDomain]
  );

  const {
    data: shareChatList = [],
    loading: isFetching,
    runAsync: refetchShareChatList
  } = useRequest2(
    () => getShareChatList<OffiAccountAppType>({ appId, type: PublishChannelEnum.officialAccount }),
    {
      manual: false
    }
  );

  const {
    onOpen: openShowShareLinkModal,
    isOpen: showShareLinkModalOpen,
    onClose: closeShowShareLinkModal
  } = useDisclosure();

  const [showShareLink, setShowShareLink] = useState<string | null>(null);

  return (
    <Box position={'relative'} pt={3} px={5} minH={'50vh'}>
      <Flex justifyContent={'space-between'} flexDirection="row">
        <HStack>
          <Box fontWeight={'bold'} fontSize={['md', 'lg']}>
            {t('publish:official_account.name')}
          </Box>

          {feConfigs?.docUrl && (
            <Link
              href={
                feConfigs.openAPIDocUrl ||
                getDocPath('/docs/use-cases/external-integration/official_account/')
              }
              target={'_blank'}
              ml={2}
              color={'primary.500'}
              fontSize={'sm'}
            >
              <Flex alignItems={'center'}>
                <MyIcon name="book" mr="1" w={'1rem'} />
                {t('common:read_doc')}
              </Flex>
            </Link>
          )}
        </HStack>
        <Button
          variant={'primary'}
          colorScheme={'blue'}
          size={['sm', 'md']}
          leftIcon={<MyIcon name={'common/addLight'} w="1.25rem" color="white" />}
          ml={3}
          {...(shareChatList.length >= 10
            ? {
                isDisabled: true,
                title: t('common:core.app.share.Amount limit tip')
              }
            : {})}
          onClick={() => {
            setEditOffiAccountData(defaultOutLinkForm as any); // HACK
            setIsEdit(false);
          }}
        >
          {t('common:add_new')}
        </Button>
      </Flex>
      <TableContainer mt={3}>
        <Table variant={'simple'} w={'100%'} overflowX={'auto'} fontSize={'sm'}>
          <Thead>
            <Tr>
              <Th>{t('common:Name')} </Th>
              <Th> {t('common:support.outlink.Usage points')} </Th>
              {feConfigs?.isPlus && (
                <>
                  <Th>{t('common:core.app.share.Ip limit title')} </Th>
                  <Th> {t('common:expired_time')} </Th>
                </>
              )}
              <Th>{t('common:last_use_time')} </Th>
              <Th> </Th>
            </Tr>
          </Thead>
          <Tbody>
            {shareChatList.map((item) => (
              <Tr key={item._id}>
                <Td>{item.name} </Td>
                <Td>
                  {Math.round(item.usagePoints)}
                  {feConfigs?.isPlus
                    ? `${
                        item.limit?.maxUsagePoints && item.limit.maxUsagePoints > -1
                          ? ` / ${item.limit.maxUsagePoints}`
                          : ` / ${t('common:Unlimited')}`
                      }`
                    : ''}
                </Td>
                {feConfigs?.isPlus && (
                  <>
                    <Td>{item?.limit?.QPM || '-'} </Td>
                    <Td>
                      {item?.limit?.expiredTime
                        ? dayjs(item.limit?.expiredTime).format('YYYY/MM/DD\nHH:mm')
                        : '-'}
                    </Td>
                  </>
                )}
                <Td>
                  {item.lastTime
                    ? t(formatTimeToChatTime(item.lastTime) as any).replace('#', ':')
                    : t('common:un_used')}
                </Td>
                <Td display={'flex'} alignItems={'center'}>
                  <Button
                    onClick={() => {
                      setShowShareLink(`${baseUrl}/support/outLink/offiaccount/${item.shareId}`);
                      openShowShareLinkModal();
                    }}
                    size={'sm'}
                    mr={3}
                    variant={'whitePrimary'}
                  >
                    {t('publish:request_address')}
                  </Button>
                  <MyMenu
                    Button={
                      <MyIcon
                        name={'more'}
                        _hover={{ bg: 'myGray.100' }}
                        cursor={'pointer'}
                        borderRadius={'md'}
                        w={'14px'}
                        p={2}
                      />
                    }
                    menuList={[
                      {
                        children: [
                          {
                            label: t('common:Edit'),
                            icon: 'edit',
                            onClick: () => {
                              setEditOffiAccountData({
                                _id: item._id,
                                name: item.name,
                                limit: item.limit,
                                app: item.app,
                                responseDetail: item.responseDetail,
                                defaultResponse: item.defaultResponse,
                                immediateResponse: item.immediateResponse
                              });
                              setIsEdit(true);
                            }
                          },
                          {
                            label: t('common:Delete'),
                            icon: 'delete',
                            onClick: async () => {
                              setIsLoading(true);
                              try {
                                await delShareChatById(item._id);
                                refetchShareChatList();
                              } catch (error) {
                                console.log(error);
                              }
                              setIsLoading(false);
                            }
                          }
                        ]
                      }
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {editOffiAccountData && (
        <OffiAccountEditModal
          appId={appId}
          defaultData={editOffiAccountData}
          onCreate={() => Promise.all([refetchShareChatList(), setEditOffiAccountData(undefined)])}
          onEdit={() => Promise.all([refetchShareChatList(), setEditOffiAccountData(undefined)])}
          onClose={() => setEditOffiAccountData(undefined)}
          isEdit={isEdit}
        />
      )}
      {shareChatList.length === 0 && !isFetching && (
        <EmptyTip text={t('common:core.app.share.Not share link')}> </EmptyTip>
      )}
      <Loading loading={isFetching} fixed={false} />
      {showShareLinkModalOpen && (
        <ShowShareLinkModal
          shareLink={showShareLink ?? ''}
          onClose={closeShowShareLinkModal}
          img="/imgs/outlink/offiaccount-copylink-instruction.png"
        />
      )}
    </Box>
  );
};

export default React.memo(OffiAccount);
