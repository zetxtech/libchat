import {
  getInvoiceBillsList,
  type invoiceBillDataType,
  submitInvoice
} from '@/web/support/wallet/bill/invoice/api';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  ModalBody,
  ModalFooter,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react';
import { billTypeMap } from '@libchat/global/support/wallet/bill/constants';
import { formatStorePrice2Read } from '@libchat/global/support/wallet/usage/tools';
import MyModal from '@libchat/web/components/common/MyModal';
import { useRequest2 } from '@libchat/web/hooks/useRequest';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';
import MyIcon from '@libchat/web/components/common/Icon';
import Divider from '@/pageComponents/app/detail/WorkflowComponents/Flow/components/Divider';
import { type TeamInvoiceHeaderType } from '@libchat/global/support/user/team/type';
import { InvoiceHeaderSingleForm } from './InvoiceHeaderForm';
import MyBox from '@libchat/web/components/common/MyBox';
import { getTeamInvoiceHeader } from '@/web/support/user/team/api';
import { useToast } from '@libchat/web/hooks/useToast';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

type chosenBillDataType = {
  _id: string;
  price: number;
};

const ApplyInvoiceModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const [chosenBillDataList, setChosenBillDataList] = useState<chosenBillDataType[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const {
    isOpen: isOpenSettleModal,
    onOpen: onOpenSettleModal,
    onClose: onCloseSettleModal
  } = useDisclosure();

  const {
    loading: isLoading,
    data: billsList,
    run: getInvoiceBills
  } = useRequest2(() => getInvoiceBillsList(), {
    manual: false
  });

  const handleSingleCheck = useCallback(
    (item: invoiceBillDataType) => {
      if (chosenBillDataList.find((bill) => bill._id === item._id)) {
        setChosenBillDataList(chosenBillDataList.filter((bill) => bill._id !== item._id));
      } else {
        setChosenBillDataList([...chosenBillDataList, { _id: item._id, price: item.price }]);
      }
    },
    [chosenBillDataList]
  );

  const { runAsync: onSubmitApply, loading: isSubmitting } = useRequest2(
    (data) =>
      submitInvoice({
        amount: totalPrice,
        billIdList: chosenBillDataList.map((item) => item._id),
        ...data
      }),
    {
      manual: true,
      successToast: t('account_bill:submit_success'),
      errorToast: t('account_bill:submit_failed'),
      onSuccess: () => {
        onClose();
        router.reload();
      }
    }
  );

  const inputForm = useForm<TeamInvoiceHeaderType>({
    defaultValues: {
      teamName: '',
      unifiedCreditCode: '',
      companyAddress: '',
      companyPhone: '',
      bankName: '',
      bankAccount: '',
      needSpecialInvoice: false,
      contactPhone: '',
      emailAddress: ''
    }
  });

  const { loading: isLoadingHeader } = useRequest2(() => getTeamInvoiceHeader(), {
    manual: false,
    onSuccess: (res) => inputForm.reset(res)
  });

  const handleBack = useCallback(() => {
    setChosenBillDataList([]);
    getInvoiceBills();
    onCloseSettleModal();
  }, [getInvoiceBills, onCloseSettleModal]);

  return (
    <MyModal
      isOpen={true}
      isCentered
      iconSrc="/imgs/modal/invoice.svg"
      w={'43rem'}
      onClose={onClose}
      isLoading={isLoading}
      title={t('account_bill:support_wallet_apply_invoice')}
    >
      {isOpenSettleModal ? (
        <>
          <ModalBody>
            <Box w={'100%'} fontSize={'0.875rem'}>
              <Flex w={'100%'} justifyContent={'space-between'}>
                <Box>{t('account_bill:total_amount')}</Box>
                <Box>{t('account_bill:yuan', { amount: formatStorePrice2Read(totalPrice) })}</Box>
              </Flex>
              <Box w={'100%'} py={4}>
                <Divider showBorderBottom={false} />
              </Box>
            </Box>
            <MyBox isLoading={isLoadingHeader}>
              <Flex justify={'center'}>
                <InvoiceHeaderSingleForm inputForm={inputForm} required />
              </Flex>
            </MyBox>
            <Flex
              align={'center'}
              w={'19.8rem'}
              h={'1.75rem'}
              mt={4}
              px={'0.75rem'}
              py={'0.38rem'}
              bg={'blue.50'}
              borderRadius={'sm'}
              color={'blue.600'}
            >
              <MyIcon name="infoRounded" w={'14px'} h={'14px'} />
              <Box ml={2} fontSize={'0.6875rem'}>
                {t('account_bill:invoice_sending_info')}
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant={'outline'} mr={'0.75rem'} px="0" onClick={handleBack}>
              <Flex alignItems={'center'}>
                <Box px={'1.25rem'} py={'0.5rem'}>
                  {t('account_bill:back')}
                </Box>
              </Flex>
            </Button>
            <Button isLoading={isSubmitting} px="0" onClick={inputForm.handleSubmit(onSubmitApply)}>
              <Flex alignItems={'center'}>
                <Box px={'1.25rem'} py={'0.5rem'}>
                  {t('account_bill:confirm')}
                </Box>
              </Flex>
            </Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalBody>
            <Box fontWeight={500} fontSize={'1rem'} pb={'0.75rem'}>
              {t('account_bill:support_wallet_apply_invoice')}
            </Box>
            <TableContainer minH={'50vh'}>
              <Table>
                <Thead>
                  <Tr>
                    <Th>
                      <Checkbox
                        isChecked={
                          chosenBillDataList.length === billsList?.length && billsList?.length !== 0
                        }
                        onChange={(e) => {
                          !e.target.checked
                            ? setChosenBillDataList([])
                            : setChosenBillDataList(
                                billsList?.map((item) => ({
                                  _id: item._id,
                                  price: item.price
                                })) || []
                              );
                        }}
                      />
                    </Th>
                    <Th>{t('account_bill:type')}</Th>
                    <Th>{t('account_bill:time')}</Th>
                    <Th>{t('account_bill:support_wallet_amount')}</Th>
                  </Tr>
                </Thead>
                <Tbody fontSize={'0.875rem'}>
                  {billsList?.map((item) => (
                    <Tr
                      cursor={'pointer'}
                      key={item._id}
                      onClick={(e: any) => {
                        if (e.target?.name && e.target.name === 'check') return;
                        handleSingleCheck(item);
                      }}
                      _hover={{
                        bg: 'blue.50'
                      }}
                    >
                      <Td>
                        <Checkbox
                          name="check"
                          isChecked={chosenBillDataList.some((i) => i._id === item._id)}
                        />
                      </Td>
                      <Td>{t(billTypeMap[item.type]?.label as any)}</Td>
                      <Td>
                        {item.createTime
                          ? dayjs(item.createTime).format('YYYY/MM/DD HH:mm:ss')
                          : '-'}
                      </Td>
                      <Td>
                        {t('account_bill:yuan', { amount: formatStorePrice2Read(item.price) })}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {!isLoading && billsList && billsList.length === 0 && (
                <Flex
                  mt={'20vh'}
                  flexDirection={'column'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
                  <Box mt={2} color={'myGray.500'}>
                    {t('account_bill:no_invoice_record')}
                  </Box>
                </Flex>
              )}
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button
              variant={'primary'}
              px="0"
              isDisabled={!chosenBillDataList.length}
              onClick={() => {
                let total = chosenBillDataList.reduce((acc, cur) => acc + Number(cur.price), 0);
                if (!total) return;
                setTotalPrice(total);
                onOpenSettleModal();
              }}
            >
              <Flex alignItems={'center'}>
                <Box px={'1.25rem'} py={'0.5rem'}>
                  {t('account_bill:confirm')}
                </Box>
              </Flex>
            </Button>
          </ModalFooter>
        </>
      )}
    </MyModal>
  );
};

export default ApplyInvoiceModal;
