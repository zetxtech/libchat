import Divider from '@/pageComponents/app/detail/WorkflowComponents/Flow/components/Divider';
import { getTeamInvoiceHeader, updateTeamInvoiceHeader } from '@/web/support/user/team/api';
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  type InputProps,
  Radio,
  RadioGroup
} from '@chakra-ui/react';
import { type TeamInvoiceHeaderType } from '@libchat/global/support/user/team/type';
import MyBox from '@libchat/web/components/common/MyBox';
import { useRequest2 } from '@libchat/web/hooks/useRequest';
import { useTranslation } from 'next-i18next';
import { type UseFormReturn, useForm } from 'react-hook-form';
import FormLabel from '@libchat/web/components/common/MyBox/FormLabel';

export const InvoiceHeaderSingleForm = ({
  inputForm,
  required = false
}: {
  inputForm: UseFormReturn<TeamInvoiceHeaderType, any>;
  required?: boolean;
}) => {
  const { t } = useTranslation();

  const { watch, register } = inputForm;
  const needSpecialInvoice = watch('needSpecialInvoice');

  const styles: InputProps = {
    bg: 'myGray.50',
    w: '21.25rem'
  };

  return (
    <>
      <Flex
        w={['auto', '36rem']}
        flexDir={'column'}
        gap={'1rem'}
        fontWeight={'500'}
        color={'myGray.900'}
        fontSize={'14px'}
      >
        <Flex
          justify={'space-between'}
          alignItems={['flex-start', 'center']}
          flexDir={['column', 'row']}
        >
          <FormLabel required={required}>{t('account_bill:organization_name')}</FormLabel>
          <Input
            {...styles}
            placeholder={t('account_bill:organization_name')}
            {...register('teamName', { required })}
          />
        </Flex>
        <Flex
          justify={'space-between'}
          alignItems={['flex-start', 'center']}
          flexDir={['column', 'row']}
        >
          <FormLabel required={required}>{t('account_bill:unit_code')}</FormLabel>
          <Input
            {...styles}
            placeholder={t('account_bill:unit_code')}
            {...register('unifiedCreditCode', {
              required
            })}
          />
        </Flex>
        <Flex
          justify={'space-between'}
          alignItems={['flex-start', 'center']}
          flexDir={['column', 'row']}
        >
          <FormLabel required={!!needSpecialInvoice && required}>
            {t('account_bill:company_address')}
          </FormLabel>
          <Input
            {...styles}
            placeholder={t('account_bill:company_address')}
            {...register('companyAddress', { required: !!needSpecialInvoice && required })}
          />
        </Flex>
        <Flex
          justify={'space-between'}
          alignItems={['flex-start', 'center']}
          flexDir={['column', 'row']}
        >
          <FormLabel required={!!needSpecialInvoice && required}>
            {t('account_bill:company_phone')}
          </FormLabel>
          <Input
            {...styles}
            placeholder={t('account_bill:company_phone')}
            {...register('companyPhone', { required: !!needSpecialInvoice && required })}
          />
        </Flex>
        <Flex
          justify={'space-between'}
          alignItems={['flex-start', 'center']}
          flexDir={['column', 'row']}
        >
          <FormLabel required={!!needSpecialInvoice && required}>
            {t('account_bill:bank_name')}
          </FormLabel>
          <Input
            {...styles}
            placeholder={t('account_bill:bank_name')}
            {...register('bankName', { required: !!needSpecialInvoice && required })}
          />
        </Flex>
        <Flex
          justify={'space-between'}
          alignItems={['flex-start', 'center']}
          flexDir={['column', 'row']}
        >
          <FormLabel required={!!needSpecialInvoice && required}>
            {t('account_bill:bank_account')}
          </FormLabel>
          <Input
            {...styles}
            placeholder={t('account_bill:bank_account')}
            {...register('bankAccount', { required: !!needSpecialInvoice && required })}
          />
        </Flex>
        <Flex
          justify={'space-between'}
          alignItems={['flex-start', 'center']}
          flexDir={['column', 'row']}
        >
          <FormLabel required={required}>{t('account_bill:need_special_invoice')}</FormLabel>
          {/* @ts-ignore */}
          <RadioGroup
            value={`${needSpecialInvoice}`}
            onChange={(e) => {
              inputForm.setValue('needSpecialInvoice', e === 'true');
            }}
            w={'21.25rem'}
          >
            <HStack h={'2rem'}>
              <Radio value="true" pr={'1rem'}>
                <Box fontSize={'14px'}>{t('account_bill:yes')}</Box>
              </Radio>
              <Radio value="false">
                <Box fontSize={'14px'}>{t('account_bill:no')}</Box>
              </Radio>
            </HStack>
          </RadioGroup>
        </Flex>
        <Box w={'100%'}>
          <Divider showBorderBottom={false} />
        </Box>
        <Flex
          justify={'space-between'}
          alignItems={['flex-start', 'center']}
          flexDir={['column', 'row']}
        >
          <FormLabel required={required}>{t('account_bill:contact_phone')}</FormLabel>
          <Input
            {...styles}
            placeholder={t('account_bill:contact_phone')}
            {...register('contactPhone', {
              required,
              pattern: {
                value: /^[1]{1}[0-9]{10}$/,
                message: t('account_bill:contact_phone_void')
              }
            })}
          />
        </Flex>
        <Flex
          justify={'space-between'}
          alignItems={['flex-start', 'center']}
          flexDir={['column', 'row']}
        >
          <FormLabel required={required}>{t('account_bill:email_address')}</FormLabel>
          <Input
            {...styles}
            placeholder={t('account_bill:email_address')}
            {...register('emailAddress', {
              required,
              pattern: {
                value: /(^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$)/,
                message: t('user:password.email_phone_error')
              }
            })}
          />
        </Flex>
      </Flex>
    </>
  );
};

const InvoiceHeaderForm = () => {
  const inputForm = useForm<TeamInvoiceHeaderType>({
    defaultValues: {
      teamName: '',
      unifiedCreditCode: '',
      companyAddress: '',
      companyPhone: '',
      bankName: '',
      bankAccount: '',
      needSpecialInvoice: false,
      emailAddress: '',
      contactPhone: ''
    }
  });

  const { loading: isLoading } = useRequest2(() => getTeamInvoiceHeader(), {
    manual: false,
    onSuccess: (data) => {
      console.log(data, '--');
      inputForm.reset(data);
    }
  });

  const { t } = useTranslation();

  const { loading: isSubmitting, runAsync: onUpdateHeader } = useRequest2(
    (data: TeamInvoiceHeaderType) => updateTeamInvoiceHeader(data),
    {
      manual: true,
      successToast: t('account_bill:save_success'),
      errorToast: t('account_bill:save_failed')
    }
  );

  return (
    <>
      <MyBox isLoading={isLoading} pt={'1rem'}>
        <Flex w={'100%'} overflow={'auto'} justify={'center'} flexDir={'column'} align={'center'}>
          <InvoiceHeaderSingleForm inputForm={inputForm} />
          <Flex w={'100%'} justify={'center'} mt={'3rem'}>
            <Button
              variant={'primary'}
              px="0"
              onClick={inputForm.handleSubmit(onUpdateHeader)}
              isLoading={isSubmitting}
            >
              <Flex alignItems={'center'} px={'20px'}>
                <Box px={'1.25rem'} py={'0.5rem'}>
                  {t('account_bill:save')}
                </Box>
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </MyBox>
    </>
  );
};

export default InvoiceHeaderForm;
