import React from 'react';
import { Flex, Box, Button, ModalBody, Input, Link } from '@chakra-ui/react';
import MyModal from '@libchat/web/components/common/MyModal';
import { PublishChannelEnum } from '@libchat/global/support/outLink/constant';
import type { OffiAccountAppType, OutLinkEditType } from '@libchat/global/support/outLink/type';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { createShareChat, updateShareChat } from '@/web/support/outLink/api';
import { useRequest2 } from '@libchat/web/hooks/useRequest';
import BasicInfo from '../components/BasicInfo';
import { getDocPath } from '@/web/common/system/doc';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyIcon from '@libchat/web/components/common/Icon';
import FormLabel from '@libchat/web/components/common/MyBox/FormLabel';

const OffiAccountEditModal = ({
  appId,
  defaultData,
  onClose,
  onCreate,
  onEdit,
  isEdit = false
}: {
  appId: string;
  defaultData: OutLinkEditType<OffiAccountAppType>;
  onClose: () => void;
  onCreate: (id: string) => void;
  onEdit: () => void;
  isEdit?: boolean;
}) => {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    handleSubmit: submitShareChat
  } = useForm({
    defaultValues: defaultData
  });

  const { runAsync: onclickCreate, loading: creating } = useRequest2(
    (e: OutLinkEditType<OffiAccountAppType>) => {
      if (e?.app) {
        e.app.appId = e.app.appId?.trim();
        e.app.secret = e.app.secret?.trim();
        e.app.CallbackToken = e.app.CallbackToken?.trim();
        e.app.CallbackEncodingAesKey = e.app.CallbackEncodingAesKey?.trim();
      }
      return createShareChat({
        ...e,
        appId,
        type: PublishChannelEnum.officialAccount
      });
    },
    {
      errorToast: t('common:create_failed'),
      successToast: t('common:create_success'),
      onSuccess: onCreate
    }
  );

  const { runAsync: onclickUpdate, loading: updating } = useRequest2(
    (e) => {
      if (e?.app) {
        e.app.appId = e.app.appId?.trim();
        e.app.secret = e.app.secret?.trim();
        e.app.CallbackToken = e.app.CallbackToken?.trim();
        e.app.CallbackEncodingAesKey = e.app.CallbackEncodingAesKey?.trim();
      }
      return updateShareChat(e);
    },
    {
      errorToast: t('common:update_failed'),
      successToast: t('common:update_success'),
      onSuccess: onEdit
    }
  );

  const { feConfigs } = useSystemStore();

  return (
    <MyModal
      iconSrc="/imgs/modal/shareFill.svg"
      title={
        isEdit
          ? t('publish:official_account.edit_modal_title')
          : t('publish:official_account.create_modal_title')
      }
      minW={['auto', '60rem']}
    >
      <ModalBody display={'grid'} gridTemplateColumns={['1fr', '1fr 1fr']} fontSize={'14px'} p={0}>
        <Box p={8} minH={['auto', '400px']} borderRight={'base'}>
          <BasicInfo register={register} setValue={setValue} defaultData={defaultData} />
        </Box>
        <Flex p={8} minH={['auto', '400px']} flexDirection="column" gap={6}>
          <Flex alignItems="center">
            <Box color="myGray.600">{t('publish:official_account.params')}</Box>
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
                  <MyIcon name="book" w={'17px'} h={'17px'} mr="1" />
                  {t('common:read_doc')}
                </Flex>
              </Link>
            )}
          </Flex>
          <Flex alignItems={'center'}>
            <FormLabel flex={'0 0 6.25rem'} required>
              App ID
            </FormLabel>
            <Input
              placeholder="App ID"
              {...register('app.appId', {
                required: true
              })}
            />
          </Flex>
          <Flex alignItems={'center'}>
            <FormLabel flex={'0 0 6.25rem'} required>
              Secret
            </FormLabel>
            <Input
              placeholder="Secret"
              {...register('app.secret', {
                required: true
              })}
            />
          </Flex>
          <Flex alignItems={'center'}>
            <FormLabel flex={'0 0 6.25rem'} required>
              Token
            </FormLabel>
            <Input
              placeholder="Token"
              {...register('app.CallbackToken', {
                required: true
              })}
            />
          </Flex>
          <Flex alignItems={'center'}>
            <FormLabel flex={'0 0 6.25rem'}>AES Key</FormLabel>
            <Input placeholder="AES Key" {...register('app.CallbackEncodingAesKey')} />
          </Flex>

          <Box flex={1}></Box>

          <Flex justifyContent={'end'}>
            <Button variant={'whiteBase'} mr={3} onClick={onClose}>
              {t('common:Close')}
            </Button>
            <Button
              isLoading={creating || updating}
              onClick={submitShareChat((data) =>
                isEdit ? onclickUpdate(data) : onclickCreate(data)
              )}
            >
              {t('common:Confirm')}
            </Button>
          </Flex>
        </Flex>
      </ModalBody>
    </MyModal>
  );
};

export default OffiAccountEditModal;
