import { Box, Flex, Grid, Button, VStack } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyIcon from '@libchat/web/components/common/Icon';
import { useForm } from 'react-hook-form';
import { useToast } from '@libchat/web/hooks/useToast';
import { postCreatePayBill } from '@/web/support/wallet/bill/api';
import { BillTypeEnum } from '@libchat/global/support/wallet/bill/constants';
import QRCodePayModal, { type QRPayProps } from '@/components/support/wallet/QRCodePayModal';
import MyNumberInput from '@libchat/web/components/common/Input/NumberInput';
import { useRequest2 } from '@libchat/web/hooks/useRequest';

const ExtraPlan = ({ onPaySuccess }: { onPaySuccess?: () => void }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { subPlans } = useSystemStore();
  const [qrPayData, setQRPayData] = useState<QRPayProps>();

  // extra dataset
  const extraDatasetPrice = subPlans?.extraDatasetSize?.price || 0;
  const { register: registerDatasetSize, handleSubmit: handleSubmitDatasetSize } = useForm({
    defaultValues: {
      datasetSize: 0,
      month: 1
    }
  });
  const { runAsync: onclickBuyDatasetSize, loading: isLoadingBuyDatasetSize } = useRequest2(
    async ({ datasetSize, month }: { datasetSize: number; month: number }) => {
      datasetSize = Math.ceil(datasetSize);
      month = Math.ceil(month);

      const datasetSizePayAmount = datasetSize * month * extraDatasetPrice;
      if (datasetSizePayAmount === 0) {
        return toast({
          status: 'warning',
          title: t('common:support.wallet.amount_0')
        });
      }

      const res = await postCreatePayBill({
        type: BillTypeEnum.extraDatasetSub,
        month,
        extraDatasetSize: datasetSize
      });
      setQRPayData({
        tip: t('common:button.extra_dataset_size_tip'),
        ...res
      });
    },
    {
      manual: true,
      refreshDeps: [extraDatasetPrice]
    }
  );

  // extra ai points
  const extraPointsPrice = subPlans?.extraPoints?.price || 0;
  const { register: registerExtraPoints, handleSubmit: handleSubmitExtraPoints } = useForm({
    defaultValues: {
      points: 0,
      month: 1
    }
  });
  const { runAsync: onclickBuyExtraPoints, loading: isLoadingBuyExtraPoints } = useRequest2(
    async ({ points }: { points: number }) => {
      points = Math.ceil(points);

      const month = 1;
      const payAmount = points * month * extraPointsPrice;

      if (payAmount === 0) {
        return toast({
          status: 'warning',
          title: t('common:support.wallet.amount_0')
        });
      }

      const res = await postCreatePayBill({
        type: BillTypeEnum.extraPoints,
        extraPoints: points
      });

      setQRPayData({
        tip: t('common:button.extra_points_tip'),
        ...res
      });
    },
    {
      manual: true,
      refreshDeps: [extraPointsPrice]
    }
  );

  return (
    <VStack>
      <Grid gridTemplateColumns={['1fr', '1fr 1fr']} gap={5} w={['100%', 'auto']}>
        <Box
          bg={'rgba(255, 255, 255, 0.90)'}
          px={'32px'}
          py={'24px'}
          borderRadius={'2xl'}
          borderWidth={'1px'}
          borderColor={'myGray.150'}
          boxShadow={'1.5'}
          w={['100%', '500px']}
        >
          <Flex borderBottomWidth={'1px'} borderBottomColor={'myGray.200'}>
            <Box flex={'1 0 0'}>
              <Box fontSize={'lg'} color={'primary.700'}>
                {t('common:support.wallet.subscription.Extra dataset size')}
              </Box>
              <Box mt={3} fontSize={['28px', '32px']} fontWeight={'bold'} color={'black'}>
                {`￥${extraDatasetPrice}/1000` + t('common:core.dataset.data.group')}
                <Box ml={1} as={'span'} fontSize={'md'} color={'myGray.500'} fontWeight={'normal'}>
                  /{t('common:month')}
                </Box>
              </Box>
            </Box>
            <MyIcon
              display={['none', 'block']}
              mt={'-30px'}
              transform={'translateX(20px)'}
              name={'support/bill/extraDatasetsize'}
              fill={'none'}
            />
          </Flex>
          <Box h={'120px'} w={'100%'}>
            <Flex mt={4} color={'myGray.900'}>
              <MyIcon mr={2} name={'support/bill/shoppingCart'} w={'16px'} color={'primary.600'} />
              {t('common:support.wallet.buy_resource')}
            </Flex>
            <Flex mt={4} alignItems={'center'}>
              <Box flex={['0 0 100px', '1 0 0']} color={'myGray.600'}>
                {t('common:support.wallet.subscription.Month amount')}
              </Box>
              <Flex alignItems={'center'} mt={1} w={'180px'} position={'relative'}>
                <MyNumberInput
                  name="month"
                  register={registerDatasetSize}
                  min={1}
                  max={12}
                  size={'sm'}
                />
                <Box position={'absolute'} right={'30px'} color={'myGray.600'} fontSize={'xs'}>
                  {t('common:month')}
                </Box>
              </Flex>
            </Flex>
            <Flex mt={4} alignItems={'center'}>
              <Box flex={['0 0 100px', '1 0 0']} color={'myGray.600'}>
                {t('common:support.wallet.subscription.Update extra dataset size')}
              </Box>
              <Flex alignItems={'center'} mt={1} w={'180px'} position={'relative'}>
                <MyNumberInput
                  name="datasetSize"
                  register={registerDatasetSize}
                  min={0}
                  max={10000}
                  size={'sm'}
                />
                <Box position={'absolute'} right={'30px'} color={'myGray.600'} fontSize={'xs'}>
                  000{t('common:core.dataset.data.unit')}
                </Box>
              </Flex>
            </Flex>
          </Box>
          <Button
            mt={6}
            w={'100%'}
            variant={'primaryGhost'}
            isLoading={isLoadingBuyDatasetSize}
            onClick={handleSubmitDatasetSize(onclickBuyDatasetSize)}
            color={'primary.700'}
          >
            {t('common:support.wallet.Buy')}
          </Button>
        </Box>
        {/* points */}
        <Box
          bg={'rgba(255, 255, 255, 0.90)'}
          w={['100%', '500px']}
          px={'32px'}
          py={'24px'}
          borderRadius={'2xl'}
          borderWidth={'1px'}
          borderColor={'myGray.150'}
          boxShadow={'1.5'}
        >
          <Flex borderBottomWidth={'1px'} borderBottomColor={'myGray.200'}>
            <Box flex={'1 0 0'}>
              <Box fontSize={'lg'} color={'primary.700'}>
                {t('common:support.wallet.subscription.Extra ai points')}
              </Box>
              <Box mt={3} fontSize={['28px', '32px']} fontWeight={'bold'} color={'black'}>
                {`￥${extraPointsPrice}/1000` + t('common:support.wallet.subscription.point')}
                <Box ml={1} as={'span'} fontSize={'md'} color={'myGray.500'} fontWeight={'normal'}>
                  /{t('common:month')}
                </Box>
              </Box>
            </Box>
            <MyIcon
              display={['none', 'block']}
              mt={'-30px'}
              transform={'translateX(20px)'}
              name={'support/bill/extraPoints'}
              fill={'none'}
            />
          </Flex>
          <Box h={'120px'} w={'100%'}>
            <Flex mt={4} color={'myGray.900'}>
              <MyIcon mr={2} name={'support/bill/shoppingCart'} w={'16px'} color={'primary.600'} />
              {t('common:support.wallet.buy_resource')}
            </Flex>
            <Flex mt={4} alignItems={'center'}>
              <Box flex={['0 0 100px', '1 0 0']} color={'myGray.600'}>
                {t('common:support.wallet.subscription.Month amount')}
              </Box>
              <Flex alignItems={'center'} mt={1} w={'180px'} position={'relative'}>
                <Box>1</Box>
                <Box color={'myGray.600'}>{t('common:month')}</Box>
              </Flex>
            </Flex>
            <Flex mt={4} alignItems={'center'}>
              <Box flex={['0 0 100px', '1 0 0']} color={'myGray.600'}>
                {t('common:support.wallet.subscription.Update extra ai points')}
              </Box>
              <Flex
                alignItems={'center'}
                mt={1}
                w={'180px'}
                position={'relative'}
                color={'myGray.500'}
              >
                <MyNumberInput
                  name="points"
                  register={registerExtraPoints}
                  min={0}
                  max={10000}
                  size={'sm'}
                />
                <Box position={'absolute'} right={'30px'} color={'myGray.500'} fontSize={'xs'}>
                  {'000' + t('common:support.wallet.subscription.point')}
                </Box>
              </Flex>
            </Flex>
          </Box>
          <Button
            mt={6}
            w={'100%'}
            variant={'primaryGhost'}
            isLoading={isLoadingBuyExtraPoints}
            onClick={handleSubmitExtraPoints(onclickBuyExtraPoints)}
            color={'primary.700'}
          >
            {t('common:support.wallet.Buy')}
          </Button>
        </Box>
      </Grid>

      {!!qrPayData && <QRCodePayModal onSuccess={onPaySuccess} {...qrPayData} />}
    </VStack>
  );
};

export default React.memo(ExtraPlan);
