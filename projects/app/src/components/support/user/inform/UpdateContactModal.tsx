import React from 'react';
import { ModalBody, Box, Flex, Input, ModalFooter, Button, HStack } from '@chakra-ui/react';
import MyModal from '@libchat/web/components/common/MyModal';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { useRequest2 } from '@libchat/web/hooks/useRequest';
import { updateContact, updateNotificationAccount } from '@/web/support/user/api';
import Icon from '@libchat/web/components/common/Icon';
import { useSendCode } from '@/web/support/user/hooks/useSendCode';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useSystemStore } from '@/web/common/system/useSystemStore';

type FormType = {
  contact: string;
  verifyCode: string;
};

const UpdateContactModal = ({
  onClose,
  onSuccess,
  mode
}: {
  onClose: () => void;
  onSuccess?: (val: string) => void;
  mode: 'contact' | 'notification_account';
}) => {
  const { t } = useTranslation();
  const { initUserInfo } = useUserStore();
  const { feConfigs } = useSystemStore();

  const { register, handleSubmit, watch } = useForm<FormType>({
    defaultValues: {
      contact: '',
      verifyCode: ''
    }
  });

  const account = watch('contact');
  const verifyCode = watch('verifyCode');

  const { runAsync: onSubmit, loading: isLoading } = useRequest2(
    async (data: FormType) => {
      if (mode === 'contact') {
        await updateContact(data);
      } else {
        await updateNotificationAccount({
          account: data.contact,
          verifyCode: data.verifyCode
        });
      }
      return data.contact;
    },
    {
      onSuccess(data) {
        initUserInfo();
        onClose();
        onSuccess?.(data);
      },
      successToast: t('common:support.user.info.bind_notification_success'),
      errorToast: t('common:support.user.info.bind_notification_error')
    }
  );

  const { SendCodeBox } = useSendCode({ type: 'bindNotification' });

  const placeholder = feConfigs?.bind_notification_method
    ?.map((item) => {
      switch (item) {
        case 'email':
          return t('common:support.user.login.Email');
        case 'phone':
          return t('common:support.user.login.Phone number');
      }
    })
    .join('/');

  return (
    <>
      <MyModal
        isOpen
        iconSrc="common/settingLight"
        w={'32rem'}
        title={
          mode === 'notification_account'
            ? t('common:support.user.info.notification_receiving_hint')
            : t('common:contact_way')
        }
      >
        <ModalBody px={10}>
          <Flex flexDirection="column">
            <HStack px="6" py="3" color="primary.600" bgColor="primary.50" borderRadius="md">
              <Icon name="common/info" w="1rem" />
              <Box fontSize={'sm'}>{t('common:support.user.info.bind_notification_hint')}</Box>
            </HStack>
            <Flex mt="4" alignItems="center">
              <Box flex={'0 0 70px'}>{t('common:user.Account')}</Box>
              <Input
                flex={1}
                bg={'myGray.50'}
                {...register('contact', { required: true })}
                placeholder={placeholder}
              ></Input>
            </Flex>
            <Flex mt="6" alignItems="center" position={'relative'}>
              <Box flex={'0 0 70px'}>{t('common:support.user.info.verification_code')}</Box>
              <Input
                flex={1}
                bg={'myGray.50'}
                {...register('verifyCode', { required: true })}
                placeholder={t('common:support.user.info.code_required')}
              ></Input>
              <SendCodeBox username={account} />
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} variant={'whiteBase'} onClick={onClose}>
            {t('common:Cancel')}
          </Button>
          <Button
            isLoading={isLoading}
            isDisabled={!account || !verifyCode}
            onClick={handleSubmit((data) => onSubmit(data))}
          >
            {t('common:Confirm')}
          </Button>
        </ModalFooter>
      </MyModal>
    </>
  );
};

export default UpdateContactModal;
