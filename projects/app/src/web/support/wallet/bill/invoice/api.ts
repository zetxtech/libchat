import { GET, POST } from '@/web/common/api/request';
import type { BillTypeEnum } from '@libchat/global/support/wallet/bill/constants';
import type { InvoiceFileInfo } from '@libchat/global/support/wallet/bill/invoice/type';
import type { InvoiceType } from '@libchat/global/support/wallet/bill/type';
import type { InvoiceSchemaType } from '@libchat/global/support/wallet/bill/type';
import type { PaginationProps, PaginationResponse } from '@libchat/web/common/fetch/type';

export type invoiceBillDataType = {
  type: BillTypeEnum;
  price: number;
  createTime: Date;
  _id: string;
};

export const getInvoiceBillsList = () =>
  GET<invoiceBillDataType[]>(`/proApi/support/wallet/bill/invoice/unInvoiceList`);

export const submitInvoice = (data: InvoiceType) =>
  POST(`/proApi/support/wallet/bill/invoice/submit`, data);

export const getInvoiceRecords = (data: PaginationProps) =>
  POST<PaginationResponse<InvoiceSchemaType>>(`/proApi/support/wallet/bill/invoice/records`, data);
