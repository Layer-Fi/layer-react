declare module '@layerfi/components/api/layer/authenticated_http' {
  import type { ParameterValues } from '@layerfi/components/utils/request/toDefinedSearchParameters';
  export type HTTPVerb = 'get' | 'put' | 'post' | 'patch' | 'options' | 'delete';
  export const get: <Return extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, ParameterValues | null | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params;
  }) => () => Promise<Return>;
  export const request: (verb: Exclude<HTTPVerb, "get">) => <Return extends Record<string, unknown> = Record<string, unknown>, Body extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params;
      body?: Body;
  }) => Promise<Return>;
  export const patch: <Return extends Record<string, unknown> = Record<string, unknown>, Body extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params;
      body?: Body;
  }) => Promise<Return>;
  export const post: <Return extends Record<string, unknown> = Record<string, unknown>, Body extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params;
      body?: Body;
  }) => Promise<Return>;
  export const put: <Return extends Record<string, unknown> = Record<string, unknown>, Body extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params;
      body?: Body;
  }) => Promise<Return>;
  export const del: <Return extends Record<string, unknown> = Record<string, unknown>, Body extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params;
      body?: Body;
  }) => Promise<Return>;
  export const postWithFormData: <Return extends Record<string, unknown> = Record<string, unknown>>(url: string, formData: FormData, baseUrl: string, accessToken: string | undefined) => Promise<Return>;

}
declare module '@layerfi/components/api/layer/balance_sheet' {
  import { BalanceSheet } from '@layerfi/components/types';
  import type { S3PresignedUrl } from '@layerfi/components/types/general';
  type GetBalanceSheetParams = {
      businessId: string;
      effectiveDate: Date;
  };
  export const getBalanceSheet: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetBalanceSheetParams | undefined;
  } | undefined) => () => Promise<{
      data: BalanceSheet;
  }>;
  export const getBalanceSheetCSV: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetBalanceSheetParams | undefined;
  } | undefined) => () => Promise<{
      data: S3PresignedUrl;
  }>;
  export const getBalanceSheetExcel: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetBalanceSheetParams | undefined;
  } | undefined) => () => Promise<{
      data: S3PresignedUrl;
  }>;
  export {};

}
declare module '@layerfi/components/api/layer/bankTransactions' {
  import { CategoryUpdate, BankTransaction } from '@layerfi/components/types';
  import { BankTransactionMatch, BankTransactionMatchType, BankTransactionMetadata, DocumentS3Urls } from '@layerfi/components/types/bank_transactions';
  import { FileMetadata } from '@layerfi/components/types/file_upload';
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  export type GetBankTransactionsReturn = {
      data: ReadonlyArray<BankTransaction>;
      meta: {
          pagination: {
              cursor?: string;
              has_more: boolean;
          };
      };
  };
  type GetBankTransactionsBaseParams = {
      businessId: string;
      categorized?: boolean;
      direction?: 'INFLOW' | 'OUTFLOW';
      query?: string;
      startDate?: Date;
      endDate?: Date;
      tagFilterQueryString?: string;
      sortOrder?: 'ASC' | 'DESC';
      sortBy?: string;
  };
  type GetBankTransactionsPaginatedParams = GetBankTransactionsBaseParams & {
      cursor?: string;
      limit?: number;
  };
  export const getBankTransactions: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetBankTransactionsPaginatedParams | undefined;
  } | undefined) => () => Promise<GetBankTransactionsReturn>;
  export const categorizeBankTransaction: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          bankTransactionId: string;
      } | undefined;
      body?: CategoryUpdate | undefined;
  } | undefined) => Promise<{
      data: BankTransaction;
  }>;
  export type MatchBankTransactionBody = {
      match_id: string;
      type: BankTransactionMatchType;
  };
  export const matchBankTransaction: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          bankTransactionId: string;
      } | undefined;
      body?: MatchBankTransactionBody | undefined;
  } | undefined) => Promise<{
      data: BankTransactionMatch;
  }>;
  export const getBankTransactionsExcel: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetBankTransactionsBaseParams | undefined;
  } | undefined) => () => Promise<{
      data: S3PresignedUrl;
  }>;
  export const getBankTransactionMetadata: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: BankTransactionMetadata;
      errors: unknown;
  }>;
  export const updateBankTransactionMetadata: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: {
          memo: string;
      } | undefined;
  } | undefined) => Promise<{
      data: BankTransactionMetadata;
      errors: unknown;
  }>;
  export const listBankTransactionDocuments: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: DocumentS3Urls;
      errors: unknown;
  }>;
  export const getBankTransactionDocument: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: S3PresignedUrl;
      errors: unknown;
  }>;
  export const archiveBankTransactionDocument: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: Record<never, never>;
      errors: unknown;
  }>;
  export const uploadBankTransactionDocument: (baseUrl: string, accessToken?: string) => ({ businessId, bankTransactionId, file, documentType, }: {
      businessId: string;
      bankTransactionId: string;
      file: File;
      documentType: string;
  }) => Promise<{
      data: FileMetadata;
      errors: unknown;
  }>;
  export {};

}
declare module '@layerfi/components/api/layer/bills' {
  import { Metadata } from '@layerfi/components/types';
  import { Bill, BillLineItem, BillPayment, SalesTax } from '@layerfi/components/types/bills';
  export type GetBillsReturn = {
      data?: Bill[];
      meta?: Metadata;
      error?: unknown;
  };
  export interface GetBillsParams extends Record<string, string | undefined> {
      businessId: string;
      cursor?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      vendorId?: string;
  }
  export type SaveBillPayload = {
      bill_number?: string;
      terms?: string;
      due_at?: string;
      received_at?: string;
      vendor_id?: string;
      vendor_external_id?: string;
      sales_taxes?: SalesTax[];
      line_items?: Partial<BillLineItem>[];
  };
  export const getBills: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetBillsParams | undefined;
  } | undefined) => () => Promise<GetBillsReturn>;
  export const getBill: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          billId: string;
      } | undefined;
  } | undefined) => () => Promise<{
      data: Bill;
  }>;
  export const updateBill: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: SaveBillPayload | undefined;
  } | undefined) => Promise<{
      data: Bill;
  }>;
  export const createBill: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: SaveBillPayload | undefined;
  } | undefined) => Promise<{
      data: Bill;
  }>;
  export const createBillPayment: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: BillPayment | undefined;
  } | undefined) => Promise<{
      data: BillPayment;
  }>;

}
declare module '@layerfi/components/api/layer/business' {
  import { Business } from '@layerfi/components/types';
  export type UpdateBusinessBody = Partial<Business>;
  export const getBusiness: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: Business;
  }>;
  export const updateBusiness: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: Partial<Business> | undefined;
  } | undefined) => Promise<{
      data: Business;
  }>;

}
declare module '@layerfi/components/api/layer/businessPersonnel/updateBusinessPersonnel' {
  import type { BusinessPersonnel, PersonnelRole, RawBusinessPersonnel } from '@layerfi/components/hooks/businessPersonnel/types';
  export type UpdateBusinessPersonnelBody = {
      id: string;
  } & Partial<Pick<RawBusinessPersonnel, 'full_name' | 'preferred_name' | 'external_id'> & {
      email_addresses: ReadonlyArray<{
          email_address: string;
      }>;
      phone_numbers: ReadonlyArray<{
          phone_number: string;
      }>;
      roles: ReadonlyArray<{
          role: PersonnelRole;
      }>;
  }>;
  export const updateBusinessPersonnel: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          businessPersonnelId: string;
      } | undefined;
      body?: UpdateBusinessPersonnelBody | undefined;
  } | undefined) => Promise<{
      data: BusinessPersonnel;
  }>;

}
declare module '@layerfi/components/api/layer/chart_of_accounts' {
  import { SingleChartAccountEncodedType } from '@layerfi/components/schemas/generalLedger/ledgerAccount';
  import { NewAccount, EditAccount, NewChildAccount, LedgerAccountsEntry } from '@layerfi/components/types';
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  import { LedgerAccountLineItems } from '@layerfi/components/types/ledger_accounts';
  export const createAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: NewAccount | undefined;
  } | undefined) => Promise<{
      data: SingleChartAccountEncodedType;
  }>;
  export const updateAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: EditAccount | undefined;
  } | undefined) => Promise<{
      data: SingleChartAccountEncodedType;
  }>;
  export const createChildAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: NewChildAccount | undefined;
  } | undefined) => Promise<{
      data: SingleChartAccountEncodedType;
  }>;
  export const getLedgerAccountsLines: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: LedgerAccountLineItems;
  }>;
  export const getLedgerAccountsEntry: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: LedgerAccountsEntry;
  }>;
  export const getLedgerAccountBalancesCSV: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: S3PresignedUrl;
  }>;

}
declare module '@layerfi/components/api/layer/journal' {
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  import { JournalEntry } from '@layerfi/components/types/journal';
  export const createJournalEntries: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: JournalEntry[];
  }>;
  export const reverseJournalEntry: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<never, never>>;
  export const getJournalEntriesCSV: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: S3PresignedUrl;
  }>;

}
declare module '@layerfi/components/api/layer/linked_accounts' {
  import { LinkedAccounts, PublicToken } from '@layerfi/components/types/linked_accounts';
  export const syncConnection: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  export const updateConnectionStatus: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  type UpdateOpeningBalanceBody = {
      effective_at: string;
      balance: number;
  };
  export const updateOpeningBalance: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          accountId: string;
      } | undefined;
      body?: UpdateOpeningBalanceBody | undefined;
  } | undefined) => Promise<never>;
  export const listExternalAccounts: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
  } | undefined) => () => Promise<{
      data: LinkedAccounts;
  }>;
  export const confirmAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          accountId: string;
      } | undefined;
      body?: ({
          is_unique: true;
      } & {
          is_relevant?: undefined;
      }) | ({
          is_relevant: true;
      } & {
          is_unique?: undefined;
      }) | undefined;
  } | undefined) => Promise<never>;
  export const excludeAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          accountId: string;
      } | undefined;
      body?: ({
          is_irrelevant: true;
      } & {
          is_duplicate?: undefined;
      }) | ({
          is_duplicate: true;
      } & {
          is_irrelevant?: undefined;
      }) | undefined;
  } | undefined) => Promise<never>;
  export const unlinkConnection: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          connectionId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  export const unlinkAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          accountId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  /**********************
   * Plaid Specific API *
   **********************/
  export const getPlaidLinkToken: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: {
          type: "Link_Token";
          link_token: string;
      };
  }>;
  export const getPlaidUpdateModeLinkToken: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: {
          type: "Link_Token";
          link_token: string;
      };
  }>;
  export const exchangePlaidPublicToken: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: PublicToken | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  export const unlinkPlaidItem: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          plaidItemPlaidId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  export const breakPlaidItemConnection: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          plaidItemPlaidId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  export {};

}
declare module '@layerfi/components/api/layer/profit_and_loss' {
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  import type { ProfitAndLossComparison, ProfitAndLossComparisonRequestBody } from '@layerfi/components/types/profit_and_loss';
  type BaseProfitAndLossParams = {
      businessId: string;
      startDate?: Date;
      endDate?: Date;
      month?: string;
      year?: string;
      tagKey?: string;
      tagValues?: string;
      reportingBasis?: string;
  };
  type GetProfitAndLossCsvParams = BaseProfitAndLossParams & {
      moneyFormat?: string;
  };
  export const compareProfitAndLoss: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: ProfitAndLossComparisonRequestBody | undefined;
  } | undefined) => Promise<{
      data?: ProfitAndLossComparison;
      error?: unknown;
  }>;
  export const getProfitAndLossCsv: (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossCsvParams) => () => Promise<{
      data?: S3PresignedUrl;
      error?: unknown;
  }>;
  export const getProfitAndLossExcel: (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossCsvParams) => () => Promise<{
      data?: S3PresignedUrl;
      error?: unknown;
  }>;
  export const profitAndLossComparisonCsv: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data?: S3PresignedUrl;
      error?: unknown;
  }>;
  export {};

}
declare module '@layerfi/components/api/layer/quickbooks' {
  import type { StatusOfQuickbooksConnection } from '@layerfi/components/types/quickbooks';
  export const syncFromQuickbooks: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  export const initQuickbooksOAuth: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: {
          type: "Quickbooks_Authorization_Params";
          redirect_url: string;
      };
  }>;
  export const unlinkQuickbooksConnection: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  /**
   * Lets user know if there exists an active Quickbooks connection or not
   */
  export const statusOfQuickbooksConnection: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
  } | undefined) => () => Promise<{
      data: StatusOfQuickbooksConnection;
  }>;

}
declare module '@layerfi/components/api/layer/statement-of-cash-flow' {
  import { StatementOfCashFlow } from '@layerfi/components/types';
  import type { S3PresignedUrl } from '@layerfi/components/types/general';
  type GetStatementOfCashFlowParams = {
      businessId: string;
      startDate: Date;
      endDate: Date;
  };
  export const getStatementOfCashFlow: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetStatementOfCashFlowParams | undefined;
  } | undefined) => () => Promise<{
      data: StatementOfCashFlow;
  }>;
  export const getCashflowStatementCSV: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetStatementOfCashFlowParams | undefined;
  } | undefined) => () => Promise<{
      data: S3PresignedUrl;
  }>;
  export {};

}
declare module '@layerfi/components/api/layer/tasks' {
  import { FileMetadata } from '@layerfi/components/types/file_upload';
  import { RawTask } from '@layerfi/components/types/tasks';
  type SubmitUserResponseForTaskBody = {
      type: 'FreeResponse';
      user_response: string;
  };
  export const submitUserResponseForTask: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          taskId: string;
      } | undefined;
      body?: SubmitUserResponseForTaskBody | undefined;
  } | undefined) => Promise<{
      data: RawTask;
  }>;
  type UpdateTaskUploadsDescriptionBody = {
      type: 'FreeResponse';
      user_response: string;
  };
  export const updateTaskUploadsDescription: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          taskId: string;
      } | undefined;
      body?: UpdateTaskUploadsDescriptionBody | undefined;
  } | undefined) => Promise<{
      data: RawTask;
  }>;
  export const deleteUploadsOnTask: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          taskId: string;
      } | undefined;
      body?: Record<string, never> | undefined;
  } | undefined) => Promise<{
      data: RawTask;
  }>;
  export function completeTaskWithUpload(baseUrl: string, accessToken: string, { businessId, taskId, files, description, }: {
      businessId: string;
      taskId: string;
      files: ReadonlyArray<File>;
      description?: string;
  }): Promise<{
      data: FileMetadata;
  }>;
  export {};

}
declare module '@layerfi/components/api/layer/vendors' {
  import { Vendor } from '@layerfi/components/types/vendors';
  export const getVendors: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: Vendor[];
  }>;

}
declare module '@layerfi/components/api/layer' {
  export const Layer: {
      getBusiness: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types").Business;
      }>;
      createAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types").NewAccount | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/schemas/generalLedger/ledgerAccount").SingleChartAccountEncodedType;
      }>;
      updateAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types").EditAccount | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/schemas/generalLedger/ledgerAccount").SingleChartAccountEncodedType;
      }>;
      createChildAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types").NewChildAccount | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/schemas/generalLedger/ledgerAccount").SingleChartAccountEncodedType;
      }>;
      getBalanceSheet: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              effectiveDate: Date;
          } | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types").BalanceSheet;
      }>;
      getBalanceSheetCSV: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              effectiveDate: Date;
          } | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/general").S3PresignedUrl;
      }>;
      getBalanceSheetExcel: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              effectiveDate: Date;
          } | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/general").S3PresignedUrl;
      }>;
      getBankTransactionMetadata: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/bank_transactions").BankTransactionMetadata;
          errors: unknown;
      }>;
      listBankTransactionDocuments: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/bank_transactions").DocumentS3Urls;
          errors: unknown;
      }>;
      getBankTransactionDocument: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/general").S3PresignedUrl;
          errors: unknown;
      }>;
      archiveBankTransactionDocument: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: Record<never, never>;
          errors: unknown;
      }>;
      updateBankTransactionMetadata: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: {
              memo: string;
          } | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/bank_transactions").BankTransactionMetadata;
          errors: unknown;
      }>;
      uploadBankTransactionDocument: (baseUrl: string, accessToken?: string) => ({ businessId, bankTransactionId, file, documentType, }: {
          businessId: string;
          bankTransactionId: string;
          file: File;
          documentType: string;
      }) => Promise<{
          data: import("@layerfi/components/types/file_upload").FileMetadata;
          errors: unknown;
      }>;
      getBills: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: import("@layerfi/components/api/layer/bills").GetBillsParams | undefined;
      } | undefined) => () => Promise<import("@layerfi/components/api/layer/bills").GetBillsReturn>;
      getBill: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              billId: string;
          } | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types").Bill;
      }>;
      createBill: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/api/layer/bills").SaveBillPayload | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types").Bill;
      }>;
      updateBill: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/api/layer/bills").SaveBillPayload | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types").Bill;
      }>;
      createBillPayment: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types/bills").BillPayment | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/bills").BillPayment;
      }>;
      getLedgerAccountBalancesCSV: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/general").S3PresignedUrl;
      }>;
      getLedgerAccountsLines: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types").LedgerAccounts;
      }>;
      getLedgerAccountsEntry: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types").LedgerAccountsEntry;
      }>;
      getProfitAndLossCsv: (apiUrl: string, accessToken: string | undefined, params: {
          businessId: string;
          startDate?: Date;
          endDate?: Date;
          month?: string;
          year?: string;
          tagKey?: string;
          tagValues?: string;
          reportingBasis?: string;
      } & {
          moneyFormat?: string;
      }) => () => Promise<{
          data?: import("@layerfi/components/types/general").S3PresignedUrl;
          error?: unknown;
      }>;
      getProfitAndLossExcel: (apiUrl: string, accessToken: string | undefined, params: {
          businessId: string;
          startDate?: Date;
          endDate?: Date;
          month?: string;
          year?: string;
          tagKey?: string;
          tagValues?: string;
          reportingBasis?: string;
      } & {
          moneyFormat?: string;
      }) => () => Promise<{
          data?: import("@layerfi/components/types/general").S3PresignedUrl;
          error?: unknown;
      }>;
      getJournalEntriesCSV: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/general").S3PresignedUrl;
      }>;
      reverseJournalEntry: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<never, never>>;
      compareProfitAndLoss: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types/profit_and_loss").ProfitAndLossComparisonRequestBody | undefined;
      } | undefined) => Promise<{
          data?: import("@layerfi/components/types/profit_and_loss").ProfitAndLossComparison;
          error?: unknown;
      }>;
      profitAndLossComparisonCsv: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data?: import("@layerfi/components/types/general").S3PresignedUrl;
          error?: unknown;
      }>;
      createJournalEntries: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types").JournalEntry[];
      }>;
      getPlaidLinkToken: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: {
              type: "Link_Token";
              link_token: string;
          };
      }>;
      getPlaidUpdateModeLinkToken: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: {
              type: "Link_Token";
              link_token: string;
          };
      }>;
      exchangePlaidPublicToken: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
          body?: import("@layerfi/components/types/linked_accounts").PublicToken | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      unlinkAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              accountId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      unlinkPlaidItem: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              plaidItemPlaidId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      confirmAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              accountId: string;
          } | undefined;
          body?: ({
              is_unique: true;
          } & {
              is_relevant?: undefined;
          }) | ({
              is_relevant: true;
          } & {
              is_unique?: undefined;
          }) | undefined;
      } | undefined) => Promise<never>;
      excludeAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              accountId: string;
          } | undefined;
          body?: ({
              is_irrelevant: true;
          } & {
              is_duplicate?: undefined;
          }) | ({
              is_duplicate: true;
          } & {
              is_irrelevant?: undefined;
          }) | undefined;
      } | undefined) => Promise<never>;
      breakPlaidItemConnection: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              plaidItemPlaidId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      syncConnection: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      updateConnectionStatus: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      updateOpeningBalance: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              accountId: string;
          } | undefined;
          body?: {
              effective_at: string;
              balance: number;
          } | undefined;
      } | undefined) => Promise<never>;
      getStatementOfCashFlow: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              startDate: Date;
              endDate: Date;
          } | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types").StatementOfCashFlow;
      }>;
      syncFromQuickbooks: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      statusOfQuickbooksConnection: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/quickbooks").StatusOfQuickbooksConnection;
      }>;
      initQuickbooksOAuth: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: {
              type: "Quickbooks_Authorization_Params";
              redirect_url: string;
          };
      }>;
      unlinkQuickbooksConnection: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      getVendors: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/vendors").Vendor[];
      }>;
  };

}
declare module '@layerfi/components/assets/images/index' {
  export { default as imagePartnerAccountingImage } from '@layerfi/components/assets/images/partner-accounting.png/index';
  export { default as imageBusinessAccounts } from '@layerfi/components/assets/images/business-accounts.svg/index';
  export { default as imageBusinessOverview } from '@layerfi/components/assets/images/business-overview.svg/index';
  export { default as imageCategorizeExpenses } from '@layerfi/components/assets/images/categorize-expenses.svg/index';
  export { default as imageBookkeeperInquiries } from '@layerfi/components/assets/images/bookkeeper-inquiries.svg/index';
  export { default as imageScheduleBookkeeperMeeting } from '@layerfi/components/assets/images/schedule-bookkeeper-meeting.svg/index';
  export { default as imagePnlOverview } from '@layerfi/components/assets/images/pnl-overview.svg/index';

}
declare module '@layerfi/components/components/ActionableList/ActionableList' {
  export interface ActionableListOption<T> {
      label: string;
      id: string;
      description?: string;
      value: T;
      asLink?: boolean;
      secondary?: boolean;
  }
  interface ActionableListProps<T> {
      options: ActionableListOption<T>[];
      onClick: (item: ActionableListOption<T>) => void;
      selectedId?: string;
      showDescriptions?: boolean;
      className?: string;
  }
  export const ActionableList: <T>({ options, onClick, selectedId, showDescriptions, className, }: ActionableListProps<T>) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ActionableList/index' {
  export { ActionableList, ActionableListOption } from '@layerfi/components/components/ActionableList/ActionableList';

}
declare module '@layerfi/components/components/ActionableRow/ActionableRow' {
  import { ReactNode } from 'react';
  interface ActionableRowProps {
      icon?: ReactNode;
      iconBox?: ReactNode;
      title?: string | ReactNode;
      description?: string | ReactNode;
      button?: ReactNode;
      onClick?: () => void;
  }
  export const ActionableRow: ({ icon, iconBox, title, description, button, onClick, }: ActionableRowProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ActionableRow/index' {
  export { ActionableRow } from '@layerfi/components/components/ActionableRow/ActionableRow';

}
declare module '@layerfi/components/components/Badge/Badge' {
  import { ReactNode } from 'react';
  import { ButtonProps } from '@layerfi/components/components/Button/Button';
  export enum BadgeSize {
      EXTRA_SMALL = "xs",
      SMALL = "small",
      MEDIUM = "medium"
  }
  export enum BadgeVariant {
      DEFAULT = "default",
      INFO = "info",
      SUCCESS = "success",
      WARNING = "warning",
      ERROR = "error"
  }
  export interface BadgeProps {
      children?: ReactNode;
      icon?: ReactNode;
      onClick?: ButtonProps['onClick'];
      tooltip?: ReactNode;
      size?: BadgeSize;
      variant?: BadgeVariant;
      hoverable?: boolean;
      iconOnly?: boolean;
  }
  export const Badge: ({ icon, onClick, children, tooltip, size, variant, hoverable, iconOnly, }: BadgeProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Badge/index' {
  export { Badge } from '@layerfi/components/components/Badge/Badge';
  export { BadgeVariant } from '@layerfi/components/components/Badge/Badge';

}
declare module '@layerfi/components/components/BadgeLoader/BadgeLoader' {
  import { ReactNode } from 'react';
  export interface BadgeLoaderProps {
      children?: ReactNode;
      size?: number;
      variant?: 'default' | 'info' | 'success' | 'error' | 'warning';
      showLoading?: boolean;
  }
  export const BadgeLoader: ({ children, showLoading, variant }: BadgeLoaderProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BadgeLoader/index' {
  export { BadgeLoader } from '@layerfi/components/components/BadgeLoader/BadgeLoader';

}
declare module '@layerfi/components/components/BalanceSheet/BalanceSheet' {
  import { PropsWithChildren } from 'react';
  import { BalanceSheetTableStringOverrides } from '@layerfi/components/components/BalanceSheetTable/BalanceSheetTable';
  export interface BalanceSheetStringOverrides {
      balanceSheetTable?: BalanceSheetTableStringOverrides;
  }
  export type BalanceSheetViewProps = PropsWithChildren<{
      withExpandAllButton?: boolean;
      asWidget?: boolean;
      stringOverrides?: BalanceSheetStringOverrides;
  }>;
  export type BalanceSheetProps = PropsWithChildren<{
      effectiveDate?: Date;
      asWidget?: boolean;
      stringOverrides?: BalanceSheetStringOverrides;
  }>;
  export const StandaloneBalanceSheet: (props: BalanceSheetProps) => import("react/jsx-runtime").JSX.Element;
  export const BalanceSheet: (props: BalanceSheetProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BalanceSheet/constants' {
  export const BALANCE_SHEET_ROWS: {
      name: string;
      displayName: string;
      lineItem: string;
  }[];

}
declare module '@layerfi/components/components/BalanceSheet/download/BalanceSheetDownloadButton' {
  type BalanceSheetDownloadButtonProps = {
      effectiveDate: Date;
      iconOnly?: boolean;
  };
  export function BalanceSheetDownloadButton({ effectiveDate, iconOnly, }: BalanceSheetDownloadButtonProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BalanceSheet/download/useBalanceSheetDownload' {
  import type { S3PresignedUrl } from '@layerfi/components/types/general';
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  type UseBalanceSheetOptions = {
      effectiveDate: Date;
      onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>;
  };
  export function useBalanceSheetDownload({ effectiveDate, onSuccess, }: UseBalanceSheetOptions): import("swr/mutation").SWRMutationResponse<unknown, any, () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      effectiveDate: Date;
      tags: string[];
  } | undefined, never>;
  export {};

}
declare module '@layerfi/components/components/BalanceSheet/index' {
  export { BalanceSheet, StandaloneBalanceSheet } from '@layerfi/components/components/BalanceSheet/BalanceSheet';

}
declare module '@layerfi/components/components/BalanceSheetDatePicker/BalanceSheetDatePicker' {
  export function BalanceSheetDatePicker(): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BalanceSheetExpandAllButton/BalanceSheetExpandAllButton' {
  import { View } from '@layerfi/components/types/general';
  export interface BalanceSheetExpandAllButtonProps {
      view?: View;
  }
  export const BalanceSheetExpandAllButton: ({ view, }: BalanceSheetExpandAllButtonProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BalanceSheetExpandAllButton/index' {
  export { BalanceSheetExpandAllButton } from '@layerfi/components/components/BalanceSheetExpandAllButton/BalanceSheetExpandAllButton';

}
declare module '@layerfi/components/components/BalanceSheetTable/BalanceSheetTable' {
  import { BalanceSheet } from '@layerfi/components/types';
  export interface BalanceSheetTableStringOverrides {
      typeColumnHeader?: string;
      totalColumnHeader?: string;
  }
  type BalanceSheetRowProps = {
      name: string;
      displayName: string;
      lineItem: string;
  };
  export const BalanceSheetTable: ({ data, config, stringOverrides, }: {
      data: BalanceSheet;
      config: BalanceSheetRowProps[];
      stringOverrides?: BalanceSheetTableStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BalanceSheetTable/index' {
  export { BalanceSheetTable } from '@layerfi/components/components/BalanceSheetTable/BalanceSheetTable';

}
declare module '@layerfi/components/components/BankTransactionList/Assignment' {
  import { BankTransaction } from '@layerfi/components/types';
  export interface AssignmentProps {
      bankTransaction: BankTransaction;
  }
  export const Assignment: ({ bankTransaction }: AssignmentProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionList/BankTransactionList' {
  import { BankTransaction } from '@layerfi/components/types';
  import { BankTransactionCTAStringOverrides } from '@layerfi/components/components/BankTransactions/BankTransactions';
  interface BankTransactionListProps {
      bankTransactions?: BankTransaction[];
      editable: boolean;
      containerWidth: number;
      removeTransaction: (bt: BankTransaction) => void;
      stringOverrides?: BankTransactionCTAStringOverrides;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showTooltips: boolean;
  }
  export const BankTransactionList: ({ bankTransactions, editable, removeTransaction, containerWidth, stringOverrides, showDescriptions, showReceiptUploads, showTooltips, }: BankTransactionListProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionList/BankTransactionListItem' {
  import { BankTransaction } from '@layerfi/components/types';
  import { BankTransactionCTAStringOverrides } from '@layerfi/components/components/BankTransactions/BankTransactions';
  type Props = {
      index: number;
      dateFormat: string;
      bankTransaction: BankTransaction;
      editable: boolean;
      removeTransaction: (bt: BankTransaction) => void;
      containerWidth?: number;
      stringOverrides?: BankTransactionCTAStringOverrides;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showTooltips: boolean;
  };
  export const BankTransactionListItem: ({ index, dateFormat, bankTransaction, editable, containerWidth, removeTransaction, stringOverrides, showDescriptions, showReceiptUploads, showTooltips, }: Props) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionList/BankTransactionProcessingInfo' {
  export const BankTransactionProcessingInfo: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionList/index' {
  export { BankTransactionList } from '@layerfi/components/components/BankTransactionList/BankTransactionList';

}
declare module '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileForms' {
  import { BankTransaction } from '@layerfi/components/types';
  import { Purpose } from '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileListItem';
  interface BankTransactionMobileFormsProps {
      isOpen?: boolean;
      purpose: Purpose;
      bankTransaction: BankTransaction;
      showCategorization?: boolean;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showTooltips: boolean;
  }
  export const BankTransactionMobileForms: ({ purpose, bankTransaction, showTooltips, showCategorization, showReceiptUploads, showDescriptions, isOpen, }: BankTransactionMobileFormsProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileList' {
  import { BankTransaction } from '@layerfi/components/types';
  export interface BankTransactionMobileListProps {
      bankTransactions?: BankTransaction[];
      editable: boolean;
      removeTransaction: (bt: BankTransaction) => void;
      initialLoad?: boolean;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showTooltips: boolean;
  }
  export const BankTransactionMobileList: ({ bankTransactions, removeTransaction, editable, initialLoad, showDescriptions, showReceiptUploads, showTooltips, }: BankTransactionMobileListProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileListItem' {
  import { BankTransaction } from '@layerfi/components/types';
  export interface BankTransactionMobileListItemProps {
      index: number;
      bankTransaction: BankTransaction;
      editable: boolean;
      removeTransaction: (bt: BankTransaction) => void;
      initialLoad?: boolean;
      isFirstItem?: boolean;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showTooltips: boolean;
  }
  export enum Purpose {
      business = "business",
      personal = "personal",
      more = "more"
  }
  export const BankTransactionMobileListItem: ({ index, bankTransaction, removeTransaction, editable, initialLoad, isFirstItem, showDescriptions, showReceiptUploads, showTooltips, }: BankTransactionMobileListItemProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/BusinessCategories' {
  import { Option } from '@layerfi/components/components/BankTransactionMobileList/utils';
  export interface BusinessCategoriesProps {
      select: (category: Option) => void;
      selectedId?: string;
      showTooltips: boolean;
  }
  export const BusinessCategories: ({ select, selectedId, showTooltips, }: BusinessCategoriesProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/BusinessForm' {
  import { BankTransaction } from '@layerfi/components/types';
  interface BusinessFormProps {
      bankTransaction: BankTransaction;
      showCategorization?: boolean;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showTooltips: boolean;
  }
  export const BusinessForm: ({ bankTransaction, showCategorization, showDescriptions, showReceiptUploads, showTooltips, }: BusinessFormProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/MatchForm' {
  import { BankTransaction } from '@layerfi/components/types';
  export const MatchForm: ({ bankTransaction, showReceiptUploads, showDescriptions, showCategorization, }: {
      bankTransaction: BankTransaction;
      showReceiptUploads?: boolean;
      showDescriptions?: boolean;
      showCategorization?: boolean;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/PersonalForm' {
  import { BankTransaction } from '@layerfi/components/types';
  interface PersonalFormProps {
      bankTransaction: BankTransaction;
      showReceiptUploads?: boolean;
      showDescriptions?: boolean;
      showCategorization?: boolean;
  }
  export const PersonalForm: ({ bankTransaction, showReceiptUploads, showDescriptions, showCategorization, }: PersonalFormProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/SplitAndMatchForm' {
  import { BankTransaction } from '@layerfi/components/types';
  interface SplitAndMatchFormProps {
      bankTransaction: BankTransaction;
      showTooltips: boolean;
      showCategorization?: boolean;
      showReceiptUploads?: boolean;
      showDescriptions?: boolean;
  }
  export const SplitAndMatchForm: ({ bankTransaction, showTooltips, showReceiptUploads, showDescriptions, showCategorization, }: SplitAndMatchFormProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/SplitForm' {
  import { BankTransaction } from '@layerfi/components/types';
  export const SplitForm: ({ bankTransaction, showTooltips, showCategorization, showReceiptUploads, showDescriptions, }: {
      bankTransaction: BankTransaction;
      showTooltips: boolean;
      showCategorization?: boolean;
      showReceiptUploads?: boolean;
      showDescriptions?: boolean;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/TransactionToOpenContext' {
  type UseTransactionToOpen = () => {
      transactionIdToOpen?: string;
      setTransactionIdToOpen: (id: string) => void;
      clearTransactionIdToOpen: () => void;
  };
  export const useTransactionToOpen: UseTransactionToOpen;
  export type TransactionToOpenContextType = ReturnType<typeof useTransactionToOpen>;
  export const TransactionToOpenContext: import("react").Context<{
      transactionIdToOpen?: string;
      setTransactionIdToOpen: (id: string) => void;
      clearTransactionIdToOpen: () => void;
  }>;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/constants' {
  export enum PersonalCategories {
      INCOME = "PERSONAL_INFLOWS",
      EXPENSES = "PERSONAL_EXPENSES"
  }

}
declare module '@layerfi/components/components/BankTransactionMobileList/utils' {
  import { BankTransaction } from '@layerfi/components/types';
  import type { CategoryWithEntries } from '@layerfi/components/types/bank_transactions';
  import { CategoryOptionPayload } from '@layerfi/components/components/CategorySelect/CategorySelect';
  export interface Option {
      label: string;
      id: string;
      description?: string;
      value: {
          type: 'CATEGORY' | 'SELECT_CATEGORY' | 'GROUP';
          payload?: CategoryOptionPayload;
          items?: Option[];
      };
      asLink?: boolean;
      secondary?: boolean;
  }
  export const mapCategoryToOption: (category: CategoryWithEntries) => Option;
  export const flattenCategories: (categories: CategoryWithEntries[]) => Option[];
  export const flattenOptionGroups: (options: Option[]) => Option[];
  export const getAssignedValue: (bankTransaction: BankTransaction) => Option | undefined;

}
declare module '@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts' {
  import { BankTransaction } from '@layerfi/components/types';
  export interface DocumentWithStatus {
      id?: string;
      url?: string;
      status: 'pending' | 'uploaded' | 'failed' | 'deleting';
      type?: string;
      name?: string;
      date?: string;
      error?: string;
  }
  export interface BankTransactionReceiptsProps {
      classNamePrefix?: string;
      floatingActions?: boolean;
      hideUploadButtons?: boolean;
      label?: string;
  }
  export interface BankTransactionReceiptsWithProviderProps extends BankTransactionReceiptsProps {
      bankTransaction: BankTransaction;
      isActive?: boolean;
  }
  export interface BankTransactionReceiptsHandle {
      uploadReceipt: (file: File) => void;
  }
  const BankTransactionReceiptsWithProvider: import("react").ForwardRefExoticComponent<BankTransactionReceiptsWithProviderProps & import("react").RefAttributes<BankTransactionReceiptsHandle>>;
  export { BankTransactionReceiptsWithProvider };
  const BankTransactionReceipts: import("react").ForwardRefExoticComponent<BankTransactionReceiptsProps & import("react").RefAttributes<BankTransactionReceiptsHandle>>;
  export { BankTransactionReceipts };

}
declare module '@layerfi/components/components/BankTransactionReceipts/index' {
  export { BankTransactionReceipts, BankTransactionReceiptsWithProvider, } from '@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts';

}
declare module '@layerfi/components/components/BankTransactionRow/BankTransactionRow' {
  import { BankTransaction } from '@layerfi/components/types';
  import { BankTransactionCTAStringOverrides } from '@layerfi/components/components/BankTransactions/BankTransactions';
  import type { CategoryWithEntries } from '@layerfi/components/types/bank_transactions';
  type Props = {
      index: number;
      editable: boolean;
      dateFormat: string;
      bankTransaction: BankTransaction;
      removeTransaction: (bt: BankTransaction) => void;
      containerWidth?: number;
      initialLoad?: boolean;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showReceiptUploadColumn: boolean;
      showTooltips: boolean;
      stringOverrides?: BankTransactionCTAStringOverrides;
  };
  export type LastSubmittedForm = 'simple' | 'match' | 'split' | undefined;
  export const extractDescriptionForSplit: (category: CategoryWithEntries | null) => string;
  export const getDefaultSelectedCategory: (bankTransaction: BankTransaction) => import("@layerfi/components/components/CategorySelect/CategorySelect").CategoryOption | undefined;
  export const BankTransactionRow: ({ index, editable, dateFormat, bankTransaction, removeTransaction, containerWidth, initialLoad, showDescriptions, showReceiptUploads, showReceiptUploadColumn, showTooltips, stringOverrides, }: Props) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionRow/MatchBadge' {
  import { BankTransaction } from '@layerfi/components/types';
  export interface MatchBadgeProps {
      bankTransaction: BankTransaction;
      classNamePrefix: string;
      dateFormat: string;
      text?: string;
  }
  export const MatchBadge: ({ bankTransaction, classNamePrefix, dateFormat, text, }: MatchBadgeProps) => import("react/jsx-runtime").JSX.Element | undefined;

}
declare module '@layerfi/components/components/BankTransactionRow/SplitTooltipDetails' {
  import type { CategoryWithEntries } from '@layerfi/components/types/bank_transactions';
  export const SplitTooltipDetails: ({ classNamePrefix, category, }: {
      classNamePrefix: string;
      category: CategoryWithEntries | null;
  }) => import("react/jsx-runtime").JSX.Element | undefined;

}
declare module '@layerfi/components/components/BankTransactions/BankTransactionMemo/BankTransactionMemo' {
  import { BankTransaction } from '@layerfi/components/types/bank_transactions';
  export const BankTransactionMemo: ({ bankTransactionId }: {
      bankTransactionId: BankTransaction["id"];
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactions/BankTransactionMemo/useBankTransactionMemo' {
  import { BankTransaction } from '@layerfi/components/types';
  interface BankTransactionMemoProps {
      bankTransactionId: BankTransaction['id'];
  }
  export const useBankTransactionMemo: ({ bankTransactionId }: BankTransactionMemoProps) => import("@tanstack/react-form").ReactFormExtendedApi<{
      memo: string | null | undefined;
  }, import("@tanstack/react-form").FormValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, import("@tanstack/react-form").FormValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, import("@tanstack/react-form").FormAsyncValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, import("@tanstack/react-form").FormValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, import("@tanstack/react-form").FormAsyncValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, import("@tanstack/react-form").FormValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, import("@tanstack/react-form").FormAsyncValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, import("@tanstack/react-form").FormValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, import("@tanstack/react-form").FormAsyncValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, import("@tanstack/react-form").FormAsyncValidateOrFn<{
      memo: string | null | undefined;
  }> | undefined, unknown>;
  export {};

}
declare module '@layerfi/components/components/BankTransactions/BankTransactions' {
  import { ReactNode } from 'react';
  import { BankTransactionFilters } from '@layerfi/components/hooks/useBankTransactions/types';
  import { type BankTransactionsTableStringOverrides } from '@layerfi/components/components/BankTransactionsTable/BankTransactionsTable';
  import { BankTransactionsHeaderStringOverrides } from '@layerfi/components/components/BankTransactions/BankTransactionsHeader';
  import { MobileComponentType } from '@layerfi/components/components/BankTransactions/constants';
  import type { LayerError } from '@layerfi/components/models/ErrorHandler';
  import { type BankTransactionsMode } from '@layerfi/components/providers/LegacyModeProvider/LegacyModeProvider';
  import { LinkingMetadata } from '@layerfi/components/contexts/InAppLinkContext';
  export interface BankTransactionsStringOverrides {
      bankTransactionCTAs?: BankTransactionCTAStringOverrides;
      transactionsTable?: BankTransactionsTableStringOverrides;
      bankTransactionsHeader?: BankTransactionsHeaderStringOverrides;
  }
  export interface BankTransactionCTAStringOverrides {
      approveButtonText?: string;
      updateButtonText?: string;
  }
  export interface BankTransactionsProps {
      asWidget?: boolean;
      pageSize?: number;
      /**
       * @deprecated `mode` can be inferred from the bookkeeping configuration of a business
       */
      mode?: BankTransactionsMode;
      showCustomerVendor?: boolean;
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
      showTooltips?: boolean;
      showUploadOptions?: boolean;
      applyGlobalDateRange?: boolean;
      monthlyView?: boolean;
      categorizeView?: boolean;
      mobileComponent?: MobileComponentType;
      filters?: BankTransactionFilters;
      hideHeader?: boolean;
      stringOverrides?: BankTransactionsStringOverrides;
      renderInAppLink?: (details: LinkingMetadata) => ReactNode;
  }
  export interface BankTransactionsWithErrorProps extends BankTransactionsProps {
      onError?: (error: LayerError) => void;
      showTags?: boolean;
  }
  export const BankTransactions: ({ onError, showTags, showCustomerVendor, monthlyView, applyGlobalDateRange, mode, renderInAppLink, ...props }: BankTransactionsWithErrorProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactions/BankTransactionsHeader' {
  import { ChangeEvent } from 'react';
  import { MobileComponentType } from '@layerfi/components/components/BankTransactions/constants';
  export interface BankTransactionsHeaderProps {
      shiftStickyHeader: number;
      asWidget?: boolean;
      categorizedOnly?: boolean;
      categorizeView?: boolean;
      onCategorizationDisplayChange: (event: ChangeEvent<HTMLInputElement>) => void;
      mobileComponent?: MobileComponentType;
      listView?: boolean;
      isDataLoading?: boolean;
      isSyncing?: boolean;
      stringOverrides?: BankTransactionsHeaderStringOverrides;
      withUploadMenu?: boolean;
  }
  export interface BankTransactionsHeaderStringOverrides {
      header?: string;
      downloadButton?: string;
  }
  export const BankTransactionsHeader: ({ shiftStickyHeader, asWidget, categorizedOnly, categorizeView, onCategorizationDisplayChange, mobileComponent, listView, stringOverrides, isSyncing, withUploadMenu, }: BankTransactionsHeaderProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactions/BankTransactionsTableEmptyState' {
  type BankTransactionsTableEmptyStatesProps = {
      hasVisibleTransactions: boolean;
      isCategorizationMode: boolean;
      isError: boolean;
      isFiltered: boolean;
      isLoadingWithoutData: boolean;
  };
  export function BankTransactionsTableEmptyStates({ hasVisibleTransactions, isCategorizationMode, isError, isFiltered, isLoadingWithoutData, }: BankTransactionsTableEmptyStatesProps): import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/BankTransactions/BankTransactionsUploadMenu' {
  export const BankTransactionsUploadMenu: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactions/BankTransactionsUploadModal/BankTransactionsUploadModal' {
  import { ModalProps } from '@layerfi/components/components/ui/Modal/Modal';
  type BankTransactionsUploadModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>;
  export function BankTransactionsUploadModal({ isOpen, onOpenChange }: BankTransactionsUploadModalProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactions/constants' {
  import { CategorizationStatus } from '@layerfi/components/types';
  export type MobileComponentType = 'regularList' | 'mobileList';
  export const CategorizedCategories: CategorizationStatus[];
  export const ReviewCategories: CategorizationStatus[];

}
declare module '@layerfi/components/components/BankTransactions/utils' {
  import { BankTransaction, DisplayState } from '@layerfi/components/types';
  export const filterVisibility: (scope: DisplayState, bankTransaction: BankTransaction) => boolean;
  export const isCategorized: (bankTransaction: BankTransaction) => boolean;

}
declare module '@layerfi/components/components/BankTransactionsLoader/BankTransactionsLoader' {
  export const BankTransactionsLoader: ({ isLoading, showTooltips, }: {
      isLoading: boolean;
      showTooltips: boolean;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionsLoader/index' {
  export { BankTransactionsLoader } from '@layerfi/components/components/BankTransactionsLoader/BankTransactionsLoader';

}
declare module '@layerfi/components/components/BankTransactionsTable/BankTransactionsTable' {
  import { BankTransaction } from '@layerfi/components/types';
  import { BankTransactionsStringOverrides } from '@layerfi/components/components/BankTransactions/BankTransactions';
  export interface BankTransactionsTableStringOverrides {
      dateColumnHeaderText?: string;
      transactionColumnHeaderText?: string;
      accountColumnHeaderText?: string;
      amountColumnHeaderText?: string;
      categorizeColumnHeaderText?: string;
      categoryColumnHeaderText?: string;
  }
  interface BankTransactionsTableProps {
      bankTransactions?: BankTransaction[];
      editable: boolean;
      categorizeView?: boolean;
      isLoading?: boolean;
      containerWidth: number;
      removeTransaction: (bt: BankTransaction) => void;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showTooltips: boolean;
      stringOverrides?: BankTransactionsStringOverrides;
      isSyncing?: boolean;
      page?: number;
      lastPage?: boolean;
      onRefresh?: () => void;
  }
  export const BankTransactionsTable: ({ categorizeView, editable, isLoading, bankTransactions, containerWidth, removeTransaction, showDescriptions, showReceiptUploads, showTooltips, stringOverrides, isSyncing, page, lastPage, onRefresh, }: BankTransactionsTableProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BaseConfirmationModal/BaseConfirmationModal' {
  import { ModalProps } from '@layerfi/components/components/ui/Modal/Modal';
  import { type ReactNode } from 'react';
  import { Awaitable } from '@layerfi/components/types/utility/promises';
  export type BaseConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
      title: string;
      description?: string;
      content?: ReactNode;
      onConfirm: () => Awaitable<void>;
      confirmLabel?: string;
      retryLabel?: string;
      cancelLabel?: string;
      errorText?: string;
      closeOnConfirm?: boolean;
  };
  export function BaseConfirmationModal({ isOpen, onOpenChange, title, description, content, onConfirm, confirmLabel, retryLabel, cancelLabel, errorText, closeOnConfirm, }: BaseConfirmationModalProps): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BaseDetailView/BaseDetailView' {
  import type { PropsWithChildren } from 'react';
  export type BaseDetailViewProps = PropsWithChildren<{
      name: string;
      borderless?: boolean;
      onGoBack: () => void;
      slots: {
          Header: React.FC;
          BackIcon?: React.FC;
      };
  }>;
  export const BaseDetailView: ({ name, onGoBack, slots, children, borderless }: BaseDetailViewProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillSummary' {
  import type { Bill } from '@layerfi/components/types';
  type BillSummaryProps = {
      bill: Bill;
  };
  export const BillSummary: ({ bill }: BillSummaryProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Bills/BillSummaryPaid' {
  import { Bill } from '@layerfi/components/types';
  type BillSummaryPaidProps = {
      bill: Bill;
  };
  export const BillSummaryPaid: ({ bill }: BillSummaryPaidProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Bills/BillSummaryUnpaid' {
  import { Bill } from '@layerfi/components/types';
  type BillSummaryUnpaidProps = {
      bill: Bill;
  };
  export const BillSummaryUnpaid: ({ bill }: BillSummaryUnpaidProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Bills/Bills' {
  import { BillsTableStringOverrides } from '@layerfi/components/components/Bills/BillsTableWithPanel';
  export type BillsStringOverrides = {
      billsTable?: BillsTableStringOverrides;
      paidToggleOption?: string;
      unpaidToggleOption?: string;
  };
  export type BillsProps = {
      context?: boolean;
      asWidget?: boolean;
      stringOverrides?: BillsStringOverrides;
  };
  export const Bills: ({ context, ...props }: BillsProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillsDatePicker' {
  export const BillsDatePicker: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillsDetails' {
  import { RefObject } from 'react';
  import type { Bill } from '@layerfi/components/types';
  export const BillsDetails: ({ bill, containerRef, }: {
      bill?: Bill;
      containerRef: RefObject<HTMLDivElement>;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillsList' {
  import { BillsTableStringOverrides } from '@layerfi/components/components/Bills/BillsTableWithPanel';
  export const BillsList: ({ stringOverrides, }: {
      stringOverrides?: BillsTableStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillsPaymentRecorded' {
  export const BillsPaymentRecorded: ({ stringOverrides, }: {
      stringOverrides?: {
          header?: string;
      };
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillsRecordPayment' {
  import { JournalFormStringOverrides } from '@layerfi/components/components/JournalForm/JournalForm';
  export const BillsRecordPayment: ({ stringOverrides, }: {
      stringOverrides?: JournalFormStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillsSidebar' {
  export const BillsSidebar: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillsTable' {
  import { BillsTableStringOverrides } from '@layerfi/components/components/Bills/BillsTableWithPanel';
  export const BillsTable: ({ stringOverrides, }: {
      stringOverrides?: BillsTableStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillsTableLoader' {
  export const BillsTableLoader: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/BillsTableWithPanel' {
  import { RefObject } from 'react';
  export type BillsTableStringOverrides = {
      componentTitle?: string;
      componentSubtitle?: string;
      vendorColumnHeader?: string;
      dueDateColumnHeader?: string;
      billAmountColumnHeader?: string;
      openBalanceColumnHeader?: string;
      statusColumnHeader?: string;
      paidToggleOption?: string;
      unpaidToggleOption?: string;
      recordPaymentButtonText?: string;
  };
  export const BillsTableWithPanel: ({ containerRef, stringOverrides, }: {
      containerRef: RefObject<HTMLDivElement>;
      stringOverrides?: BillsTableStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Bills/useBillForm' {
  import { Bill, BillLineItem } from '@layerfi/components/types/bills';
  import { Vendor } from '@layerfi/components/types/vendors';
  export type BillForm = {
      bill_number?: string;
      vendor?: Vendor;
      vendor_address?: string;
      received_at?: string;
      due_at?: string;
      terms?: string;
      line_items?: (Partial<BillLineItem>)[];
  };
  export type EditableBill = Partial<Bill>;
  export const useBillForm: (bill?: EditableBill) => {
      form: import("@tanstack/react-form").ReactFormExtendedApi<BillForm, import("@tanstack/react-form").FormValidateOrFn<BillForm>, import("@tanstack/react-form").FormValidateOrFn<BillForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<BillForm>, import("@tanstack/react-form").FormValidateOrFn<BillForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<BillForm>, import("@tanstack/react-form").FormValidateOrFn<BillForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<BillForm>, import("@tanstack/react-form").FormValidateOrFn<BillForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<BillForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<BillForm>, unknown>;
      isDirty: boolean;
      submitError: string | undefined;
      formErrorMap: import("@tanstack/react-form").ValidationErrorMap<undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined>;
  };

}
declare module '@layerfi/components/components/Bills/useBillsRecordPayment' {
  import { Bill, BillPaymentMethod } from '@layerfi/components/types/bills';
  import { Vendor } from '@layerfi/components/types/vendors';
  import { APIError } from '@layerfi/components/models/APIError';
  export type BillsRecordPaymentFormRecord = {
      bill?: Bill;
      amount?: string | null;
  };
  export const useBillsRecordPayment: ({ refetchAllBills }: {
      refetchAllBills?: () => void;
  }) => {
      billsToPay: BillsRecordPaymentFormRecord[];
      setBill: (bill: Bill, index: number) => void;
      addBill: (bill?: Bill) => void;
      removeBill: (bill: Bill) => void;
      removeBillByIndex: (index: number) => void;
      setAmount: (billId: string, amount: string) => void;
      setAmountByIndex: (index: number, amount?: string | null) => void;
      vendor: Vendor | undefined;
      setVendor: (newVendor?: Vendor) => void;
      paymentDate: Date;
      setPaymentDate: import("react").Dispatch<import("react").SetStateAction<Date>>;
      paymentMethod: BillPaymentMethod;
      setPaymentMethod: import("react").Dispatch<import("react").SetStateAction<BillPaymentMethod>>;
      showRecordPaymentForm: boolean;
      setShowRecordPaymentForm: import("react").Dispatch<import("react").SetStateAction<boolean>>;
      bulkSelectionActive: boolean;
      openBulkSelection: () => void;
      closeBulkSelection: () => void;
      recordPayment: () => Promise<void>;
      dataSaved: boolean;
      closeRecordPayment: () => void;
      clearRecordPaymentSelection: () => void;
      recordPaymentForBill: (bill: Bill) => void;
      payRemainingBalance: () => void;
      isLoading: boolean;
      apiError: APIError | undefined;
  };

}
declare module '@layerfi/components/components/Bills/useUnpaidBillsByVendor' {
  export const useUnpaidBillsByVendor: ({ vendorId }: {
      vendorId?: string;
  }) => import("swr").SWRResponse<import("../../types").Bill[] | undefined, any, any>;

}
declare module '@layerfi/components/components/BookkeepingStatus/BookkeepingStatus' {
  import { BookkeepingPeriodStatus } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  type BookkeepingStatusProps = {
      monthNumber?: number;
      status?: BookkeepingPeriodStatus;
      text?: string;
      iconOnly?: boolean;
  };
  export const BookkeepingStatus: ({ status, text, monthNumber, iconOnly }: BookkeepingStatusProps) => import("react/jsx-runtime").JSX.Element | undefined;
  export {};

}
declare module '@layerfi/components/components/BookkeepingStatus/BookkeepingStatusDescription' {
  import { BookkeepingPeriodStatus } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  type BookkeepingStatusDescriptionProps = {
      monthNumber: number;
      status: BookkeepingPeriodStatus;
      incompleteTasksCount: number;
  };
  export const BookkeepingStatusDescription: ({ monthNumber, status, incompleteTasksCount }: BookkeepingStatusDescriptionProps) => import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/BookkeepingStatus/utils' {
  import { ReactNode } from 'react';
  import { BookkeepingPeriodStatus } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  import { TextStatus } from '@layerfi/components/components/Typography/Text';
  type InternalStatusConfig = {
      label: string;
      description: string;
      color: TextStatus;
      icon: ReactNode;
  };
  type BookkeepingStatusConfigOptions = {
      status: BookkeepingPeriodStatus;
      monthNumber?: number;
      incompleteTasksCount?: number;
  };
  export function getBookkeepingStatusConfig({ status, monthNumber, incompleteTasksCount, }: BookkeepingStatusConfigOptions): InternalStatusConfig | undefined;
  export {};

}
declare module '@layerfi/components/components/BusinessForm/BusinessForm' {
  export type BusinessFormStringOverrides = {
      saveButton?: string;
  };
  export type BusinessFormProps = {
      stringOverrides?: BusinessFormStringOverrides;
      onSuccess?: () => void;
  };
  export const BusinessForm: ({ stringOverrides, onSuccess }: BusinessFormProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BusinessForm/useBusinessForm' {
  import { USStateCode } from '@layerfi/components/types/location';
  import { EntityType } from '@layerfi/components/types/business';
  type BusinessFormData = {
      full_name?: string;
      preferred_name?: string;
      email?: string;
      phone_number?: string;
      legal_name?: string;
      dba?: string;
      entity_type?: EntityType;
      us_state?: USStateCode;
      tin?: string;
  };
  type UseBusinessFormProps = {
      onSuccess?: () => void;
  };
  export const useBusinessForm: ({ onSuccess }: UseBusinessFormProps) => {
      form: import("@tanstack/react-form").ReactFormExtendedApi<BusinessFormData, import("@tanstack/react-form").FormValidateOrFn<BusinessFormData>, import("@tanstack/react-form").FormValidateOrFn<BusinessFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<BusinessFormData>, import("@tanstack/react-form").FormValidateOrFn<BusinessFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<BusinessFormData>, import("@tanstack/react-form").FormValidateOrFn<BusinessFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<BusinessFormData>, import("@tanstack/react-form").FormValidateOrFn<BusinessFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<BusinessFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<BusinessFormData>, unknown>;
      submitError: string | undefined;
      isFormValid: boolean;
  };
  export {};

}
declare module '@layerfi/components/components/Button/BackButton' {
  import { ButtonHTMLAttributes } from 'react';
  type BackButtonProps = {
      textOnly?: boolean;
  } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;
  export const BackButton: ({ className, textOnly, ...props }: BackButtonProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Button/Button' {
  import { ButtonHTMLAttributes, ReactNode } from 'react';
  export enum ButtonVariant {
      primary = "primary",
      secondary = "secondary",
      tertiary = "tertiary"
  }
  export type ButtonJustify = 'center' | 'space-between' | 'start';
  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: ButtonVariant;
      leftIcon?: ReactNode;
      rightIcon?: ReactNode;
      iconOnly?: ReactNode;
      iconAsPrimary?: boolean;
      justify?: ButtonJustify;
      fullWidth?: boolean;
      isProcessing?: boolean;
      tooltip?: ReactNode | string;
  }
  export const Button: ({ className, children, variant, leftIcon, rightIcon, iconOnly, iconAsPrimary, justify, fullWidth, isProcessing, tooltip, ...props }: ButtonProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Button/CloseButton' {
  import { ButtonHTMLAttributes } from 'react';
  type CloseButtonProps = {
      textOnly?: boolean;
  } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;
  export const CloseButton: ({ className, textOnly, ...props }: CloseButtonProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Button/DownloadButton' {
  import { ButtonProps, ButtonVariant } from '@layerfi/components/components/Button/Button';
  interface DownloadButtonProps {
      onClick?: () => void | Promise<void>;
      iconOnly?: boolean;
      isDownloading?: boolean;
      requestFailed?: boolean;
      text?: string;
      retryText?: string;
      errorText?: string;
      tooltip?: ButtonProps['tooltip'];
      variant?: ButtonVariant;
  }
  export const DownloadButton: ({ iconOnly, onClick, isDownloading, requestFailed, tooltip, text, retryText, errorText, variant, }: DownloadButtonProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Button/ExpandCollapseButton' {
  import { ButtonVariant } from '@layerfi/components/components/Button/Button';
  export interface ExpandCollapseButtonProps {
      onClick: (value: boolean) => void;
      expanded?: boolean;
      className?: string;
      iconOnly?: boolean;
      variant?: ButtonVariant;
  }
  export const ExpandCollapseButton: ({ onClick, expanded, className, iconOnly, variant, }: ExpandCollapseButtonProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Button/IconButton' {
  import { ButtonHTMLAttributes, ReactNode } from 'react';
  export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      icon: ReactNode;
      active?: boolean;
      withBorder?: boolean;
      href?: HTMLAnchorElement['href'];
      target?: HTMLAnchorElement['target'];
      rel?: HTMLAnchorElement['rel'];
      download?: HTMLAnchorElement['download'];
      onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>) => void;
  }
  export const IconButton: ({ className, children: _children, icon, active, withBorder, href, target, rel, download, ...props }: IconButtonProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Button/Link' {
  import { HTMLAttributeAnchorTarget, LinkHTMLAttributes, ReactNode } from 'react';
  import { ButtonVariant, ButtonJustify } from '@layerfi/components/components/Button/Button';
  export interface LinkProps extends LinkHTMLAttributes<HTMLAnchorElement> {
      variant?: ButtonVariant;
      leftIcon?: ReactNode;
      rightIcon?: ReactNode;
      iconOnly?: ReactNode;
      iconAsPrimary?: boolean;
      justify?: ButtonJustify;
      fullWidth?: boolean;
      target: HTMLAttributeAnchorTarget;
  }
  export const Link: ({ className, children, variant, leftIcon, rightIcon, iconOnly, iconAsPrimary, justify, fullWidth, ...props }: LinkProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Button/RetryButton' {
  import { ButtonHTMLAttributes } from 'react';
  export interface RetryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      processing?: boolean;
      disabled?: boolean;
      error: string;
      fullWidth?: boolean;
      iconOnly?: boolean;
  }
  export const RetryButton: ({ className, processing, disabled, error, children, ...props }: RetryButtonProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Button/SubmitButton' {
  import { ButtonHTMLAttributes } from 'react';
  import { ButtonProps } from '@layerfi/components/components/Button/Button';
  export interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      processing?: boolean;
      disabled?: boolean;
      error?: boolean | string;
      active?: boolean;
      iconOnly?: boolean;
      variant?: ButtonProps['variant'];
      action?: SubmitAction;
      noIcon?: boolean;
      tooltip?: ButtonProps['tooltip'];
      withRetry?: boolean;
      iconAsPrimary?: boolean;
  }
  export enum SubmitAction {
      SAVE = "save",
      UPDATE = "update",
      UPLOAD = "upload"
  }
  export const SubmitButton: ({ active, className, processing, disabled, error, children, action, noIcon, variant, withRetry, iconAsPrimary, ...props }: SubmitButtonProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Button/SwitchButton' {
  interface SwitchButtonProps {
      children: string;
      labelPosition?: 'left' | 'right';
      checked?: boolean;
      defaultChecked?: boolean;
      onChange?: (checked: boolean) => void;
      disabled?: boolean;
  }
  export const SwitchButton: React.FC<SwitchButtonProps>;
  export {};

}
declare module '@layerfi/components/components/Button/TextButton' {
  import { ButtonHTMLAttributes } from 'react';
  export type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
  export const TextButton: ({ className, children, ...props }: TextButtonProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Button/index' {
  export { Button, ButtonVariant } from '@layerfi/components/components/Button/Button';
  export { IconButton } from '@layerfi/components/components/Button/IconButton';
  export { RetryButton } from '@layerfi/components/components/Button/RetryButton';
  export { SubmitButton } from '@layerfi/components/components/Button/SubmitButton';
  export { TextButton } from '@layerfi/components/components/Button/TextButton';
  export { BackButton } from '@layerfi/components/components/Button/BackButton';
  export { CloseButton } from '@layerfi/components/components/Button/CloseButton';
  export { SwitchButton } from '@layerfi/components/components/Button/SwitchButton';
  export { Link } from '@layerfi/components/components/Button/Link';
  export { DownloadButton } from '@layerfi/components/components/Button/DownloadButton';
  export { ExpandCollapseButton } from '@layerfi/components/components/Button/ExpandCollapseButton';

}
declare module '@layerfi/components/components/Card/Card' {
  import { ReactNode } from 'react';
  export interface CardProps {
      children: ReactNode;
      className?: string;
  }
  export const Card: ({ children, className }: CardProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Card/index' {
  export { Card } from '@layerfi/components/components/Card/Card';

}
declare module '@layerfi/components/components/CategorySelect/CategorySelect' {
  import { BankTransaction, Category } from '@layerfi/components/types';
  import { SuggestedMatch, type CategoryWithEntries } from '@layerfi/components/types/bank_transactions';
  import { MatchDetailsType } from '@layerfi/components/schemas/match';
  type Props = {
      name?: string;
      bankTransaction?: BankTransaction;
      value: CategoryOption | undefined;
      onChange: (newValue: CategoryOption) => void;
      disabled?: boolean;
      className?: string;
      showTooltips: boolean;
      excludeMatches?: boolean;
      asDrawer?: boolean;
  };
  export enum OptionActionType {
      CATEGORY = "category",
      MATCH = "match",
      HIDDEN = "hidden",
      SUGGESTIONS_LOADING = "suggestions loading"
  }
  export interface CategoryOptionPayload {
      id: string;
      option_type: OptionActionType;
      display_name: string;
      description?: string;
      date?: string;
      amount?: number;
      type?: string;
      stable_name?: string;
      entries?: CategoryWithEntries['entries'];
      subCategories: Category[] | null;
      details?: MatchDetailsType;
  }
  export interface CategoryOption {
      type: string;
      disabled?: boolean;
      payload: CategoryOptionPayload;
  }
  export const mapCategoryToOption: (category: CategoryWithEntries) => CategoryOption;
  export const mapCategoryToExclusionOption: (category: CategoryWithEntries & {
      type: "ExclusionNested";
  }) => CategoryOption;
  export const mapSuggestedMatchToOption: (record: SuggestedMatch) => CategoryOption;
  export const CategorySelect: ({ bankTransaction, name, value, onChange, disabled, className, showTooltips, excludeMatches, asDrawer, }: Props) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CategorySelect/CategorySelectDrawer' {
  import type { Option } from '@layerfi/components/components/BankTransactionMobileList/utils';
  interface CategorySelectDrawerProps {
      onSelect: (value: Option) => void;
      selectedId?: string;
      showTooltips: boolean;
      isOpen: boolean;
      onOpenChange: (isOpen: boolean) => void;
  }
  export const CategorySelectDrawer: ({ onSelect, selectedId, showTooltips, isOpen, onOpenChange, }: CategorySelectDrawerProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CategorySelect/index' {
  export { CategorySelect } from '@layerfi/components/components/CategorySelect/CategorySelect';

}
declare module '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts' {
  import { ReactNode } from 'react';
  import { ChartOfAccountsTableStringOverrides } from '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel';
  import { LedgerAccountStringOverrides } from '@layerfi/components/components/LedgerAccount/LedgerAccountIndex';
  import { LinkingMetadata } from '@layerfi/components/contexts/InAppLinkContext';
  export interface ChartOfAccountsStringOverrides {
      chartOfAccountsTable?: ChartOfAccountsTableStringOverrides;
      ledgerAccount?: LedgerAccountStringOverrides;
  }
  export interface ChartOfAccountsProps {
      asWidget?: boolean;
      withDateControl?: boolean;
      withExpandAllButton?: boolean;
      stringOverrides?: ChartOfAccountsStringOverrides;
      showAddAccountButton?: boolean;
      templateAccountsEditable?: boolean;
      showReversalEntries?: boolean;
      renderInAppLink?: (source: LinkingMetadata) => ReactNode;
  }
  export const ChartOfAccounts: (props: ChartOfAccountsProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccounts/download/AccountBalancesDownloadButton' {
  type AccountBalancesDownloadButtonProps = {
      startCutoff?: Date;
      endCutoff?: Date;
      iconOnly?: boolean;
  };
  export function AccountBalancesDownloadButton({ startCutoff, endCutoff, iconOnly, }: AccountBalancesDownloadButtonProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ChartOfAccounts/download/useAccountBalancesDownload' {
  import type { S3PresignedUrl } from '@layerfi/components/types/general';
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  type UseAccountBalancesDownloadOptions = {
      startCutoff?: Date;
      endCutoff?: Date;
      onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>;
  };
  export function useAccountBalancesDownload({ startCutoff, endCutoff, onSuccess, }: UseAccountBalancesDownloadOptions): import("swr/mutation").SWRMutationResponse<unknown, any, () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      startCutoff: Date | undefined;
      endCutoff: Date | undefined;
      tags: string[];
  } | undefined, never>;
  export {};

}
declare module '@layerfi/components/components/ChartOfAccounts/index' {
  export { ChartOfAccounts } from '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts';

}
declare module '@layerfi/components/components/ChartOfAccountsDatePicker/ChartOfAccountsDatePicker' {
  export const ChartOfAccountsDatePicker: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccountsDatePicker/index' {
  export { ChartOfAccountsDatePicker } from '@layerfi/components/components/ChartOfAccountsDatePicker/ChartOfAccountsDatePicker';

}
declare module '@layerfi/components/components/ChartOfAccountsForm/ChartOfAccountsForm' {
  export interface ChartOfAccountsFormStringOverrides {
      editModeHeader?: string;
      createModeHeader?: string;
      cancelButton?: string;
      retryButton?: string;
      saveButton?: string;
      parentLabel?: string;
      nameLabel?: string;
      accountNumberLabel?: string;
      typeLabel?: string;
      subTypeLabel?: string;
      normalityLabel?: string;
  }
  export const ChartOfAccountsForm: ({ stringOverrides, }: {
      stringOverrides?: ChartOfAccountsFormStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element | null;

}
declare module '@layerfi/components/components/ChartOfAccountsForm/constants' {
  import { Direction } from '@layerfi/components/types';
  import { BaseSelectOption } from '@layerfi/components/types/general';
  export const LEDGER_ACCOUNT_TYPES: BaseSelectOption[];
  export const DEFAULT_ACCOUNT_TYPE_DIRECTION: Record<string, Direction>;
  export const NORMALITY_OPTIONS: BaseSelectOption[];
  export const ASSET_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[];
  export const LIABILITY_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[];
  export const EQUITY_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[];
  export const REVENUE_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[];
  export const EXPENSE_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[];
  export const LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[];
  export const LEDGER_ACCOUNT_SUBTYPES_FOR_TYPE: Record<string, BaseSelectOption[]>;

}
declare module '@layerfi/components/components/ChartOfAccountsForm/index' {
  export { ChartOfAccountsForm } from '@layerfi/components/components/ChartOfAccountsForm/ChartOfAccountsForm';

}
declare module '@layerfi/components/components/ChartOfAccountsForm/useParentOptions' {
  import { BaseSelectOption } from '@layerfi/components/types/general';
  import { LedgerBalancesSchemaType } from '@layerfi/src/schemas/generalLedger/ledgerAccount/index';
  export const useParentOptions: (data?: LedgerBalancesSchemaType) => BaseSelectOption[];

}
declare module '@layerfi/components/components/ChartOfAccountsSidebar/ChartOfAccountsSidebar' {
  import { RefObject } from 'react';
  import { ChartOfAccountsFormStringOverrides } from '@layerfi/components/components/ChartOfAccountsForm/ChartOfAccountsForm';
  export const ChartOfAccountsSidebar: ({ parentRef: _parentRef, stringOverrides, }: {
      parentRef?: RefObject<HTMLDivElement>;
      stringOverrides?: ChartOfAccountsFormStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccountsSidebar/index' {
  export { ChartOfAccountsSidebar } from '@layerfi/components/components/ChartOfAccountsSidebar/ChartOfAccountsSidebar';

}
declare module '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTable' {
  import { View } from '@layerfi/components/types/general';
  import { ChartOfAccountsTableStringOverrides, ExpandActionState } from '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel';
  import { LedgerBalancesSchemaType } from '@layerfi/components/schemas/generalLedger/ledgerAccount';
  export const ChartOfAccountsTable: ({ view, stringOverrides, data, searchQuery, expandAll, templateAccountsEditable, }: {
      view: View;
      data: LedgerBalancesSchemaType;
      searchQuery: string;
      stringOverrides?: ChartOfAccountsTableStringOverrides;
      expandAll?: ExpandActionState;
      templateAccountsEditable?: boolean;
  }) => import("react/jsx-runtime").JSX.Element;
  export const ChartOfAccountsTableContent: ({ stringOverrides, data, searchQuery, expandAll, templateAccountsEditable, }: {
      view: View;
      data: LedgerBalancesSchemaType;
      searchQuery: string;
      stringOverrides?: ChartOfAccountsTableStringOverrides;
      expandAll?: ExpandActionState;
      templateAccountsEditable: boolean;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel' {
  import { RefObject } from 'react';
  import { View } from '@layerfi/components/types/general';
  import { ChartOfAccountsFormStringOverrides } from '@layerfi/components/components/ChartOfAccountsForm/ChartOfAccountsForm';
  export type ExpandActionState = undefined | 'expanded' | 'collapsed';
  export interface ChartOfAccountsTableStringOverrides {
      headerText?: string;
      addAccountButtonText?: string;
      csvDownloadButtonText?: string;
      nameColumnHeader?: string;
      numberColumnHeader?: string;
      typeColumnHeader?: string;
      balanceColumnHeader?: string;
      subtypeColumnHeader?: string;
      chartOfAccountsForm?: ChartOfAccountsFormStringOverrides;
  }
  export const ChartOfAccountsTableWithPanel: ({ view, containerRef, asWidget, withDateControl, withExpandAllButton, showAddAccountButton, stringOverrides, templateAccountsEditable, }: {
      view: View;
      containerRef: RefObject<HTMLDivElement>;
      asWidget?: boolean;
      withDateControl?: boolean;
      withExpandAllButton?: boolean;
      showAddAccountButton?: boolean;
      stringOverrides?: ChartOfAccountsTableStringOverrides;
      templateAccountsEditable?: boolean;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccountsTable/index' {
  export { ChartOfAccountsTableWithPanel as ChartOfAccountsTable } from '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel';

}
declare module '@layerfi/components/components/ChartOfAccountsTable/utils/types' {
  export enum LedgerAccountTypeOrderEnum {
      ASSET = 0,
      LIABILITY = 1,
      EQUITY = 2,
      REVENUE = 3,
      EXPENSES = 4
  }
  export enum LedgerAccountSubtypeOrderEnum {
      BANK_ACCOUNTS = 0,
      CASH = 1,
      UNDEPOSITED_FUNDS = 2,
      PAYMENT_PROCESSOR_CLEARING_ACCOUNT = 3,
      INBOUND_PAYMENT_METHOD_CLEARING = 4,
      ACCOUNTS_RECEIVABLE = 5,
      INVENTORY = 6,
      CURRENT_ASSET = 7,
      FIXED_ASSET = 8,
      INTANGIBLE_ASSET = 9,
      PREPAID_EXPENSES = 10,
      DEVELOPMENT_COSTS = 11,
      CREDIT_CARD = 12,
      ACCOUNTS_PAYABLE = 13,
      LINE_OF_CREDIT = 14,
      REFUND_LIABILITIES = 15,
      PAYROLL_LIABILITY = 16,
      SALES_TAXES_PAYABLE = 17,
      OTHER_TAXES_PAYABLE = 18,
      TIPS = 19,
      UNEARNED_REVENUE = 20,
      UNDEPOSITED_OUTFLOWS = 21,
      OUTGOING_PAYMENT_CLEARING_ACCOUNT = 22,
      OTHER_CURRENT_LIABILITY = 23,
      SHAREHOLDER_LOAN = 24,
      NOTES_PAYABLE = 25,
      OTHER_LONG_TERM_LIABILITIES = 26,
      CONTRIBUTIONS = 27,
      DISTRIBUTIONS = 28,
      COMMON_STOCK = 29,
      ADDITIONAL_PAID_IN_CAPITAL = 30,
      RETAINED_EARNINGS = 31,
      ACCUMULATED_ADJUSTMENTS = 32,
      OPENING_BALANCE_EQUITY = 33,
      OTHER_EQUITY = 34,
      SALES = 35,
      REVENUE = 36,
      UNCATEGORIZED_REVENUE = 37,
      RETURNS_ALLOWANCES = 38,
      OTHER_INCOME = 39,
      COGS = 40,
      OPERATING_EXPENSES = 41,
      PAYROLL = 42,
      INTEREST_EXPENSES = 43,
      TAXES_LICENSES = 44,
      UNCATEGORIZED_EXPENSE = 45
  }

}
declare module '@layerfi/components/components/ChartOfAccountsTable/utils/utils' {
  import type { AugmentedLedgerAccountBalance } from '@layerfi/components/types/chart_of_accounts';
  import { NestedLedgerAccountType } from '@layerfi/src/schemas/generalLedger/ledgerAccount/index';
  export const sortAccountsRecursive: (accounts: NestedLedgerAccountType[]) => NestedLedgerAccountType[];
  export const filterAccounts: (accounts: NestedLedgerAccountType[], query: string) => AugmentedLedgerAccountBalance[];
  export const getMatchedTextIndices: ({ text, query, isMatching, }: {
      text: string;
      query: string;
      isMatching?: boolean;
  }) => {
      startIdx: number;
      endIdx: number;
  } | null;

}
declare module '@layerfi/components/components/Container/Container' {
  import { CSSProperties, ReactNode } from 'react';
  export interface ContainerProps {
      name: string;
      className?: string;
      asWidget?: boolean;
      elevated?: boolean;
      transparentBg?: boolean;
      children: ReactNode;
      style?: CSSProperties;
  }
  const Container: import("react").ForwardRefExoticComponent<ContainerProps & import("react").RefAttributes<HTMLDivElement>>;
  export { Container };

}
declare module '@layerfi/components/components/Container/Header' {
  /**
   * @deprecated- use components/Header instead.
   * This has been kept to not introduce breaking changes.
   */
  import { CSSProperties, ReactNode } from 'react';
  export enum HeaderLayout {
      DEFAULT = "default",
      NEXT_LINE_ACTIONS = "next-line-actions"
  }
  export interface HeaderProps {
      className?: string;
      style?: CSSProperties;
      children: ReactNode;
      layout?: HeaderLayout;
  }
  const Header: import("react").ForwardRefExoticComponent<HeaderProps & import("react").RefAttributes<HTMLElement>>;
  export { Header };

}
declare module '@layerfi/components/components/Container/index' {
  export { Container } from '@layerfi/components/components/Container/Container';
  export { Header } from '@layerfi/components/components/Container/Header';

}
declare module '@layerfi/components/components/CsvUpload/CopyTemplateHeadersButtonGroup' {
  interface CopyTemplateHeadersButtonGroupProps {
      headers: Record<string, string>;
      className?: string;
  }
  export const CopyTemplateHeadersButtonGroup: ({ headers, className }: CopyTemplateHeadersButtonGroupProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CsvUpload/CsvUpload' {
  type CsvUploadProps = {
      file: File | null;
      onFileSelected: (file: File | null) => void;
      replaceDropTarget?: boolean;
  };
  export const CsvUpload: ({ file, onFileSelected, replaceDropTarget }: CsvUploadProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CsvUpload/DownloadCsvTemplateButton' {
  import { type PropsWithChildren } from 'react';
  interface DownloadCsvTemplateButtonProps<T> {
      csvProps: {
          headers: {
              [K in keyof T]: string;
          };
          rows?: T[];
      };
      fileName?: string;
      className?: string;
  }
  export const DownloadCsvTemplateButton: <T extends { [K in keyof T]: string | number | null | undefined; }>({ children, className, csvProps, fileName }: PropsWithChildren<DownloadCsvTemplateButtonProps<T>>) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CsvUpload/ValidateCsvTable' {
  import { PreviewCsv } from '@layerfi/components/components/CsvUpload/types';
  interface ValidateCsvTableProps<T extends {
      [K in keyof T]: string | number | null | undefined;
  }> {
      data: PreviewCsv<T>;
      headers: {
          [K in keyof T]: string;
      };
      formatters?: Partial<{
          [K in keyof T]: (parsed: T[K]) => string;
      }>;
      className?: string;
  }
  export function ValidateCsvTable<T extends {
      [K in keyof T]: string | number | null | undefined;
  }>({ data, headers, formatters, className, }: ValidateCsvTableProps<T>): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CsvUpload/types' {
  export type PreviewCell<T> = {
      raw: string;
      parsed: T;
      is_valid: boolean;
  };
  export type PreviewRow<T extends {
      [K in keyof T]: string | number | null | undefined;
  }> = {
      [K in keyof T]: PreviewCell<T[K]>;
  } & {
      row: number;
      is_valid: boolean;
  };
  export type PreviewCsv<T extends {
      [K in keyof T]: string | number | null | undefined;
  }> = PreviewRow<T>[];

}
declare module '@layerfi/components/components/CustomAccountForm/CustomAccountForm' {
  import { type CustomAccount } from '@layerfi/components/hooks/customAccounts/types';
  export type CustomAccountsFormProps = {
      initialAccountName: string;
      onCancel?: () => void;
      onSuccess?: (account: CustomAccount) => void;
  };
  export const CustomAccountForm: ({ initialAccountName, onCancel, onSuccess }: CustomAccountsFormProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/CustomAccountForm/useCustomAccountForm' {
  import { CustomAccount, CustomAccountSubtype, CustomAccountType } from '@layerfi/components/hooks/customAccounts/types';
  export const getCustomAccountTypeFromSubtype: (subtype: CustomAccountSubtype) => CustomAccountType;
  type CustomAccountFormData = {
      account_name?: string;
      institution_name?: string;
      account_type?: CustomAccountSubtype;
  };
  type UseCustomAccountFormProps = {
      onSuccess?: (account: CustomAccount) => void;
  };
  export const useCustomAccountForm: ({ onSuccess }: UseCustomAccountFormProps) => {
      form: import("@tanstack/react-form").ReactFormExtendedApi<CustomAccountFormData, import("@tanstack/react-form").FormValidateOrFn<CustomAccountFormData>, import("@tanstack/react-form").FormValidateOrFn<CustomAccountFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<CustomAccountFormData>, import("@tanstack/react-form").FormValidateOrFn<CustomAccountFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<CustomAccountFormData>, import("@tanstack/react-form").FormValidateOrFn<CustomAccountFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<CustomAccountFormData>, import("@tanstack/react-form").FormValidateOrFn<CustomAccountFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<CustomAccountFormData>, import("@tanstack/react-form").FormAsyncValidateOrFn<CustomAccountFormData>, unknown>;
      submitError: string | undefined;
      isFormValid: boolean;
  };
  export {};

}
declare module '@layerfi/components/components/DataPoint/DataPoint' {
  import type { PropsWithChildren } from 'react';
  export type DataPointProps = PropsWithChildren<{
      label: string;
  }>;
  export const DataPoint: ({ label, children }: DataPointProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/DataState/DataState' {
  import { ReactNode } from 'react';
  import { TextSize } from '@layerfi/components/components/Typography/index';
  export enum DataStateStatus {
      allDone = "allDone",
      success = "success",
      failed = "failed",
      info = "info"
  }
  export interface DataStateProps {
      status: DataStateStatus;
      title?: string;
      icon?: ReactNode;
      description?: string;
      onRefresh?: () => void;
      isLoading?: boolean;
      spacing?: boolean;
      inline?: boolean;
      titleSize?: TextSize;
      className?: string;
  }
  export const DataState: ({ status, title, description, onRefresh, isLoading, icon, spacing, inline, titleSize, className, }: DataStateProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/DataState/index' {
  export { DataState, DataStateStatus } from '@layerfi/components/components/DataState/DataState';

}
declare module '@layerfi/components/components/DataTable/DataTable' {
  export type Column<TData, K> = {
      id: K;
      header?: React.ReactNode;
      cell: (row: TData) => React.ReactNode;
      isRowHeader?: true;
  };
  export type ColumnConfig<TData, TColumns extends string> = {
      [K in TColumns]: Column<TData, K>;
  };
  export interface DataTableProps<TData, TColumns extends string> {
      columnConfig: ColumnConfig<TData, TColumns>;
      data: TData[] | undefined;
      componentName: string;
      ariaLabel: string;
      isLoading: boolean;
      isError: boolean;
      slots: {
          EmptyState: React.FC;
          ErrorState: React.FC;
      };
  }
  export const DataTable: <TData extends {
      id: string;
  }, TColumns extends string>({ columnConfig, data, isLoading, isError, componentName, ariaLabel, slots, }: DataTableProps<TData, TColumns>) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/DataTable/DataTableHeader' {
  import { type SearchFieldProps } from '@layerfi/components/components/SearchField/SearchField';
  interface CountProps {
      showCount?: true;
      totalCount?: string;
  }
  interface ClearFiltersButtonProps {
      onClick: () => void;
  }
  interface DataTableHeaderProps {
      name: string;
      count?: CountProps;
      slotProps?: {
          SearchField?: SearchFieldProps;
          ClearFiltersButton?: ClearFiltersButtonProps;
      };
      slots?: {
          HeaderActions?: React.FC;
          HeaderFilters?: React.FC;
          Filters?: React.FC;
      };
  }
  export const DataTableHeader: ({ name, count, slotProps, slots }: DataTableHeaderProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/DataTable/PaginatedTable' {
  import { type DataTableProps } from '@layerfi/components/components/DataTable/DataTable';
  interface PaginationProps {
      pageSize?: number;
      hasMore?: boolean;
      fetchMore?: () => void;
  }
  interface PaginatedTableProps<TData, TColumns extends string> extends DataTableProps<TData, TColumns> {
      paginationProps: PaginationProps;
  }
  export function PaginatedTable<TData extends {
      id: string;
  }, TColumns extends string>({ data, isLoading, isError, columnConfig, componentName, ariaLabel, paginationProps, slots, }: PaginatedTableProps<TData, TColumns>): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/DatePicker/DatePicker' {
  import { type FC } from 'react';
  import { CustomDateRange } from '@layerfi/components/components/DatePicker/DatePickerOptions';
  import type { UnifiedPickerMode, DatePickerModeSelectorProps } from '@layerfi/components/components/DatePicker/ModeSelector/DatePickerModeSelector';
  type NavigationArrows = 'desktop' | 'mobile';
  interface DatePickerProps {
      displayMode: UnifiedPickerMode | 'timePicker';
      selected: Date | [Date, Date | null];
      onChange: (date: Date | [Date, Date | null]) => void;
      disabled?: boolean;
      allowedModes?: ReadonlyArray<UnifiedPickerMode>;
      dateFormat?: string;
      timeIntervals?: number;
      timeCaption?: string;
      placeholderText?: string;
      customDateRanges?: CustomDateRange[];
      wrapperClassName?: string;
      calendarClassName?: string;
      popperClassName?: string;
      currentDateOption?: boolean;
      minDate?: Date;
      maxDate?: Date | null;
      navigateArrows?: NavigationArrows[];
      onChangeMode?: (mode: UnifiedPickerMode) => void;
      slots?: {
          ModeSelector: FC<DatePickerModeSelectorProps>;
      };
      highlightYears?: number[];
  }
  export const DatePicker: ({ selected, onChange, disabled, displayMode, allowedModes, dateFormat, timeIntervals, timeCaption, placeholderText: _placeholderText, customDateRanges, wrapperClassName, calendarClassName, popperClassName, minDate, maxDate, currentDateOption, navigateArrows, highlightYears, onChangeMode, slots, ...props }: DatePickerProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/DatePicker/DatePickerOptions' {
  export type CustomDateRange = {
      label: string;
      startDate: Date;
      endDate: Date;
  };
  export const DatePickerOptions: ({ customDateRanges, setSelectedDate, }: {
      customDateRanges?: CustomDateRange[];
      setSelectedDate: (dates: [Date, Date | null]) => void;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/DatePicker/ModeSelector/DatePickerModeSelector' {
  import type { DatePickerMode, DateRangePickerMode } from '@layerfi/components/providers/GlobalDateStore/GlobalDateStoreProvider';
  export type UnifiedPickerMode = DatePickerMode | DateRangePickerMode;
  export const DEFAULT_ALLOWED_PICKER_MODES: readonly ["monthPicker"];
  export type DatePickerModeSelectorProps = {
      mode: UnifiedPickerMode;
      allowedModes: ReadonlyArray<UnifiedPickerMode>;
      onChangeMode: (mode: UnifiedPickerMode) => void;
  };
  export function DatePickerModeSelector({ mode, allowedModes, onChangeMode, }: DatePickerModeSelectorProps): import("react/jsx-runtime").JSX.Element | null;

}
declare module '@layerfi/components/components/DatePicker/index' {
  export { DatePicker } from '@layerfi/components/components/DatePicker/DatePicker';

}
declare module '@layerfi/components/components/DateTime/DateTime' {
  import { TextStyleProps } from '@layerfi/components/components/ui/Typography/Text';
  interface DateTimeProps {
      value: string;
      format?: string;
      dateFormat?: string;
      timeFormat?: string;
      onlyDate?: boolean;
      onlyTime?: boolean;
      slotProps?: {
          Date?: TextStyleProps;
          Time?: TextStyleProps;
      };
  }
  export const DateTime: ({ value, format, dateFormat, timeFormat, onlyDate, onlyTime, slotProps, }: DateTimeProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/DateTime/index' {
  export { DateTime } from '@layerfi/components/components/DateTime/DateTime';

}
declare module '@layerfi/components/components/DetailReportBreadcrumb/DetailReportBreadcrumb' {
  export interface BreadcrumbItem {
      name: string;
      display_name: string;
  }
  export interface DetailReportBreadcrumbProps {
      breadcrumbs: BreadcrumbItem[];
      subtitle?: string;
      onBreadcrumbClick?: (lineItemName: string) => void;
  }
  export const DetailReportBreadcrumb: ({ breadcrumbs, subtitle, onBreadcrumbClick, }: DetailReportBreadcrumbProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/DetailsList/DetailsList' {
  import { ReactNode } from 'react';
  export interface DetailsListProps {
      title?: ReactNode;
      className?: string;
      titleClassName?: string;
      children: ReactNode;
      actions?: ReactNode;
  }
  export const DetailsList: ({ title, children, className, titleClassName, actions, }: DetailsListProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/DetailsList/DetailsListItem' {
  import { ReactNode } from 'react';
  export interface DetailsListItemProps {
      label: string;
      children: ReactNode | string;
      isLoading?: boolean;
  }
  export const DetailsListItem: ({ label, children, isLoading, }: DetailsListItemProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/DetailsList/index' {
  export { DetailsList } from '@layerfi/components/components/DetailsList/DetailsList';
  export { DetailsListItem } from '@layerfi/components/components/DetailsList/DetailsListItem';

}
declare module '@layerfi/components/components/DueStatus/DueStatus' {
  export interface DueStatusProps {
      dueDate: Date | string;
      paidAt?: Date | string;
      size?: 'sm' | 'md';
  }
  export const DueStatus: ({ dueDate, paidAt, size }: DueStatusProps) => import("react/jsx-runtime").JSX.Element | null;

}
declare module '@layerfi/components/components/ErrorBoundary/ErrorBoundary' {
  import { ErrorInfo, Component, type PropsWithChildren } from 'react';
  import { LayerError } from '@layerfi/components/models/ErrorHandler';
  interface ErrorBoundaryProps {
      onError?: (error: LayerError) => void;
  }
  interface ErrorBoundaryState {
      hasError?: boolean;
  }
  export class ErrorBoundary extends Component<PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
      onError?: (err: LayerError) => void;
      constructor(props: PropsWithChildren<ErrorBoundaryProps>);
      static getDerivedStateFromError(_error: Error): {
          hasError: boolean;
      };
      componentDidCatch(error: Error, _info: ErrorInfo): void;
      render(): string | number | boolean | Iterable<import("react").ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined;
  }
  export {};

}
declare module '@layerfi/components/components/ErrorBoundary/ErrorBoundaryMessage' {
  export const ErrorBoundaryMessage: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ErrorBoundary/index' {
  export { ErrorBoundary } from '@layerfi/components/components/ErrorBoundary/ErrorBoundary';

}
declare module '@layerfi/components/components/ExpandedBankTransactionRow/APIErrorNotifications' {
  import { BankTransaction } from '@layerfi/components/types';
  interface APIErrorNotificationsProps {
      bankTransaction: BankTransaction;
      containerWidth?: number;
  }
  export const APIErrorNotifications: ({ bankTransaction, containerWidth, }: APIErrorNotificationsProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ExpandedBankTransactionRow/ExpandedBankTransactionRow' {
  import { BankTransaction } from '@layerfi/components/types';
  type Props = {
      bankTransaction: BankTransaction;
      isOpen?: boolean;
      close: () => void;
      asListItem?: boolean;
      submitBtnText?: string;
      containerWidth?: number;
      categorized?: boolean;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showTooltips: boolean;
  };
  export type SaveHandle = {
      save: () => void;
  };
  export interface DocumentWithStatus {
      id?: string;
      url?: string;
      status: 'pending' | 'uploaded' | 'failed' | 'deleting';
      type?: string;
      name?: string;
      date?: string;
      error?: string;
  }
  const ExpandedBankTransactionRow: import("react").ForwardRefExoticComponent<Props & import("react").RefAttributes<SaveHandle>>;
  export { ExpandedBankTransactionRow };

}
declare module '@layerfi/components/components/ExpandedBankTransactionRow/index' {
  export { ExpandedBankTransactionRow } from '@layerfi/components/components/ExpandedBankTransactionRow/ExpandedBankTransactionRow';

}
declare module '@layerfi/components/components/FileThumb/FileThumb' {
  type FileThumbProps = {
      url?: string;
      type?: string;
      floatingActions?: boolean;
      uploadPending?: boolean;
      deletePending?: boolean;
      name?: string;
      date?: string;
      onDelete?: () => void;
      enableOpen?: boolean;
      onOpen?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
      enableDownload?: boolean;
      error?: string;
  };
  export const FileThumb: ({ url, floatingActions, uploadPending, deletePending, name, date, onDelete, enableOpen, onOpen, enableDownload, error, }: FileThumbProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/FileThumb/index' {
  export { FileThumb } from '@layerfi/components/components/FileThumb/FileThumb';

}
declare module '@layerfi/components/components/Header/Header' {
  import { CSSProperties, ReactNode } from 'react';
  export interface HeaderProps {
      className?: string;
      style?: CSSProperties;
      asHeader?: boolean;
      sticky?: boolean;
      rounded?: boolean;
      children: ReactNode;
  }
  const Header: import("react").ForwardRefExoticComponent<HeaderProps & import("react").RefAttributes<HTMLDivElement | HTMLElement>>;
  export { Header };

}
declare module '@layerfi/components/components/Header/HeaderCol' {
  import { CSSProperties, ReactNode } from 'react';
  interface HeaderColProps {
      className?: string;
      style?: CSSProperties;
      noPadding?: boolean;
      children: ReactNode;
  }
  export const HeaderCol: ({ className, children, style, noPadding }: HeaderColProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Header/HeaderRow' {
  import { CSSProperties, ReactNode } from 'react';
  interface HeaderRowProps {
      className?: string;
      style?: CSSProperties;
      children: ReactNode;
      direction?: 'row' | 'col';
  }
  export const HeaderRow: ({ className, children, direction, style }: HeaderRowProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Header/index' {
  export { Header } from '@layerfi/components/components/Header/Header';
  export { HeaderRow } from '@layerfi/components/components/Header/HeaderRow';
  export { HeaderCol } from '@layerfi/components/components/Header/HeaderCol';

}
declare module '@layerfi/components/components/HoverMenu/HoverMenu' {
  import { ReactNode } from 'react';
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  export type HoverMenuProps = {
      children: ReactNode;
      config: Array<{
          name: string;
          action: () => Awaitable<void>;
      }>;
  };
  export const HoverMenu: ({ children, config }: HoverMenuProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/HoverMenu/index' {
  export { HoverMenu, HoverMenuProps } from '@layerfi/components/components/HoverMenu/HoverMenu';

}
declare module '@layerfi/components/components/IconBox/IconBox' {
  import { ReactNode } from 'react';
  interface IconBoxProps {
      children: ReactNode;
  }
  export const IconBox: ({ children }: IconBoxProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/IconBox/index' {
  export { IconBox } from '@layerfi/components/components/IconBox/IconBox';

}
declare module '@layerfi/components/components/Input/AmountInput' {
  import { type ReactNode } from 'react';
  import { CurrencyInputProps } from 'react-currency-input-field';
  export interface AmountInputProps extends Omit<CurrencyInputProps, 'onChange'> {
      onChange?: (value?: string) => void;
      isInvalid?: boolean;
      errorMessage?: string;
      leftText?: string;
      badge?: ReactNode;
  }
  export const AmountInput: ({ onChange, className, leftText, errorMessage, isInvalid, badge, placeholder, ...props }: AmountInputProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/BusinessTypeSelect' {
  import { ENTITY_TYPES, EntityType } from '@layerfi/components/types/business';
  export const findSelectOption: (options: typeof ENTITY_TYPES, value?: EntityType) => {
      readonly value: "SOLE_PROP";
      readonly label: "Sole Proprietorship";
  } | {
      readonly value: "C_CORP";
      readonly label: "C Corporation";
  } | {
      readonly value: "LLC";
      readonly label: "Limited Liability Company";
  } | {
      readonly value: "S_CORP";
      readonly label: "S Corporation";
  } | {
      readonly value: "PARTNERSHIP";
      readonly label: "Partnership";
  } | undefined;
  export type BusinessTypeSelectProps = {
      value?: EntityType;
      onChange: (value: EntityType) => void;
  };
  export const BusinessTypeSelect: ({ value, onChange }: BusinessTypeSelectProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/CreatableSelect' {
  import { ReactNode } from 'react';
  import { GroupBase } from 'react-select';
  import { type CreatableProps } from 'react-select/creatable';
  import { type SelectProps } from '@layerfi/components/components/Input/Select';
  export interface CreatableSelectProps<T> extends Omit<SelectProps<T>, 'value' | 'onChange'> {
      value?: T | null;
      onChange: (selected: T | null) => void;
      isClearable?: boolean;
      onCreateOption?: (inputValue: string) => void;
      isValidNewOption?: CreatableProps<T, false, GroupBase<T>>['isValidNewOption'];
      formatCreateLabel?: (inputValue: string) => ReactNode;
      createOptionPosition?: 'first' | 'last';
  }
  export const CreatableSelect: <T>({ name, options, className, classNamePrefix, value, onChange, disabled, placeholder, isInvalid, errorMessage, formatOptionLabel, onCreateOption, isValidNewOption, formatCreateLabel, inputId, isLoading, isClearable, createOptionPosition, }: CreatableSelectProps<T>) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/FileInput' {
  export interface FileInputProps {
      text?: string;
      onUpload?: (files: File[]) => void;
      disabled?: boolean;
      secondary?: boolean;
      iconOnly?: boolean;
      icon?: React.ReactNode;
      allowMultipleUploads?: boolean;
  }
  export const FileInput: ({ text, onUpload, disabled, secondary, iconOnly, icon, allowMultipleUploads, }: FileInputProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/FormSection' {
  import { ReactNode } from 'react';
  type FormSectionProps = {
      title?: string;
      children: ReactNode | ReactNode[];
  };
  export const FormSection: ({ children, title }: FormSectionProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Input/Input' {
  import { HTMLProps } from 'react';
  export interface InputProps extends HTMLProps<HTMLInputElement> {
      isInvalid?: boolean;
      errorMessage?: string;
      leftText?: string;
  }
  export const Input: ({ className, isInvalid, errorMessage, leftText, ...props }: InputProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/InputGroup' {
  import { ReactNode } from 'react';
  export interface InputGroupProps {
      label?: string;
      name?: string;
      className?: string;
      children?: ReactNode;
      inline?: boolean;
  }
  export const InputGroup: ({ label, name, className, inline, children, }: InputGroupProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/MultiSelect' {
  import { GroupBase, MultiValue, OptionsOrGroups, StylesConfig } from 'react-select';
  export interface SelectProps<T> {
      name?: string;
      options?: OptionsOrGroups<T, GroupBase<T>>;
      className?: string;
      classNamePrefix?: string;
      value?: T[];
      defaultValue?: T[];
      onChange: (selected: MultiValue<T>) => void;
      disabled?: boolean;
      placeholder?: string;
      isInvalid?: boolean;
      errorMessage?: string;
      styles?: StylesConfig<T, true, GroupBase<T>>;
      inputId?: string;
      isLoading?: boolean;
  }
  export const MultiSelect: <T>({ name, options, className, classNamePrefix, value, defaultValue, onChange, disabled, placeholder, isInvalid, errorMessage, styles, inputId, isLoading, }: SelectProps<T>) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/PhoneInput' {
  import { InputProps } from '@layerfi/components/components/Input/Input';
  interface PhoneInputProps extends Omit<InputProps, 'onChange' | 'value'> {
      value?: string;
      onChange: (value?: string) => void;
  }
  export const PhoneInput: ({ value, onChange, placeholder, ...props }: PhoneInputProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Input/Select' {
  import { type ReactNode } from 'react';
  import { FormatOptionLabelMeta, GroupBase, OptionsOrGroups } from 'react-select';
  export interface SelectProps<T> {
      name?: string;
      options?: OptionsOrGroups<T, GroupBase<T>>;
      className?: string;
      classNamePrefix?: string;
      value?: T;
      onChange: (selected: T) => void;
      disabled?: boolean;
      placeholder?: string;
      isInvalid?: boolean;
      errorMessage?: string;
      inputId?: string;
      isLoading?: boolean;
      formatOptionLabel?: (option: T, meta?: FormatOptionLabelMeta<T>) => ReactNode;
  }
  export const Select: <T>({ name, options, className, classNamePrefix, value, onChange, disabled, placeholder, isInvalid, errorMessage, inputId, isLoading, formatOptionLabel, }: SelectProps<T>) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/StaticValue' {
  import { TextProps } from '@layerfi/components/components/Typography/Text';
  export type StaticValueProps = TextProps;
  /**
   * Use in places where you want to show a static value instead of (disabled) input.
   * Usually it can be used on a summary view after submitting the form,
   * where showing disable input doesn't look right.
   */
  export const StaticValue: (props: StaticValueProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/USStateSelect' {
  import { BaseSelectOption } from '@layerfi/components/types/general';
  import { USState } from '@layerfi/components/types/location';
  export const findSelectOption: (options: BaseSelectOption[], selected?: string) => BaseSelectOption | undefined;
  export type USStateSelecttProps = {
      value?: string;
      onChange: (value: USState) => void;
  };
  export const USStateSelect: ({ value, onChange }: USStateSelecttProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Input/index' {
  export { Input } from '@layerfi/components/components/Input/Input';
  export { InputGroup } from '@layerfi/components/components/Input/InputGroup';
  export { FileInput } from '@layerfi/components/components/Input/FileInput';
  export { Select } from '@layerfi/components/components/Input/Select';
  export { MultiSelect } from '@layerfi/components/components/Input/MultiSelect';

}
declare module '@layerfi/components/components/Integrations/Integrations' {
  export interface IntegrationsProps {
      stringOverrides?: {
          title?: string;
      };
  }
  export const Integrations: (props: IntegrationsProps) => import("react/jsx-runtime").JSX.Element;
  export const IntegrationsComponent: ({ stringOverrides, }: IntegrationsProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Integrations/IntegrationsConnectMenu/IntegrationsConnectMenu' {
  export const IntegrationsConnectMenu: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Integrations/IntegrationsContent' {
  export const IntegrationsContent: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Integrations/IntegrationsQuickbooksItemThumb/IntegrationsQuickbooksItemThumb' {
  export const IntegrationsQuickbooksItemThumb: () => import("react/jsx-runtime").JSX.Element | null;

}
declare module '@layerfi/components/components/Integrations/IntegrationsQuickbooksItemThumb/IntegrationsQuickbooksItemThumbFooter' {
  import { QuickbooksConnectionSyncUiState } from '@layerfi/components/components/Integrations/IntegrationsQuickbooksItemThumb/utils';
  type IntegrationsQuickbooksItemThumbFooterProps = {
      quickbooksUiState: QuickbooksConnectionSyncUiState;
  };
  export const IntegrationsQuickbooksItemThumbFooter: ({ quickbooksUiState }: IntegrationsQuickbooksItemThumbFooterProps) => import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/Integrations/IntegrationsQuickbooksItemThumb/IntegrationsQuickbooksUnlinkConfirmationModal' {
  import { ModalProps } from '@layerfi/components/components/ui/Modal/Modal';
  type IntegrationsQuickbooksUnlinkConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>;
  export function IntegrationsQuickbooksUnlinkConfirmationModal({ isOpen, onOpenChange }: IntegrationsQuickbooksUnlinkConfirmationModalProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Integrations/IntegrationsQuickbooksItemThumb/utils' {
  import { StatusOfQuickbooksConnection } from '@layerfi/components/types/quickbooks';
  export enum QuickbooksConnectionSyncUiState {
      Syncing = "Syncing",
      SyncFailed = "SyncFailed",
      SyncSuccess = "SyncSuccess",
      Connected = "Connected"
  }
  export const getQuickbooksConnectionSyncUiState: (quickbooksConnectionStatus: StatusOfQuickbooksConnection) => QuickbooksConnectionSyncUiState;

}
declare module '@layerfi/components/components/Invoices/InvoiceDetail/InvoiceDetail' {
  export const InvoiceDetail: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Invoices/InvoiceDetail/InvoiceDetailHeaderMenu' {
  type InvoiceDetailHeaderMenuProps = {
      onEditInvoice: () => void;
  };
  export const InvoiceDetailHeaderMenu: ({ onEditInvoice }: InvoiceDetailHeaderMenuProps) => import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/Invoices/InvoiceForm/InvoiceForm' {
  import React, { type PropsWithChildren } from 'react';
  import type { Invoice, InvoiceForm as InvoiceFormType } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { UpsertInvoiceMode } from '@layerfi/components/features/invoices/api/useUpsertInvoice';
  import { type InvoiceFormState } from '@layerfi/components/components/Invoices/InvoiceForm/formUtils';
  import type { AppForm } from '@layerfi/components/features/forms/hooks/useForm';
  type InvoiceFormLineItemRowProps = PropsWithChildren<{
      form: AppForm<InvoiceFormType>;
      index: number;
      isReadOnly: boolean;
      onDeleteLine: () => void;
  }>;
  export const InvoiceFormLineItemRow: ({ form, index, isReadOnly, onDeleteLine }: InvoiceFormLineItemRowProps) => import("react/jsx-runtime").JSX.Element;
  export type InvoiceFormMode = {
      mode: UpsertInvoiceMode.Update;
      invoice: Invoice;
  } | {
      mode: UpsertInvoiceMode.Create;
  };
  export type InvoiceFormProps = {
      isReadOnly: boolean;
      onSuccess: (invoice: Invoice) => void;
      onChangeFormState?: (formState: InvoiceFormState) => void;
  };
  export const InvoiceForm: React.ForwardRefExoticComponent<InvoiceFormProps & React.RefAttributes<unknown>>;
  export {};

}
declare module '@layerfi/components/components/Invoices/InvoiceForm/formUtils' {
  import { type Invoice, type InvoiceForm, type InvoiceFormLineItem } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { type Tag } from '@layerfi/components/features/tags/tagSchemas';
  export const INVOICE_MECE_TAG_DIMENSION = "Job";
  export type InvoiceFormState = {
      isDirty: boolean;
      isSubmitting: boolean;
  };
  export const EMPTY_LINE_ITEM: InvoiceFormLineItem;
  export const getInvoiceFormDefaultValues: () => InvoiceForm;
  export const getAdditionalTags: (tags: readonly Tag[]) => Tag[];
  export const getSelectedTag: (tags: readonly Tag[]) => Tag | null;
  export const getInvoiceFormInitialValues: (invoice: Invoice) => InvoiceForm;
  export const validateInvoiceForm: ({ value: invoice }: {
      value: InvoiceForm;
  }) => ({
      customer: string;
      invoiceNumber?: undefined;
      sentAt?: undefined;
      dueAt?: undefined;
      lineItems?: undefined;
  } | {
      invoiceNumber: string;
      customer?: undefined;
      sentAt?: undefined;
      dueAt?: undefined;
      lineItems?: undefined;
  } | {
      sentAt: string;
      customer?: undefined;
      invoiceNumber?: undefined;
      dueAt?: undefined;
      lineItems?: undefined;
  } | {
      dueAt: string;
      customer?: undefined;
      invoiceNumber?: undefined;
      sentAt?: undefined;
      lineItems?: undefined;
  } | {
      lineItems: string;
      customer?: undefined;
      invoiceNumber?: undefined;
      sentAt?: undefined;
      dueAt?: undefined;
  })[] | null;
  export const convertInvoiceFormToParams: (form: InvoiceForm) => unknown;

}
declare module '@layerfi/components/components/Invoices/InvoiceForm/totalsUtils' {
  import { BigDecimal as BD } from 'effect';
  import type { InvoiceForm, InvoiceFormLineItem } from '@layerfi/components/features/invoices/invoiceSchemas';
  export function computeSubtotal(lineItems: InvoiceFormLineItem[]): BD.BigDecimal;
  export function computeSubtotal(lineItems: readonly InvoiceFormLineItem[]): BD.BigDecimal;
  export const computeRawTaxableSubtotal: (lineItems: InvoiceFormLineItem[]) => BD.BigDecimal;
  export function computeAdditionalDiscount({ subtotal, discountRate, }: {
      subtotal: BD.BigDecimal;
      discountRate: BD.BigDecimal;
  }): BD.BigDecimal;
  export function computeTaxableSubtotal({ rawTaxableSubtotal, discountRate, }: {
      rawTaxableSubtotal: BD.BigDecimal;
      discountRate: BD.BigDecimal;
  }): BD.BigDecimal;
  export function computeTaxes({ taxableSubtotal, taxRate, }: {
      taxableSubtotal: BD.BigDecimal;
      taxRate: BD.BigDecimal;
  }): BD.BigDecimal;
  export function computeGrandTotal({ subtotal, additionalDiscount, taxes, }: {
      subtotal: BD.BigDecimal;
      additionalDiscount: BD.BigDecimal;
      taxes: BD.BigDecimal;
  }): BD.BigDecimal;
  export const getGrandTotalFromInvoice: (invoice: InvoiceForm) => BD.BigDecimal;

}
declare module '@layerfi/components/components/Invoices/InvoiceForm/useInvoiceForm' {
  import { type Invoice, type InvoiceForm } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { UpsertInvoiceMode } from '@layerfi/components/features/invoices/api/useUpsertInvoice';
  type onSuccessFn = (invoice: Invoice) => void;
  type UseInvoiceFormProps = {
      onSuccess: onSuccessFn;
      mode: UpsertInvoiceMode.Create;
  } | {
      onSuccess: onSuccessFn;
      mode: UpsertInvoiceMode.Update;
      invoice: Invoice;
  };
  export const useInvoiceForm: (props: UseInvoiceFormProps) => {
      form: import("@tanstack/react-form").AppFieldExtendedReactFormApi<InvoiceForm, import("@tanstack/react-form").FormValidateOrFn<InvoiceForm>, import("@tanstack/react-form").FormValidateOrFn<InvoiceForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<InvoiceForm>, import("@tanstack/react-form").FormValidateOrFn<InvoiceForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<InvoiceForm>, import("@tanstack/react-form").FormValidateOrFn<InvoiceForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<InvoiceForm>, import("@tanstack/react-form").FormValidateOrFn<InvoiceForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<InvoiceForm>, import("@tanstack/react-form").FormAsyncValidateOrFn<InvoiceForm>, unknown, {
          readonly BaseFormTextField: typeof import("@layerfi/components/features/forms/components/BaseFormTextField").BaseFormTextField;
          readonly FormBigDecimalField: typeof import("@layerfi/components/features/forms/components/FormBigDecimalField").FormBigDecimalField;
          readonly FormCheckboxField: typeof import("@layerfi/components/features/forms/components/FormCheckboxField").FormCheckboxField;
          readonly FormDateField: typeof import("@layerfi/components/features/forms/components/FormDateField").FormDateField;
          readonly FormTextAreaField: typeof import("@layerfi/components/features/forms/components/FormTextAreaField").FormTextAreaField;
          readonly FormTextField: typeof import("@layerfi/components/features/forms/components/FormTextField").FormTextField;
      }, {}>;
      formState: {
          isDirty: boolean;
          isSubmitting: boolean;
      };
      totals: {
          subtotal: import("effect/BigDecimal").BigDecimal;
          additionalDiscount: import("effect/BigDecimal").BigDecimal;
          taxableSubtotal: import("effect/BigDecimal").BigDecimal;
          taxes: import("effect/BigDecimal").BigDecimal;
          grandTotal: import("effect/BigDecimal").BigDecimal;
      };
      submitError: string | undefined;
  };
  export {};

}
declare module '@layerfi/components/components/Invoices/InvoiceOverview/InvoiceOverview' {
  export const InvoiceOverview: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Invoices/InvoicePaymentForm/InvoicePaymentForm' {
  import type { Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  import type { InvoicePayment } from '@layerfi/components/features/invoices/invoicePaymentSchemas';
  import type { UpsertDedicatedInvoicePaymentMode } from '@layerfi/components/features/invoices/api/useUpsertDedicatedInvoicePayment';
  export type InvoicePaymentFormMode = {
      mode: UpsertDedicatedInvoicePaymentMode.Update;
      invoice: Invoice;
      invoicePayment: InvoicePayment;
  } | {
      mode: UpsertDedicatedInvoicePaymentMode.Create;
      invoice: Invoice;
  };
  export type InvoicePaymentFormProps = InvoicePaymentFormMode & {
      isReadOnly?: boolean;
      onSuccess: (invoicePayment: InvoicePayment) => void;
  };
  export const InvoicePaymentForm: (props: InvoicePaymentFormProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Invoices/InvoicePaymentForm/formUtils' {
  import { type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { type DedicatedInvoicePaymentForm } from '@layerfi/components/features/invoices/invoicePaymentSchemas';
  export const getInvoicePaymentFormDefaultValues: (invoice: Invoice) => DedicatedInvoicePaymentForm;
  export const validateInvoicePaymentForm: ({ invoicePayment, invoice }: {
      invoicePayment: DedicatedInvoicePaymentForm;
      invoice: Invoice;
  }) => ({
      amount: string;
      paidAt?: undefined;
      method?: undefined;
  } | {
      paidAt: string;
      amount?: undefined;
      method?: undefined;
  } | {
      method: string;
      amount?: undefined;
      paidAt?: undefined;
  })[] | null;
  export const convertInvoicePaymentFormToParams: (form: DedicatedInvoicePaymentForm) => unknown;

}
declare module '@layerfi/components/components/Invoices/InvoicePaymentForm/useInvoicePaymentForm' {
  import { type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { type InvoicePayment } from '@layerfi/components/features/invoices/invoicePaymentSchemas';
  type onSuccessFn = (invoicePayment: InvoicePayment) => void;
  type UseInvoicePaymentFormProps = {
      onSuccess: onSuccessFn;
      invoice: Invoice;
  };
  export const useInvoicePaymentForm: (props: UseInvoicePaymentFormProps) => {
      form: import("@tanstack/react-form").AppFieldExtendedReactFormApi<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }, import("@tanstack/react-form").FormValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, import("@tanstack/react-form").FormValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, import("@tanstack/react-form").FormValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, import("@tanstack/react-form").FormValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, import("@tanstack/react-form").FormValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly memo: string;
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly referenceNumber: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
          readonly paidAt: import("@internationalized/date").ZonedDateTime | null;
      }>, unknown, {
          readonly BaseFormTextField: typeof import("@layerfi/components/features/forms/components/BaseFormTextField").BaseFormTextField;
          readonly FormBigDecimalField: typeof import("@layerfi/components/features/forms/components/FormBigDecimalField").FormBigDecimalField;
          readonly FormCheckboxField: typeof import("@layerfi/components/features/forms/components/FormCheckboxField").FormCheckboxField;
          readonly FormDateField: typeof import("@layerfi/components/features/forms/components/FormDateField").FormDateField;
          readonly FormTextAreaField: typeof import("@layerfi/components/features/forms/components/FormTextAreaField").FormTextAreaField;
          readonly FormTextField: typeof import("@layerfi/components/features/forms/components/FormTextField").FormTextField;
      }, {}>;
      submitError: string | undefined;
  };
  export {};

}
declare module '@layerfi/components/components/Invoices/InvoiceRefundForm/InvoiceRefundForm' {
  import React from 'react';
  import type { Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  import type { CustomerRefund } from '@layerfi/components/features/invoices/customerRefundSchemas';
  export type InvoiceRefundFormProps = {
      onSuccess: (refund: CustomerRefund) => void;
      invoice: Invoice;
  };
  export const InvoiceRefundForm: React.ForwardRefExoticComponent<InvoiceRefundFormProps & React.RefAttributes<unknown>>;

}
declare module '@layerfi/components/components/Invoices/InvoiceRefundForm/formUtils' {
  import { type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  import type { InvoiceRefundForm } from '@layerfi/components/components/Invoices/InvoiceRefundForm/invoiceRefundFormSchemas';
  export const getInvoiceRefundFormDefaultValues: (invoice: Invoice) => InvoiceRefundForm;
  export const validateInvoiceRefundForm: ({ invoiceRefund, invoice }: {
      invoiceRefund: InvoiceRefundForm;
      invoice: Invoice;
  }) => ({
      completedAt: string;
      method?: undefined;
  } | {
      method: string;
      completedAt?: undefined;
  })[] | null;
  export const convertInvoiceRefundFormToParams: (form: InvoiceRefundForm) => unknown;

}
declare module '@layerfi/components/components/Invoices/InvoiceRefundForm/invoiceRefundFormSchemas' {
  import { Schema } from 'effect';
  export const InvoiceRefundFormSchema: Schema.Struct<{
      amount: typeof Schema.BigDecimal;
      method: Schema.NullOr<Schema.Enums<typeof import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod>>;
      completedAt: Schema.NullOr<Schema.declare<import("@internationalized/date").ZonedDateTime, import("@internationalized/date").ZonedDateTime, readonly [], never>>;
  }>;
  export type InvoiceRefundForm = typeof InvoiceRefundFormSchema.Type;

}
declare module '@layerfi/components/components/Invoices/InvoiceRefundForm/useInvoiceRefundForm' {
  import { type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { type CustomerRefund } from '@layerfi/components/features/invoices/customerRefundSchemas';
  type onSuccessFn = (refund: CustomerRefund) => void;
  type UseInvoiceRefundFormProps = {
      onSuccess: onSuccessFn;
      invoice: Invoice;
  };
  export const useInvoiceRefundForm: ({ onSuccess, invoice }: UseInvoiceRefundFormProps) => {
      form: import("@tanstack/react-form").AppFieldExtendedReactFormApi<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }, import("@tanstack/react-form").FormValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, import("@tanstack/react-form").FormValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, import("@tanstack/react-form").FormValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, import("@tanstack/react-form").FormValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, import("@tanstack/react-form").FormValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, import("@tanstack/react-form").FormAsyncValidateOrFn<{
          readonly amount: import("effect/BigDecimal").BigDecimal;
          readonly completedAt: import("@internationalized/date").ZonedDateTime | null;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod | null;
      }>, unknown, {
          readonly BaseFormTextField: typeof import("@layerfi/components/features/forms/components/BaseFormTextField").BaseFormTextField;
          readonly FormBigDecimalField: typeof import("@layerfi/components/features/forms/components/FormBigDecimalField").FormBigDecimalField;
          readonly FormCheckboxField: typeof import("@layerfi/components/features/forms/components/FormCheckboxField").FormCheckboxField;
          readonly FormDateField: typeof import("@layerfi/components/features/forms/components/FormDateField").FormDateField;
          readonly FormTextAreaField: typeof import("@layerfi/components/features/forms/components/FormTextAreaField").FormTextAreaField;
          readonly FormTextField: typeof import("@layerfi/components/features/forms/components/FormTextField").FormTextField;
      }, {}>;
      submitError: string | undefined;
  };
  export {};

}
declare module '@layerfi/components/components/Invoices/InvoiceStatusCell/InvoiceStatusCell' {
  import { type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  export const InvoiceStatusCell: ({ invoice, inline }: {
      invoice: Invoice;
      inline?: boolean;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Invoices/InvoiceSummaryStats/InvoiceSummaryStats' {
  export const InvoiceSummaryStats: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Invoices/InvoiceTable/InvoiceTable' {
  enum InvoiceStatusFilter {
      All = "All",
      Unpaid = "Unpaid",
      Overdue = "Overdue",
      Sent = "Sent",
      Paid = "Paid",
      WrittenOff = "Written Off",
      Voided = "Voided",
      Refunded = "Refunded"
  }
  export type InvoiceStatusOption = {
      label: string;
      value: InvoiceStatusFilter;
  };
  export const ALL_OPTION: {
      label: string;
      value: InvoiceStatusFilter;
  };
  export const InvoiceTable: () => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Invoices/InvoiceTermsComboBox/InvoiceTermsComboBox' {
  import { ZonedDateTime } from '@internationalized/date';
  export enum InvoiceTermsValues {
      Net10 = "Net10",
      Net15 = "Net15",
      Net30 = "Net30",
      Net60 = "Net60",
      Net90 = "Net90",
      Custom = "Custom"
  }
  export const getDurationInDaysFromTerms: (terms: InvoiceTermsValues) => 15 | 60 | 30 | 10 | 90 | undefined;
  export const getInvoiceTermsFromDates: (sentAt: ZonedDateTime | null, dueAt: ZonedDateTime | null) => InvoiceTermsValues;
  type InvoiceTermsComboBoxProps = {
      value: InvoiceTermsValues;
      onValueChange: (value: InvoiceTermsValues | null) => void;
      isReadOnly?: boolean;
  };
  export const InvoiceTermsComboBox: ({ value, onValueChange, isReadOnly }: InvoiceTermsComboBoxProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Invoices/Invoices' {
  interface InvoicesStringOverrides {
      title?: string;
  }
  export interface InvoicesProps {
      showTitle?: boolean;
      stringOverrides?: InvoicesStringOverrides;
  }
  export const Invoices: ({ showTitle, stringOverrides }: InvoicesProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Invoices/Modal/InvoiceRefundModal' {
  import { ModalProps } from '@layerfi/components/components/ui/Modal/Modal';
  import type { Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  type InvoiceRefundModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
      invoice: Invoice;
      onSuccess: (invoice: Invoice) => void;
  };
  export function InvoiceRefundModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceRefundModalProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Invoices/Modal/InvoiceResetModal' {
  import { ModalProps } from '@layerfi/components/components/ui/Modal/Modal';
  import { type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  type InvoiceResetModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
      invoice: Invoice;
      onSuccess: (invoice: Invoice) => void;
  };
  export function InvoiceResetModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceResetModalProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Invoices/Modal/InvoiceVoidModal' {
  import { ModalProps } from '@layerfi/components/components/ui/Modal/Modal';
  import type { Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  type InvoiceVoidModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
      invoiceId: string;
      onSuccess: (invoice: Invoice) => void;
  };
  export function InvoiceVoidModal({ isOpen, onOpenChange, invoiceId, onSuccess }: InvoiceVoidModalProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Invoices/Modal/InvoiceWriteoffModal' {
  import { ModalProps } from '@layerfi/components/components/ui/Modal/Modal';
  import type { Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  type InvoiceWriteoffModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
      invoice: Invoice;
      onSuccess: (invoice: Invoice) => void;
  };
  export function InvoiceWriteoffModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceWriteoffModalProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Journal/Journal' {
  import { JournalTableStringOverrides } from '@layerfi/components/components/JournalTable/JournalTableWithPanel';
  import { LinkingMetadata } from '@layerfi/components/contexts/InAppLinkContext';
  import { ReactNode } from 'react';
  export interface JournalConfig {
      form: {
          addEntryLinesLimit?: number;
      };
  }
  export interface JournalStringOverrides {
      journalTable?: JournalTableStringOverrides;
  }
  export interface JournalProps {
      asWidget?: boolean;
      config?: JournalConfig;
      stringOverrides?: JournalStringOverrides;
      renderInAppLink?: (source: LinkingMetadata) => ReactNode;
  }
  export const JOURNAL_CONFIG: JournalConfig;
  export const Journal: (props: JournalProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Journal/download/JournalEntriesDownloadButton' {
  type JournalEntriesDownloadButtonProps = {
      startCutoff?: Date;
      endCutoff?: Date;
      iconOnly?: boolean;
  };
  export function JournalEntriesDownloadButton({ startCutoff, endCutoff, iconOnly, }: JournalEntriesDownloadButtonProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Journal/download/useJournalEntriesDownload' {
  import type { S3PresignedUrl } from '@layerfi/components/types/general';
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  import { APIError } from '@layerfi/components/models/APIError';
  type UseJournalEntriesDownloadOptions = {
      startCutoff?: Date;
      endCutoff?: Date;
      onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>;
  };
  type MutationParams = () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      startCutoff: Date | undefined;
      endCutoff: Date | undefined;
  } | undefined;
  export function useJournalEntriesDownload({ startCutoff, endCutoff, onSuccess, }: UseJournalEntriesDownloadOptions): import("swr/mutation").SWRMutationResponse<unknown, APIError | Error, MutationParams, never>;
  export {};

}
declare module '@layerfi/components/components/Journal/index' {
  export { Journal } from '@layerfi/components/components/Journal/Journal';

}
declare module '@layerfi/components/components/JournalEntryDetails/JournalEntryDetails' {
  export const JournalEntryDetails: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/JournalEntryDetails/index' {
  export { JournalEntryDetails } from '@layerfi/components/components/JournalEntryDetails/JournalEntryDetails';

}
declare module '@layerfi/components/components/JournalForm/JournalForm' {
  import { JournalConfig } from '@layerfi/components/components/Journal/Journal';
  export interface JournalFormStringOverrides {
      header?: string;
      cancelButton?: string;
      retryButton?: string;
      saveButton?: string;
  }
  export const JournalForm: ({ config, stringOverrides, }: {
      config: JournalConfig;
      stringOverrides?: JournalFormStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/JournalForm/JournalFormEntryLines' {
  import { LedgerAccountBalance } from '@layerfi/components/types/journal';
  import { BaseSelectOption } from '@layerfi/components/types/general';
  import { JournalConfig } from '@layerfi/components/components/Journal/Journal';
  import { JournalEntryLineItem } from '@layerfi/components/types/journal';
  import { LedgerEntryDirection } from '@layerfi/components/schemas/generalLedger/ledgerAccount';
  export const JournalFormEntryLines: ({ entrylineItems, addEntryLine, removeEntryLine, changeFormData, sendingForm, config, }: {
      entrylineItems: JournalEntryLineItem[];
      addEntryLine: (direction: LedgerEntryDirection) => void;
      removeEntryLine: (index: number) => void;
      changeFormData: (name: string, value: string | BaseSelectOption | number | undefined, lineItemIndex: number, accounts?: LedgerAccountBalance[]) => void;
      sendingForm: boolean;
      config: JournalConfig;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/JournalForm/index' {
  export { JournalForm } from '@layerfi/components/components/JournalForm/JournalForm';

}
declare module '@layerfi/components/components/JournalSidebar/JournalSidebar' {
  import { RefObject } from 'react';
  import { JournalConfig } from '@layerfi/components/components/Journal/Journal';
  import { JournalFormStringOverrides } from '@layerfi/components/components/JournalForm/JournalForm';
  export const JournalSidebar: ({ parentRef: _parentRef, config, stringOverrides, }: {
      parentRef?: RefObject<HTMLDivElement>;
      config: JournalConfig;
      stringOverrides?: JournalFormStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/JournalSidebar/index' {
  export { JournalSidebar } from '@layerfi/components/components/JournalSidebar/JournalSidebar';

}
declare module '@layerfi/components/components/JournalTable/JournalTable' {
  import { JournalEntry } from '@layerfi/components/types';
  import { View } from '@layerfi/components/types/general';
  import { JournalTableStringOverrides } from '@layerfi/components/components/JournalTable/JournalTableWithPanel';
  export const JournalTable: ({ view, data, stringOverrides, }: {
      view: View;
      data: JournalEntry[];
      stringOverrides?: JournalTableStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/JournalTable/JournalTableWithPanel' {
  import { RefObject } from 'react';
  import { View } from '@layerfi/components/types/general';
  import { JournalConfig } from '@layerfi/components/components/Journal/Journal';
  export interface JournalTableStringOverrides {
      componentTitle?: string;
      componentSubtitle?: string;
      addEntryButton?: string;
      idColumnHeader?: string;
      dateColumnHeader?: string;
      transactionColumnHeader?: string;
      accountNumberColumnHeader?: string;
      accountColumnHeader?: string;
      debitColumnHeader?: string;
      creditColumnHeader?: string;
  }
  export const JournalTableWithPanel: ({ containerRef, pageSize, config, stringOverrides, view, }: {
      view: View;
      containerRef: RefObject<HTMLDivElement>;
      pageSize?: number;
      config: JournalConfig;
      stringOverrides?: JournalTableStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/JournalTable/index' {
  export { JournalTableWithPanel as JournalTable } from '@layerfi/components/components/JournalTable/JournalTableWithPanel';

}
declare module '@layerfi/components/components/LedgerAccount/LedgerAccountIndex' {
  import { RefObject } from 'react';
  import { View } from '@layerfi/components/types/general';
  import { LedgerAccountEntryDetailsStringOverrides } from '@layerfi/components/components/LedgerAccountEntryDetails/LedgerAccountEntryDetails';
  interface LedgerEntriesTableStringOverrides {
      dateColumnHeader?: string;
      journalIdColumnHeader?: string;
      sourceColumnHeader?: string;
      accountColumnHeader?: string;
      debitColumnHeader?: string;
      creditColumnHeader?: string;
      runningBalanceColumnHeader?: string;
  }
  export interface LedgerAccountStringOverrides {
      ledgerEntryDetail?: LedgerAccountEntryDetailsStringOverrides;
      ledgerEntriesTable?: LedgerEntriesTableStringOverrides;
  }
  export interface LedgerAccountProps {
      view: View;
      containerRef: RefObject<HTMLDivElement>;
      pageSize?: number;
      stringOverrides?: LedgerAccountStringOverrides;
  }
  export const LedgerAccount: ({ containerRef, pageSize, view, stringOverrides, }: LedgerAccountProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LedgerAccount/LedgerAccountRow' {
  import { LedgerAccountLineItem } from '@layerfi/components/types';
  import { View } from '@layerfi/components/types/general';
  import { LedgerAccountNodeType } from '@layerfi/components/types/chart_of_accounts';
  export interface LedgerAccountRowProps {
      row: LedgerAccountLineItem;
      index: number;
      view: View;
      nodeType?: LedgerAccountNodeType;
  }
  export const LedgerAccountRow: ({ row, index, view, nodeType, }: LedgerAccountRowProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/LedgerAccount/index' {
  export { LedgerAccount } from '@layerfi/components/components/LedgerAccount/LedgerAccountIndex';

}
declare module '@layerfi/components/components/LedgerAccountCombobox/LedgerAccountCombobox' {
  import { type CategoriesListMode } from '@layerfi/components/types/categories';
  import { type AccountIdentifier } from '@layerfi/components/schemas/accountIdentifier';
  type LedgerAccountComboboxProps = {
      label: string;
      value: AccountIdentifier | null;
      onValueChange: (value: AccountIdentifier | null) => void;
      mode?: CategoriesListMode;
      isReadOnly?: boolean;
      showLabel?: boolean;
  };
  export const LedgerAccountCombobox: ({ label, value, mode, onValueChange, isReadOnly, showLabel }: LedgerAccountComboboxProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LedgerAccountEntryDetails/LedgerAccountEntryDetails' {
  import { LedgerEntrySourceType } from '@layerfi/components/schemas/generalLedger/ledgerEntrySource';
  interface SourceDetailStringOverrides {
      sourceLabel?: string;
      accountNameLabel?: string;
      dateLabel?: string;
      amountLabel?: string;
      directionLabel?: string;
      counterpartyLabel?: string;
      invoiceNumberLabel?: string;
      recipientNameLabel?: string;
      memoLabel?: string;
      createdByLabel?: string;
      processorLabel?: string;
  }
  export const SourceDetailView: ({ source, stringOverrides, }: {
      source: LedgerEntrySourceType;
      stringOverrides?: SourceDetailStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element | null;
  interface JournalEntryDetailsStringOverrides {
      entryTypeLabel?: string;
      dateLabel?: string;
      creationDateLabel?: string;
      reversalLabel?: string;
  }
  interface LineItemsTableStringOverrides {
      lineItemsColumnHeader?: string;
      debitColumnHeader?: string;
      creditColumnHeader?: string;
      totalRowHeader?: string;
  }
  export interface LedgerAccountEntryDetailsStringOverrides {
      title?: string;
      transactionSource?: {
          header?: string;
          details?: SourceDetailStringOverrides;
      };
      journalEntry?: {
          header?: (entryId?: string) => string;
          details?: JournalEntryDetailsStringOverrides;
      };
      lineItemsTable?: LineItemsTableStringOverrides;
  }
  export const LedgerAccountEntryDetails: ({ stringOverrides, }: {
      stringOverrides?: LedgerAccountEntryDetailsStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LedgerAccountEntryDetails/index' {
  export { LedgerAccountEntryDetails } from '@layerfi/components/components/LedgerAccountEntryDetails/LedgerAccountEntryDetails';

}
declare module '@layerfi/components/components/LinkedAccountOptions/LinkedAccountOptions' {
  import { HoverMenuProps } from '@layerfi/components/components/HoverMenu/index';
  interface LinkedAccountOptionsProps extends HoverMenuProps {
      showLedgerBalance?: boolean;
  }
  export const LinkedAccountOptions: ({ children, config, showLedgerBalance, }: LinkedAccountOptionsProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccountOptions/index' {
  export { LinkedAccountOptions } from '@layerfi/components/components/LinkedAccountOptions/LinkedAccountOptions';

}
declare module '@layerfi/components/components/LinkedAccountPill/LinkedAccountPill' {
  type LinkedAccountPillProps = {
      label: string;
      items: ReadonlyArray<{
          action: () => void;
          name: string;
      }>;
  };
  export function LinkedAccountPill({ label, items }: LinkedAccountPillProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccountThumb/LinkedAccountThumb' {
  import { LinkedAccount } from '@layerfi/components/types/linked_accounts';
  export interface LinkedAccountThumbProps {
      account: LinkedAccount;
      asWidget?: boolean;
      showLedgerBalance?: boolean;
      slots: {
          Pill: React.ReactNode;
      };
  }
  export const LinkedAccountThumb: ({ account, asWidget, showLedgerBalance, slots, }: LinkedAccountThumbProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/LinkedAccounts/AccountFormBox/AccountFormBox' {
  import { LinkedAccount } from '@layerfi/components/types/linked_accounts';
  export type AccountFormBoxData = {
      account: LinkedAccount;
      isConfirmed: boolean;
      openingDate?: Date;
      openingBalance?: string;
      saved?: boolean;
  };
  type AccountFormProps = {
      account: LinkedAccount;
      value: AccountFormBoxData;
      isSaved?: boolean;
      disableConfirmExclude?: boolean;
      errors?: string[];
      onChange: (value: AccountFormBoxData) => void;
  };
  export const AccountFormBox: ({ account, value, isSaved, disableConfirmExclude, onChange, errors, }: AccountFormProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccounts/BasicLinkedAccount/BasicLinkedAccount' {
  import type { LinkedAccount } from '@layerfi/components/types/linked_accounts';
  import type { PropsWithChildren } from 'react';
  type BasicLinkedAccountContainer = PropsWithChildren<{
      isSelected?: boolean;
  }>;
  export function BasicLinkedAccountContainer({ children, isSelected }: BasicLinkedAccountContainer): import("react/jsx-runtime").JSX.Element;
  type BasicLinkedAccountContainerProps = {
      account: Pick<LinkedAccount, 'external_account_name' | 'mask' | 'institution'>;
  };
  export function BasicLinkedAccountContent({ account }: BasicLinkedAccountContainerProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccounts/ConfirmationModal/LinkedAccountToConfirm' {
  import type { LinkedAccount } from '@layerfi/components/types/linked_accounts';
  type LinkedAccountConfirmationProps = {
      account: LinkedAccount;
      isConfirmed: boolean;
      onChangeConfirmed: (isConfirmed: boolean) => void;
  };
  export function LinkedAccountToConfirm({ account, isConfirmed, onChangeConfirmed, }: LinkedAccountConfirmationProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccounts/ConfirmationModal/LinkedAccountsConfirmationModal' {
  export function LinkedAccountsConfirmationModal(): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/LinkedAccounts/ConfirmationModal/useConfirmAndExcludeMultiple' {
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  export type AccountConfirmExcludeFormState = Record<string, boolean>;
  export function useConfirmAndExcludeMultiple({ onSuccess }: {
      onSuccess?: () => Awaitable<unknown>;
  }): import("swr/mutation").SWRMutationResponse<true, any, () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      tags: string[];
  } | undefined, AccountConfirmExcludeFormState>;

}
declare module '@layerfi/components/components/LinkedAccounts/LinkedAccountItemThumb' {
  import { LinkedAccount } from '@layerfi/components/types/linked_accounts';
  export interface LinkedAccountItemThumbProps {
      account: LinkedAccount;
      asWidget?: boolean;
      showLedgerBalance?: boolean;
      showUnlinkItem?: boolean;
      showBreakConnection?: boolean;
  }
  export const LinkedAccountItemThumb: ({ account, asWidget, showLedgerBalance, showUnlinkItem, showBreakConnection, }: LinkedAccountItemThumbProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/LinkedAccounts/LinkedAccounts' {
  export interface LinkedAccountsProps {
      asWidget?: boolean;
      elevated?: boolean;
      showLedgerBalance?: boolean;
      showUnlinkItem?: boolean;
      showBreakConnection?: boolean;
      stringOverrides?: {
          title?: string;
      };
  }
  export const LinkedAccounts: (props: LinkedAccountsProps) => import("react/jsx-runtime").JSX.Element;
  export const LinkedAccountsComponent: ({ asWidget, elevated, showLedgerBalance, showUnlinkItem, showBreakConnection, stringOverrides, }: LinkedAccountsProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/LinkedAccounts/LinkedAccountsContent' {
  interface LinkedAccountsDataProps {
      asWidget?: boolean;
      showLedgerBalance?: boolean;
      showUnlinkItem?: boolean;
      showBreakConnection?: boolean;
  }
  export const LinkedAccountsContent: ({ asWidget, showLedgerBalance, showUnlinkItem, showBreakConnection, }: LinkedAccountsDataProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccounts/OpeningBalanceModal/OpeningBalanceModal' {
  type OpeningBalanceModalStringOverrides = {
      title?: string;
      description?: string;
      buttonText?: string;
  };
  export function OpeningBalanceModal({ stringOverrides, }: {
      stringOverrides?: OpeningBalanceModalStringOverrides;
  }): import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/LinkedAccounts/OpeningBalanceModal/useUpdateOpeningBalanceAndDate' {
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  export type OpeningBalanceData = {
      accountId: string;
      openingDate?: Date;
      openingBalance?: number;
  };
  type OpeningBalanceAPIResponseValidationError = {
      accountId: string;
      status: 'rejected';
      reason: {
          cause: {
              type: 'validation';
              errors: string[];
              accountId: string;
          };
      };
  };
  type OpeningBalanceAPIResponseError = {
      accountId: string;
      status: 'rejected';
      reason: {
          code?: number;
          info?: string;
          messages?: Record<string, string>[];
          name?: string;
      };
  };
  export type OpeningBalanceAPIResponseResult = {
      accountId: string;
      status: 'fulfilled';
      value: {
          data: {
              type: string;
          };
      };
  } | OpeningBalanceAPIResponseValidationError | OpeningBalanceAPIResponseError;
  export function useBulkSetOpeningBalanceAndDate(data: OpeningBalanceData[], { onSuccess }: {
      onSuccess: (results: OpeningBalanceAPIResponseResult[]) => Awaitable<void>;
  }): import("swr/mutation").SWRMutationResponse<true, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly data: OpeningBalanceData[];
      readonly tags: readonly ["#linked-accounts", "#opening-balance"];
  } | undefined, never>;
  export {};

}
declare module '@layerfi/components/components/LinkedAccounts/UnlinkAccountConfirmationModal/UnlinkAccountConfirmationModal' {
  import { ModalProps } from '@layerfi/components/components/ui/Modal/Modal';
  import type { LinkedAccount } from '@layerfi/components/types/linked_accounts';
  type UnlinkAccountConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
      account: LinkedAccount;
  };
  export function UnlinkAccountConfirmationModal({ isOpen, onOpenChange, account }: UnlinkAccountConfirmationModalProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccounts/index' {
  export { LinkedAccounts } from '@layerfi/components/components/LinkedAccounts/LinkedAccounts';
  export { LinkedAccountItemThumb } from '@layerfi/components/components/LinkedAccounts/LinkedAccountItemThumb';

}
declare module '@layerfi/components/components/Loader/Loader' {
  import type { PropsWithChildren } from 'react';
  type LoaderProps = PropsWithChildren<{
      size?: number;
  }>;
  export const Loader: ({ children, size }: LoaderProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Loader/SmallLoader' {
  export interface SmallLoaderProps {
      size?: number;
  }
  export const SmallLoader: ({ size }: SmallLoaderProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Loader/index' {
  export { Loader } from '@layerfi/components/components/Loader/Loader';
  export { SmallLoader } from '@layerfi/components/components/Loader/SmallLoader';

}
declare module '@layerfi/components/components/MatchForm/MatchForm' {
  import { BankTransaction } from '@layerfi/components/types';
  export interface MatchFormProps {
      classNamePrefix: string;
      bankTransaction: BankTransaction;
      selectedMatchId?: string;
      setSelectedMatchId: (val?: string) => void;
      matchFormError?: string;
      readOnly?: boolean;
  }
  export const MatchForm: ({ classNamePrefix, bankTransaction, selectedMatchId, setSelectedMatchId, matchFormError, readOnly, }: MatchFormProps) => import("react/jsx-runtime").JSX.Element | null;

}
declare module '@layerfi/components/components/MatchForm/MatchFormMobile' {
  import { MatchFormProps } from '@layerfi/components/components/MatchForm/MatchForm';
  export const MatchFormMobile: ({ classNamePrefix, bankTransaction, selectedMatchId, setSelectedMatchId, matchFormError, readOnly, }: MatchFormProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/MatchForm/index' {
  export { MatchForm } from '@layerfi/components/components/MatchForm/MatchForm';
  export { MatchFormMobile } from '@layerfi/components/components/MatchForm/MatchFormMobile';

}
declare module '@layerfi/components/components/MobilePanel/MobilePanel' {
  import { ReactNode } from 'react';
  export type MobilePanelProps = {
      header?: ReactNode;
      children: ReactNode;
      open?: boolean;
      onClose?: () => void;
      className?: string;
  };
  export const MobilePanel: ({ header, children, open, onClose, className }: MobilePanelProps) => import("react").ReactPortal;

}
declare module '@layerfi/components/components/Onboarding/ConnectAccount' {
  import { OnboardingStep } from '@layerfi/components/types/layer_context';
  export interface ConnectAccountProps {
      onboardingStep: OnboardingStep;
      onTransactionsToReviewClick?: () => void;
      currentMonthOnly?: boolean;
  }
  export const ConnectAccount: ({ onboardingStep, onTransactionsToReviewClick, }: ConnectAccountProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Onboarding/Onboarding' {
  import { OnboardingStep } from '@layerfi/components/types/layer_context';
  export interface OnboardingProps {
      onTransactionsToReviewClick?: () => void;
      onboardingStepOverride?: OnboardingStep;
  }
  export const Onboarding: (props: OnboardingProps) => import("react/jsx-runtime").JSX.Element;
  export const OnboardingContent: ({ onTransactionsToReviewClick, onboardingStepOverride, }: OnboardingProps) => import("react/jsx-runtime").JSX.Element | null;

}
declare module '@layerfi/components/components/Onboarding/index' {
  export { Onboarding } from '@layerfi/components/components/Onboarding/Onboarding';

}
declare module '@layerfi/components/components/Pagination/Pagination' {
  export interface PaginationProps {
      currentPage: number;
      pageSize: number;
      onPageChange: (page: number) => void;
      totalCount: number;
      siblingCount?: number;
      hasMore?: boolean;
      fetchMore?: () => void;
      className?: string;
  }
  export const Pagination: ({ onPageChange, totalCount, siblingCount, currentPage, pageSize, hasMore, fetchMore, className, }: PaginationProps) => import("react/jsx-runtime").JSX.Element | null;

}
declare module '@layerfi/components/components/Pagination/index' {
  export { Pagination } from '@layerfi/components/components/Pagination/Pagination';

}
declare module '@layerfi/components/components/Panel/Panel' {
  import { ReactNode, RefObject } from 'react';
  export interface PanelProps {
      children: ReactNode;
      className?: string;
      sidebar?: ReactNode;
      sidebarIsOpen?: boolean;
      header?: ReactNode;
      parentRef?: RefObject<HTMLDivElement>;
      defaultSidebarHeight?: boolean;
      floating?: boolean;
  }
  export const Panel: ({ children, className, sidebar, header, sidebarIsOpen, parentRef, defaultSidebarHeight, floating, }: PanelProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Panel/index' {
  export { Panel } from '@layerfi/components/components/Panel/Panel';

}
declare module '@layerfi/components/components/PaymentMethod/PaymentMethodComboBox' {
  import { PaymentMethod } from '@layerfi/components/components/PaymentMethod/schemas';
  type PaymentMethodComboBoxProps = {
      value: PaymentMethod | null;
      onValueChange: (value: PaymentMethod | null) => void;
      isReadOnly?: boolean;
      className?: string;
      inline?: boolean;
  };
  export const PaymentMethodComboBox: ({ value, onValueChange, isReadOnly, className, inline }: PaymentMethodComboBoxProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/PaymentMethod/schemas' {
  import { Schema } from 'effect';
  export enum PaymentMethod {
      Cash = "CASH",
      Check = "CHECK",
      CreditCard = "CREDIT_CARD",
      Ach = "ACH",
      Other = "Other"
  }
  export const PaymentMethodSchema: Schema.Enums<typeof PaymentMethod>;
  export const TransformedPaymentMethodSchema: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<PaymentMethod, PaymentMethod, never>>;

}
declare module '@layerfi/components/components/PlatformOnboarding/Container/LinkAccountsListContainer' {
  import type { PropsWithChildren } from 'react';
  export function LinkAccountsListContainer({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/PlatformOnboarding/LinkAccounts' {
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  type LinkAccountsProps = {
      onComplete?: () => Awaitable<void>;
  };
  export function LinkAccounts(props: LinkAccountsProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/PlatformOnboarding/PlatformOnboarding' {
  type PlatformOnboardingProps = {
      onComplete?: () => void;
  };
  export const PlatformOnboarding: ({ onComplete }: PlatformOnboardingProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/PlatformOnboarding/Steps/BusinessInfoStep' {
  type BusinessInfoStepProps = {
      title?: string;
      onNext: () => void;
  };
  export const BusinessInfoStep: ({ title, onNext }: BusinessInfoStepProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/PlatformOnboarding/Steps/LinkAccountsConfirmationStep' {
  export function LinkAccountsConfirmationStep(): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/PlatformOnboarding/Steps/LinkAccountsLinkStep' {
  export function LinkAccountsLinkStep(): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/PlatformOnboarding/Steps/SummaryStep' {
  type SummaryStepProps = {
      onNext: () => void;
      title?: string;
      description?: string;
      nextBtnText?: string;
  };
  export const SummaryStep: ({ onNext, title, description, nextBtnText }: SummaryStepProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/PlatformOnboarding/Steps/WelcomeStep' {
  type WelcomeStepProps = {
      onNext: () => void;
      title?: string;
      description?: string;
      stepsEnabled?: string[];
  };
  export const WelcomeStep: ({ onNext, title, description, stepsEnabled }: WelcomeStepProps) => import("react/jsx-runtime").JSX.Element;
  export const WelcomeStepFooter: () => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLoss/ProfitAndLoss' {
  import { PropsWithChildren } from 'react';
  import { ReportingBasis } from '@layerfi/components/types';
  import { ProfitAndLossSummaries } from '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries';
  import { ProfitAndLossCompareConfig } from '@layerfi/components/types/profit_and_loss';
  type Props = PropsWithChildren & {
      tagFilter?: {
          key: string;
          values: string[];
      };
      comparisonConfig?: ProfitAndLossCompareConfig;
      reportingBasis?: ReportingBasis;
      asContainer?: boolean;
      withReportsModeProvider?: boolean;
  };
  const ProfitAndLoss: {
      ({ withReportsModeProvider, ...restProps }: Props): import("react/jsx-runtime").JSX.Element;
      Chart: ({ forceRerenderOnDataChange, tagFilter, }: import("@layerfi/components/components/ProfitAndLossChart/ProfitAndLossChart").Props) => import("react/jsx-runtime").JSX.Element;
      Context: import("react").Context<{
          data: {
              readonly businessId: string;
              readonly startDate: Date;
              readonly endDate: Date;
              readonly income: {
                  readonly value: number;
                  readonly displayName: string;
                  readonly name: string;
                  readonly isContra: boolean;
                  readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
                  readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
              };
              readonly costOfGoodsSold: {
                  readonly value: number;
                  readonly displayName: string;
                  readonly name: string;
                  readonly isContra: boolean;
                  readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
                  readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
              };
              readonly grossProfit: number;
              readonly profitBeforeTaxes: number;
              readonly taxes: {
                  readonly value: number;
                  readonly displayName: string;
                  readonly name: string;
                  readonly isContra: boolean;
                  readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
                  readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
              };
              readonly netProfit: number;
              readonly fullyCategorized: boolean;
              readonly uncategorizedInflows?: {
                  readonly value: number;
                  readonly displayName: string;
                  readonly name: string;
                  readonly isContra: boolean;
                  readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
                  readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
              } | undefined;
              readonly uncategorizedOutflows?: {
                  readonly value: number;
                  readonly displayName: string;
                  readonly name: string;
                  readonly isContra: boolean;
                  readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
                  readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
              } | undefined;
              readonly grossProfitPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
              readonly profitBeforeTaxesPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
              readonly netProfitPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
              readonly expenses: {
                  readonly value: number;
                  readonly displayName: string;
                  readonly name: string;
                  readonly isContra: boolean;
                  readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
                  readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
              };
              readonly customLineItems: {
                  readonly value: number;
                  readonly displayName: string;
                  readonly name: string;
                  readonly isContra: boolean;
                  readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
                  readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
              } | null;
              readonly otherOutflows: {
                  readonly value: number;
                  readonly displayName: string;
                  readonly name: string;
                  readonly isContra: boolean;
                  readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
                  readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
              } | null;
              readonly personalExpenses: {
                  readonly value: number;
                  readonly displayName: string;
                  readonly name: string;
                  readonly isContra: boolean;
                  readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
                  readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
              } | null;
          } | undefined;
          filteredDataRevenue: never[] | import("@layerfi/components/utils/profitAndLossUtils").PnlChartLineItem[];
          filteredTotalRevenue: number | undefined;
          filteredDataExpenses: never[] | import("@layerfi/components/utils/profitAndLossUtils").PnlChartLineItem[];
          filteredTotalExpenses: number | undefined;
          isLoading: boolean;
          isValidating: boolean;
          isError: boolean;
          refetch: () => void;
          sidebarScope: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").SidebarScope;
          setSidebarScope: import("react").Dispatch<import("react").SetStateAction<import("../../hooks/useProfitAndLoss/useProfitAndLoss").SidebarScope>>;
          sortBy: (scope: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").Scope, field: string, direction?: import("../../types").SortDirection) => void;
          filters: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").ProfitAndLossFilters;
          setFilterTypes: (scope: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").Scope, types: string[]) => void;
          tagFilter: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").PnlTagFilter | undefined;
          dateRange: {
              startDate: Date;
              endDate: Date;
          };
      }>;
      ComparisonContext: import("react").Context<{
          data: import("@layerfi/components/types/profit_and_loss").ProfitAndLossComparisonItem[] | undefined;
          isLoading: boolean;
          isValidating: boolean;
          isPeriodsSelectEnabled: boolean;
          compareModeActive: boolean;
          comparePeriods: number;
          setComparePeriods: import("react").Dispatch<import("react").SetStateAction<number>>;
          compareOptions: import("@layerfi/components/types/profit_and_loss").TagComparisonOption[];
          selectedCompareOptions: import("@layerfi/components/types/profit_and_loss").TagComparisonOption[];
          setSelectedCompareOptions: (values: import("react-select").MultiValue<{
              value: string;
              label: string;
          }>) => void;
          getProfitAndLossComparisonCsv: (dateRange: import("@layerfi/components/types").DateRange, moneyFormat?: import("../../types").MoneyFormat) => Promise<{
              data?: import("@layerfi/components/types/general").S3PresignedUrl;
              error?: unknown;
          }>;
          comparisonConfig: ProfitAndLossCompareConfig | undefined;
      }>;
      DatePicker: ({ allowedDatePickerModes, customDateRanges, defaultDatePickerMode, }: import("@layerfi/components/components/ProfitAndLossDatePicker/ProfitAndLossDatePicker").ProfitAndLossDatePickerProps) => import("react/jsx-runtime").JSX.Element;
      CompareOptions: () => import("react/jsx-runtime").JSX.Element | null;
      Summaries: typeof ProfitAndLossSummaries;
      Table: (props: import("@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableComponent").ProfitAndLossTableProps) => import("react/jsx-runtime").JSX.Element;
      DetailedCharts: ({ scope, hideClose, showDatePicker, chartColorsList, stringOverrides, }: {
          scope?: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").SidebarScope;
          hideClose?: boolean;
          showDatePicker?: boolean;
          chartColorsList?: string[];
          stringOverrides?: import("@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts").ProfitAndLossDetailedChartsStringOverrides;
      }) => import("react/jsx-runtime").JSX.Element;
      Header: ({ text, className, headingClassName, withDatePicker, withStatus, }: import("@layerfi/components/components/ProfitAndLossHeader/ProfitAndLossHeader").ProfitAndLossHeaderProps) => import("react/jsx-runtime").JSX.Element;
      Report: ({ stringOverrides, allowedDatePickerModes, datePickerMode, defaultDatePickerMode, customDateRanges, csvMoneyFormat, view, renderInAppLink, }: import("@layerfi/components/components/ProfitAndLossReport/ProfitAndLossReport").ProfitAndLossReportProps) => import("react/jsx-runtime").JSX.Element;
      DownloadButton: ({ stringOverrides, useComparisonPnl, moneyFormat, view, }: import("@layerfi/components/components/ProfitAndLossDownloadButton/ProfitAndLossDownloadButton").ProfitAndLossDownloadButtonProps) => import("react/jsx-runtime").JSX.Element;
  };
  export { ProfitAndLoss };

}
declare module '@layerfi/components/components/ProfitAndLoss/index' {
  export { ProfitAndLoss } from '@layerfi/components/components/ProfitAndLoss/ProfitAndLoss';

}
declare module '@layerfi/components/components/ProfitAndLossChart/ChartStateCard' {
  export const ChartStateCard: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossChart/Indicator' {
  import type { Props as LabelBaseProps } from 'recharts/types/component/Label';
  type IndicatorProps = Pick<LabelBaseProps, 'className' | 'viewBox'> & {
      customCursorSize: {
          width: number;
          height: number;
      };
      setCustomCursorSize: (width: number, height: number, x: number) => void;
  };
  export const Indicator: ({ className, customCursorSize, setCustomCursorSize, viewBox, }: IndicatorProps) => import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossChart/ProfitAndLossChart' {
  export interface Props {
      forceRerenderOnDataChange?: boolean;
      tagFilter?: {
          key: string;
          values: string[];
      };
  }
  export const ProfitAndLossChart: ({ forceRerenderOnDataChange, tagFilter, }: Props) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossChart/index' {
  export { ProfitAndLossChart } from '@layerfi/components/components/ProfitAndLossChart/ProfitAndLossChart';

}
declare module '@layerfi/components/components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions' {
  export const ProfitAndLossCompareOptions: () => import("react/jsx-runtime").JSX.Element | null;

}
declare module '@layerfi/components/components/ProfitAndLossDatePicker/ProfitAndLossDatePicker' {
  import type { TimeRangePickerConfig } from '@layerfi/components/views/Reports/reportTypes';
  export type ProfitAndLossDatePickerProps = TimeRangePickerConfig;
  export const ProfitAndLossDatePicker: ({ allowedDatePickerModes, customDateRanges, defaultDatePickerMode, }: ProfitAndLossDatePickerProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDatePicker/index' {
  export { ProfitAndLossDatePicker } from '@layerfi/components/components/ProfitAndLossDatePicker/ProfitAndLossDatePicker';

}
declare module '@layerfi/components/components/ProfitAndLossDetailLinesDownloadButton/ProfitAndLossDetailLinesDownloadButton' {
  type ProfitAndLossDetailLinesDownloadButtonProps = {
      pnlStructureLineItemName: string;
      iconOnly?: boolean;
  };
  export function ProfitAndLossDetailLinesDownloadButton({ pnlStructureLineItemName, iconOnly, }: ProfitAndLossDetailLinesDownloadButtonProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossDetailLinesDownloadButton/index' {
  export { ProfitAndLossDetailLinesDownloadButton } from '@layerfi/components/components/ProfitAndLossDetailLinesDownloadButton/ProfitAndLossDetailLinesDownloadButton';

}
declare module '@layerfi/components/components/ProfitAndLossDetailReport/ProfitAndLossDetailReport' {
  import { BreadcrumbItem } from '@layerfi/components/components/DetailReportBreadcrumb/DetailReportBreadcrumb';
  export interface ProfitAndLossDetailReportStringOverrides {
      title?: string;
      dateColumnHeader?: string;
      typeColumnHeader?: string;
      accountColumnHeader?: string;
      descriptionColumnHeader?: string;
      amountColumnHeader?: string;
      balanceColumnHeader?: string;
      sourceDetailsTitle?: string;
  }
  export interface ProfitAndLossDetailReportProps {
      lineItemName: string;
      breadcrumbPath?: BreadcrumbItem[];
      onClose: () => void;
      onBreadcrumbClick?: (lineItemName: string) => void;
      stringOverrides?: ProfitAndLossDetailReportStringOverrides;
  }
  export const ProfitAndLossDetailReport: ({ lineItemName, breadcrumbPath, onClose, onBreadcrumbClick, stringOverrides, }: ProfitAndLossDetailReportProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/DetailReportModal' {
  import { type ProfitAndLossDetailReportProps } from '@layerfi/components/components/ProfitAndLossDetailReport/ProfitAndLossDetailReport';
  import { type SelectedLineItem } from '@layerfi/components/components/ProfitAndLossReport/ProfitAndLossReport';
  export interface DetailReportModalProps {
      isOpen: boolean;
      onOpenChange: (isOpen: boolean) => void;
      selectedItem: SelectedLineItem | null;
      onBreadcrumbClick?: (lineItemName: string) => void;
      stringOverrides?: ProfitAndLossDetailReportProps['stringOverrides'];
  }
  export function DetailReportModal({ isOpen, onOpenChange, selectedItem, onBreadcrumbClick, stringOverrides, }: DetailReportModalProps): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/DetailedChart' {
  import { SidebarScope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import type { PnlChartLineItem } from '@layerfi/components/utils/profitAndLossUtils';
  interface DetailedChartProps {
      filteredData: PnlChartLineItem[];
      filteredTotal?: number;
      hoveredItem?: string;
      setHoveredItem: (name?: string) => void;
      sidebarScope?: SidebarScope;
      date: number | Date;
      isLoading?: boolean;
      showDatePicker?: boolean;
      chartColorsList?: string[];
  }
  export const DetailedChart: ({ filteredData, filteredTotal, hoveredItem, setHoveredItem, chartColorsList, isLoading, showDatePicker, }: DetailedChartProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/DetailedTable' {
  import { Scope, SidebarScope, ProfitAndLossFilters } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { SortDirection } from '@layerfi/components/types';
  import type { PnlChartLineItem } from '@layerfi/components/utils/profitAndLossUtils';
  export interface DetailedTableStringOverrides {
      categoryColumnHeader?: string;
      typeColumnHeader?: string;
      valueColumnHeader?: string;
  }
  export interface DetailedTableProps {
      filteredData: PnlChartLineItem[];
      hoveredItem?: string;
      setHoveredItem: (name?: string) => void;
      sidebarScope: SidebarScope;
      filters: ProfitAndLossFilters;
      sortBy: (scope: Scope, field: string, direction?: SortDirection) => void;
      chartColorsList?: string[];
      stringOverrides?: DetailedTableStringOverrides;
      onValueClick?: (item: PnlChartLineItem) => void;
  }
  export interface TypeColorMapping {
      color: string;
      opacity: number;
  }
  export const mapTypesToColors: (data: PnlChartLineItem[], colorList?: string[]) => TypeColorMapping[];
  export const DetailedTable: ({ filteredData, sidebarScope, filters, sortBy, hoveredItem, setHoveredItem, chartColorsList, stringOverrides, onValueClick, }: DetailedTableProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/Filters' {
  import { Scope, SidebarScope, ProfitAndLossFilters } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import type { PnlChartLineItem } from '@layerfi/components/utils/profitAndLossUtils';
  export interface FiltersProps {
      filteredData: PnlChartLineItem[];
      sidebarScope: SidebarScope;
      filters: ProfitAndLossFilters;
      setFilterTypes: (scope: Scope, types: string[]) => void;
  }
  export const Filters: ({ filteredData, sidebarScope, filters, setFilterTypes, }: FiltersProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts' {
  import { SidebarScope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { DetailedTableStringOverrides } from '@layerfi/components/components/ProfitAndLossDetailedCharts/DetailedTable';
  import type { ProfitAndLossDetailReportProps } from '@layerfi/components/components/ProfitAndLossDetailReport/ProfitAndLossDetailReport';
  export interface ProfitAndLossDetailedChartsStringOverrides {
      detailedTableStringOverrides?: DetailedTableStringOverrides;
      detailReportStringOverrides?: ProfitAndLossDetailReportProps['stringOverrides'];
  }
  export const ProfitAndLossDetailedCharts: ({ scope, hideClose, showDatePicker, chartColorsList, stringOverrides, }: {
      scope?: SidebarScope;
      hideClose?: boolean;
      showDatePicker?: boolean;
      chartColorsList?: string[];
      stringOverrides?: ProfitAndLossDetailedChartsStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/index' {
  export { ProfitAndLossDetailedCharts } from '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts';

}
declare module '@layerfi/components/components/ProfitAndLossDownloadButton/ProfitAndLossDownloadButton' {
  import { MoneyFormat } from '@layerfi/components/types';
  import { View as ViewType } from '@layerfi/components/types/general';
  type ViewBreakpoint = ViewType | undefined;
  export interface PnLDownloadButtonStringOverrides {
      downloadButtonText?: string;
      retryButtonText?: string;
  }
  export interface ProfitAndLossDownloadButtonProps {
      stringOverrides?: PnLDownloadButtonStringOverrides;
      useComparisonPnl?: boolean;
      moneyFormat?: MoneyFormat;
      view: ViewBreakpoint;
  }
  export const ProfitAndLossDownloadButton: ({ stringOverrides, useComparisonPnl, moneyFormat, view, }: ProfitAndLossDownloadButtonProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossDownloadButton/index' {
  export { ProfitAndLossDownloadButton, PnLDownloadButtonStringOverrides, } from '@layerfi/components/components/ProfitAndLossDownloadButton/ProfitAndLossDownloadButton';

}
declare module '@layerfi/components/components/ProfitAndLossHeader/ProfitAndLossHeader' {
  export interface ProfitAndLossHeaderProps {
      text?: string;
      className?: string;
      headingClassName?: string;
      withDatePicker?: boolean;
      withStatus?: boolean;
  }
  export const ProfitAndLossHeader: ({ text, className, headingClassName, withDatePicker, withStatus, }: ProfitAndLossHeaderProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossHeader/index' {
  export { ProfitAndLossHeader } from '@layerfi/components/components/ProfitAndLossHeader/ProfitAndLossHeader';

}
declare module '@layerfi/components/components/ProfitAndLossReport/ProfitAndLossReport' {
  import { ReactNode } from 'react';
  import { View as ViewType } from '@layerfi/components/types/general';
  import { ReportsStringOverrides } from '@layerfi/components/views/Reports/Reports';
  import type { TimeRangePickerConfig } from '@layerfi/components/views/Reports/reportTypes';
  import { BreadcrumbItem } from '@layerfi/components/components/DetailReportBreadcrumb/DetailReportBreadcrumb';
  import { LinkingMetadata } from '@layerfi/components/contexts/InAppLinkContext';
  type ViewBreakpoint = ViewType | undefined;
  export type ProfitAndLossReportProps = {
      stringOverrides?: ReportsStringOverrides;
      view?: ViewBreakpoint;
      renderInAppLink?: (source: LinkingMetadata) => ReactNode;
  } & TimeRangePickerConfig;
  export type SelectedLineItem = {
      lineItemName: string;
      breadcrumbPath: BreadcrumbItem[];
  };
  export const ProfitAndLossReport: ({ stringOverrides, allowedDatePickerModes, datePickerMode, defaultDatePickerMode, customDateRanges, csvMoneyFormat, view, renderInAppLink, }: ProfitAndLossReportProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries' {
  import type { Variants } from '@layerfi/components/utils/styleUtils/sizeVariants';
  export interface ProfitAndLossSummariesStringOverrides {
      revenueLabel?: string;
      expensesLabel?: string;
      netProfitLabel?: string;
  }
  type CommonProfitAndLossSummariesProps = {
      actionable?: boolean;
      stringOverrides?: ProfitAndLossSummariesStringOverrides;
      chartColorsList?: string[];
      variants?: Variants;
      /**
       * @deprecated Use `stringOverrides.revenueLabel` instead
       */
      revenueLabel?: string;
      /**
       * @deprecated Orientation is determined by the container size
       */
      vertical?: boolean;
  };
  type ProfitAndLossSummariesProps = CommonProfitAndLossSummariesProps & {
      onTransactionsToReviewClick?: () => void;
  };
  export function ProfitAndLossSummaries({ onTransactionsToReviewClick, ...restProps }: ProfitAndLossSummariesProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesHeading' {
  import type { PropsWithChildren } from 'react';
  import type { Variants } from '@layerfi/components/utils/styleUtils/sizeVariants';
  export function ProfitAndLossSummariesHeading({ variants, children, }: PropsWithChildren<{
      variants?: Pick<Variants, 'size'>;
  }>): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesList' {
  import { type PropsWithChildren } from 'react';
  type ProfitAndLossSummariesListItemProps = PropsWithChildren<{
      isActive?: boolean;
      onClick?: () => void;
  }>;
  export function ProfitAndLossSummariesListItem({ children, isActive, onClick, }: ProfitAndLossSummariesListItemProps): import("react/jsx-runtime").JSX.Element;
  type ProfitAndLossSummariesListProps = PropsWithChildren<{
      itemCount?: number;
  }>;
  export function ProfitAndLossSummariesList({ children, itemCount, }: ProfitAndLossSummariesListProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesMiniChart' {
  import type { ProfitAndLoss } from '@layerfi/components/hooks/useProfitAndLoss/schemas';
  import type { Scope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { type PnlChartLineItem } from '@layerfi/components/utils/profitAndLossUtils';
  import { Variants } from '@layerfi/components/utils/styleUtils/sizeVariants';
  export function toMiniChartData({ scope, data, }: {
      scope: Scope;
      data?: ProfitAndLoss;
  }): PnlChartLineItem[];
  type ProfitAndLossMiniChartProps = {
      data: PnlChartLineItem[];
      chartColorsList?: string[];
      variants?: Variants;
  };
  export function ProfitAndLossSummariesMiniChart({ data, chartColorsList, variants, }: ProfitAndLossMiniChartProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesSummary' {
  import type { ReactNode } from 'react';
  import type { Variants } from '@layerfi/components/utils/styleUtils/sizeVariants';
  type ProfitAndLossSummariesSummaryProps = {
      label: string;
      amount: number;
      isLoading?: boolean;
      slots?: {
          Chart: ReactNode;
      };
      variants?: Variants;
  };
  export function ProfitAndLossSummariesSummary({ label, amount, isLoading, slots, variants, }: ProfitAndLossSummariesSummaryProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossCompareTable' {
  import { ProfitAndLossTableStringOverrides } from '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableComponent';
  interface ProfilAndLostCompareTableProps {
      stringOverrides?: ProfitAndLossTableStringOverrides;
  }
  export const ProfitAndLossCompareTable: ({ stringOverrides, }: ProfilAndLostCompareTableProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableComponent' {
  import { BreadcrumbItem } from '@layerfi/components/components/DetailReportBreadcrumb/DetailReportBreadcrumb';
  export interface ProfitAndLossTableStringOverrides {
      grossProfitLabel?: string;
      profitBeforeTaxesLabel?: string;
      netProfitLabel?: string;
  }
  export type ProfitAndLossTableProps = {
      lockExpanded?: boolean;
      asContainer?: boolean;
      stringOverrides?: ProfitAndLossTableStringOverrides;
      onLineItemClick?: (lineItemName: string, breadcrumbPath: BreadcrumbItem[]) => void;
  };
  export const ProfitAndLossTableComponent: ({ asContainer, stringOverrides, onLineItemClick, }: ProfitAndLossTableProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableWithProvider' {
  import { ProfitAndLossTableProps } from '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableComponent';
  export const ProfitAndLossTableWithProvider: (props: ProfitAndLossTableProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossTable/index' {
  export { ProfitAndLossTableWithProvider as ProfitAndLossTable } from '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableWithProvider';
  export { ProfitAndLossTableStringOverrides } from '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableComponent';

}
declare module '@layerfi/components/components/ProfitAndLossView/ProfitAndLossView' {
  import { RefObject } from 'react';
  import { ProfitAndLossDetailedChartsStringOverrides } from '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts';
  import { ProfitAndLossSummariesStringOverrides } from '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries';
  import { ProfitAndLossTableStringOverrides } from '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableComponent';
  export interface ProfitAndLossViewProps {
      hideTable?: boolean;
      hideChart?: boolean;
      showDetailedCharts?: boolean;
      stringOverrides?: {
          header?: string;
          profitAndLossTable?: ProfitAndLossTableStringOverrides;
          profitAndLossSummaries?: ProfitAndLossSummariesStringOverrides;
          profitAndLossDetailedCharts?: ProfitAndLossDetailedChartsStringOverrides;
      };
  }
  export interface ProfitAndLossViewPanelProps extends ProfitAndLossViewProps {
      containerRef: RefObject<HTMLDivElement>;
  }
  export const ProfitAndLossView: (props: ProfitAndLossViewProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossView/index' {
  export { ProfitAndLossView } from '@layerfi/components/components/ProfitAndLossView/ProfitAndLossView';

}
declare module '@layerfi/components/components/ProgressSteps/ProgressSteps' {
  export type ProgressStepsProps = {
      steps: string[];
      currentStep: number;
  };
  export const ProgressSteps: ({ steps, currentStep }: ProgressStepsProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/SearchField/SearchField' {
  export type SearchFieldProps = {
      value: string;
      slot?: string;
      onChange: (value: string) => void;
      label: string;
  };
  export function SearchField({ slot, label, ...restProps }: SearchFieldProps): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Separator/Separator' {
  import { Spacing } from '@layerfi/components/components/ui/sharedUITypes';
  type SeparatorProps = {
      mbs?: Spacing;
      mbe?: Spacing;
  };
  export const Separator: ({ mbs, mbe }: SeparatorProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ServiceOffering/ServiceOffering' {
  import { HTMLAttributes } from 'react';
  import { ContentConfig } from '@layerfi/components/components/ServiceOffering/content';
  import { PlatformConfig, ServiceOfferingLinks } from '@layerfi/components/components/ServiceOffering/types';
  export type ServiceOfferingMainConfig = {
      /** Link configuration for various CTAs and actions */
      links: ServiceOfferingLinks;
      /** Platform-specific branding and customization settings */
      platform: PlatformConfig;
      /** Content configuration for service offerings and pricing */
      content: ContentConfig;
  };
  /**
     * Props for the ServiceOffering component - a customizable landing page component
     * that showcases accounting services with optional pricing options and booking integration.
     */
  export interface ServiceOfferingTypesProps extends HTMLAttributes<HTMLDivElement> {
      config: ServiceOfferingMainConfig;
  }
  export const ServiceOffering: ({ config: mainConfig, ...props }: ServiceOfferingTypesProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ServiceOffering/ServiceOfferingOptions' {
  import { HTMLAttributes } from 'react';
  import { ServiceOfferingConfig } from '@layerfi/components/components/ServiceOffering/types';
  export interface ServiceOfferingOptionsProps extends HTMLAttributes<HTMLDivElement> {
      config: ServiceOfferingConfig;
  }
  export const ServiceOfferingOffer: ({ config, ...props }: ServiceOfferingOptionsProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ServiceOffering/calendly' {
  import { Link } from '@layerfi/components/components/ServiceOffering/types';
  interface CalendlyPayload {
      event: {
          uri: string;
      };
      invitee: {
          uri: string;
      };
  }
  export interface CalendlyMessageData {
      event?: string;
      payload?: CalendlyPayload;
  }
  export const isCalendlyLink: (link?: Link) => boolean;
  export const useCalendly: () => {
      isCalendlyVisible: boolean;
      calendlyLink: string;
      calendlyRef: import("react").RefObject<HTMLDivElement>;
      openCalendly: (link: string) => void;
      closeCalendly: () => void;
  };
  export {};

}
declare module '@layerfi/components/components/ServiceOffering/content' {
  import { ServiceOfferingConfig, ServiceOfferingOfferLayout } from '@layerfi/components/components/ServiceOffering/types';
  export type ServiceOfferingTypesTextContent = Record<ServiceOfferingContentID, string>;
  export enum ServiceOfferingContentID {
      subtitle = 0,
      headline_1 = 1,
      headline_1_desc = 2,
      headline_2 = 3,
      headline_2_desc = 4,
      offers_title = 5
  }
  export const ServiceOfferingDefaultTextContent: ServiceOfferingTypesTextContent;
  export interface ContentConfig {
      /**
         * Allows you to optionally configure the text on the component.
         */
      textContent?: ServiceOfferingTypesTextContent;
      /**
         * Controls the positioning of the service options panel.
         * @default 'none'
         * - 'left': Options panel appears on the left side
         * - 'right': Options panel appears on the right side
         * - 'bottom': Options panel appears below the main content
         * - 'none': No options panel is displayed
         */
      layout?: ServiceOfferingOfferLayout;
      config: ServiceOfferingConfig[];
  }

}
declare module '@layerfi/components/components/ServiceOffering/index' {
  export { ServiceOffering } from '@layerfi/components/components/ServiceOffering/ServiceOffering';
  export { ServiceOfferingOffer as ServiceOfferingOptions } from '@layerfi/components/components/ServiceOffering/ServiceOfferingOptions';

}
declare module '@layerfi/components/components/ServiceOffering/offers' {
  import { ServiceOfferingConfig } from '@layerfi/components/components/ServiceOffering/types';
  export const ServiceOfferingAccounting: ServiceOfferingConfig;
  export const ServiceOfferingBookkeeping: ServiceOfferingConfig;

}
declare module '@layerfi/components/components/ServiceOffering/types' {
  import { ReactNode } from 'react';
  export type ServiceOfferingOfferLayout = 'left' | 'bottom' | 'right' | 'none';
  export type Link = {
      label: string;
      url: string;
  };
  export type ServiceOfferingFeature = string | {
      description: string;
      icon: ReactNode;
  };
  export type ServiceOfferingConfig = {
      badge: string;
      title: string;
      description: string;
      features: ServiceOfferingFeature[];
      pricing: string;
      unit: string;
      cta: Link;
  };
  export type ServiceOfferingValueProposition = {
      test: string;
  };
  export type ServiceOfferingLinks = {
      /**
         * Main CTA link on the top-of-fold component.
         */
      main: Link;
      /**
         * Enables the learn more button, which allows a platform to link to a learn more page.
         */
      learnMore?: Link;
  };
  export interface PlatformConfig {
      /**
         * The platform/brand name displayed throughout the component (e.g., "Shopify", "WooCommerce").
         * Used in titles, descriptions, and feature text to customize the content.
         */
      platformName: string;
      /**
         * The image URL to be used for the top-of-the-fold image.
         *
         * If left blank, will use a default.
         */
      imageUrl?: string;
      /**
         * The target industry for customization (e.g., "e-commerce", "SaaS", "retail").
         * Used to tailor feature descriptions and messaging to the specific industry.
         */
      industry: string;
  }

}
declare module '@layerfi/components/components/ServiceOffering/utils' {
  import { ServiceOfferingContentID, ServiceOfferingTypesTextContent } from '@layerfi/components/components/ServiceOffering/content';
  import { ServiceOfferingTypesProps } from '@layerfi/components/components/ServiceOffering/ServiceOffering';
  export function makeDynamicText(contentId: ServiceOfferingContentID, textContent: ServiceOfferingTypesTextContent, config: ServiceOfferingTypesProps['config']): string;

}
declare module '@layerfi/components/components/SkeletonLoader/SkeletonLoader' {
  import type { PropsWithChildren } from 'react';
  export interface SkeletonLoaderProps {
      width?: string;
      height?: string;
      className?: string;
  }
  export const SkeletonLoader: ({ height, width, className, }: SkeletonLoaderProps) => import("react/jsx-runtime").JSX.Element;
  type FallbackWithSkeletonLoader = PropsWithChildren<SkeletonLoaderProps> & {
      isLoading: boolean;
  };
  export const FallbackWithSkeletonLoader: ({ height, width, isLoading, children, className, }: FallbackWithSkeletonLoader) => string | number | boolean | Iterable<import("react").ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined;
  export {};

}
declare module '@layerfi/components/components/SkeletonLoader/index' {
  export { SkeletonLoader } from '@layerfi/components/components/SkeletonLoader/SkeletonLoader';

}
declare module '@layerfi/components/components/SkeletonTableLoader/SkeletonTableLoader' {
  interface SkeletonTableLoaderProps {
      rows: number;
      cols: Array<{
          colSpan: number;
          colComponent?: React.ReactNode;
          trimLastXRows?: number;
          parts?: number;
      }>;
      height?: number;
      width?: number;
  }
  export const SkeletonTableLoader: ({ rows, cols, height, width, }: SkeletonTableLoaderProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/SkeletonTableLoader/index' {
  export { SkeletonTableLoader } from '@layerfi/components/components/SkeletonTableLoader/SkeletonTableLoader';

}
declare module '@layerfi/components/components/StatementOfCashFlow/StatementOfCashFlow' {
  import type { TimeRangePickerConfig } from '@layerfi/components/views/Reports/reportTypes';
  import { StatementOfCashFlowTableStringOverrides } from '@layerfi/components/components/StatementOfCashFlowTable/StatementOfCashFlowTable';
  export interface StatementOfCashFlowStringOverrides {
      statementOfCashFlowTable?: StatementOfCashFlowTableStringOverrides;
  }
  export type StatementOfCashFlowProps = TimeRangePickerConfig & {
      stringOverrides?: StatementOfCashFlowStringOverrides;
  };
  export const StandaloneStatementOfCashFlow: (props: StatementOfCashFlowProps) => import("react/jsx-runtime").JSX.Element;
  export const StatementOfCashFlow: (props: StatementOfCashFlowProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/StatementOfCashFlow/constants' {
  export const STATEMENT_OF_CASH_FLOW_ROWS: {
      name: string;
      displayName: string;
      lineItem: string;
      type: string;
      summarize: boolean;
  }[];
  export const ADJUSTMENTS_ROW_NAME = "Adjustments to Net Income";

}
declare module '@layerfi/components/components/StatementOfCashFlow/datePicker/StatementOfCashFlowDatePicker' {
  import type { TimeRangePickerConfig } from '@layerfi/components/views/Reports/reportTypes';
  type StatementOfCashFlowDatePickerProps = Pick<TimeRangePickerConfig, 'allowedDatePickerModes' | 'customDateRanges' | 'defaultDatePickerMode'>;
  export function StatementOfCashFlowDatePicker({ allowedDatePickerModes, customDateRanges, defaultDatePickerMode, }: StatementOfCashFlowDatePickerProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/StatementOfCashFlow/download/CashflowStatementDownloadButton' {
  type CashflowStatementDownloadButtonProps = {
      startDate: Date;
      endDate: Date;
      iconOnly?: boolean;
  };
  export function CashflowStatementDownloadButton({ startDate, endDate, iconOnly, }: CashflowStatementDownloadButtonProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/StatementOfCashFlow/download/useCashflowStatementDownload' {
  import type { S3PresignedUrl } from '@layerfi/components/types/general';
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  type UseCashflowStatementDownloadOptions = {
      startDate: Date;
      endDate: Date;
      onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>;
  };
  export function useCashflowStatementDownload({ startDate, endDate, onSuccess, }: UseCashflowStatementDownloadOptions): import("swr/mutation").SWRMutationResponse<unknown, any, () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      startDate: Date;
      endDate: Date;
      tags: string[];
  } | undefined, never>;
  export {};

}
declare module '@layerfi/components/components/StatementOfCashFlow/index' {
  export { StatementOfCashFlow, StandaloneStatementOfCashFlow } from '@layerfi/components/components/StatementOfCashFlow/StatementOfCashFlow';

}
declare module '@layerfi/components/components/StatementOfCashFlowTable/StatementOfCashFlowTable' {
  import { StatementOfCashFlow } from '@layerfi/components/types';
  type StatementOfCashFlowRowProps = {
      name: string;
      displayName: string;
      lineItem: string | undefined;
      summarize: boolean;
      type: string;
  };
  export interface StatementOfCashFlowTableStringOverrides {
      typeColumnHeader?: string;
      totalColumnHeader?: string;
  }
  export const StatementOfCashFlowTable: ({ data, config, stringOverrides, }: {
      data: StatementOfCashFlow;
      config: StatementOfCashFlowRowProps[];
      stringOverrides?: StatementOfCashFlowTableStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/StatementOfCashFlowTable/index' {
  export { StatementOfCashFlowTable } from '@layerfi/components/components/StatementOfCashFlowTable/StatementOfCashFlowTable';

}
declare module '@layerfi/components/components/SyncingBadge/SyncingBadge' {
  export const SyncingBadge: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/SyncingBadge/index' {
  export { SyncingBadge } from '@layerfi/components/components/SyncingBadge/SyncingBadge';

}
declare module '@layerfi/components/components/SyncingComponent/SyncingComponent' {
  interface SyncingComponentProps {
      title?: string;
      message?: string;
      onRefresh?: () => void;
      timeSync?: number;
      inProgress?: boolean;
      hideContent?: boolean;
  }
  /**
   * SyncingComponent
   * @param title - Title of the component
   * @param message - Message of the component
   * @param onRefresh - Function to refresh the component
   * @param timeSync - Time to sync in minutes
   * @param inProgress - Show progress icon besides button
   * @param hideContent - Hide content of the component
   *
   * @example
   * <SyncingComponent
   *  title='Syncing account data'
   *  message='This may take up to'
   *  onRefresh={() => console.log('refresh')}
   *  timeSync={1440}
   *  inProgress={false}
   *  hideContent={false}
   * />
   */
  export const SyncingComponent: ({ title, message, onRefresh, inProgress, timeSync, hideContent, }: SyncingComponentProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/SyncingComponent/index' {
  export { SyncingComponent } from '@layerfi/components/components/SyncingComponent/SyncingComponent';

}
declare module '@layerfi/components/components/Table/Table' {
  import { TableProps } from '@layerfi/components/types/table';
  export const Table: ({ componentName, children, borderCollapse, bottomSpacing, }: TableProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Table/index' {
  import { TableBody } from '@layerfi/components/components/TableBody/index';
  import { TableCell } from '@layerfi/components/components/TableCell/index';
  import { TableHead } from '@layerfi/components/components/TableHead/index';
  import { TableRow } from '@layerfi/components/components/TableRow/index';
  import { Table } from '@layerfi/components/components/Table/Table';
  export { Table, TableBody, TableHead, TableRow, TableCell };

}
declare module '@layerfi/components/components/TableBody/TableBody' {
  import { TableBodyProps } from '@layerfi/components/types/table';
  export const TableBody: ({ children }: TableBodyProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/TableBody/index' {
  export { TableBody } from '@layerfi/components/components/TableBody/TableBody';

}
declare module '@layerfi/components/components/TableCell/TableCell' {
  import { TableCellProps } from '@layerfi/components/types/table';
  export const TableCell: ({ children, className, isHeaderCell, isCurrency, align, primary, withExpandIcon, fullWidth, colSpan, onClick, style, width, nowrap, }: TableCellProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/TableCell/index' {
  export { TableCell } from '@layerfi/components/components/TableCell/TableCell';

}
declare module '@layerfi/components/components/TableHead/TableHead' {
  import { TableHeadProps } from '@layerfi/components/types/table';
  export const TableHead: ({ children }: TableHeadProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/TableHead/index' {
  export { TableHead } from '@layerfi/components/components/TableHead/TableHead';

}
declare module '@layerfi/components/components/TableRow/TableRow' {
  import { TableRowProps } from '@layerfi/components/types/table';
  export const TableRow: React.FC<TableRowProps>;

}
declare module '@layerfi/components/components/TableRow/index' {
  export { TableRow } from '@layerfi/components/components/TableRow/TableRow';

}
declare module '@layerfi/components/components/Tabs/Tab' {
  import { ChangeEvent, ReactNode } from 'react';
  interface TabProps {
      checked: boolean;
      label: string;
      name: string;
      onChange: (event: ChangeEvent<HTMLInputElement>) => void;
      value: string;
      disabled?: boolean;
      disabledMessage?: string;
      leftIcon?: ReactNode;
      index: number;
      badge?: ReactNode;
  }
  export const Tab: ({ checked, label, name, onChange, value, leftIcon, disabled, disabledMessage, index, badge, }: TabProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Tabs/Tabs' {
  import { ChangeEvent, ReactNode } from 'react';
  interface Option {
      label: string;
      value: string;
      disabled?: boolean;
      disabledMessage?: string;
      leftIcon?: ReactNode;
  }
  interface TabsProps {
      name: string;
      options: Option[];
      selected?: Option['value'];
      onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  }
  export const Tabs: ({ name, options, selected, onChange }: TabsProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Tasks/TaskMonthTile' {
  import { MonthData } from '@layerfi/components/components/Tasks/types';
  export type TaskMonthTileProps = {
      data: MonthData;
      active?: boolean;
      disabled?: boolean;
      onClick: (date: Date) => void;
  };
  export const TaskMonthTile: ({ data, onClick, active, disabled }: TaskMonthTileProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/TaskStatusBadge' {
  import { BookkeepingPeriod } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  type TaskStatusBadgeProps = {
      status: BookkeepingPeriod['status'];
      tasksCount?: number;
  };
  export const TaskStatusBadge: ({ status, tasksCount }: TaskStatusBadgeProps) => import("react/jsx-runtime").JSX.Element | undefined;
  export {};

}
declare module '@layerfi/components/components/Tasks/Tasks' {
  export interface TasksStringOverrides {
      header?: string;
  }
  type TasksProps = {
      /**
       * @deprecated Use `stringOverrides.header` instead
       */
      tasksHeader?: string;
      mobile?: boolean;
      stringOverrides?: TasksStringOverrides;
      onClickReconnectAccounts?: () => void;
  };
  export function Tasks({ mobile, tasksHeader, onClickReconnectAccounts, stringOverrides, }: TasksProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Tasks/TasksHeader' {
  export const TasksHeader: ({ tasksHeader, }: {
      tasksHeader?: string;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/TasksList' {
  type TasksListProps = {
      pageSize?: number;
      mobile?: boolean;
  };
  export const TasksList: ({ pageSize, mobile }: TasksListProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Tasks/TasksListItem' {
  import { type UserVisibleTask } from '@layerfi/components/utils/bookkeeping/tasks/bookkeepingTasksFilters';
  type TasksListItemProps = {
      task: UserVisibleTask;
      defaultOpen: boolean;
      onExpandTask?: (isOpen: boolean) => void;
  };
  export const TasksListItem: import("react").ForwardRefExoticComponent<TasksListItemProps & import("react").RefAttributes<HTMLDivElement>>;
  export {};

}
declare module '@layerfi/components/components/Tasks/TasksListMobile' {
  import { type UserVisibleTask } from '@layerfi/components/utils/bookkeeping/tasks/bookkeepingTasksFilters';
  type TasksListMobileProps = {
      tasksCount: number;
      sortedTasks: ReadonlyArray<UserVisibleTask>;
      indexFirstIncomplete: number;
      currentPage: number;
      pageSize: number;
      setCurrentPage: (page: number) => void;
  };
  export const TasksListMobile: ({ tasksCount, sortedTasks, indexFirstIncomplete, currentPage, pageSize, setCurrentPage, }: TasksListMobileProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Tasks/TasksMonthSelector' {
  function TasksMonthSelector(): import("react/jsx-runtime").JSX.Element;
  export { TasksMonthSelector };

}
declare module '@layerfi/components/components/Tasks/TasksPanelNotification' {
  type TasksPanelNotificationProps = {
      onClickReconnectAccounts?: () => void;
  };
  export const TasksPanelNotification: ({ onClickReconnectAccounts, }: TasksPanelNotificationProps) => import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/Tasks/TasksPending' {
  export const TasksPending: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/TasksYearsTabs' {
  export const TasksYearsTabs: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/container/TasksEmptyContainer' {
  import type { PropsWithChildren } from 'react';
  export function TasksEmptyContainer({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/types' {
  import { BookkeepingPeriodStatus } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  import type { UserVisibleTask } from '@layerfi/components/utils/bookkeeping/tasks/bookkeepingTasksFilters';
  export type MonthData = {
      monthStr: string;
      date: Date;
      year: number;
      month: number;
      total: number;
      completed: number;
      status?: BookkeepingPeriodStatus;
      disabled?: boolean;
      tasks: ReadonlyArray<UserVisibleTask>;
  };

}
declare module '@layerfi/components/components/Textarea/Textarea' {
  import { HTMLProps } from 'react';
  export interface TextareaProps extends HTMLProps<HTMLTextAreaElement> {
      isInvalid?: boolean;
      errorMessage?: string;
  }
  export const Textarea: ({ className, isInvalid, errorMessage, ...props }: TextareaProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Textarea/index' {
  export { Textarea } from '@layerfi/components/components/Textarea/Textarea';

}
declare module '@layerfi/components/components/Toast/Toast' {
  export interface ToastProps {
      id?: string;
      content: string;
      duration?: number;
      isExiting?: boolean;
      type?: 'success' | 'error' | 'default';
  }
  export function ToastsContainer(): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Toast/index' {
  export { ToastsContainer } from '@layerfi/components/components/Toast/Toast';

}
declare module '@layerfi/components/components/Toggle/Toggle' {
  import { CSSProperties, ChangeEvent, ReactNode } from 'react';
  export interface Option {
      label: string;
      value: string;
      disabled?: boolean;
      disabledMessage?: string;
      leftIcon?: ReactNode;
      style?: CSSProperties;
  }
  export enum ToggleSize {
      medium = "medium",
      small = "small",
      xsmall = "xsmall"
  }
  export interface ToggleProps {
      name: string;
      size?: ToggleSize;
      options: Option[];
      selected?: Option['value'];
      onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  }
  export const Toggle: ({ name, options, selected, onChange, size, }: ToggleProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Toggle/index' {
  export { Toggle } from '@layerfi/components/components/Toggle/Toggle';

}
declare module '@layerfi/components/components/Tooltip/Tooltip' {
  import { ReactNode, HTMLProps } from 'react';
  import type { Placement } from '@floating-ui/react';
  export interface TooltipOptions {
      initialOpen?: boolean;
      placement?: Placement;
      open?: boolean;
      disabled?: boolean;
      onOpenChange?: (open: boolean) => void;
      offset?: number;
      shift?: {
          padding?: number;
      };
  }
  export const Tooltip: ({ children, ...options }: {
      children: ReactNode;
  } & TooltipOptions) => import("react/jsx-runtime").JSX.Element;
  export const TooltipTrigger: import("react").ForwardRefExoticComponent<Omit<HTMLProps<HTMLElement> & {
      asChild?: boolean;
  }, "ref"> & import("react").RefAttributes<HTMLElement>>;
  type TooltipContentProps = Omit<HTMLProps<HTMLDivElement>, 'style'> & {
      width?: 'md';
  };
  export const TooltipContent: import("react").ForwardRefExoticComponent<Omit<TooltipContentProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
  export {};

}
declare module '@layerfi/components/components/Tooltip/index' {
  export { Tooltip, TooltipTrigger, TooltipContent } from '@layerfi/components/components/Tooltip/Tooltip';
  export { useTooltip } from '@layerfi/components/components/Tooltip/useTooltip';

}
declare module '@layerfi/components/components/Tooltip/useTooltip' {
  import { TooltipOptions } from '@layerfi/components/components/Tooltip/Tooltip';
  export type ContextType = ReturnType<typeof useTooltip> | null;
  export const TooltipContext: import("react").Context<ContextType>;
  export const useTooltipContext: () => {
      placement: import("@floating-ui/utils").Placement;
      strategy: import("@floating-ui/utils").Strategy;
      middlewareData: import("@floating-ui/core").MiddlewareData;
      x: number;
      y: number;
      isPositioned: boolean;
      update: () => void;
      floatingStyles: React.CSSProperties;
      refs: {
          reference: import("react").MutableRefObject<import("@floating-ui/react-dom").ReferenceType | null>;
          floating: React.MutableRefObject<HTMLElement | null>;
          setReference: (node: import("@floating-ui/react-dom").ReferenceType | null) => void;
          setFloating: (node: HTMLElement | null) => void;
      } & import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
      elements: {
          reference: import("@floating-ui/react-dom").ReferenceType | null;
          floating: HTMLElement | null;
      } & import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
      context: {
          placement: import("@floating-ui/utils").Placement;
          x: number;
          y: number;
          strategy: import("@floating-ui/utils").Strategy;
          middlewareData: import("@floating-ui/core").MiddlewareData;
          isPositioned: boolean;
          update: () => void;
          floatingStyles: React.CSSProperties;
          open: boolean;
          onOpenChange: (open: boolean, event?: Event, reason?: import("@floating-ui/react").OpenChangeReason) => void;
          events: import("@floating-ui/react").FloatingEvents;
          dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
          nodeId: string | undefined;
          floatingId: string | undefined;
          refs: import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
          elements: import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
      };
      getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
      getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
      getItemProps: (userProps?: Omit<React.HTMLProps<HTMLElement>, "selected" | "active"> & {
          active?: boolean;
          selected?: boolean;
      }) => Record<string, unknown>;
      open: boolean;
      setOpen: (open: boolean) => void;
      isMounted: boolean;
      styles: import("react").CSSProperties;
      disabled: boolean | undefined;
  };
  export const useTooltip: ({ initialOpen, placement, open: controlledOpen, onOpenChange: setControlledOpen, disabled, offset: offsetProp, shift: shiftProp, }?: TooltipOptions) => {
      placement: import("@floating-ui/utils").Placement;
      strategy: import("@floating-ui/utils").Strategy;
      middlewareData: import("@floating-ui/core").MiddlewareData;
      x: number;
      y: number;
      isPositioned: boolean;
      update: () => void;
      floatingStyles: React.CSSProperties;
      refs: {
          reference: import("react").MutableRefObject<import("@floating-ui/react-dom").ReferenceType | null>;
          floating: React.MutableRefObject<HTMLElement | null>;
          setReference: (node: import("@floating-ui/react-dom").ReferenceType | null) => void;
          setFloating: (node: HTMLElement | null) => void;
      } & import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
      elements: {
          reference: import("@floating-ui/react-dom").ReferenceType | null;
          floating: HTMLElement | null;
      } & import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
      context: {
          placement: import("@floating-ui/utils").Placement;
          x: number;
          y: number;
          strategy: import("@floating-ui/utils").Strategy;
          middlewareData: import("@floating-ui/core").MiddlewareData;
          isPositioned: boolean;
          update: () => void;
          floatingStyles: React.CSSProperties;
          open: boolean;
          onOpenChange: (open: boolean, event?: Event, reason?: import("@floating-ui/react").OpenChangeReason) => void;
          events: import("@floating-ui/react").FloatingEvents;
          dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
          nodeId: string | undefined;
          floatingId: string | undefined;
          refs: import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
          elements: import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
      };
      getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
      getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
      getItemProps: (userProps?: Omit<React.HTMLProps<HTMLElement>, "selected" | "active"> & {
          active?: boolean;
          selected?: boolean;
      }) => Record<string, unknown>;
      open: boolean;
      setOpen: (open: boolean) => void;
      isMounted: boolean;
      styles: import("react").CSSProperties;
      disabled: boolean | undefined;
  };

}
declare module '@layerfi/components/components/Typography/ErrorText' {
  import { TextProps } from '@layerfi/components/components/Typography/Text';
  export type ErrorTextProps = TextProps;
  export const ErrorText: ({ className, ...props }: ErrorTextProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Typography/Heading' {
  import { ReactNode } from 'react';
  export enum HeadingSize {
      primary = "primary",
      secondary = "secondary",
      page = "page",
      view = "view"
  }
  export interface HeadingProps {
      as?: React.ElementType;
      className?: string;
      children: ReactNode;
      size?: HeadingSize;
      align?: 'left' | 'center' | 'right';
  }
  export const Heading: ({ as: Component, className, children, size, align, }: HeadingProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Typography/Text' {
  import { ReactNode } from 'react';
  export enum TextSize {
      lg = "lg",
      md = "md",
      sm = "sm"
  }
  export enum TextWeight {
      normal = "normal",
      bold = "bold"
  }
  export enum TextUseTooltip {
      whenTruncated = "whenTruncated",
      always = "always"
  }
  export type TextStatus = 'success' | 'error' | 'warning' | 'disabled' | 'info';
  export interface TextTooltipOptions {
      contentClassName?: string;
      offset?: number;
      shift?: {
          padding?: number;
      };
  }
  export interface TextProps {
      as?: React.ElementType;
      className?: string;
      children: ReactNode;
      size?: TextSize;
      weight?: TextWeight;
      status?: TextStatus;
      htmlFor?: string;
      withTooltip?: TextUseTooltip;
      tooltipOptions?: TextTooltipOptions;
      ellipsis?: boolean;
      pb?: '4xs' | '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg';
      invertColor?: boolean;
  }
  export const Text: ({ as: Component, className, children, size, weight, withTooltip, ellipsis, status, pb, invertColor, ...props }: TextProps) => import("react/jsx-runtime").JSX.Element;
  export const TextWithTooltip: ({ as: Component, className, children, size: _size, weight: _weight, withTooltip: _withTooltip, tooltipOptions, ...props }: TextProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Typography/index' {
  export { Text, TextSize, TextWeight, TextUseTooltip } from '@layerfi/components/components/Typography/Text';
  export { Heading, HeadingSize } from '@layerfi/components/components/Typography/Heading';
  export { ErrorText } from '@layerfi/components/components/Typography/ErrorText';

}
declare module '@layerfi/components/components/UploadTransactions/UploadTransactions' {
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  type UploadTransactionsProps = {
      onComplete?: () => Awaitable<void>;
  };
  export function UploadTransactions({ onComplete }: UploadTransactionsProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/UploadTransactions/UploadTransactionsConfirmationStep' {
  type UploadTransactionsConfirmationStepProps = {
      onRestartFlow: () => void;
      uploadedTransactionsCount: number;
  };
  export function UploadTransactionsConfirmationStep({ onRestartFlow, uploadedTransactionsCount }: UploadTransactionsConfirmationStepProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/UploadTransactions/UploadTransactionsUploadCsvStep' {
  import type { CustomAccount } from '@layerfi/components/hooks/customAccounts/types';
  import { type CustomAccountParseCsvResponse } from '@layerfi/components/hooks/customAccounts/useCustomAccountParseCsv';
  export type AccountOption = {
      value: string;
      label: string;
      account: Partial<CustomAccount> & Pick<CustomAccount, 'accountName'>;
      __isNew__?: true;
  };
  interface UploadTransactionsUploadCsvStepProps {
      selectedAccount: AccountOption | null;
      onSelectAccount: (account: AccountOption | null) => void;
      selectedFile: File | null;
      onSelectFile: (file: File | null) => void;
      onParseCsv: (parseCsvResponse: CustomAccountParseCsvResponse) => void;
  }
  export function UploadTransactionsUploadCsvStep({ selectedAccount, onSelectAccount, selectedFile, onSelectFile, onParseCsv }: UploadTransactionsUploadCsvStepProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/UploadTransactions/UploadTransactionsValidateCsvStep' {
  import type { CustomAccountParseCsvResponse } from '@layerfi/components/hooks/customAccounts/useCustomAccountParseCsv';
  import { BankTransaction } from '@layerfi/components/types';
  interface UploadTransactionsValidateCsvStepProps {
      parseCsvResponse: CustomAccountParseCsvResponse | null;
      selectedAccountId?: string;
      onSelectFile: (file: File | null) => void;
      onUploadTransactionsSuccess: (transactions: BankTransaction[]) => void;
  }
  export function UploadTransactionsValidateCsvStep({ parseCsvResponse, selectedAccountId, onSelectFile, onUploadTransactionsSuccess }: UploadTransactionsValidateCsvStepProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/UploadTransactions/template' {
  import { CustomAccountTransactionRow } from '@layerfi/components/hooks/customAccounts/types';
  export const templateHeaders: {
      [K in keyof CustomAccountTransactionRow]: string;
  };
  export const allHeaders: {
      [K in keyof CustomAccountTransactionRow]: string;
  };
  export const templateExampleTransactions: CustomAccountTransactionRow[];

}
declare module '@layerfi/components/components/UploadTransactions/types' {
  export enum UploadTransactionsStep {
      UploadCsv = 0,
      ValidateCsv = 1,
      Confirmation = 2
  }

}
declare module '@layerfi/components/components/UpsellBanner/BookkeepingUpsellBar' {
  interface BookkeepingUpsellBarProps {
      onClick?: () => void;
      href?: string;
  }
  export const BookkeepingUpsellBar: ({ onClick, href, }: BookkeepingUpsellBarProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/UpsellBanner/index' {
  export { BookkeepingUpsellBar } from '@layerfi/components/components/UpsellBanner/BookkeepingUpsellBar';

}
declare module '@layerfi/components/components/Vendors/SelectVendor' {
  import { Vendor } from '@layerfi/components/types/vendors';
  type SelectVendorProps = {
      value: Vendor | null;
      onChange: (value: Vendor | null) => void;
      disabled?: boolean;
      placeholder?: string;
      withContext?: boolean;
      isInvalid?: boolean;
      errorMessage?: string;
  };
  export const SelectVendor: ({ withContext, ...props }: SelectVendorProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/View/View' {
  import { ReactNode } from 'react';
  export interface ViewProps {
      children: ReactNode;
      title?: string;
      showHeader?: boolean;
      header?: ReactNode;
      headerControls?: ReactNode;
      type?: 'default' | 'panel';
      withSidebar?: boolean;
      sidebar?: ReactNode;
      viewClassName?: string;
      notification?: ReactNode;
  }
  const View: import("react").ForwardRefExoticComponent<ViewProps & import("react").RefAttributes<HTMLDivElement>>;
  export { View };

}
declare module '@layerfi/components/components/View/index' {
  export { View } from '@layerfi/components/components/View/View';

}
declare module '@layerfi/components/components/ViewHeader/ViewHeader' {
  import { ReactNode } from 'react';
  export interface ViewHeaderProps {
      title?: string;
      className?: string;
      children?: ReactNode;
  }
  export const ViewHeader: ({ title, className, children }: ViewHeaderProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ViewHeader/index' {
  export { ViewHeader } from '@layerfi/components/components/ViewHeader/ViewHeader';

}
declare module '@layerfi/components/components/VirtualizedDataTable/VirtualizedDataTable' {
  import { type RowData } from '@tanstack/react-table';
  import type { ColumnConfig } from '@layerfi/components/components/DataTable/DataTable';
  module '@tanstack/react-table' {
      interface ColumnMeta<TData extends RowData, TValue> {
          isRowHeader: boolean;
      }
  }
  export interface VirtualizedDataTableProps<TData extends {
      id: string;
  }, TColumns extends string> {
      columnConfig: ColumnConfig<TData, TColumns>;
      data: TData[] | undefined;
      componentName: string;
      ariaLabel: string;
      isLoading: boolean;
      isError: boolean;
      slots: {
          EmptyState: React.FC;
          ErrorState: React.FC;
      };
      shrinkHeightToFitRows?: boolean;
      height?: number;
      rowHeight?: number;
      overscan?: number;
  }
  export const VirtualizedDataTable: <TData extends {
      id: string;
  }, TColumns extends string>({ columnConfig, data, isLoading, isError, componentName, ariaLabel, slots, shrinkHeightToFitRows, height, rowHeight, overscan, }: VirtualizedDataTableProps<TData, TColumns>) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Wizard/Wizard' {
  import { type PropsWithChildren, type ReactNode } from 'react';
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  export function useWizard(): {
      next: () => Awaitable<void>;
      previous: () => void;
      goToStep: (stepIndex: number) => void;
  };
  type WizardProps = PropsWithChildren<{
      Header: ReactNode;
      Footer: ReactNode;
      onComplete?: () => Awaitable<void>;
      onStepChange?: (stepIndex: number) => void;
  }>;
  export function Wizard({ Header, Footer, onComplete, onStepChange, children, }: WizardProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/domain/transactions/actions/TransactionsActions' {
  import type { PropsWithChildren } from 'react';
  export function TransactionsActions({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ui/Button/Button' {
  import { type ButtonProps } from 'react-aria-components';
  type ButtonVariant = 'solid' | 'ghost' | 'outlined' | 'text' | 'branded';
  type ButtonSize = 'md';
  type ButtonRounding = 'sm' | 'md';
  const Button: import("react").ForwardRefExoticComponent<Omit<ButtonProps, "className"> & {
      ellipsis?: true;
      icon?: true;
      inset?: true;
      rounded?: ButtonRounding;
      size?: ButtonSize;
      variant?: ButtonVariant;
  } & import("react").RefAttributes<HTMLButtonElement>>;
  export { Button };

}
declare module '@layerfi/components/components/ui/Checkbox/Checkbox' {
  import { type CheckboxProps as AriaCheckboxProps } from 'react-aria-components';
  type CheckboxVariant = 'default' | 'success' | 'error';
  type CheckboxSize = 'md' | 'lg';
  type CheckboxProps = Omit<AriaCheckboxProps, 'className'> & {
      className?: string;
      variant?: CheckboxVariant;
      size?: CheckboxSize;
  };
  type CheckboxWithTooltipProps = CheckboxProps & {
      tooltip?: string;
  };
  export function Checkbox({ children, className, variant, size, ...props }: CheckboxProps): import("react/jsx-runtime").JSX.Element;
  export function CheckboxWithTooltip({ tooltip, ...props }: CheckboxWithTooltipProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ui/ComboBox/ComboBox' {
  import { type ReactNode } from 'react';
  import type { OneOf } from '@layerfi/components/types/utility/oneOf';
  type ComboBoxOption = {
      label: string;
      value: string;
      isDisabled?: boolean;
  };
  type OptionsOrGroups<T> = OneOf<[
      {
          options: ReadonlyArray<T>;
      },
      {
          groups: ReadonlyArray<{
              label: string;
              options: ReadonlyArray<T>;
          }>;
      }
  ]>;
  type AriaLabelProps = Pick<React.AriaAttributes, 'aria-label' | 'aria-labelledby' | 'aria-describedby'>;
  type ComboBoxProps<T extends ComboBoxOption> = {
      className?: string;
      selectedValue: T | null;
      onSelectedValueChange: (value: T | null) => void;
      onInputValueChange?: (value: string) => void;
      placeholder?: string;
      slots?: {
          EmptyMessage?: ReactNode;
          ErrorMessage?: ReactNode;
          SelectedValue?: ReactNode;
      };
      inputId?: string;
      isDisabled?: boolean;
      isError?: boolean;
      isLoading?: boolean;
      isMutating?: boolean;
      isSearchable?: boolean;
      isClearable?: boolean;
      isReadOnly?: boolean;
      displayDisabledAsSelected?: boolean;
  } & OptionsOrGroups<T> & AriaLabelProps;
  export function ComboBox<T extends ComboBoxOption>({ className, selectedValue, onSelectedValueChange, options, groups, onInputValueChange, placeholder, slots, inputId, isDisabled, isError, isLoading, isMutating, isSearchable, isClearable, isReadOnly, displayDisabledAsSelected, ...ariaProps }: ComboBoxProps<T>): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ui/Date/Date' {
  import type { ZonedDateTime } from '@internationalized/date';
  import { type DateFieldProps as ReactAriaDateFieldProps, type DateSegmentProps as ReactAriaDateSegmentProps, type DateInputProps as ReactAriaDateInputProps } from 'react-aria-components';
  export const DateField: import("react").ForwardRefExoticComponent<ReactAriaDateFieldProps<ZonedDateTime> & {
      inline?: boolean;
  } & import("react").RefAttributes<HTMLDivElement>>;
  export const DateInput: import("react").ForwardRefExoticComponent<Omit<ReactAriaDateInputProps, "className"> & {
      inset?: true;
  } & import("react").RefAttributes<HTMLInputElement>>;
  export const DateSegment: import("react").ForwardRefExoticComponent<Omit<ReactAriaDateSegmentProps, "className"> & {
      isReadOnly?: boolean;
  } & import("react").RefAttributes<HTMLDivElement>>;

}
declare module '@layerfi/components/components/ui/DropdownMenu/DropdownMenu' {
  import React, { type PropsWithChildren } from 'react';
  type DropdownMenuProps = PropsWithChildren<{
      className?: string;
      ariaLabel?: string;
      slots: {
          Trigger: React.FC;
      };
      slotProps?: {
          Dialog?: {
              width?: number | string;
          };
      };
      variant?: 'compact';
  }>;
  type MenuItemProps = PropsWithChildren<{
      isDisabled?: boolean;
      onClick?: () => void;
  }>;
  export const MenuItem: ({ children, onClick, isDisabled }: MenuItemProps) => import("react/jsx-runtime").JSX.Element;
  export const MenuList: ({ children }: PropsWithChildren) => import("react/jsx-runtime").JSX.Element;
  export const DropdownMenu: ({ children, ariaLabel, variant, slots, slotProps }: DropdownMenuProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ui/Form/Form' {
  import { type FormProps as ReactAriaFormProps, type TextFieldProps as ReactAriaTextFieldProps, type FieldErrorProps as ReactAriaFieldErrorProps } from 'react-aria-components';
  export const Form: import("react").ForwardRefExoticComponent<ReactAriaFormProps & import("react").RefAttributes<HTMLFormElement>>;
  export type TextFieldProps = ReactAriaTextFieldProps & {
      inline?: boolean;
      textarea?: boolean;
  };
  export const TextField: import("react").ForwardRefExoticComponent<ReactAriaTextFieldProps & {
      inline?: boolean;
      textarea?: boolean;
  } & import("react").RefAttributes<HTMLDivElement>>;
  type FieldErrorProps = Omit<ReactAriaFieldErrorProps, 'className'>;
  export const FieldError: import("react").ForwardRefExoticComponent<FieldErrorProps & import("react").RefAttributes<HTMLElement>>;
  export {};

}
declare module '@layerfi/components/components/ui/Input/Input' {
  import { InputProps as ReactAriaInputProps } from 'react-aria-components';
  export const Input: import("react").ForwardRefExoticComponent<Omit<ReactAriaInputProps, "className"> & {
      inset?: true;
      placement?: "first";
  } & import("react").RefAttributes<HTMLInputElement>>;

}
declare module '@layerfi/components/components/ui/Input/InputGroup' {
  import { type GroupProps as ReactAriaGroupProps } from 'react-aria-components';
  export const InputGroup: import("react").ForwardRefExoticComponent<ReactAriaGroupProps & {
      actionCount?: 1 | 2;
  } & import("react").RefAttributes<HTMLDivElement>>;

}
declare module '@layerfi/components/components/ui/Input/TextArea' {
  import { type ComponentProps } from 'react';
  import { TextArea as ReactAriaTextArea } from 'react-aria-components';
  type TextAreaProps = Omit<ComponentProps<typeof ReactAriaTextArea>, 'className'> & {
      resize?: 'both' | 'vertical' | 'horizontal' | 'none';
  };
  export const TextArea: import("react").ForwardRefExoticComponent<Omit<TextAreaProps, "ref"> & import("react").RefAttributes<HTMLTextAreaElement>>;
  export {};

}
declare module '@layerfi/components/components/ui/ListBox/ListBox' {
  import { type ForwardedRef, type Ref } from 'react';
  import { type ListBoxProps as ReactAriaListBoxProps, type ListBoxItemProps as ReactAriaListBoxItemProps, type ListBoxSectionProps as ReactAriaListBoxSectionProps } from 'react-aria-components';
  type ListBoxProps<T extends Record<string, unknown>> = Omit<ReactAriaListBoxProps<T>, 'className'>;
  function InternalListBox<T extends Record<string, unknown>>(props: ListBoxProps<T>, ref: React.ForwardedRef<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
  export const ListBox: <T extends Record<string, unknown>>(props: ListBoxProps<T> & {
      ref?: Ref<HTMLDivElement>;
  }) => ReturnType<typeof InternalListBox>;
  type ListBoxSectionProps<T extends Record<string, unknown>> = Omit<ReactAriaListBoxSectionProps<T>, 'className'>;
  function InternalListBoxSection<T extends Record<string, unknown>>(props: ListBoxSectionProps<T>, ref: ForwardedRef<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
  export const ListBoxSection: <T extends Record<string, unknown>>(props: ListBoxSectionProps<T> & {
      ref?: Ref<HTMLDivElement>;
  }) => ReturnType<typeof InternalListBoxSection>;
  export const ListBoxSectionHeader: import("react").ForwardRefExoticComponent<Omit<Omit<Pick<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLElement>, HTMLElement>, "ref">, "id" | "slot"> & {
      nonAria?: true;
  } & import("@layerfi/components/components/ui/Typography/Text").TextStyleProps & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLElement>, "slot">, "ref"> & import("react").RefAttributes<HTMLElement>>;
  type ListBoxItemProps<T extends Record<string, unknown>> = Omit<ReactAriaListBoxItemProps<T>, 'className'>;
  function InternalListBoxItem<T extends Record<string, unknown>>(props: ListBoxItemProps<T>, ref?: ForwardedRef<T>): import("react/jsx-runtime").JSX.Element;
  export const ListBoxItem: <T extends Record<string, unknown>>(props: ListBoxItemProps<T> & {
      ref?: Ref<T>;
  }) => ReturnType<typeof InternalListBoxItem>;
  export {};

}
declare module '@layerfi/components/components/ui/Loading/LoadingSpinner' {
  import { type LucideProps } from 'lucide-react';
  export function LoadingSpinner({ size }: Pick<LucideProps, 'size'>): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ui/Menu/Menu' {
  import { type MenuItemProps as ReactAriaMenuItemProps } from 'react-aria-components';
  export const Menu: import("react").ForwardRefExoticComponent<{
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLDivElement>>;
  export const MenuItem: import("react").ForwardRefExoticComponent<{
      children?: import("react").ReactNode | undefined;
  } & Pick<ReactAriaMenuItemProps<object>, "textValue" | "onAction"> & import("react").RefAttributes<HTMLDivElement>>;

}
declare module '@layerfi/components/components/ui/Meter/Meter' {
  import { MeterProps as ReactAriaMeterProps } from 'react-aria-components';
  export const Meter: import("react").ForwardRefExoticComponent<Omit<ReactAriaMeterProps, "children" | "className"> & {
      label: string;
      meterOnly?: boolean;
      className?: string;
  } & import("react").RefAttributes<HTMLDivElement>>;

}
declare module '@layerfi/components/components/ui/Modal/Modal' {
  import { type ComponentProps } from 'react';
  import { type DialogProps, type ModalOverlayProps } from 'react-aria-components';
  type ModalSize = 'md' | 'lg' | 'xl';
  type ModalVariant = 'center' | 'drawer' | 'mobile-drawer';
  const ModalOverlay: import("react").ForwardRefExoticComponent<Omit<ModalOverlayProps, "className"> & {
      variant: ModalVariant;
  } & import("react").RefAttributes<HTMLDivElement>>;
  const InternalModal: import("react").ForwardRefExoticComponent<{
      size?: ModalSize;
      flexBlock?: boolean;
      variant?: ModalVariant;
  } & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLDivElement>>;
  const Dialog: import("react").ForwardRefExoticComponent<Omit<DialogProps, "className"> & {
      variant: ModalVariant;
  } & import("react").RefAttributes<HTMLElement>>;
  type AllowedModalOverlayProps = Pick<ComponentProps<typeof ModalOverlay>, 'isOpen' | 'onOpenChange' | 'isDismissable'>;
  type AllowedInternalModalProps = Pick<ComponentProps<typeof InternalModal>, 'flexBlock' | 'size'>;
  type AllowedDialogProps = Pick<ComponentProps<typeof Dialog>, 'children' | 'role' | 'aria-label'>;
  export type ModalProps = AllowedModalOverlayProps & AllowedInternalModalProps & AllowedDialogProps;
  export function Modal({ isOpen, size, flexBlock, onOpenChange, children, 'aria-label': ariaLabel, role, }: ModalProps): import("react/jsx-runtime").JSX.Element;
  type AllowedInternalDrawerProps = Pick<ComponentProps<typeof InternalModal>, 'size'> & {
      variant?: Exclude<ModalVariant, 'center'>;
  };
  export type DrawerProps = AllowedModalOverlayProps & AllowedInternalDrawerProps & AllowedDialogProps;
  export function Drawer({ isOpen, onOpenChange, size, children, 'aria-label': ariaLabel, variant, isDismissable, role, }: DrawerProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ui/Modal/ModalSlots' {
  import { type PropsWithChildren, type ReactElement } from 'react';
  type ModalCloseButtonProps = {
      onClose?: () => void;
      positionAbsolute?: boolean;
  };
  export const ModalCloseButton: ({ onClose, positionAbsolute }: ModalCloseButtonProps) => import("react/jsx-runtime").JSX.Element;
  type ModalTitleWithCloseProps = {
      heading: ReactElement;
      onClose?: () => void;
  };
  export const ModalTitleWithClose: import("react").ForwardRefExoticComponent<ModalTitleWithCloseProps & import("react").RefAttributes<HTMLDivElement>>;
  export const ModalHeading: import("react").ForwardRefExoticComponent<Omit<Omit<import("react-aria-components").HeadingProps & {
      align?: "center";
      pbe?: import("@layerfi/components/components/ui/sharedUITypes").Spacing;
      pie?: import("@layerfi/components/components/ui/sharedUITypes").Spacing;
      size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
      variant?: "subtle";
      weight?: "normal" | "bold";
      ellipsis?: true;
  } & import("react").RefAttributes<HTMLHeadingElement>, "slot" | "level">, "ref"> & import("react").RefAttributes<HTMLHeadingElement>>;
  export const ModalDescription: import("react").ForwardRefExoticComponent<Omit<Omit<Pick<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, "ref">, "id" | "slot"> & {
      nonAria?: true;
  } & import("@layerfi/components/components/ui/Typography/Text").TextStyleProps & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLParagraphElement>, "slot">, "ref"> & import("react").RefAttributes<HTMLParagraphElement>>;
  export function ModalContent({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;
  export function ModalActions({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ui/Pill/Pill' {
  import { type ButtonProps } from 'react-aria-components';
  type PillStatus = 'error';
  export const Pill: import("react").ForwardRefExoticComponent<Pick<ButtonProps, "children" | "onPress" | "onHoverStart"> & {
      status?: PillStatus;
  } & import("react").RefAttributes<HTMLButtonElement>>;
  export {};

}
declare module '@layerfi/components/components/ui/Popover/Popover' {
  import { PopoverProps as ReactAriaPopoverProps } from 'react-aria-components';
  type PopoverProps = Omit<ReactAriaPopoverProps, 'className'>;
  export const Popover: import("react").ForwardRefExoticComponent<PopoverProps & import("react").RefAttributes<HTMLElement>>;
  export {};

}
declare module '@layerfi/components/components/ui/Portal/Portal' {
  export const PORTAL_CLASS_NAME = "Layer__Portal";

}
declare module '@layerfi/components/components/ui/SearchField/MinimalSearchField' {
  import { type SearchFieldProps as ReactAriaSearchFieldProps } from 'react-aria-components';
  type MinimalSearchFieldProps = ReactAriaSearchFieldProps & {
      placeholder?: string;
  };
  export function MinimalSearchField({ placeholder, ...restProps }: MinimalSearchFieldProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ui/Square/Square' {
  type SquareProps = {
      inset?: true;
  };
  export const Square: import("react").ForwardRefExoticComponent<SquareProps & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLDivElement>>;
  export {};

}
declare module '@layerfi/components/components/ui/Stack/Stack' {
  import { type PropsWithChildren } from 'react';
  import type { Spacing } from '@layerfi/components/components/ui/sharedUITypes';
  export type StackProps = PropsWithChildren<{
      align?: 'start' | 'center' | 'baseline' | 'end';
      gap?: Spacing;
      justify?: 'start' | 'center' | 'end' | 'space-between';
      overflow?: 'scroll' | 'hidden' | 'auto' | 'clip' | 'visible';
      pb?: Spacing;
      pbs?: Spacing;
      pbe?: Spacing;
      pi?: Spacing;
      pis?: Spacing;
      pie?: Spacing;
      fluid?: boolean;
      slot?: string;
      className?: string;
  }>;
  export const VStack: import("react").ForwardRefExoticComponent<{
      align?: "start" | "center" | "baseline" | "end";
      gap?: Spacing;
      justify?: "start" | "center" | "end" | "space-between";
      overflow?: "scroll" | "hidden" | "auto" | "clip" | "visible";
      pb?: Spacing;
      pbs?: Spacing;
      pbe?: Spacing;
      pi?: Spacing;
      pis?: Spacing;
      pie?: Spacing;
      fluid?: boolean;
      slot?: string;
      className?: string;
  } & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLDivElement>>;
  export const HStack: import("react").ForwardRefExoticComponent<{
      align?: "start" | "center" | "baseline" | "end";
      gap?: Spacing;
      justify?: "start" | "center" | "end" | "space-between";
      overflow?: "scroll" | "hidden" | "auto" | "clip" | "visible";
      pb?: Spacing;
      pbs?: Spacing;
      pbe?: Spacing;
      pi?: Spacing;
      pis?: Spacing;
      pie?: Spacing;
      fluid?: boolean;
      slot?: string;
      className?: string;
  } & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLDivElement>>;
  export const Spacer: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ui/Table/Table' {
  import { type CellProps, type ColumnProps, type RowProps, type TableBodyProps, type TableHeaderProps, type TableProps } from 'react-aria-components';
  const Table: import("react").ForwardRefExoticComponent<TableProps & import("react").RefAttributes<HTMLTableElement>>;
  const TableHeader: (<T>(props: TableHeaderProps<T> & {
      ref?: React.Ref<HTMLTableSectionElement>;
  }) => React.ReactElement) & {
      displayName?: string;
  };
  const TableBody: (<T>(props: TableBodyProps<T> & {
      ref?: React.Ref<HTMLTableSectionElement>;
  }) => React.ReactElement) & {
      displayName?: string;
  };
  const Row: (<T>(props: RowProps<T> & {
      ref?: React.Ref<HTMLTableRowElement>;
  }) => React.ReactElement) & {
      displayName?: string;
  };
  type ColumnStyleProps = {
      textAlign?: 'left' | 'center' | 'right';
  };
  const Column: import("react").ForwardRefExoticComponent<ColumnProps & ColumnStyleProps & import("react").RefAttributes<HTMLTableColElement>>;
  const Cell: import("react").ForwardRefExoticComponent<CellProps & import("react").RefAttributes<HTMLTableCellElement>>;
  export { Table, TableBody, TableHeader, Cell, Column, Row, };

}
declare module '@layerfi/components/components/ui/TagGroup/TagGroup' {
  import { TagGroup as ReactAriaTagGroup, TagList as ReactAriaTagList, Tag as ReactAriaTag } from 'react-aria-components';
  import { type ComponentProps } from 'react';
  type TagGroupProps = Omit<ComponentProps<typeof ReactAriaTagGroup>, 'className'>;
  export const TagGroup: import("react").ForwardRefExoticComponent<Omit<TagGroupProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
  type TagListProps<T extends Record<string, unknown>> = Omit<ComponentProps<typeof ReactAriaTagList<T>>, 'className'> & {
      columnCount?: 1 | 2;
  };
  function InternalTagList<T extends Record<string, unknown>>({ columnCount, ...restProps }: TagListProps<T>, ref: React.ForwardedRef<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
  export const TagList: <T extends Record<string, unknown>>(props: TagListProps<T> & {
      ref?: React.ForwardedRef<HTMLDivElement>;
  }) => ReturnType<typeof InternalTagList>;
  type TagProps = Omit<ComponentProps<typeof ReactAriaTag>, 'className'>;
  export const Tag: import("react").ForwardRefExoticComponent<Omit<TagProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
  export {};

}
declare module '@layerfi/components/components/ui/Typography/Heading' {
  import { HeadingProps as ReactAriaHeadingProps } from 'react-aria-components';
  import type { Spacing } from '@layerfi/components/components/ui/sharedUITypes';
  type HeadingDataProps = {
      align?: 'center';
      pbe?: Spacing;
      pie?: Spacing;
      size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
      variant?: 'subtle';
      weight?: 'normal' | 'bold';
      ellipsis?: true;
  };
  const Heading: import("react").ForwardRefExoticComponent<ReactAriaHeadingProps & HeadingDataProps & import("react").RefAttributes<HTMLHeadingElement>>;
  export { Heading };

}
declare module '@layerfi/components/components/ui/Typography/MoneyText' {
  const MoneySpan: import("react").ForwardRefExoticComponent<{
      amount: number;
      bold?: boolean;
      size?: "xs" | "sm" | "md" | "lg";
  } & Pick<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "ref">, "slot"> & import("react").RefAttributes<HTMLSpanElement>>;
  export { MoneySpan };

}
declare module '@layerfi/components/components/ui/Typography/Text' {
  import type { Spacing } from '@layerfi/components/components/ui/sharedUITypes';
  export type TextStyleProps = {
      align?: 'center' | 'right';
      ellipsis?: true;
      noWrap?: true;
      pb?: Spacing;
      pbe?: Spacing;
      pbs?: Spacing;
      size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      status?: 'error';
      variant?: 'placeholder' | 'subtle';
      weight?: 'normal' | 'bold';
      lineHeight?: 'md' | 'lg' | 'xl';
  };
  type TextRenderingProps = {
      nonAria?: true;
  };
  export const Header: import("react").ForwardRefExoticComponent<Pick<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLElement>, HTMLElement>, "ref">, "id" | "slot"> & TextRenderingProps & TextStyleProps & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLElement>>;
  export const Label: import("react").ForwardRefExoticComponent<Pick<Omit<import("react").DetailedHTMLProps<import("react").LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, "ref">, "id" | "htmlFor" | "slot"> & TextRenderingProps & TextStyleProps & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLLabelElement>>;
  export const P: import("react").ForwardRefExoticComponent<Pick<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, "ref">, "id" | "slot"> & TextRenderingProps & TextStyleProps & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLParagraphElement>>;
  export const Span: import("react").ForwardRefExoticComponent<Pick<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "ref">, "id" | "slot"> & TextRenderingProps & TextStyleProps & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLSpanElement>>;
  export {};

}
declare module '@layerfi/components/components/ui/sharedUITypes' {
  export type Spacing = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl';

}
declare module '@layerfi/components/components/utility/ConditionalBlock' {
  type ConditionalBlockProps<T> = {
      data: T | undefined;
      children: React.FC<{
          data: T;
      }>;
  } & ({
      isLoading: boolean;
      Loading: React.ReactNode;
      Inactive: React.ReactNode;
  } | {
      isLoading?: never;
      Loading?: never;
      Inactive?: never;
  }) & ({
      isError: boolean;
      Error: React.ReactNode;
  } | {
      isError?: never;
      Error?: never;
  });
  export function ConditionalBlock<T>({ data, children, isLoading, Loading, Inactive, isError, Error, }: ConditionalBlockProps<T>): import("react").ReactNode;
  export {};

}
declare module '@layerfi/components/components/utility/ConditionalList' {
  import type { PropsWithChildren } from 'react';
  type ConditionalListProps<T> = {
      list: ReadonlyArray<T>;
      Empty: React.ReactNode;
      children: React.FC<{
          item: T;
          index: number;
      }>;
      Container?: React.FC<PropsWithChildren>;
  } & ({
      isLoading: boolean;
      Loading: React.ReactNode;
  } | {
      isLoading?: never;
      Loading?: never;
  }) & ({
      isError: boolean;
      Error: React.ReactNode;
  } | {
      isError?: never;
      Error?: never;
  });
  export function ConditionalList<T>({ list, Empty, Container, isLoading, Loading, isError, Error, children, }: ConditionalListProps<T>): string | number | boolean | Iterable<import("react").ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined;
  export {};

}
declare module '@layerfi/components/components/utility/InvisibleDownload' {
  type InvisibleDownloadHandle = {
      trigger: (options: {
          url: string;
      }) => Promise<void>;
  };
  export function useInvisibleDownload(): {
      invisibleDownloadRef: import("react").RefObject<InvisibleDownloadHandle>;
      triggerInvisibleDownload: (options: {
          url: string;
      }) => void;
  };
  const InvisibleDownload: import("react").ForwardRefExoticComponent<import("react").RefAttributes<InvisibleDownloadHandle>>;
  export default InvisibleDownload;

}
declare module '@layerfi/components/components/utility/withRenderProp' {
  import type { ReactNode } from 'react';
  type GenericFn<TOut> = (...args: Array<never>) => TOut;
  type RenderProp<T extends GenericFn<ReactNode>> = ReactNode | T;
  export function withRenderProp<T extends GenericFn<ReactNode>>(renderProp: RenderProp<T>, callback: (node: ReactNode) => ReactNode): string | number | boolean | import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | T | null | undefined;
  export {};

}
declare module '@layerfi/components/config/charts' {
  export const INACTIVE_OPACITY_LEVELS: number[];
  export const DEFAULT_CHART_OPACITY: number[];
  export const DEFAULT_CHART_COLOR_TYPE: string[];
  export const TASKS_CHARTS_COLORS: {
      done: string;
      pending: string;
  };

}
declare module '@layerfi/components/config/general' {
  export const DATE_FORMAT = "LLL d, yyyy";
  export const DATE_FORMAT_SHORT = "M/d/yyyy";
  export const DATE_FORMAT_SHORT_PADDED = "MM/dd/yyyy";
  export const MONTH_DAY_FORMAT = "LLL d";
  export const TIME_FORMAT = "p";
  export const BREAKPOINTS: {
      TABLET: number;
      MOBILE: number;
  };

}
declare module '@layerfi/components/config/theme' {
  export const SHADES: {
      50: {
          s: number;
          l: number;
      };
      100: {
          s: number;
          l: number;
      };
      200: {
          s: number;
          l: number;
      };
      300: {
          s: number;
          l: number;
      };
      500: {
          s: number;
          l: number;
      };
      600: {
          s: number;
          l: number;
      };
      700: {
          s: number;
          l: number;
      };
      800: {
          s: number;
          l: number;
      };
      1000: {
          s: number;
          l: number;
      };
  };
  export const COLORS: {
      dark: {
          h: number;
          s: number;
          l: number;
      };
      light: {
          h: number;
          s: number;
          l: number;
      };
  };

}
declare module '@layerfi/components/contexts/BankTransactionsContext/BankTransactionsContext' {
  import { useAugmentedBankTransactions } from '@layerfi/components/hooks/useBankTransactions/useAugmentedBankTransactions';
  import { DisplayState } from '@layerfi/components/types';
  export type BankTransactionsContextType = ReturnType<typeof useAugmentedBankTransactions>;
  export const BankTransactionsContext: import("react").Context<{
      data: import("@layerfi/components/types").BankTransaction[] | undefined;
      metadata: {
          pagination: {
              cursor?: string;
              has_more: boolean;
          };
      } | undefined;
      isLoading: boolean;
      isValidating: boolean;
      refetch: () => void;
      error: any;
      categorize: (bankTransactionId: import("@layerfi/components/types").BankTransaction["id"], newCategory: import("../../types").CategoryUpdate, notify?: boolean) => Promise<void>;
      match: (bankTransactionId: import("@layerfi/components/types").BankTransaction["id"], suggestedMatchId: string, notify?: boolean) => Promise<void>;
      updateOneLocal: (newBankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      shouldHideAfterCategorize: () => boolean;
      removeAfterCategorize: (bankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      filters: {
          dateRange?: import("@layerfi/components/types").DateRange;
          amount?: import("@layerfi/components/hooks/useBankTransactions/types").NumericRangeFilter;
          account?: string[];
          direction?: import("@layerfi/components/types").Direction[];
          categorizationStatus?: DisplayState;
          query?: string;
          tagFilter?: import("@layerfi/components/types/tags").TagFilterInput;
      };
      setFilters: (newFilters: import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters) => void;
      dateFilterMode: import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionsDateFilterMode | undefined;
      accountsList: import("@layerfi/components/hooks/useBankTransactions/types").AccountItem[];
      display: DisplayState;
      fetchMore: () => void;
      hasMore: boolean;
  }>;
  export const useBankTransactionsContext: () => {
      data: import("@layerfi/components/types").BankTransaction[] | undefined;
      metadata: {
          pagination: {
              cursor?: string;
              has_more: boolean;
          };
      } | undefined;
      isLoading: boolean;
      isValidating: boolean;
      refetch: () => void;
      error: any;
      categorize: (bankTransactionId: import("@layerfi/components/types").BankTransaction["id"], newCategory: import("../../types").CategoryUpdate, notify?: boolean) => Promise<void>;
      match: (bankTransactionId: import("@layerfi/components/types").BankTransaction["id"], suggestedMatchId: string, notify?: boolean) => Promise<void>;
      updateOneLocal: (newBankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      shouldHideAfterCategorize: () => boolean;
      removeAfterCategorize: (bankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      filters: {
          dateRange?: import("@layerfi/components/types").DateRange;
          amount?: import("@layerfi/components/hooks/useBankTransactions/types").NumericRangeFilter;
          account?: string[];
          direction?: import("@layerfi/components/types").Direction[];
          categorizationStatus?: DisplayState;
          query?: string;
          tagFilter?: import("@layerfi/components/types/tags").TagFilterInput;
      };
      setFilters: (newFilters: import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters) => void;
      dateFilterMode: import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionsDateFilterMode | undefined;
      accountsList: import("@layerfi/components/hooks/useBankTransactions/types").AccountItem[];
      display: DisplayState;
      fetchMore: () => void;
      hasMore: boolean;
  };

}
declare module '@layerfi/components/contexts/BankTransactionsContext/index' {
  export { BankTransactionsContext, useBankTransactionsContext, } from '@layerfi/components/contexts/BankTransactionsContext/BankTransactionsContext';

}
declare module '@layerfi/components/contexts/BillsContext' {
  import React, { ReactNode } from 'react';
  import { useBills } from '@layerfi/components/hooks/useBills';
  import { useBillsRecordPayment } from '@layerfi/components/components/Bills/useBillsRecordPayment';
  type BillsProviderProps = {
      children: ReactNode;
  };
  export type BillsContextType = ReturnType<typeof useBills>;
  export const BillsContext: React.Context<{
      data: import("@layerfi/components/types").Bill[];
      paginatedData: import("@layerfi/components/types").Bill[];
      currentPage: number;
      setCurrentPage: (page: number) => void;
      pageSize: number;
      metadata?: import("@layerfi/components/types").Metadata;
      billInDetails?: import("@layerfi/components/types").Bill;
      openBillDetails: (bill?: import("@layerfi/components/types").Bill) => void;
      showBillInDetails: boolean;
      closeBillDetails: () => void;
      status: import("@layerfi/components/hooks/useBills").BillStatusFilter;
      setStatus: (status: import("@layerfi/components/hooks/useBills").BillStatusFilter) => void;
      dateRange: import("@layerfi/components/types").DateRange;
      setDateRange: (dateRange: import("@layerfi/components/types").DateRange) => void;
      vendor: import("@layerfi/components/types/vendors").Vendor | null;
      setVendor: (vendor: import("@layerfi/components/types/vendors").Vendor | null) => void;
      fetchMore: () => void;
      hasMore: boolean;
      isLoading: boolean;
      isValidating: boolean;
      error?: Error;
      refetch: () => void;
  }>;
  export type BillsRecordPaymentContextType = ReturnType<typeof useBillsRecordPayment>;
  export const BillsRecordPaymentContext: React.Context<{
      billsToPay: import("@layerfi/components/components/Bills/useBillsRecordPayment").BillsRecordPaymentFormRecord[];
      setBill: (bill: import("@layerfi/components/types").Bill, index: number) => void;
      addBill: (bill?: import("@layerfi/components/types").Bill) => void;
      removeBill: (bill: import("@layerfi/components/types").Bill) => void;
      removeBillByIndex: (index: number) => void;
      setAmount: (billId: string, amount: string) => void;
      setAmountByIndex: (index: number, amount?: string | null) => void;
      vendor: import("@layerfi/components/types/vendors").Vendor | undefined;
      setVendor: (newVendor?: import("@layerfi/components/types/vendors").Vendor) => void;
      paymentDate: Date;
      setPaymentDate: React.Dispatch<React.SetStateAction<Date>>;
      paymentMethod: import("@layerfi/components/types/bills").BillPaymentMethod;
      setPaymentMethod: React.Dispatch<React.SetStateAction<import("@layerfi/components/types/bills").BillPaymentMethod>>;
      showRecordPaymentForm: boolean;
      setShowRecordPaymentForm: React.Dispatch<React.SetStateAction<boolean>>;
      bulkSelectionActive: boolean;
      openBulkSelection: () => void;
      closeBulkSelection: () => void;
      recordPayment: () => Promise<void>;
      dataSaved: boolean;
      closeRecordPayment: () => void;
      clearRecordPaymentSelection: () => void;
      recordPaymentForBill: (bill: import("@layerfi/components/types").Bill) => void;
      payRemainingBalance: () => void;
      isLoading: boolean;
      apiError: import("@layerfi/components/models/APIError").APIError | undefined;
  }>;
  export const useBillsContext: () => {
      data: import("@layerfi/components/types").Bill[];
      paginatedData: import("@layerfi/components/types").Bill[];
      currentPage: number;
      setCurrentPage: (page: number) => void;
      pageSize: number;
      metadata?: import("@layerfi/components/types").Metadata;
      billInDetails?: import("@layerfi/components/types").Bill;
      openBillDetails: (bill?: import("@layerfi/components/types").Bill) => void;
      showBillInDetails: boolean;
      closeBillDetails: () => void;
      status: import("@layerfi/components/hooks/useBills").BillStatusFilter;
      setStatus: (status: import("@layerfi/components/hooks/useBills").BillStatusFilter) => void;
      dateRange: import("@layerfi/components/types").DateRange;
      setDateRange: (dateRange: import("@layerfi/components/types").DateRange) => void;
      vendor: import("@layerfi/components/types/vendors").Vendor | null;
      setVendor: (vendor: import("@layerfi/components/types/vendors").Vendor | null) => void;
      fetchMore: () => void;
      hasMore: boolean;
      isLoading: boolean;
      isValidating: boolean;
      error?: Error;
      refetch: () => void;
  };
  export const useBillsRecordPaymentContext: () => {
      billsToPay: import("@layerfi/components/components/Bills/useBillsRecordPayment").BillsRecordPaymentFormRecord[];
      setBill: (bill: import("@layerfi/components/types").Bill, index: number) => void;
      addBill: (bill?: import("@layerfi/components/types").Bill) => void;
      removeBill: (bill: import("@layerfi/components/types").Bill) => void;
      removeBillByIndex: (index: number) => void;
      setAmount: (billId: string, amount: string) => void;
      setAmountByIndex: (index: number, amount?: string | null) => void;
      vendor: import("@layerfi/components/types/vendors").Vendor | undefined;
      setVendor: (newVendor?: import("@layerfi/components/types/vendors").Vendor) => void;
      paymentDate: Date;
      setPaymentDate: React.Dispatch<React.SetStateAction<Date>>;
      paymentMethod: import("@layerfi/components/types/bills").BillPaymentMethod;
      setPaymentMethod: React.Dispatch<React.SetStateAction<import("@layerfi/components/types/bills").BillPaymentMethod>>;
      showRecordPaymentForm: boolean;
      setShowRecordPaymentForm: React.Dispatch<React.SetStateAction<boolean>>;
      bulkSelectionActive: boolean;
      openBulkSelection: () => void;
      closeBulkSelection: () => void;
      recordPayment: () => Promise<void>;
      dataSaved: boolean;
      closeRecordPayment: () => void;
      clearRecordPaymentSelection: () => void;
      recordPaymentForBill: (bill: import("@layerfi/components/types").Bill) => void;
      payRemainingBalance: () => void;
      isLoading: boolean;
      apiError: import("@layerfi/components/models/APIError").APIError | undefined;
  };
  export const BillsProvider: React.FC<BillsProviderProps>;
  export {};

}
declare module '@layerfi/components/contexts/ChartOfAccountsContext/ChartOfAccountsContext' {
  import { useChartOfAccounts } from '@layerfi/components/hooks/useChartOfAccounts/index';
  export type ChartOfAccountsContextType = ReturnType<typeof useChartOfAccounts>;
  export const ChartOfAccountsContext: import("react").Context<{
      data: {
          readonly accounts: readonly {
              readonly name: string;
              readonly stableName: string | null;
              readonly normality: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
              readonly accountType: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
                  readonly displayName: string;
              };
              readonly accountSubtype: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
                  readonly displayName: string;
              };
              readonly accountId: string;
              readonly accountNumber: string | null;
              readonly balance: number;
              readonly isDeletable: boolean | null;
              readonly subAccounts: readonly import("@layerfi/components/schemas/generalLedger/ledgerAccount").NestedLedgerAccount[];
          }[];
      } | undefined;
      isLoading: boolean;
      isValidating: boolean;
      isError: boolean;
      refetch: () => Promise<void>;
      create: (newAccount: import("@layerfi/components/types").NewAccount) => Promise<void>;
      form: import("@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts").ChartOfAccountsForm | undefined;
      sendingForm: boolean;
      apiError: string | undefined;
      addAccount: () => void;
      editAccount: (id: string) => void;
      deleteAccount: (accountId: string) => Promise<void>;
      cancelForm: () => void;
      changeFormData: (fieldName: string, value: string | import("@layerfi/components/types/general").BaseSelectOption | undefined) => void;
      submitForm: () => void;
      dateRange: {
          startDate: Date;
          endDate: Date;
      };
      changeDateRange: ({ startDate: newStartDate, endDate: newEndDate, }: Partial<import("@layerfi/components/types").DateRange>) => void;
  }>;

}
declare module '@layerfi/components/contexts/ChartOfAccountsContext/index' {
  export { ChartOfAccountsContext } from '@layerfi/components/contexts/ChartOfAccountsContext/ChartOfAccountsContext';

}
declare module '@layerfi/components/contexts/InAppLinkContext' {
  import { ReactNode } from 'react';
  export enum EntityName {
      Unknown = "Unknown",
      BankTransaction = "Bank Transaction",
      Invoice = "Invoice",
      InvoicePayment = "Invoice Payment",
      Bill = "Bill",
      BillPayment = "Bill Payment",
      CustomerRefund = "Customer Refund",
      CustomerRefundAllocation = "Customer Refund Allocation",
      CustomerRefundPayment = "Customer Refund Payment",
      VendorRefund = "Vendor Refund",
      VendorRefundAllocation = "Vendor Refund Allocation",
      VendorRefundPayment = "Vendor Refund Payment",
      CustomerPayout = "Customer Payout",
      VendorPayout = "Vendor Payout",
      QuickBooks = "QuickBooks",
      CustomJournalEntry = "Custom Journal Entry",
      Payroll = "Payroll",
      PayrollPayment = "Payroll Payment",
      OpeningBalance = "Opening Balance",
      InvoiceWriteOff = "Invoice Write-Off",
      VendorCredit = "Vendor Credit",
      CustomerCredit = "Customer Credit"
  }
  export interface RelatedEntityLinkingMetadata {
      id: string;
      entityName: EntityName;
      externalId?: string;
      referenceNumber?: string;
      metadata?: unknown;
  }
  export interface LinkingMetadata {
      id: string;
      entityName: EntityName;
      externalId?: string;
      referenceNumber?: string;
      metadata?: unknown;
      relatedEntityLinkingMetadata?: RelatedEntityLinkingMetadata[];
  }
  export interface InAppLinkContextType {
      renderInAppLink?: (source: LinkingMetadata) => ReactNode;
  }
  export interface InAppLinkProviderProps {
      renderInAppLink?: (source: LinkingMetadata) => ReactNode;
      children: ReactNode;
  }
  export const useInAppLinkContext: () => InAppLinkContextType;
  export const InAppLinkProvider: ({ renderInAppLink, children, }: InAppLinkProviderProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/contexts/JournalContext/JournalContext' {
  import { useJournal } from '@layerfi/components/hooks/useJournal/index';
  export type JournalContextType = ReturnType<typeof useJournal>;
  export const JournalContext: import("react").Context<{
      data?: ReadonlyArray<import("@layerfi/components/types").JournalEntry>;
      isLoading?: boolean;
      isLoadingEntry?: boolean;
      isValidating?: boolean;
      isValidatingEntry?: boolean;
      error?: unknown;
      errorEntry?: unknown;
      refetch: () => void;
      selectedEntryId?: string;
      setSelectedEntryId: (id?: string) => void;
      closeSelectedEntry: () => void;
      create: (newJournalEntry: import("@layerfi/components/types/journal").NewApiJournalEntry) => void;
      changeFormData: (name: string, value: string | import("@layerfi/components/types/general").BaseSelectOption | undefined | number, lineItemIndex?: number, accounts?: import("../../types/journal").LedgerAccountBalance[]) => void;
      submitForm: () => void;
      cancelForm: () => void;
      addEntry: () => void;
      sendingForm: boolean;
      form?: import("@layerfi/components/hooks/useJournal/useJournal").JournalFormTypes;
      apiError?: string;
      setForm: (form?: import("@layerfi/components/hooks/useJournal/useJournal").JournalFormTypes) => void;
      addEntryLine: (direction: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection) => void;
      removeEntryLine: (index: number) => void;
      reverseEntry: (entryId: string) => ReturnType<(baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<never, never>>>;
      hasMore: boolean;
      fetchMore: () => void;
  }>;

}
declare module '@layerfi/components/contexts/JournalContext/index' {
  export { JournalContext } from '@layerfi/components/contexts/JournalContext/JournalContext';

}
declare module '@layerfi/components/contexts/LayerContext/LayerContext' {
  import { LayerContextValues } from '@layerfi/components/types';
  import { LayerContextHelpers, LayerThemeConfig } from '@layerfi/components/types/layer_context';
  export const LayerContext: import("react").Context<LayerContextValues & LayerContextHelpers & {
      setTheme: (theme: LayerThemeConfig) => void;
  }>;
  export const useLayerContext: () => LayerContextValues & LayerContextHelpers & {
      setTheme: (theme: LayerThemeConfig) => void;
  };

}
declare module '@layerfi/components/contexts/LayerContext/index' {
  export { LayerContext, useLayerContext } from '@layerfi/components/contexts/LayerContext/LayerContext';

}
declare module '@layerfi/components/contexts/LedgerAccountsContext/LedgerAccountsContext' {
  import { useLedgerAccounts } from '@layerfi/components/hooks/useLedgerAccounts/index';
  export type LedgerAccountsContextType = ReturnType<typeof useLedgerAccounts>;
  export const LedgerAccountsContext: import("react").Context<{
      data?: import("@layerfi/components/types").LedgerAccounts;
      entryData?: import("@layerfi/components/types").LedgerAccountsEntry;
      isLoading?: boolean;
      isLoadingEntry?: boolean;
      isValidating?: boolean;
      isValidatingEntry?: boolean;
      error?: unknown;
      errorEntry?: unknown;
      refetch: () => void;
      selectedAccount: import("@layerfi/components/types/chart_of_accounts").LedgerAccountBalanceWithNodeType | undefined;
      setSelectedAccount: (account: import("@layerfi/components/types/chart_of_accounts").LedgerAccountBalanceWithNodeType | undefined) => void;
      selectedEntryId?: string;
      setSelectedEntryId: (id?: string) => void;
      closeSelectedEntry: () => void;
      hasMore: boolean;
      fetchMore: () => void;
  }>;

}
declare module '@layerfi/components/contexts/LedgerAccountsContext/index' {
  export { LedgerAccountsContext } from '@layerfi/components/contexts/LedgerAccountsContext/LedgerAccountsContext';

}
declare module '@layerfi/components/contexts/LinkedAccountsContext/LinkedAccountsContext' {
  import { useLinkedAccounts } from '@layerfi/components/hooks/useLinkedAccounts/index';
  export type LinkedAccountsContextType = ReturnType<typeof useLinkedAccounts>;
  export const LinkedAccountsContext: import("react").Context<{
      data?: import("@layerfi/components/types/linked_accounts").LinkedAccount[];
      isLoading: boolean;
      loadingStatus: import("@layerfi/components/types/general").LoadedStatus;
      isValidating: boolean;
      error: unknown;
      addConnection: (source: import("@layerfi/components/types/linked_accounts").AccountSource) => void;
      removeConnection: (source: import("@layerfi/components/types/linked_accounts").AccountSource, sourceId: string) => void;
      repairConnection: (source: import("@layerfi/components/types/linked_accounts").AccountSource, sourceId: string) => void;
      updateConnectionStatus: () => void;
      refetchAccounts: () => import("@layerfi/components/types/utility/promises").Awaitable<void>;
      syncAccounts: () => void;
      unlinkAccount: (source: import("@layerfi/components/types/linked_accounts").AccountSource, userCreated: boolean, accountId: string) => void;
      confirmAccount: (source: import("@layerfi/components/types/linked_accounts").AccountSource, accountId: string) => void;
      excludeAccount: (source: import("@layerfi/components/types/linked_accounts").AccountSource, accountId: string) => void;
      accountsToAddOpeningBalanceInModal: import("@layerfi/components/types/linked_accounts").LinkedAccount[];
      setAccountsToAddOpeningBalanceInModal: (accounts: import("@layerfi/components/types/linked_accounts").LinkedAccount[]) => void;
      breakConnection: (source: import("@layerfi/components/types/linked_accounts").AccountSource, connectionExternalId: string) => void;
  }>;

}
declare module '@layerfi/components/contexts/LinkedAccountsContext/index' {
  export { LinkedAccountsContext } from '@layerfi/components/contexts/LinkedAccountsContext/LinkedAccountsContext';

}
declare module '@layerfi/components/contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext' {
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  export const PNLComparisonContext: import("react").Context<{
      data: import("@layerfi/components/types/profit_and_loss").ProfitAndLossComparisonItem[] | undefined;
      isLoading: boolean;
      isValidating: boolean;
      isPeriodsSelectEnabled: boolean;
      compareModeActive: boolean;
      comparePeriods: number;
      setComparePeriods: import("react").Dispatch<import("react").SetStateAction<number>>;
      compareOptions: import("@layerfi/components/types/profit_and_loss").TagComparisonOption[];
      selectedCompareOptions: import("@layerfi/components/types/profit_and_loss").TagComparisonOption[];
      setSelectedCompareOptions: (values: import("react-select").MultiValue<{
          value: string;
          label: string;
      }>) => void;
      getProfitAndLossComparisonCsv: (dateRange: import("@layerfi/components/types").DateRange, moneyFormat?: import("../../types").MoneyFormat) => Promise<{
          data?: S3PresignedUrl;
          error?: unknown;
      }>;
      comparisonConfig: import("@layerfi/components/types/profit_and_loss").ProfitAndLossCompareConfig | undefined;
  }>;

}
declare module '@layerfi/components/contexts/ProfitAndLossComparisonContext/index' {
  export { PNLComparisonContext } from '@layerfi/components/contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext';

}
declare module '@layerfi/components/contexts/QuickbooksContext/QuickbooksContext' {
  import { useQuickbooks } from '@layerfi/components/hooks/useQuickbooks/index';
  export type QuickbooksContextType = ReturnType<typeof useQuickbooks>;
  export const QuickbooksContext: import("react").Context<{
      linkQuickbooks: () => Promise<string>;
      unlinkQuickbooks: () => Promise<void>;
      syncFromQuickbooks: () => void;
      quickbooksConnectionStatus: import("@layerfi/components/types/quickbooks").StatusOfQuickbooksConnection | undefined;
  }>;

}
declare module '@layerfi/components/contexts/ReceiptsContext/ReceiptsContext' {
  import { useReceipts } from '@layerfi/components/hooks/useReceipts/useReceipts';
  export type ReceiptsContextType = ReturnType<typeof useReceipts>;
  export const ReceiptsContext: import("react").Context<{
      receiptUrls: import("@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts").DocumentWithStatus[];
      uploadReceipt: (file: File) => import("@layerfi/components/types/utility/promises").Awaitable<void>;
      archiveDocument: (document: import("@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts").DocumentWithStatus) => import("../../types/utility/promises").Awaitable<void>;
  }>;
  export const useReceiptsContext: () => {
      receiptUrls: import("@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts").DocumentWithStatus[];
      uploadReceipt: (file: File) => import("@layerfi/components/types/utility/promises").Awaitable<void>;
      archiveDocument: (document: import("@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts").DocumentWithStatus) => import("../../types/utility/promises").Awaitable<void>;
  };

}
declare module '@layerfi/components/contexts/ReceiptsContext/index' {
  export { ReceiptsContext } from '@layerfi/components/contexts/ReceiptsContext/ReceiptsContext';

}
declare module '@layerfi/components/contexts/TableContext/TableContext' {
  import { ReactNode } from 'react';
  import { TableContextProps } from '@layerfi/components/types/table';
  export const TableContext: import("react").Context<TableContextProps>;
  interface TableProviderProps {
      children: ReactNode;
  }
  export const TableProvider: React.FC<TableProviderProps>;
  export {};

}
declare module '@layerfi/components/contexts/TableContext/index' {
  export { TableContext, TableProvider } from '@layerfi/components/contexts/TableContext/TableContext';

}
declare module '@layerfi/components/contexts/VendorsContext' {
  import React, { ReactNode } from 'react';
  import { useVendors } from '@layerfi/components/hooks/useVendors';
  type VendorsProviderProps = {
      children: ReactNode;
  };
  export type VendorsContextType = ReturnType<typeof useVendors>;
  export const VendorsContext: React.Context<{
      data: import("@layerfi/components/types/vendors").Vendor[];
  }>;
  export const useVendorsContext: () => {
      data: import("@layerfi/components/types/vendors").Vendor[];
  };
  export const VendorsProvider: React.FC<VendorsProviderProps>;
  export {};

}
declare module '@layerfi/components/features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields' {
  import type { BankTransaction } from '@layerfi/components/types';
  type BankTransactionFormFieldProps = {
      bankTransaction: Pick<BankTransaction, 'id' | 'transaction_tags' | 'customer' | 'vendor'>;
      showDescriptions?: boolean;
  };
  export function BankTransactionFormFields({ bankTransaction, showDescriptions, }: BankTransactionFormFieldProps): import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorSelector' {
  import type { BankTransaction } from '@layerfi/components/types';
  type BankTransactionCustomerVendorSelectorProps = {
      bankTransaction: Pick<BankTransaction, 'id' | 'customer' | 'vendor'>;
  };
  export function BankTransactionCustomerVendorSelector({ bankTransaction, }: BankTransactionCustomerVendorSelectorProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorVisibilityProvider' {
  import { type PropsWithChildren } from 'react';
  export function useBankTransactionCustomerVendorVisibility(): {
      showCustomerVendor: boolean;
  };
  type BankTransactionCustomerVendorVisibilityProviderProps = PropsWithChildren<{
      showCustomerVendor: boolean;
  }>;
  export function BankTransactionCustomerVendorVisibilityProvider({ children, showCustomerVendor, }: BankTransactionCustomerVendorVisibilityProviderProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/features/bankTransactions/[bankTransactionId]/metadata/api/useSetMetadataOnBankTransaction' {
  import { type VendorSchema } from '@layerfi/components/schemas/vendor';
  import { type CustomerSchema } from '@layerfi/components/schemas/customer';
  type SetMetadataOnBankTransactionArg = {
      vendor: typeof VendorSchema.Type | null;
      customer: typeof CustomerSchema.Type | null;
  };
  type UseSetMetadataOnBankTransactionParameters = {
      bankTransactionId: string;
  };
  export function useSetMetadataOnBankTransaction({ bankTransactionId, }: UseSetMetadataOnBankTransactionParameters): import("swr/mutation").SWRMutationResponse<Record<string, never>, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly bankTransactionId: string;
      readonly tags: readonly ["#set-metadata-on-bank-transaction"];
  } | undefined, SetMetadataOnBankTransactionArg>;
  export {};

}
declare module '@layerfi/components/features/bankTransactions/[bankTransactionId]/tags/api/useRemoveTagFromBankTransaction' {
  type RemoveTagFromBankTransactionArg = {
      tagId: string;
  };
  type RemoveTagFromBankTransactionOptions = {
      bankTransactionId: string;
  };
  export function useRemoveTagFromBankTransaction({ bankTransactionId }: RemoveTagFromBankTransactionOptions): import("swr/mutation").SWRMutationResponse<Record<string, never>, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly bankTransactionId: string;
      readonly tags: readonly ["#remove-tag-from-bank-transaction"];
  } | undefined, RemoveTagFromBankTransactionArg>;
  export {};

}
declare module '@layerfi/components/features/bankTransactions/[bankTransactionId]/tags/api/useTagBankTransaction' {
  type TagBankTransactionArg = {
      key: string;
      value: string;
  };
  type TagBankTransactionOptions = {
      bankTransactionId: string;
  };
  export function useTagBankTransaction({ bankTransactionId }: TagBankTransactionOptions): import("swr/mutation").SWRMutationResponse<Record<string, never>, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly bankTransactionId: string;
      readonly tags: readonly ["#tag-bank-transaction"];
  } | undefined, TagBankTransactionArg>;
  export {};

}
declare module '@layerfi/components/features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagSelector' {
  import type { BankTransaction } from '@layerfi/components/types';
  type BankTransactionTagSelectorProps = {
      bankTransaction: Pick<BankTransaction, 'id' | 'transaction_tags'>;
  };
  export function BankTransactionTagSelector({ bankTransaction }: BankTransactionTagSelectorProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagVisibilityProvider' {
  import { type PropsWithChildren } from 'react';
  export function useBankTransactionTagVisibility(): {
      showTags: boolean;
  };
  type BankTransactionTagVisibilityProviderProps = PropsWithChildren<{
      showTags: boolean;
  }>;
  export function BankTransactionTagVisibilityProvider({ children, showTags, }: BankTransactionTagVisibilityProviderProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/features/customerVendor/components/CustomerVendorSelector' {
  import type { CustomerVendorSchema } from '@layerfi/components/features/customerVendor/customerVendorSchemas';
  type CustomerVendor = typeof CustomerVendorSchema.Type;
  type CustomerVendorSelectorProps = {
      selectedCustomerVendor: CustomerVendor | null;
      onSelectedCustomerVendorChange: (customerVendor: CustomerVendor | null) => void;
      placeholder: string;
      isMutating?: boolean;
      isReadOnly?: boolean;
  };
  export function CustomerVendorSelector({ selectedCustomerVendor, onSelectedCustomerVendorChange, placeholder, isMutating, isReadOnly, }: CustomerVendorSelectorProps): import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/features/customerVendor/customerVendorSchemas' {
  import { Schema } from 'effect';
  export const CustomerVendorTypeSchema: Schema.Literal<["CUSTOMER", "VENDOR"]>;
  export const CustomerVendorSchema: Schema.Union<[Schema.Struct<{
      customerVendorType: Schema.Literal<["CUSTOMER"]>;
      id: typeof Schema.UUID;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
      companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
      email: Schema.NullOr<typeof Schema.String>;
      mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
      officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
      addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
      status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
      memo: Schema.NullOr<typeof Schema.String>;
      _local: Schema.optional<Schema.Struct<{
          isOptimistic: typeof Schema.Boolean;
      }>>;
  }>, Schema.Struct<{
      customerVendorType: Schema.Literal<["VENDOR"]>;
      id: typeof Schema.UUID;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
      companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
      email: Schema.NullOr<typeof Schema.String>;
      mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
      officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
      status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
      memo: Schema.NullOr<typeof Schema.String>;
      _local: Schema.optional<Schema.Struct<{
          isOptimistic: typeof Schema.Boolean;
      }>>;
  }>]>;
  export const decodeCustomerVendor: (i: {
      readonly id: string;
      readonly external_id: string | null;
      readonly individual_name: string | null;
      readonly company_name: string | null;
      readonly email: string | null;
      readonly mobile_phone: string | null;
      readonly office_phone: string | null;
      readonly address_string: string | null;
      readonly status: string;
      readonly memo: string | null;
      readonly customerVendorType: "CUSTOMER";
      readonly _local?: {
          readonly isOptimistic: boolean;
      } | undefined;
  } | {
      readonly id: string;
      readonly external_id: string | null;
      readonly individual_name: string | null;
      readonly company_name: string | null;
      readonly email: string | null;
      readonly mobile_phone: string | null;
      readonly office_phone: string | null;
      readonly status: string;
      readonly memo: string | null;
      readonly customerVendorType: "VENDOR";
      readonly _local?: {
          readonly isOptimistic: boolean;
      } | undefined;
  }, overrideOptions?: import("effect/SchemaAST").ParseOptions) => {
      readonly id: string;
      readonly externalId: string | null;
      readonly individualName: string | null;
      readonly companyName: string | null;
      readonly email: string | null;
      readonly mobilePhone: string | null;
      readonly officePhone: string | null;
      readonly addressString: string | null;
      readonly status: "ACTIVE" | "ARCHIVED";
      readonly memo: string | null;
      readonly _local?: {
          readonly isOptimistic: boolean;
      } | undefined;
      readonly customerVendorType: "CUSTOMER";
  } | {
      readonly id: string;
      readonly externalId: string | null;
      readonly individualName: string | null;
      readonly companyName: string | null;
      readonly email: string | null;
      readonly mobilePhone: string | null;
      readonly officePhone: string | null;
      readonly status: "ACTIVE" | "ARCHIVED";
      readonly memo: string | null;
      readonly _local?: {
          readonly isOptimistic: boolean;
      } | undefined;
      readonly customerVendorType: "VENDOR";
  };

}
declare module '@layerfi/components/features/customers/api/useListCustomers' {
  import { type SWRInfiniteResponse } from 'swr/infinite';
  import { Schema } from 'effect';
  const ListCustomersRawResultSchema: Schema.Struct<{
      data: Schema.Array$<Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>>;
      meta: Schema.Struct<{
          pagination: Schema.Struct<{
              cursor: Schema.NullOr<typeof Schema.String>;
              hasMore: Schema.PropertySignature<":", boolean, "has_more", ":", boolean, false, never>;
          }>;
      }>;
  }>;
  type ListCustomersRawResult = typeof ListCustomersRawResultSchema.Type;
  export const CUSTOMERS_TAG_KEY = "#customers";
  class ListCustomersSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRInfiniteResponse<ListCustomersRawResult>);
      get data(): {
          readonly data: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly individualName: string | null;
              readonly companyName: string | null;
              readonly email: string | null;
              readonly mobilePhone: string | null;
              readonly officePhone: string | null;
              readonly addressString: string | null;
              readonly status: "ACTIVE" | "ARCHIVED";
              readonly memo: string | null;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
          }[];
          readonly meta: {
              readonly pagination: {
                  readonly cursor: string | null;
                  readonly hasMore: boolean;
              };
          };
      }[] | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
  }
  type UseListCustomersParams = {
      query?: string;
      isEnabled?: boolean;
  };
  export function useListCustomers({ query, isEnabled }?: UseListCustomersParams): ListCustomersSWRResponse;
  export function usePreloadCustomers(parameters?: UseListCustomersParams): void;
  export {};

}
declare module '@layerfi/components/features/customers/components/CustomerSelector' {
  import { Customer } from '@layerfi/components/schemas/customer';
  type CustomerSelectorProps = {
      selectedCustomer: Customer | null;
      onSelectedCustomerChange: (customer: Customer | null) => void;
      placeholder?: string;
      isReadOnly?: boolean;
      inline?: boolean;
      className?: string;
  };
  export function CustomerSelector({ selectedCustomer, onSelectedCustomerChange, placeholder, isReadOnly, inline, className, }: CustomerSelectorProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/features/customers/util' {
  import type { Customer } from '@layerfi/components/schemas/customer';
  export function getCustomerName(customer?: Customer | null): string;

}
declare module '@layerfi/components/features/forms/components/BaseFormTextField' {
  import type { PropsWithChildren } from 'react';
  import { type TextFieldProps } from '@layerfi/components/components/ui/Form/Form';
  import type { CommonFormFieldProps } from '@layerfi/components/features/forms/types';
  export type BaseFormTextFieldProps = CommonFormFieldProps & {
      inputMode?: TextFieldProps['inputMode'];
      isTextArea?: boolean;
  };
  export function BaseFormTextField({ label, inline, showLabel, showFieldError, isTextArea, isReadOnly, className, children, }: PropsWithChildren<BaseFormTextFieldProps>): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/features/forms/components/FormBigDecimalField' {
  import { BigDecimal as BD } from 'effect';
  import { type BaseFormTextFieldProps } from '@layerfi/components/features/forms/components/BaseFormTextField';
  type FormBigDecimalFieldProps = Omit<BaseFormTextFieldProps, 'inputMode' | 'isTextArea'> & {
      maxValue?: BD.BigDecimal;
      minDecimalPlaces?: number;
      maxDecimalPlaces?: number;
      allowNegative?: boolean;
      mode?: 'percent' | 'currency' | 'decimal';
  };
  /**
   * This is some crazy nonsense to make BigDecimal play nicely with TanStack form. TanStack form checks deep equality for
   * object form fields all the way down to determine if they've changed. BigDecimal has a `normalized` param, which is a
   * BigDecimal that is the "normalized" form of itself (i.e., lowest absolute scale). Therefore, when determining if two
   * BigDecimals values are equal, we do an infinite recursion comparing their normalized forms.
   *
   * To remediate this, before updating a BigDecimal field, we check the new value is equal (per BigDecimal.equal) outside,
   * and if not, only then call the onChange handler with the value wrapped with withForceUpdate, which adds a unique symbol
   * to the BigDecimal and short-circuits any potential infinite recursion on comparing normalized values all the way down.
   *
   * Doing either the equality check or forced update to cause inequality is sufficient, but we do both to cover our bases.
   */
  export const withForceUpdate: (value: BD.BigDecimal) => BD.BigDecimal;
  export function FormBigDecimalField({ mode, allowNegative, maxValue, minDecimalPlaces, maxDecimalPlaces, ...restProps }: FormBigDecimalFieldProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/features/forms/components/FormCheckboxField' {
  import { type PropsWithChildren } from 'react';
  import type { CommonFormFieldProps } from '@layerfi/components/features/forms/types';
  export type FormCheckboxFieldProps = CommonFormFieldProps;
  export function FormCheckboxField({ label, className, inline, showLabel, showFieldError, isReadOnly, }: PropsWithChildren<FormCheckboxFieldProps>): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/features/forms/components/FormDateField' {
  import { type PropsWithChildren } from 'react';
  import type { CommonFormFieldProps } from '@layerfi/components/features/forms/types';
  export type FormDateFieldProps = CommonFormFieldProps;
  export function FormDateField({ label, className, inline, showLabel, showFieldError, isReadOnly, }: PropsWithChildren<FormDateFieldProps>): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/features/forms/components/FormTextAreaField' {
  import { type BaseFormTextFieldProps } from '@layerfi/components/features/forms/components/BaseFormTextField';
  type FormTextAreaFieldProps = Omit<BaseFormTextFieldProps, 'isTextArea'>;
  export function FormTextAreaField(props: FormTextAreaFieldProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/features/forms/components/FormTextField' {
  import { type BaseFormTextFieldProps } from '@layerfi/components/features/forms/components/BaseFormTextField';
  type FormTextFieldProps = Omit<BaseFormTextFieldProps, 'isTextArea'>;
  export function FormTextField(props: FormTextFieldProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/features/forms/hooks/useForm' {
  import { type FormOptions, type FormValidateOrFn, type FormAsyncValidateOrFn } from '@tanstack/react-form';
  import { BaseFormTextField } from '@layerfi/components/features/forms/components/BaseFormTextField';
  import { FormBigDecimalField } from '@layerfi/components/features/forms/components/FormBigDecimalField';
  import { FormCheckboxField } from '@layerfi/components/features/forms/components/FormCheckboxField';
  import { FormDateField } from '@layerfi/components/features/forms/components/FormDateField';
  import { FormTextAreaField } from '@layerfi/components/features/forms/components/FormTextAreaField';
  import { FormTextField } from '@layerfi/components/features/forms/components/FormTextField';
  export const fieldContext: import("react").Context<import("@tanstack/react-form").AnyFieldApi>, useFieldContext: <TData>() => import("@tanstack/react-form").FieldApi<any, string, TData, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>, formContext: import("react").Context<import("@tanstack/react-form").AnyFormApi>, useFormContext: () => import("@tanstack/react-form").ReactFormExtendedApi<Record<string, never>, any, any, any, any, any, any, any, any, any, any, any>;
  export function useAppForm<T extends Record<string, unknown>>(props: FormOptions<T, FormValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormAsyncValidateOrFn<T>, unknown>): import("@tanstack/react-form").AppFieldExtendedReactFormApi<T, FormValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormAsyncValidateOrFn<T>, unknown, {
      readonly BaseFormTextField: typeof BaseFormTextField;
      readonly FormBigDecimalField: typeof FormBigDecimalField;
      readonly FormCheckboxField: typeof FormCheckboxField;
      readonly FormDateField: typeof FormDateField;
      readonly FormTextAreaField: typeof FormTextAreaField;
      readonly FormTextField: typeof FormTextField;
  }, {}>;
  export type AppForm<T extends Record<string, unknown>> = ReturnType<typeof useAppForm<T>>;
  export function useForm<T extends Record<string, unknown>>(props: FormOptions<T, FormValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormAsyncValidateOrFn<T>, unknown>): import("@tanstack/react-form").ReactFormExtendedApi<T, FormValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormValidateOrFn<T>, FormAsyncValidateOrFn<T>, FormAsyncValidateOrFn<T>, unknown>;

}
declare module '@layerfi/components/features/forms/types' {
  export interface CommonFormFieldProps {
      label: string;
      className?: string;
      inline?: boolean;
      showLabel?: boolean;
      showFieldError?: boolean;
      isReadOnly?: boolean;
  }

}
declare module '@layerfi/components/features/invoices/api/useInvoiceSummaryStats' {
  import { type SWRResponse } from 'swr';
  import { type InvoiceSummaryStatsResponse } from '@layerfi/components/features/invoices/invoiceSchemas';
  export const INVOICE_SUMMARY_STATS_TAG_KEY = "#invoices-summary-stats";
  class InvoiceSummaryStatsSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRResponse<InvoiceSummaryStatsResponse>);
      get data(): {
          readonly invoices: {
              readonly overdueCount: number;
              readonly overdueTotal: bigint;
              readonly sentCount: number;
              readonly sentTotal: bigint;
          };
          readonly invoicePayments: {
              readonly sumTotal: bigint;
          };
      } | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
  }
  export function useInvoiceSummaryStats(): InvoiceSummaryStatsSWRResponse;
  export const useInvoiceSummaryStatsCacheActions: () => {
      forceReloadInvoiceSummaryStats: () => Promise<undefined[]>;
  };
  export {};

}
declare module '@layerfi/components/features/invoices/api/useListInvoices' {
  import { type SWRInfiniteResponse } from 'swr/infinite';
  import { Schema } from 'effect';
  import { type PaginationParams, type SortParams } from '@layerfi/components/types/utility/pagination';
  import { InvoiceStatus, type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  export const LIST_INVOICES_TAG_KEY = "#list-invoices";
  type ListInvoicesBaseParams = {
      businessId: string;
  };
  export type ListInvoicesFilterParams = {
      status?: ReadonlyArray<InvoiceStatus>;
      query?: string;
      dueAtStart?: Date;
      dueAtEnd?: Date;
  };
  enum SortBy {
      SentAt = "sent_at"
  }
  type ListInvoicesOptions = ListInvoicesFilterParams & PaginationParams & SortParams<SortBy>;
  type ListInvoicesParams = ListInvoicesBaseParams & ListInvoicesOptions;
  const ListInvoicesReturnSchema: Schema.Struct<{
      data: Schema.Array$<Schema.Struct<{
          id: typeof Schema.UUID;
          businessId: Schema.PropertySignature<":", string, "business_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<InvoiceStatus, InvoiceStatus, never>>;
          sentAt: Schema.PropertySignature<":", Date | null, "sent_at", ":", string | null, false, never>;
          dueAt: Schema.PropertySignature<":", Date | null, "due_at", ":", string | null, false, never>;
          paidAt: Schema.PropertySignature<":", Date | null, "paid_at", ":", string | null, false, never>;
          voidedAt: Schema.PropertySignature<":", Date | null, "voided_at", ":", string | null, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
          customer: Schema.NullOr<Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>>;
          lineItems: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly memo: string | null;
              readonly description: string | null;
              readonly invoiceId: string;
              readonly subtotal: number;
              readonly quantity: import("effect/BigDecimal").BigDecimal;
              readonly unitPrice: number;
              readonly discountAmount: number;
              readonly salesTaxTotal: number;
              readonly totalAmount: number;
              readonly transactionTags: readonly {
                  readonly value: string;
                  readonly id: string;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
                  readonly key: string;
                  readonly createdAt: Date;
                  readonly updatedAt: Date;
                  readonly deletedAt?: Date | undefined;
              }[];
              readonly accountIdentifier: {
                  readonly type: "StableName";
                  readonly stableName: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | null;
          }[], "line_items", ":", readonly {
              readonly id: string;
              readonly external_id: string | null;
              readonly memo: string | null;
              readonly description: string | null;
              readonly invoice_id: string;
              readonly subtotal: number;
              readonly quantity: string;
              readonly unit_price: number;
              readonly discount_amount: number;
              readonly sales_taxes_total: number;
              readonly total_amount: number;
              readonly transaction_tags: readonly {
                  readonly value: string;
                  readonly id: string;
                  readonly key: string;
                  readonly created_at: string;
                  readonly updated_at: string;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
                  readonly deleted_at?: string | undefined;
              }[];
              readonly account_identifier: {
                  readonly type: "StableName";
                  readonly stable_name: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | null;
          }[], false, never>;
          subtotal: typeof Schema.Number;
          additionalDiscount: Schema.PropertySignature<":", number, "additional_discount", ":", number, false, never>;
          additionalSalesTaxesTotal: Schema.PropertySignature<":", number, "additional_sales_taxes_total", ":", number, false, never>;
          totalAmount: Schema.PropertySignature<":", number, "total_amount", ":", number, false, never>;
          outstandingBalance: Schema.PropertySignature<":", number, "outstanding_balance", ":", number, false, never>;
          importedAt: Schema.PropertySignature<":", Date, "imported_at", ":", string, false, never>;
          updatedAt: Schema.PropertySignature<":", Date | null, "updated_at", ":", string | null, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
      }>>;
      meta: Schema.Struct<{
          pagination: Schema.Struct<{
              cursor: Schema.NullOr<typeof Schema.String>;
              hasMore: Schema.PropertySignature<":", boolean, "has_more", ":", boolean, false, never>;
              totalCount: Schema.PropertySignature<":", number | undefined, "total_count", ":", number | undefined, false, never>;
          }>;
      }>;
  }>;
  type ListInvoicesReturn = typeof ListInvoicesReturnSchema.Type;
  class ListInvoicesSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRInfiniteResponse<ListInvoicesReturn>);
      get data(): {
          readonly data: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          }[];
          readonly meta: {
              readonly pagination: {
                  readonly cursor: string | null;
                  readonly totalCount: number | undefined;
                  readonly hasMore: boolean;
              };
          };
      }[] | undefined;
      get size(): number;
      get setSize(): (size: number | ((_size: number) => number)) => Promise<{
          readonly data: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          }[];
          readonly meta: {
              readonly pagination: {
                  readonly cursor: string | null;
                  readonly totalCount: number | undefined;
                  readonly hasMore: boolean;
              };
          };
      }[] | undefined>;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
      get refetch(): import("swr/infinite").SWRInfiniteKeyedMutator<{
          readonly data: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          }[];
          readonly meta: {
              readonly pagination: {
                  readonly cursor: string | null;
                  readonly totalCount: number | undefined;
                  readonly hasMore: boolean;
              };
          };
      }[]>;
  }
  export const listInvoices: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: ListInvoicesParams | undefined;
  } | undefined) => () => Promise<{
      readonly data: readonly {
          readonly id: string;
          readonly externalId: string | null;
          readonly status: InvoiceStatus;
          readonly memo: string | null;
          readonly updatedAt: Date | null;
          readonly customer: {
              readonly id: string;
              readonly externalId: string | null;
              readonly individualName: string | null;
              readonly companyName: string | null;
              readonly email: string | null;
              readonly mobilePhone: string | null;
              readonly officePhone: string | null;
              readonly addressString: string | null;
              readonly status: "ACTIVE" | "ARCHIVED";
              readonly memo: string | null;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
          } | null;
          readonly invoiceNumber: string | null;
          readonly recipientName: string | null;
          readonly businessId: string;
          readonly lineItems: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly memo: string | null;
              readonly description: string | null;
              readonly invoiceId: string;
              readonly subtotal: number;
              readonly quantity: import("effect/BigDecimal").BigDecimal;
              readonly unitPrice: number;
              readonly discountAmount: number;
              readonly salesTaxTotal: number;
              readonly totalAmount: number;
              readonly transactionTags: readonly {
                  readonly value: string;
                  readonly id: string;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
                  readonly key: string;
                  readonly createdAt: Date;
                  readonly updatedAt: Date;
                  readonly deletedAt?: Date | undefined;
              }[];
              readonly accountIdentifier: {
                  readonly type: "StableName";
                  readonly stableName: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | null;
          }[];
          readonly subtotal: number;
          readonly paidAt: Date | null;
          readonly totalAmount: number;
          readonly sentAt: Date | null;
          readonly dueAt: Date | null;
          readonly voidedAt: Date | null;
          readonly additionalDiscount: number;
          readonly additionalSalesTaxesTotal: number;
          readonly outstandingBalance: number;
          readonly importedAt: Date;
      }[];
      readonly meta: {
          readonly pagination: {
              readonly cursor: string | null;
              readonly totalCount: number | undefined;
              readonly hasMore: boolean;
          };
      };
  }>;
  export function useListInvoices({ status, query, dueAtStart, dueAtEnd, sortBy, sortOrder, limit, showTotalCount, }?: ListInvoicesOptions): ListInvoicesSWRResponse;
  export function useInvoicesGlobalCacheActions(): {
      patchInvoiceByKey: (updatedInvoice: Invoice) => Promise<({
          readonly data: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          }[];
          readonly meta: {
              readonly pagination: {
                  readonly cursor: string | null;
                  readonly totalCount: number | undefined;
                  readonly hasMore: boolean;
              };
          };
      } | {
          readonly data: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          }[];
          readonly meta: {
              readonly pagination: {
                  readonly cursor: string | null;
                  readonly totalCount: number | undefined;
                  readonly hasMore: boolean;
              };
          };
      }[] | undefined)[]>;
      patchInvoiceWithTransformation: (transformation: (invoice: Invoice) => Invoice) => Promise<({
          readonly data: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          }[];
          readonly meta: {
              readonly pagination: {
                  readonly cursor: string | null;
                  readonly totalCount: number | undefined;
                  readonly hasMore: boolean;
              };
          };
      } | {
          readonly data: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          }[];
          readonly meta: {
              readonly pagination: {
                  readonly cursor: string | null;
                  readonly totalCount: number | undefined;
                  readonly hasMore: boolean;
              };
          };
      }[] | undefined)[]>;
      forceReloadInvoices: () => Promise<undefined[]>;
  };
  export {};

}
declare module '@layerfi/components/features/invoices/api/useRefundInvoice' {
  import type { Key } from 'swr';
  import { type SWRMutationResponse } from 'swr/mutation';
  import { Schema } from 'effect';
  import { CreateCustomerRefundSchema } from '@layerfi/components/features/invoices/customerRefundSchemas';
  import { type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  const RefundInvoiceReturnSchema: Schema.Struct<{
      data: Schema.Struct<{
          externalId: Schema.PropertySignature<":", string | undefined, "external_id", ":", string | undefined, false, never>;
          refundedAmount: Schema.PropertySignature<":", number, "refunded_amount", ":", number, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<import("@layerfi/components/features/invoices/customerRefundSchemas").CustomerRefundStatus, import("../customerRefundSchemas").CustomerRefundStatus, never>>;
          completedAt: Schema.PropertySignature<":", Date, "completed_at", ":", string, false, never>;
          isDedicated: Schema.PropertySignature<":", boolean, "is_dedicated", ":", boolean, false, never>;
          referenceNumber: Schema.PropertySignature<":", string | null, "reference_number", ":", string | null, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
      }>;
  }>;
  type RefundInvoiceBody = typeof CreateCustomerRefundSchema.Encoded;
  type RefundInvoiceReturn = typeof RefundInvoiceReturnSchema.Type;
  type RefundInvoiceSWRMutationResponse = SWRMutationResponse<RefundInvoiceReturn, unknown, Key, RefundInvoiceBody>;
  class RefundInvoiceSWRResponse {
      private swrResponse;
      constructor(swrResponse: RefundInvoiceSWRMutationResponse);
      get data(): {
          readonly data: {
              readonly externalId: string | undefined;
              readonly status: import("@layerfi/components/features/invoices/customerRefundSchemas").CustomerRefundStatus;
              readonly memo: string | null;
              readonly referenceNumber: string | null;
              readonly completedAt: Date;
              readonly refundedAmount: number;
              readonly isDedicated: boolean;
          };
      } | undefined;
      get trigger(): import("swr/mutation").TriggerWithArgs<{
          readonly data: {
              readonly externalId: string | undefined;
              readonly status: import("@layerfi/components/features/invoices/customerRefundSchemas").CustomerRefundStatus;
              readonly memo: string | null;
              readonly referenceNumber: string | null;
              readonly completedAt: Date;
              readonly refundedAmount: number;
              readonly isDedicated: boolean;
          };
      }, unknown, Key, {
          readonly completed_at: string;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod;
          readonly external_id?: string | undefined;
          readonly memo?: string | undefined;
          readonly reference_number?: string | undefined;
          readonly refunded_amount?: number | undefined;
      }>;
      get isMutating(): boolean;
      get isError(): boolean;
  }
  export const updateInvoiceWithRefund: (invoice: Invoice) => Invoice;
  type UseRefundInvoiceProps = {
      invoiceId: string;
  };
  export const useRefundInvoice: ({ invoiceId }: UseRefundInvoiceProps) => RefundInvoiceSWRResponse;
  export {};

}
declare module '@layerfi/components/features/invoices/api/useResetInvoice' {
  import type { Key } from 'swr';
  import { type SWRMutationResponse } from 'swr/mutation';
  import { Schema } from 'effect';
  const ResetInvoiceReturnSchema: Schema.Struct<{
      data: Schema.Struct<{
          id: typeof Schema.UUID;
          businessId: Schema.PropertySignature<":", string, "business_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<import("@layerfi/components/features/invoices/invoiceSchemas").InvoiceStatus, import("../invoiceSchemas").InvoiceStatus, never>>;
          sentAt: Schema.PropertySignature<":", Date | null, "sent_at", ":", string | null, false, never>;
          dueAt: Schema.PropertySignature<":", Date | null, "due_at", ":", string | null, false, never>;
          paidAt: Schema.PropertySignature<":", Date | null, "paid_at", ":", string | null, false, never>;
          voidedAt: Schema.PropertySignature<":", Date | null, "voided_at", ":", string | null, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
          customer: Schema.NullOr<Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>>;
          lineItems: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly memo: string | null;
              readonly description: string | null;
              readonly invoiceId: string;
              readonly subtotal: number;
              readonly quantity: import("effect/BigDecimal").BigDecimal;
              readonly unitPrice: number;
              readonly discountAmount: number;
              readonly salesTaxTotal: number;
              readonly totalAmount: number;
              readonly transactionTags: readonly {
                  readonly value: string;
                  readonly id: string;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
                  readonly key: string;
                  readonly createdAt: Date;
                  readonly updatedAt: Date;
                  readonly deletedAt?: Date | undefined;
              }[];
              readonly accountIdentifier: {
                  readonly type: "StableName";
                  readonly stableName: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | null;
          }[], "line_items", ":", readonly {
              readonly id: string;
              readonly external_id: string | null;
              readonly memo: string | null;
              readonly description: string | null;
              readonly invoice_id: string;
              readonly subtotal: number;
              readonly quantity: string;
              readonly unit_price: number;
              readonly discount_amount: number;
              readonly sales_taxes_total: number;
              readonly total_amount: number;
              readonly transaction_tags: readonly {
                  readonly value: string;
                  readonly id: string;
                  readonly key: string;
                  readonly created_at: string;
                  readonly updated_at: string;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
                  readonly deleted_at?: string | undefined;
              }[];
              readonly account_identifier: {
                  readonly type: "StableName";
                  readonly stable_name: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | null;
          }[], false, never>;
          subtotal: typeof Schema.Number;
          additionalDiscount: Schema.PropertySignature<":", number, "additional_discount", ":", number, false, never>;
          additionalSalesTaxesTotal: Schema.PropertySignature<":", number, "additional_sales_taxes_total", ":", number, false, never>;
          totalAmount: Schema.PropertySignature<":", number, "total_amount", ":", number, false, never>;
          outstandingBalance: Schema.PropertySignature<":", number, "outstanding_balance", ":", number, false, never>;
          importedAt: Schema.PropertySignature<":", Date, "imported_at", ":", string, false, never>;
          updatedAt: Schema.PropertySignature<":", Date | null, "updated_at", ":", string | null, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
      }>;
  }>;
  type ResetInvoiceReturn = typeof ResetInvoiceReturnSchema.Type;
  type ResetInvoiceSWRMutationResponse = SWRMutationResponse<ResetInvoiceReturn, unknown, Key, never>;
  class ResetInvoiceSWRResponse {
      private swrResponse;
      constructor(swrResponse: ResetInvoiceSWRMutationResponse);
      get data(): {
          readonly data: {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: import("@layerfi/components/features/invoices/invoiceSchemas").InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          };
      } | undefined;
      get trigger(): import("swr/mutation").TriggerWithoutArgs<{
          readonly data: {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: import("@layerfi/components/features/invoices/invoiceSchemas").InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          };
      }, unknown, Key, never>;
      get isMutating(): boolean;
      get isError(): boolean;
  }
  type UseResetInvoiceProps = {
      invoiceId: string;
  };
  export const useResetInvoice: ({ invoiceId }: UseResetInvoiceProps) => ResetInvoiceSWRResponse;
  export {};

}
declare module '@layerfi/components/features/invoices/api/useUpsertDedicatedInvoicePayment' {
  import type { Key } from 'swr';
  import { type SWRMutationResponse } from 'swr/mutation';
  import { InvoiceStatus, type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { type InvoicePayment, type UpsertDedicatedInvoicePaymentSchema } from '@layerfi/components/features/invoices/invoicePaymentSchemas';
  import { Schema } from 'effect';
  export enum UpsertDedicatedInvoicePaymentMode {
      Create = "Create",
      Update = "Update"
  }
  type UpsertDedicatedInvoicePaymentBody = typeof UpsertDedicatedInvoicePaymentSchema.Encoded;
  const UpsertDedicatedInvoicePaymentReturnSchema: Schema.Struct<{
      data: Schema.Struct<{
          amount: typeof Schema.Number;
          method: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod, import("../../../components/PaymentMethod/schemas").PaymentMethod, never>>;
          at: Schema.propertySignature<typeof Schema.Date>;
          referenceNumber: Schema.PropertySignature<":", string | null, "reference_number", ":", string | null, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
      }>;
  }>;
  type UpsertDedicatedInvoicePaymentReturn = typeof UpsertDedicatedInvoicePaymentReturnSchema.Type;
  type UpsertDedicatedInvoicePaymentSWRMutationResponse = SWRMutationResponse<UpsertDedicatedInvoicePaymentReturn, unknown, Key, UpsertDedicatedInvoicePaymentBody>;
  class UpsertDedicatedInvoicePaymentSWRResponse {
      private swrResponse;
      constructor(swrResponse: UpsertDedicatedInvoicePaymentSWRMutationResponse);
      get data(): {
          readonly data: {
              readonly at: Date;
              readonly memo: string | null;
              readonly amount: number;
              readonly referenceNumber: string | null;
              readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod;
          };
      } | undefined;
      get trigger(): import("swr/mutation").TriggerWithArgs<{
          readonly data: {
              readonly at: Date;
              readonly memo: string | null;
              readonly amount: number;
              readonly referenceNumber: string | null;
              readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod;
          };
      }, unknown, Key, {
          readonly amount: number;
          readonly method: import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod;
          readonly paid_at: string;
          readonly memo?: string | undefined;
          readonly reference_number?: string | undefined;
      }>;
      get isMutating(): boolean;
      get isError(): boolean;
  }
  const CreateParamsSchema: Schema.Struct<{
      businessId: typeof Schema.String;
      invoiceId: typeof Schema.String;
  }>;
  const UpdateParamsSchema: Schema.Struct<{
      businessId: typeof Schema.String;
      invoiceId: typeof Schema.String;
      invoicePaymentId: typeof Schema.String;
  }>;
  export type CreateParams = typeof CreateParamsSchema.Type;
  export type UpdateParams = typeof UpdateParamsSchema.Type;
  export type UpsertParams = CreateParams | UpdateParams;
  export const updateInvoiceWithPayment: (invoice: Invoice, invoicePayment: InvoicePayment) => {
      status: InvoiceStatus;
      outstandingBalance: number;
      id: string;
      externalId: string | null;
      memo: string | null;
      updatedAt: Date | null;
      customer: {
          readonly id: string;
          readonly externalId: string | null;
          readonly individualName: string | null;
          readonly companyName: string | null;
          readonly email: string | null;
          readonly mobilePhone: string | null;
          readonly officePhone: string | null;
          readonly addressString: string | null;
          readonly status: "ACTIVE" | "ARCHIVED";
          readonly memo: string | null;
          readonly _local?: {
              readonly isOptimistic: boolean;
          } | undefined;
      } | null;
      invoiceNumber: string | null;
      recipientName: string | null;
      businessId: string;
      lineItems: readonly {
          readonly id: string;
          readonly externalId: string | null;
          readonly memo: string | null;
          readonly description: string | null;
          readonly invoiceId: string;
          readonly subtotal: number;
          readonly quantity: import("effect/BigDecimal").BigDecimal;
          readonly unitPrice: number;
          readonly discountAmount: number;
          readonly salesTaxTotal: number;
          readonly totalAmount: number;
          readonly transactionTags: readonly {
              readonly value: string;
              readonly id: string;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
              readonly key: string;
              readonly createdAt: Date;
              readonly updatedAt: Date;
              readonly deletedAt?: Date | undefined;
          }[];
          readonly accountIdentifier: {
              readonly type: "StableName";
              readonly stableName: string;
          } | {
              readonly id: string;
              readonly type: "AccountId";
          } | null;
      }[];
      subtotal: number;
      paidAt: Date | null;
      totalAmount: number;
      sentAt: Date | null;
      dueAt: Date | null;
      voidedAt: Date | null;
      additionalDiscount: number;
      additionalSalesTaxesTotal: number;
      importedAt: Date;
  };
  type UseUpsertDedicatedInvoicePaymentProps = {
      mode: UpsertDedicatedInvoicePaymentMode.Create;
      invoiceId: string;
  } | {
      mode: UpsertDedicatedInvoicePaymentMode.Update;
      invoiceId: string;
      invoicePaymentId: string;
  };
  export const useUpsertDedicatedInvoicePayment: (props: UseUpsertDedicatedInvoicePaymentProps) => UpsertDedicatedInvoicePaymentSWRResponse;
  export {};

}
declare module '@layerfi/components/features/invoices/api/useUpsertInvoice' {
  import type { Key } from 'swr';
  import { type SWRMutationResponse } from 'swr/mutation';
  import { type UpsertInvoiceSchema } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { Schema } from 'effect';
  export enum UpsertInvoiceMode {
      Create = "Create",
      Update = "Update"
  }
  type UpsertInvoiceBody = typeof UpsertInvoiceSchema.Encoded;
  const UpsertInvoiceReturnSchema: Schema.Struct<{
      data: Schema.Struct<{
          id: typeof Schema.UUID;
          businessId: Schema.PropertySignature<":", string, "business_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<import("@layerfi/components/features/invoices/invoiceSchemas").InvoiceStatus, import("../invoiceSchemas").InvoiceStatus, never>>;
          sentAt: Schema.PropertySignature<":", Date | null, "sent_at", ":", string | null, false, never>;
          dueAt: Schema.PropertySignature<":", Date | null, "due_at", ":", string | null, false, never>;
          paidAt: Schema.PropertySignature<":", Date | null, "paid_at", ":", string | null, false, never>;
          voidedAt: Schema.PropertySignature<":", Date | null, "voided_at", ":", string | null, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
          customer: Schema.NullOr<Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>>;
          lineItems: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly memo: string | null;
              readonly description: string | null;
              readonly invoiceId: string;
              readonly subtotal: number;
              readonly quantity: import("effect/BigDecimal").BigDecimal;
              readonly unitPrice: number;
              readonly discountAmount: number;
              readonly salesTaxTotal: number;
              readonly totalAmount: number;
              readonly transactionTags: readonly {
                  readonly value: string;
                  readonly id: string;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
                  readonly key: string;
                  readonly createdAt: Date;
                  readonly updatedAt: Date;
                  readonly deletedAt?: Date | undefined;
              }[];
              readonly accountIdentifier: {
                  readonly type: "StableName";
                  readonly stableName: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | null;
          }[], "line_items", ":", readonly {
              readonly id: string;
              readonly external_id: string | null;
              readonly memo: string | null;
              readonly description: string | null;
              readonly invoice_id: string;
              readonly subtotal: number;
              readonly quantity: string;
              readonly unit_price: number;
              readonly discount_amount: number;
              readonly sales_taxes_total: number;
              readonly total_amount: number;
              readonly transaction_tags: readonly {
                  readonly value: string;
                  readonly id: string;
                  readonly key: string;
                  readonly created_at: string;
                  readonly updated_at: string;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
                  readonly deleted_at?: string | undefined;
              }[];
              readonly account_identifier: {
                  readonly type: "StableName";
                  readonly stable_name: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | null;
          }[], false, never>;
          subtotal: typeof Schema.Number;
          additionalDiscount: Schema.PropertySignature<":", number, "additional_discount", ":", number, false, never>;
          additionalSalesTaxesTotal: Schema.PropertySignature<":", number, "additional_sales_taxes_total", ":", number, false, never>;
          totalAmount: Schema.PropertySignature<":", number, "total_amount", ":", number, false, never>;
          outstandingBalance: Schema.PropertySignature<":", number, "outstanding_balance", ":", number, false, never>;
          importedAt: Schema.PropertySignature<":", Date, "imported_at", ":", string, false, never>;
          updatedAt: Schema.PropertySignature<":", Date | null, "updated_at", ":", string | null, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
      }>;
  }>;
  type UpsertInvoiceReturn = typeof UpsertInvoiceReturnSchema.Type;
  type UpsertInvoiceSWRMutationResponse = SWRMutationResponse<UpsertInvoiceReturn, unknown, Key, UpsertInvoiceBody>;
  class UpsertInvoiceSWRResponse {
      private swrResponse;
      constructor(swrResponse: UpsertInvoiceSWRMutationResponse);
      get data(): {
          readonly data: {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: import("@layerfi/components/features/invoices/invoiceSchemas").InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          };
      } | undefined;
      get trigger(): import("swr/mutation").TriggerWithArgs<{
          readonly data: {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: import("@layerfi/components/features/invoices/invoiceSchemas").InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          };
      }, unknown, Key, {
          readonly line_items: readonly {
              readonly description: string;
              readonly quantity: string;
              readonly unit_price: number;
              readonly tags?: readonly {
                  readonly value: string;
                  readonly key: string;
              }[] | undefined;
              readonly account_identifier?: {
                  readonly type: "StableName";
                  readonly stable_name: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | undefined;
              readonly sales_taxes?: readonly {
                  readonly amount: number;
              }[] | undefined;
          }[];
          readonly sent_at: string;
          readonly due_at: string;
          readonly customer_id: string;
          readonly memo?: string | undefined;
          readonly invoice_number?: string | undefined;
          readonly additional_discount?: number | undefined;
      }>;
      get isMutating(): boolean;
      get isError(): boolean;
  }
  const CreateParamsSchema: Schema.Struct<{
      businessId: typeof Schema.String;
  }>;
  const UpdateParamsSchema: Schema.Struct<{
      businessId: typeof Schema.String;
      invoiceId: typeof Schema.String;
  }>;
  export type CreateParams = typeof CreateParamsSchema.Type;
  export type UpdateParams = typeof UpdateParamsSchema.Type;
  export type UpsertParams = CreateParams | UpdateParams;
  type UseUpsertInvoiceProps = {
      mode: UpsertInvoiceMode.Create;
  } | {
      mode: UpsertInvoiceMode.Update;
      invoiceId: string;
  };
  export const useUpsertInvoice: (props: UseUpsertInvoiceProps) => UpsertInvoiceSWRResponse;
  export {};

}
declare module '@layerfi/components/features/invoices/api/useVoidInvoice' {
  import type { Key } from 'swr';
  import { type SWRMutationResponse } from 'swr/mutation';
  import { Schema } from 'effect';
  const VoidInvoiceReturnSchema: Schema.Struct<{
      data: Schema.Struct<{
          id: typeof Schema.UUID;
          businessId: Schema.PropertySignature<":", string, "business_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<import("@layerfi/components/features/invoices/invoiceSchemas").InvoiceStatus, import("../invoiceSchemas").InvoiceStatus, never>>;
          sentAt: Schema.PropertySignature<":", Date | null, "sent_at", ":", string | null, false, never>;
          dueAt: Schema.PropertySignature<":", Date | null, "due_at", ":", string | null, false, never>;
          paidAt: Schema.PropertySignature<":", Date | null, "paid_at", ":", string | null, false, never>;
          voidedAt: Schema.PropertySignature<":", Date | null, "voided_at", ":", string | null, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
          customer: Schema.NullOr<Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>>;
          lineItems: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly memo: string | null;
              readonly description: string | null;
              readonly invoiceId: string;
              readonly subtotal: number;
              readonly quantity: import("effect/BigDecimal").BigDecimal;
              readonly unitPrice: number;
              readonly discountAmount: number;
              readonly salesTaxTotal: number;
              readonly totalAmount: number;
              readonly transactionTags: readonly {
                  readonly value: string;
                  readonly id: string;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
                  readonly key: string;
                  readonly createdAt: Date;
                  readonly updatedAt: Date;
                  readonly deletedAt?: Date | undefined;
              }[];
              readonly accountIdentifier: {
                  readonly type: "StableName";
                  readonly stableName: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | null;
          }[], "line_items", ":", readonly {
              readonly id: string;
              readonly external_id: string | null;
              readonly memo: string | null;
              readonly description: string | null;
              readonly invoice_id: string;
              readonly subtotal: number;
              readonly quantity: string;
              readonly unit_price: number;
              readonly discount_amount: number;
              readonly sales_taxes_total: number;
              readonly total_amount: number;
              readonly transaction_tags: readonly {
                  readonly value: string;
                  readonly id: string;
                  readonly key: string;
                  readonly created_at: string;
                  readonly updated_at: string;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
                  readonly deleted_at?: string | undefined;
              }[];
              readonly account_identifier: {
                  readonly type: "StableName";
                  readonly stable_name: string;
              } | {
                  readonly id: string;
                  readonly type: "AccountId";
              } | null;
          }[], false, never>;
          subtotal: typeof Schema.Number;
          additionalDiscount: Schema.PropertySignature<":", number, "additional_discount", ":", number, false, never>;
          additionalSalesTaxesTotal: Schema.PropertySignature<":", number, "additional_sales_taxes_total", ":", number, false, never>;
          totalAmount: Schema.PropertySignature<":", number, "total_amount", ":", number, false, never>;
          outstandingBalance: Schema.PropertySignature<":", number, "outstanding_balance", ":", number, false, never>;
          importedAt: Schema.PropertySignature<":", Date, "imported_at", ":", string, false, never>;
          updatedAt: Schema.PropertySignature<":", Date | null, "updated_at", ":", string | null, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
      }>;
  }>;
  type VoidInvoiceReturn = typeof VoidInvoiceReturnSchema.Type;
  type VoidInvoiceSWRMutationResponse = SWRMutationResponse<VoidInvoiceReturn, unknown, Key, never>;
  class VoidInvoiceSWRResponse {
      private swrResponse;
      constructor(swrResponse: VoidInvoiceSWRMutationResponse);
      get data(): {
          readonly data: {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: import("@layerfi/components/features/invoices/invoiceSchemas").InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          };
      } | undefined;
      get trigger(): import("swr/mutation").TriggerWithoutArgs<{
          readonly data: {
              readonly id: string;
              readonly externalId: string | null;
              readonly status: import("@layerfi/components/features/invoices/invoiceSchemas").InvoiceStatus;
              readonly memo: string | null;
              readonly updatedAt: Date | null;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly invoiceNumber: string | null;
              readonly recipientName: string | null;
              readonly businessId: string;
              readonly lineItems: readonly {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly memo: string | null;
                  readonly description: string | null;
                  readonly invoiceId: string;
                  readonly subtotal: number;
                  readonly quantity: import("effect/BigDecimal").BigDecimal;
                  readonly unitPrice: number;
                  readonly discountAmount: number;
                  readonly salesTaxTotal: number;
                  readonly totalAmount: number;
                  readonly transactionTags: readonly {
                      readonly value: string;
                      readonly id: string;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                      readonly key: string;
                      readonly createdAt: Date;
                      readonly updatedAt: Date;
                      readonly deletedAt?: Date | undefined;
                  }[];
                  readonly accountIdentifier: {
                      readonly type: "StableName";
                      readonly stableName: string;
                  } | {
                      readonly id: string;
                      readonly type: "AccountId";
                  } | null;
              }[];
              readonly subtotal: number;
              readonly paidAt: Date | null;
              readonly totalAmount: number;
              readonly sentAt: Date | null;
              readonly dueAt: Date | null;
              readonly voidedAt: Date | null;
              readonly additionalDiscount: number;
              readonly additionalSalesTaxesTotal: number;
              readonly outstandingBalance: number;
              readonly importedAt: Date;
          };
      }, unknown, Key, never>;
      get isMutating(): boolean;
      get isError(): boolean;
  }
  type UseVoidInvoiceProps = {
      invoiceId: string;
  };
  export const useVoidInvoice: ({ invoiceId }: UseVoidInvoiceProps) => VoidInvoiceSWRResponse;
  export {};

}
declare module '@layerfi/components/features/invoices/api/useWriteoffInvoice' {
  import { Schema } from 'effect';
  import type { Key } from 'swr';
  import { type SWRMutationResponse } from 'swr/mutation';
  import { type Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { type CreateInvoiceWriteoff } from '@layerfi/components/features/invoices/invoiceWriteoffSchemas';
  const WriteoffInvoiceReturnSchema: Schema.Struct<{
      data: Schema.Struct<{
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          amount: typeof Schema.Number;
          writeOffMode: Schema.PropertySignature<":", import("@layerfi/components/features/invoices/invoiceWriteoffSchemas").InvoiceWriteoffMode, "write_off_mode", ":", string, false, never>;
          writeOffAt: Schema.PropertySignature<":", Date, "write_off_at", ":", string, false, never>;
          referenceNumber: Schema.PropertySignature<":", string | null, "reference_number", ":", string | null, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
      }>;
  }>;
  type WriteoffInvoiceReturn = typeof WriteoffInvoiceReturnSchema.Type;
  type WriteoffInvoiceSWRMutationResponse = SWRMutationResponse<WriteoffInvoiceReturn, unknown, Key, CreateInvoiceWriteoff>;
  class WriteoffInvoiceSWRResponse {
      private swrResponse;
      constructor(swrResponse: WriteoffInvoiceSWRMutationResponse);
      get data(): {
          readonly data: {
              readonly externalId: string | null;
              readonly memo: string | null;
              readonly amount: number;
              readonly referenceNumber: string | null;
              readonly invoiceId: string;
              readonly writeOffMode: import("@layerfi/components/features/invoices/invoiceWriteoffSchemas").InvoiceWriteoffMode;
              readonly writeOffAt: Date;
          };
      } | undefined;
      get trigger(): import("swr/mutation").TriggerWithArgs<{
          readonly data: {
              readonly externalId: string | null;
              readonly memo: string | null;
              readonly amount: number;
              readonly referenceNumber: string | null;
              readonly invoiceId: string;
              readonly writeOffMode: import("@layerfi/components/features/invoices/invoiceWriteoffSchemas").InvoiceWriteoffMode;
              readonly writeOffAt: Date;
          };
      }, unknown, Key, {
          readonly externalId?: string | undefined;
          readonly memo?: string | undefined;
          readonly amount: number;
          readonly referenceNumber?: string | undefined;
          readonly writeOffMode?: import("@layerfi/components/features/invoices/invoiceWriteoffSchemas").InvoiceWriteoffMode | undefined;
          readonly writeOffAt: Date;
      }>;
      get isMutating(): boolean;
      get isError(): boolean;
  }
  export const updateInvoiceWithWriteoff: (invoice: Invoice) => Invoice;
  type UseWriteoffInvoiceProps = {
      invoiceId: string;
  };
  export const useWriteoffInvoice: ({ invoiceId }: UseWriteoffInvoiceProps) => WriteoffInvoiceSWRResponse;
  export {};

}
declare module '@layerfi/components/features/invoices/customerRefundSchemas' {
  import { Schema } from 'effect';
  export enum CustomerRefundStatus {
      Paid = "PAID",
      PartiallyPaid = "PARTIALLY_PAID",
      Sent = "SENT"
  }
  export const TransformedCustomerRefundStatusSchema: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<CustomerRefundStatus, CustomerRefundStatus, never>>;
  export const CreateCustomerRefundSchema: Schema.Struct<{
      externalId: Schema.PropertySignature<"?:", string | undefined, "external_id", "?:", string | undefined, false, never>;
      refundedAmount: Schema.PropertySignature<"?:", number | undefined, "refunded_amount", "?:", number | undefined, false, never>;
      completedAt: Schema.PropertySignature<":", Date, "completed_at", ":", string, false, never>;
      method: Schema.Enums<typeof import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod>;
      referenceNumber: Schema.PropertySignature<"?:", string | undefined, "reference_number", "?:", string | undefined, false, never>;
      memo: Schema.optional<typeof Schema.String>;
  }>;
  export type CreateCustomerRefund = typeof CreateCustomerRefundSchema.Type;
  export const CustomerRefundSchema: Schema.Struct<{
      externalId: Schema.PropertySignature<":", string | undefined, "external_id", ":", string | undefined, false, never>;
      refundedAmount: Schema.PropertySignature<":", number, "refunded_amount", ":", number, false, never>;
      status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<CustomerRefundStatus, CustomerRefundStatus, never>>;
      completedAt: Schema.PropertySignature<":", Date, "completed_at", ":", string, false, never>;
      isDedicated: Schema.PropertySignature<":", boolean, "is_dedicated", ":", boolean, false, never>;
      referenceNumber: Schema.PropertySignature<":", string | null, "reference_number", ":", string | null, false, never>;
      memo: Schema.NullOr<typeof Schema.String>;
  }>;
  export type CustomerRefund = typeof CustomerRefundSchema.Type;

}
declare module '@layerfi/components/features/invoices/invoicePaymentSchemas' {
  import { Schema } from 'effect';
  export const UpsertDedicatedInvoicePaymentSchema: Schema.Struct<{
      amount: typeof Schema.Number;
      method: Schema.Enums<typeof import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod>;
      paidAt: Schema.PropertySignature<":", Date, "paid_at", ":", string, false, never>;
      referenceNumber: Schema.PropertySignature<"?:", string | undefined, "reference_number", "?:", string | undefined, false, never>;
      memo: Schema.optional<typeof Schema.String>;
  }>;
  export type UpsertDedicatedInvoicePayment = typeof UpsertDedicatedInvoicePaymentSchema.Type;
  export const DedicatedInvoicePaymentFormSchema: Schema.Struct<{
      amount: typeof Schema.BigDecimal;
      method: Schema.NullOr<Schema.Enums<typeof import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod>>;
      paidAt: Schema.NullOr<Schema.declare<import("@internationalized/date").ZonedDateTime, import("@internationalized/date").ZonedDateTime, readonly [], never>>;
      referenceNumber: typeof Schema.String;
      memo: typeof Schema.String;
  }>;
  export type DedicatedInvoicePaymentForm = typeof DedicatedInvoicePaymentFormSchema.Type;
  export const InvoicePaymentSchema: Schema.Struct<{
      amount: typeof Schema.Number;
      method: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<import("@layerfi/components/components/PaymentMethod/schemas").PaymentMethod, import("../../components/PaymentMethod/schemas").PaymentMethod, never>>;
      at: Schema.propertySignature<typeof Schema.Date>;
      referenceNumber: Schema.PropertySignature<":", string | null, "reference_number", ":", string | null, false, never>;
      memo: Schema.NullOr<typeof Schema.String>;
  }>;
  export type InvoicePayment = typeof InvoicePaymentSchema.Type;

}
declare module '@layerfi/components/features/invoices/invoiceSchemas' {
  import { Schema } from 'effect';
  import { InvoiceTermsValues } from '@layerfi/components/components/Invoices/InvoiceTermsComboBox/InvoiceTermsComboBox';
  export enum InvoiceStatus {
      Voided = "VOIDED",
      Paid = "PAID",
      WrittenOff = "WRITTEN_OFF",
      PartiallyWrittenOff = "PARTIALLY_WRITTEN_OFF",
      PartiallyPaid = "PARTIALLY_PAID",
      Sent = "SENT",
      Refunded = "REFUNDED"
  }
  export const TransformedInvoiceStatusSchema: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<InvoiceStatus, InvoiceStatus, never>>;
  export const InvoiceLineItemSchema: Schema.Struct<{
      id: typeof Schema.UUID;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
      description: Schema.NullOr<typeof Schema.String>;
      unitPrice: Schema.PropertySignature<":", number, "unit_price", ":", number, false, never>;
      quantity: typeof Schema.BigDecimal;
      subtotal: typeof Schema.Number;
      discountAmount: Schema.PropertySignature<":", number, "discount_amount", ":", number, false, never>;
      salesTaxTotal: Schema.PropertySignature<":", number, "sales_taxes_total", ":", number, false, never>;
      totalAmount: Schema.PropertySignature<":", number, "total_amount", ":", number, false, never>;
      memo: Schema.NullOr<typeof Schema.String>;
      transactionTags: Schema.PropertySignature<":", readonly {
          readonly value: string;
          readonly id: string;
          readonly _local?: {
              readonly isOptimistic: boolean;
          } | undefined;
          readonly key: string;
          readonly createdAt: Date;
          readonly updatedAt: Date;
          readonly deletedAt?: Date | undefined;
      }[], "transaction_tags", ":", readonly {
          readonly value: string;
          readonly id: string;
          readonly key: string;
          readonly created_at: string;
          readonly updated_at: string;
          readonly _local?: {
              readonly isOptimistic: boolean;
          } | undefined;
          readonly deleted_at?: string | undefined;
      }[], false, never>;
      accountIdentifier: Schema.PropertySignature<":", {
          readonly type: "StableName";
          readonly stableName: string;
      } | {
          readonly id: string;
          readonly type: "AccountId";
      } | null, "account_identifier", ":", {
          readonly type: "StableName";
          readonly stable_name: string;
      } | {
          readonly id: string;
          readonly type: "AccountId";
      } | null, false, never>;
  }>;
  export type InvoiceLineItem = typeof InvoiceLineItemSchema.Type;
  export const InvoiceSchema: Schema.Struct<{
      id: typeof Schema.UUID;
      businessId: Schema.PropertySignature<":", string, "business_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<InvoiceStatus, InvoiceStatus, never>>;
      sentAt: Schema.PropertySignature<":", Date | null, "sent_at", ":", string | null, false, never>;
      dueAt: Schema.PropertySignature<":", Date | null, "due_at", ":", string | null, false, never>;
      paidAt: Schema.PropertySignature<":", Date | null, "paid_at", ":", string | null, false, never>;
      voidedAt: Schema.PropertySignature<":", Date | null, "voided_at", ":", string | null, false, never>;
      invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
      recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
      customer: Schema.NullOr<Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>>;
      lineItems: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly externalId: string | null;
          readonly memo: string | null;
          readonly description: string | null;
          readonly invoiceId: string;
          readonly subtotal: number;
          readonly quantity: import("effect/BigDecimal").BigDecimal;
          readonly unitPrice: number;
          readonly discountAmount: number;
          readonly salesTaxTotal: number;
          readonly totalAmount: number;
          readonly transactionTags: readonly {
              readonly value: string;
              readonly id: string;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
              readonly key: string;
              readonly createdAt: Date;
              readonly updatedAt: Date;
              readonly deletedAt?: Date | undefined;
          }[];
          readonly accountIdentifier: {
              readonly type: "StableName";
              readonly stableName: string;
          } | {
              readonly id: string;
              readonly type: "AccountId";
          } | null;
      }[], "line_items", ":", readonly {
          readonly id: string;
          readonly external_id: string | null;
          readonly memo: string | null;
          readonly description: string | null;
          readonly invoice_id: string;
          readonly subtotal: number;
          readonly quantity: string;
          readonly unit_price: number;
          readonly discount_amount: number;
          readonly sales_taxes_total: number;
          readonly total_amount: number;
          readonly transaction_tags: readonly {
              readonly value: string;
              readonly id: string;
              readonly key: string;
              readonly created_at: string;
              readonly updated_at: string;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
              readonly deleted_at?: string | undefined;
          }[];
          readonly account_identifier: {
              readonly type: "StableName";
              readonly stable_name: string;
          } | {
              readonly id: string;
              readonly type: "AccountId";
          } | null;
      }[], false, never>;
      subtotal: typeof Schema.Number;
      additionalDiscount: Schema.PropertySignature<":", number, "additional_discount", ":", number, false, never>;
      additionalSalesTaxesTotal: Schema.PropertySignature<":", number, "additional_sales_taxes_total", ":", number, false, never>;
      totalAmount: Schema.PropertySignature<":", number, "total_amount", ":", number, false, never>;
      outstandingBalance: Schema.PropertySignature<":", number, "outstanding_balance", ":", number, false, never>;
      importedAt: Schema.PropertySignature<":", Date, "imported_at", ":", string, false, never>;
      updatedAt: Schema.PropertySignature<":", Date | null, "updated_at", ":", string | null, false, never>;
      memo: Schema.NullOr<typeof Schema.String>;
  }>;
  export type Invoice = typeof InvoiceSchema.Type;
  export const UpsertInvoiceTaxLineItemSchema: Schema.Struct<{
      amount: typeof Schema.Number;
  }>;
  export const UpsertInvoiceLineItemSchema: Schema.Struct<{
      description: typeof Schema.String;
      unitPrice: Schema.PropertySignature<":", number, "unit_price", ":", number, false, never>;
      quantity: typeof Schema.BigDecimal;
      salesTaxes: Schema.PropertySignature<"?:", readonly {
          readonly amount: number;
      }[] | undefined, "sales_taxes", "?:", readonly {
          readonly amount: number;
      }[] | undefined, false, never>;
      accountIdentifier: Schema.PropertySignature<"?:", {
          readonly type: "StableName";
          readonly stableName: string;
      } | {
          readonly id: string;
          readonly type: "AccountId";
      } | undefined, "account_identifier", "?:", {
          readonly type: "StableName";
          readonly stable_name: string;
      } | {
          readonly id: string;
          readonly type: "AccountId";
      } | undefined, false, never>;
      tags: Schema.optional<Schema.Array$<Schema.Struct<{
          key: typeof Schema.NonEmptyTrimmedString;
          value: typeof Schema.NonEmptyTrimmedString;
      }>>>;
  }>;
  export type UpsertInvoiceLineItem = typeof UpsertInvoiceLineItemSchema.Type;
  export const UpsertInvoiceSchema: Schema.Struct<{
      sentAt: Schema.PropertySignature<":", Date, "sent_at", ":", string, false, never>;
      dueAt: Schema.PropertySignature<":", Date, "due_at", ":", string, false, never>;
      invoiceNumber: Schema.PropertySignature<"?:", string | undefined, "invoice_number", "?:", string | undefined, false, never>;
      customerId: Schema.PropertySignature<":", string, "customer_id", ":", string, false, never>;
      memo: Schema.optional<typeof Schema.String>;
      lineItems: Schema.PropertySignature<":", readonly {
          readonly description: string;
          readonly tags?: readonly {
              readonly value: string;
              readonly key: string;
          }[] | undefined;
          readonly quantity: import("effect/BigDecimal").BigDecimal;
          readonly unitPrice: number;
          readonly accountIdentifier?: {
              readonly type: "StableName";
              readonly stableName: string;
          } | {
              readonly id: string;
              readonly type: "AccountId";
          } | undefined;
          readonly salesTaxes?: readonly {
              readonly amount: number;
          }[] | undefined;
      }[], "line_items", ":", readonly {
          readonly description: string;
          readonly quantity: string;
          readonly unit_price: number;
          readonly tags?: readonly {
              readonly value: string;
              readonly key: string;
          }[] | undefined;
          readonly account_identifier?: {
              readonly type: "StableName";
              readonly stable_name: string;
          } | {
              readonly id: string;
              readonly type: "AccountId";
          } | undefined;
          readonly sales_taxes?: readonly {
              readonly amount: number;
          }[] | undefined;
      }[], false, never>;
      additionalDiscount: Schema.PropertySignature<"?:", number | undefined, "additional_discount", "?:", number | undefined, false, never>;
  }>;
  export type UpsertInvoice = typeof UpsertInvoiceSchema.Type;
  export const InvoiceFormLineItemSchema: Schema.Struct<{
      description: typeof Schema.String;
      unitPrice: typeof Schema.BigDecimal;
      quantity: typeof Schema.BigDecimal;
      amount: typeof Schema.BigDecimal;
      isTaxable: typeof Schema.Boolean;
      accountIdentifier: Schema.NullOr<Schema.Union<[Schema.Struct<{
          type: Schema.Literal<["StableName"]>;
          stableName: Schema.PropertySignature<":", string, "stable_name", ":", string, false, never>;
      }>, Schema.Struct<{
          type: Schema.Literal<["AccountId"]>;
          id: typeof Schema.String;
      }>]>>;
      tags: Schema.Array$<Schema.Data<Schema.Struct<{
          id: typeof Schema.UUID;
          dimensionLabel: typeof Schema.NonEmptyTrimmedString;
          valueLabel: typeof Schema.NonEmptyTrimmedString;
          _local: Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>;
      }>>>;
  }>;
  export type InvoiceFormLineItem = typeof InvoiceFormLineItemSchema.Type;
  export const InvoiceFormLineItemEquivalence: import("effect/Equivalence").Equivalence<{
      readonly amount: import("effect/BigDecimal").BigDecimal;
      readonly description: string;
      readonly tags: readonly {
          readonly id: string;
          readonly _local: {
              readonly isOptimistic: boolean;
          };
          readonly dimensionLabel: string;
          readonly valueLabel: string;
      }[];
      readonly quantity: import("effect/BigDecimal").BigDecimal;
      readonly unitPrice: import("effect/BigDecimal").BigDecimal;
      readonly accountIdentifier: {
          readonly type: "StableName";
          readonly stableName: string;
      } | {
          readonly id: string;
          readonly type: "AccountId";
      } | null;
      readonly isTaxable: boolean;
  }>;
  export const InvoiceFormSchema: Schema.Struct<{
      terms: Schema.Enums<typeof InvoiceTermsValues>;
      sentAt: Schema.NullOr<Schema.declare<import("@internationalized/date").ZonedDateTime, import("@internationalized/date").ZonedDateTime, readonly [], never>>;
      dueAt: Schema.NullOr<Schema.declare<import("@internationalized/date").ZonedDateTime, import("@internationalized/date").ZonedDateTime, readonly [], never>>;
      invoiceNumber: typeof Schema.String;
      customer: Schema.NullOr<Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>>;
      email: typeof Schema.String;
      address: typeof Schema.String;
      lineItems: Schema.Array$<Schema.Struct<{
          description: typeof Schema.String;
          unitPrice: typeof Schema.BigDecimal;
          quantity: typeof Schema.BigDecimal;
          amount: typeof Schema.BigDecimal;
          isTaxable: typeof Schema.Boolean;
          accountIdentifier: Schema.NullOr<Schema.Union<[Schema.Struct<{
              type: Schema.Literal<["StableName"]>;
              stableName: Schema.PropertySignature<":", string, "stable_name", ":", string, false, never>;
          }>, Schema.Struct<{
              type: Schema.Literal<["AccountId"]>;
              id: typeof Schema.String;
          }>]>>;
          tags: Schema.Array$<Schema.Data<Schema.Struct<{
              id: typeof Schema.UUID;
              dimensionLabel: typeof Schema.NonEmptyTrimmedString;
              valueLabel: typeof Schema.NonEmptyTrimmedString;
              _local: Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>;
          }>>>;
      }>>;
      discountRate: typeof Schema.BigDecimal;
      taxRate: typeof Schema.BigDecimal;
      memo: typeof Schema.String;
  }>;
  export type InvoiceForm = Omit<typeof InvoiceFormSchema.Type, 'lineItems'> & {
      lineItems: InvoiceFormLineItem[];
  };
  export const InvoiceSummaryStatsResponseSchema: Schema.Struct<{
      invoices: Schema.Struct<{
          overdueCount: Schema.PropertySignature<":", number, "overdue_count", ":", number, false, never>;
          overdueTotal: Schema.PropertySignature<":", bigint, "overdue_total", ":", number, false, never>;
          sentCount: Schema.PropertySignature<":", number, "sent_count", ":", number, false, never>;
          sentTotal: Schema.PropertySignature<":", bigint, "sent_total", ":", number, false, never>;
      }>;
      invoicePayments: Schema.PropertySignature<":", {
          readonly sumTotal: bigint;
      }, "invoice_payments", ":", {
          readonly sum_total: number;
      }, false, never>;
  }>;
  export type InvoiceSummaryStatsResponse = typeof InvoiceSummaryStatsResponseSchema.Type;

}
declare module '@layerfi/components/features/invoices/invoiceWriteoffSchemas' {
  import { Schema } from 'effect';
  export enum InvoiceWriteoffMode {
      Expense = "EXPENSE",
      RevenueReversal = "REVENUE_REVERSAL"
  }
  export const TransformedInvoiceWriteoffModeSchema: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<InvoiceWriteoffMode, InvoiceWriteoffMode, never>>;
  export const CreateInvoiceWriteoffSchema: Schema.Struct<{
      externalId: Schema.PropertySignature<"?:", string | undefined, "external_id", "?:", string | undefined, false, never>;
      amount: typeof Schema.Number;
      writeOffMode: Schema.PropertySignature<"?:", InvoiceWriteoffMode | undefined, "write_off_mode", "?:", InvoiceWriteoffMode | undefined, false, never>;
      writeOffAt: Schema.PropertySignature<":", Date, "write_off_at", ":", string, false, never>;
      referenceNumber: Schema.PropertySignature<"?:", string | undefined, "reference_number", "?:", string | undefined, false, never>;
      memo: Schema.optional<typeof Schema.String>;
  }>;
  export type CreateInvoiceWriteoff = typeof CreateInvoiceWriteoffSchema.Type;
  export const InvoiceWriteoffSchema: Schema.Struct<{
      invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      amount: typeof Schema.Number;
      writeOffMode: Schema.PropertySignature<":", InvoiceWriteoffMode, "write_off_mode", ":", string, false, never>;
      writeOffAt: Schema.PropertySignature<":", Date, "write_off_at", ":", string, false, never>;
      referenceNumber: Schema.PropertySignature<":", string | null, "reference_number", ":", string | null, false, never>;
      memo: Schema.NullOr<typeof Schema.String>;
  }>;
  export type InvoiceWriteoff = typeof InvoiceWriteoffSchema.Type;

}
declare module '@layerfi/components/features/ledger/accounts/[ledgerAccountId]/api/useDeleteLedgerAccount' {
  export function useDeleteAccountFromLedger(): import("swr/mutation").SWRMutationResponse<Record<string, never>, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#delete-account-from-ledger"];
  } | undefined, {
      accountId: string;
  }>;

}
declare module '@layerfi/components/features/ledger/accounts/[ledgerAccountId]/api/useListLedgerAccountLines' {
  import { LedgerAccountLineItem, LedgerAccountLineItems } from '@layerfi/components/types/ledger_accounts';
  export const LIST_LEDGER_ACCOUNT_LINES_TAG_KEY = "#list-ledger-account-lines";
  type GetLedgerAccountLinesParams = {
      businessId: string;
      accountId: string;
      include_entries_before_activation?: boolean;
      include_child_account_lines?: boolean;
      start_date?: string;
      end_date?: string;
      sort_by?: 'entry_at' | 'entry_number' | 'created_at';
      sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES';
      cursor?: string;
      limit?: number;
      show_total_count?: boolean;
  };
  type ListLedgerAccountLinesReturn = {
      data: LedgerAccountLineItems;
      meta?: {
          pagination: {
              cursor?: string;
              has_more: boolean;
              total_count?: number;
          };
      };
  };
  export const listLedgerAccountLines: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetLedgerAccountLinesParams | undefined;
  } | undefined) => () => Promise<ListLedgerAccountLinesReturn>;
  export type UseListLedgerAccountLinesOptions = {
      accountId: string;
      include_entries_before_activation?: boolean;
      include_child_account_lines?: boolean;
      start_date?: string;
      end_date?: string;
      sort_by?: 'entry_at' | 'entry_number' | 'created_at';
      sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES';
      limit?: number;
      show_total_count?: boolean;
  };
  export function useListLedgerAccountLines({ accountId, include_entries_before_activation, include_child_account_lines, start_date, end_date, sort_by, sort_order, limit, show_total_count, }: UseListLedgerAccountLinesOptions): import("swr/infinite").SWRInfiniteResponse<ListLedgerAccountLinesReturn, any>;
  export function useLedgerAccountLinesInvalidator(): {
      invalidateLedgerAccountLines: () => Promise<undefined[]>;
      debouncedInvalidateLedgerAccountLines: import("lodash").DebouncedFunc<() => Promise<undefined[]>>;
  };
  export function useLedgerAccountLinesOptimisticUpdater(): {
      optimisticallyUpdateLedgerAccountLines: (transformLineItem: (lineItem: LedgerAccountLineItem) => LedgerAccountLineItem) => Promise<undefined[]>;
  };
  export {};

}
declare module '@layerfi/components/features/ledger/entries/[ledgerEntryId]/tags/api/useRemoveTagFromLedgerEntry' {
  type RemoveTagFromLedgerEntryArg = {
      tagId: string;
  };
  type RemoveTagFromLedgerEntryOptions = {
      ledgerEntryId: string;
  };
  export function useRemoveTagFromLedgerEntry({ ledgerEntryId }: RemoveTagFromLedgerEntryOptions): import("swr/mutation").SWRMutationResponse<Record<string, never>, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly ledgerEntryId: string;
      readonly tags: readonly ["#remove-tag-from-ledger-entry"];
  } | undefined, RemoveTagFromLedgerEntryArg>;
  export {};

}
declare module '@layerfi/components/features/ledger/entries/[ledgerEntryId]/tags/api/useTagLedgerEntry' {
  type TagLedgerEntryArg = {
      key: string;
      value: string;
  };
  type TagLedgerEntryOptions = {
      ledgerEntryId: string;
  };
  export function useTagLedgerEntry({ ledgerEntryId }: TagLedgerEntryOptions): import("swr/mutation").SWRMutationResponse<Record<string, never>, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly ledgerEntryId: string;
      readonly tags: readonly ["#tag-ledger-entry"];
  } | undefined, TagLedgerEntryArg>;
  export {};

}
declare module '@layerfi/components/features/ledger/entries/api/useListLedgerEntries' {
  import type { JournalEntry } from '@layerfi/components/types';
  export const LIST_LEDGER_ENTRIES_TAG_KEY = "#list-ledger-entries";
  type GetLedgerEntriesParams = {
      businessId: string;
      sort_by?: 'entry_at' | 'entry_number' | 'created_at';
      sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES';
      cursor?: string;
      limit?: number;
      show_total_count?: boolean;
  };
  type ListLedgerEntriesReturn = {
      data: ReadonlyArray<JournalEntry>;
      meta?: {
          pagination: {
              cursor?: string;
              has_more: boolean;
              total_count?: number;
          };
      };
  };
  export const listLedgerEntries: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetLedgerEntriesParams | undefined;
  } | undefined) => () => Promise<ListLedgerEntriesReturn>;
  export type UseListLedgerEntriesOptions = {
      sort_by?: 'entry_at' | 'entry_number' | 'created_at';
      sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES';
      limit?: number;
      show_total_count?: boolean;
  };
  export function useListLedgerEntries({ sort_by, sort_order, limit, show_total_count, }?: UseListLedgerEntriesOptions): import("swr/infinite").SWRInfiniteResponse<ListLedgerEntriesReturn, any>;
  export function useLedgerEntriesCacheActions(): {
      invalidateLedgerEntries: () => Promise<undefined[]>;
      debouncedInvalidateLedgerEntries: import("lodash").DebouncedFunc<() => Promise<undefined[]>>;
      forceReloadLedgerEntries: () => Promise<undefined[]>;
  };
  export function useLedgerEntriesOptimisticUpdater(): {
      optimisticallyUpdateLedgerEntries: (transformJournalEntry: (entry: JournalEntry) => JournalEntry) => Promise<undefined[]>;
  };
  export {};

}
declare module '@layerfi/components/features/tags/api/useCreateTagDimension' {
  import { TagDimensionSchema } from '@layerfi/components/features/tags/tagSchemas';
  export function useCreateTagDimension(): import("swr/mutation").SWRMutationResponse<{
      data: typeof TagDimensionSchema.Encoded;
  }, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#create-tag-dimension"];
  } | undefined, {
      readonly key: string;
      readonly strictness: "BALANCING" | "NON_BALANCING";
      readonly definedValues: readonly string[];
  }>;

}
declare module '@layerfi/components/features/tags/api/useCreateTagValueDefinition' {
  import { type TagValueDefinitionSchema } from '@layerfi/components/features/tags/tagSchemas';
  export function useCreateTagDimension(): import("swr/mutation").SWRMutationResponse<{
      data: typeof TagValueDefinitionSchema.Encoded;
  }, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#create-tag-value-definition"];
  } | undefined, {
      dimensionId: string;
      label: string;
  }>;

}
declare module '@layerfi/components/features/tags/api/useTagDimensionByKey' {
  import { type SWRResponse } from 'swr';
  import { type TagDimension } from '@layerfi/components/features/tags/tagSchemas';
  export const TAG_DIMENSION_BY_KEY_TAG_KEY = "#tag-dimension-by-key";
  class TagDimensionByKeySWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRResponse<TagDimension>);
      get data(): {
          readonly id: string;
          readonly key: string;
          readonly strictness: "BALANCING" | "NON_BALANCING";
          readonly definedValues: readonly {
              readonly value: string;
              readonly id: string;
          }[];
      } | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
  }
  type UseTagDimensionByKeyParameters = {
      isEnabled?: boolean;
      dimensionKey: string;
  };
  export function useTagDimensionByKey({ isEnabled, dimensionKey }: UseTagDimensionByKeyParameters): TagDimensionByKeySWRResponse;
  export function usePreloadTagDimensionByKey(parameters: UseTagDimensionByKeyParameters): void;
  export {};

}
declare module '@layerfi/components/features/tags/api/useTagDimensions' {
  import { type SWRResponse } from 'swr';
  import { Schema } from 'effect';
  export const TAG_DIMENSIONS_TAG_KEY = "#tag-dimensions";
  const TagDimensionsListSchema: Schema.Array$<Schema.Struct<{
      id: typeof Schema.UUID;
      key: typeof Schema.NonEmptyTrimmedString;
      strictness: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.Literal<["BALANCING", "NON_BALANCING"]>>;
      definedValues: Schema.PropertySignature<":", readonly {
          readonly value: string;
          readonly id: string;
      }[], "defined_values", ":", readonly {
          readonly value: string;
          readonly id: string;
      }[], false, never>;
  }>>;
  class TagDimensionsSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRResponse<typeof TagDimensionsListSchema.Type>);
      get data(): readonly {
          readonly id: string;
          readonly key: string;
          readonly strictness: "BALANCING" | "NON_BALANCING";
          readonly definedValues: readonly {
              readonly value: string;
              readonly id: string;
          }[];
      }[] | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
  }
  type UseTagDimensionsParameters = {
      isEnabled?: boolean;
  };
  export function useTagDimensions({ isEnabled }?: UseTagDimensionsParameters): TagDimensionsSWRResponse;
  export function usePreloadTagDimensions(parameters?: UseTagDimensionsParameters): void;
  export {};

}
declare module '@layerfi/components/features/tags/components/TagDimensionCombobox' {
  import { type Tag } from '@layerfi/components/features/tags/tagSchemas';
  type TagDimensionComboboxProps = {
      dimensionKey: string;
      value: Tag | null;
      onValueChange: (tags: Tag | null) => void;
      isReadOnly?: boolean;
      showLabel?: boolean;
  };
  export const TagDimensionCombobox: ({ dimensionKey, value, onValueChange, isReadOnly, showLabel }: TagDimensionComboboxProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/features/tags/components/TagSelector' {
  import type { Tag as TagType, TagValue } from '@layerfi/components/features/tags/tagSchemas';
  type TagSelectorProps = {
      selectedTags: ReadonlyArray<TagType>;
      onAddTag: (tagValue: TagValue) => void;
      onRemoveTag: (tag: TagType) => void;
      isReadOnly?: boolean;
  };
  export function TagSelector({ selectedTags, onAddTag, onRemoveTag, isReadOnly, }: TagSelectorProps): import("react/jsx-runtime").JSX.Element | null;
  export {};

}
declare module '@layerfi/components/features/tags/tagSchemas' {
  import { Schema } from 'effect';
  export const TagDimensionStrictnessSchema: Schema.Literal<["BALANCING", "NON_BALANCING"]>;
  export const TagValueDefinitionSchema: Schema.Struct<{
      id: typeof Schema.UUID;
      value: typeof Schema.NonEmptyTrimmedString;
  }>;
  export type TagValueDefinition = typeof TagValueDefinitionSchema.Type;
  export const TagKeyValueSchema: Schema.Struct<{
      key: typeof Schema.NonEmptyTrimmedString;
      value: typeof Schema.NonEmptyTrimmedString;
  }>;
  export const makeTagKeyValue: (i: {
      readonly value: string;
      readonly key: string;
  }, overrideOptions?: import("effect/SchemaAST").ParseOptions) => {
      readonly value: string;
      readonly key: string;
  };
  export const TagDimensionSchema: Schema.Struct<{
      id: typeof Schema.UUID;
      key: typeof Schema.NonEmptyTrimmedString;
      strictness: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.Literal<["BALANCING", "NON_BALANCING"]>>;
      definedValues: Schema.PropertySignature<":", readonly {
          readonly value: string;
          readonly id: string;
      }[], "defined_values", ":", readonly {
          readonly value: string;
          readonly id: string;
      }[], false, never>;
  }>;
  export type TagDimension = typeof TagDimensionSchema.Type;
  const TagValueSchema: Schema.Data<Schema.Struct<{
      dimensionId: typeof Schema.UUID;
      dimensionLabel: typeof Schema.NonEmptyTrimmedString;
      valueId: typeof Schema.UUID;
      valueLabel: typeof Schema.NonEmptyTrimmedString;
  }>>;
  export const makeTagValue: (i: {
      readonly dimensionId: string;
      readonly dimensionLabel: string;
      readonly valueId: string;
      readonly valueLabel: string;
  }, overrideOptions?: import("effect/SchemaAST").ParseOptions) => {
      readonly dimensionId: string;
      readonly dimensionLabel: string;
      readonly valueId: string;
      readonly valueLabel: string;
  };
  export type TagValue = typeof TagValueSchema.Type;
  export const TagSchema: Schema.Data<Schema.Struct<{
      id: typeof Schema.UUID;
      dimensionLabel: typeof Schema.NonEmptyTrimmedString;
      valueLabel: typeof Schema.NonEmptyTrimmedString;
      _local: Schema.Struct<{
          isOptimistic: typeof Schema.Boolean;
      }>;
  }>>;
  export const makeTag: (i: {
      readonly id: string;
      readonly _local: {
          readonly isOptimistic: boolean;
      };
      readonly dimensionLabel: string;
      readonly valueLabel: string;
  }, overrideOptions?: import("effect/SchemaAST").ParseOptions) => {
      readonly id: string;
      readonly _local: {
          readonly isOptimistic: boolean;
      };
      readonly dimensionLabel: string;
      readonly valueLabel: string;
  };
  export type Tag = typeof TagSchema.Type;
  export const TransactionTagSchema: Schema.Struct<{
      id: typeof Schema.UUID;
      key: typeof Schema.NonEmptyTrimmedString;
      value: typeof Schema.NonEmptyTrimmedString;
      createdAt: Schema.PropertySignature<":", Date, "created_at", ":", string, false, never>;
      updatedAt: Schema.PropertySignature<":", Date, "updated_at", ":", string, false, never>;
      deletedAt: Schema.PropertySignature<"?:", Date | undefined, "deleted_at", "?:", string | undefined, false, never>;
      _local: Schema.optional<Schema.Struct<{
          isOptimistic: typeof Schema.Boolean;
      }>>;
  }>;
  export type TransactionTag = typeof TransactionTagSchema.Type;
  export type TransactionTagEncoded = typeof TransactionTagSchema.Encoded;
  export const makeTagKeyValueFromTag: ({ dimensionLabel, valueLabel }: Tag) => {
      readonly value: string;
      readonly key: string;
  };
  export const makeTagFromTransactionTag: ({ id, key, value, _local }: TransactionTag) => {
      readonly id: string;
      readonly _local: {
          readonly isOptimistic: boolean;
      };
      readonly dimensionLabel: string;
      readonly valueLabel: string;
  };
  export {};

}
declare module '@layerfi/components/features/tags/useFlattenedTagValues' {
  import type { useTagDimensions } from '@layerfi/components/features/tags/api/useTagDimensions';
  export function useFlattenedTagValues(dimensions: ReturnType<typeof useTagDimensions>['data']): {
      readonly dimensionId: string;
      readonly dimensionLabel: string;
      readonly valueId: string;
      readonly valueLabel: string;
  }[];

}
declare module '@layerfi/components/features/vendors/api/useListVendors' {
  import { type SWRInfiniteResponse } from 'swr/infinite';
  import { Schema } from 'effect';
  const ListVendorsRawResultSchema: Schema.Struct<{
      data: Schema.Array$<Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>>;
      meta: Schema.Struct<{
          pagination: Schema.Struct<{
              cursor: Schema.NullOr<typeof Schema.String>;
              hasMore: Schema.PropertySignature<":", boolean, "has_more", ":", boolean, false, never>;
          }>;
      }>;
  }>;
  type ListVendorsRawResult = typeof ListVendorsRawResultSchema.Type;
  export const VENDORS_TAG_KEY = "#vendors";
  class ListVendorsSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRInfiniteResponse<ListVendorsRawResult>);
      get data(): {
          readonly data: readonly {
              readonly id: string;
              readonly externalId: string | null;
              readonly individualName: string | null;
              readonly companyName: string | null;
              readonly email: string | null;
              readonly mobilePhone: string | null;
              readonly officePhone: string | null;
              readonly status: "ACTIVE" | "ARCHIVED";
              readonly memo: string | null;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
          }[];
          readonly meta: {
              readonly pagination: {
                  readonly cursor: string | null;
                  readonly hasMore: boolean;
              };
          };
      }[] | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
  }
  type UseListVendorsParameters = {
      query?: string;
      isEnabled?: boolean;
  };
  export function useListVendors({ query, isEnabled }?: UseListVendorsParameters): ListVendorsSWRResponse;
  export function usePreloadVendors(parameters?: UseListVendorsParameters): void;
  export {};

}
declare module '@layerfi/components/hooks/array/usePaginatedList' {
  export function usePaginatedList<T>(list: ReadonlyArray<T>, pageSize: number): {
      pageCount: number;
      pageIndex: number;
      pageItems: readonly T[];
      pageSize: number;
      next: () => void;
      set: (pageIndex: number) => void;
      previous: () => void;
      reset: () => void;
  };

}
declare module '@layerfi/components/hooks/balanceSheet/useBalanceSheet' {
  export function useBalanceSheet({ effectiveDate, }: {
      effectiveDate?: Date;
  }): import("swr").SWRResponse<import("../../types").BalanceSheet, any, any>;

}
declare module '@layerfi/components/hooks/bookkeeping/periods/tasks/useDeleteUploadsOnTask' {
  type UseDeleteUploadsOnTaskArg = {
      taskId: string;
  };
  export function useDeleteUploadsOnTask(): import("swr/mutation").SWRMutationResponse<{
      data: import("@layerfi/components/types/tasks").RawTask;
  }, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#delete-uploads-on-task"];
  } | undefined, UseDeleteUploadsOnTaskArg>;
  export {};

}
declare module '@layerfi/components/hooks/bookkeeping/periods/tasks/useSubmitResponseForTask' {
  type UseSubmitUserResponseForTaskArg = {
      taskId: string;
      userResponse: string;
  };
  export function useSubmitUserResponseForTask(): import("swr/mutation").SWRMutationResponse<{
      data: import("@layerfi/components/types/tasks").RawTask;
  }, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#submit-user-response-for-task"];
  } | undefined, UseSubmitUserResponseForTaskArg>;
  export {};

}
declare module '@layerfi/components/hooks/bookkeeping/periods/tasks/useUpdateTaskUploadDescription' {
  type UseUpdateTaskUploadDescriptionArg = {
      taskId: string;
      description: string;
  };
  export function useUpdateTaskUploadDescription(): import("swr/mutation").SWRMutationResponse<{
      data: import("@layerfi/components/types/tasks").RawTask;
  }, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#update-task-upload-description"];
  } | undefined, UseUpdateTaskUploadDescriptionArg>;
  export {};

}
declare module '@layerfi/components/hooks/bookkeeping/periods/tasks/useUploadDocumentsForTask' {
  type UseUploadDocumentsForTaskArg = {
      taskId: string;
      files: ReadonlyArray<File>;
      description?: string;
  };
  export function useUploadDocumentsForTask(): import("swr/mutation").SWRMutationResponse<{
      data: import("@layerfi/components/types/file_upload").FileMetadata;
  }, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#use-upload-documents-for-task"];
  } | undefined, UseUploadDocumentsForTaskArg>;
  export {};

}
declare module '@layerfi/components/hooks/bookkeeping/periods/useActiveBookkeepingPeriod' {
  export function useActiveBookkeepingPeriod(): {
      activePeriod: ({
          status: import("@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods").BookkeepingPeriodStatus;
          tasks: (import("@layerfi/components/types/tasks").RawTask & {
              status: "TODO" | "USER_MARKED_COMPLETED";
          })[];
          id: string;
          month: number;
          year: number;
      } & {
          status: import("@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods").BookkeepingPeriodStatus.NOT_STARTED | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.CLOSING_IN_REVIEW | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.CLOSED_OPEN_TASKS | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.CLOSED_COMPLETE;
      }) | undefined;
      isLoading: boolean;
  };

}
declare module '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods' {
  import type { RawTask } from '@layerfi/components/types/tasks';
  import type { EnumWithUnknownValues } from '@layerfi/components/types/utility/enumWithUnknownValues';
  export enum BookkeepingPeriodStatus {
      BOOKKEEPING_NOT_ACTIVE = "BOOKKEEPING_NOT_ACTIVE",
      NOT_STARTED = "NOT_STARTED",
      IN_PROGRESS_AWAITING_BOOKKEEPER = "IN_PROGRESS_AWAITING_BOOKKEEPER",
      IN_PROGRESS_AWAITING_CUSTOMER = "IN_PROGRESS_AWAITING_CUSTOMER",
      CLOSING_IN_REVIEW = "CLOSING_IN_REVIEW",
      CLOSED_OPEN_TASKS = "CLOSED_OPEN_TASKS",
      CLOSED_COMPLETE = "CLOSED_COMPLETE"
  }
  type RawBookkeepingPeriodStatus = EnumWithUnknownValues<BookkeepingPeriodStatus>;
  export type BookkeepingPeriod = Omit<RawBookkeepingPeriod, 'status'> & {
      status: BookkeepingPeriodStatus;
  };
  type RawBookkeepingPeriod = {
      id: string;
      month: number;
      year: number;
      status: RawBookkeepingPeriodStatus;
      tasks: ReadonlyArray<RawTask>;
  };
  export const BOOKKEEPING_PERIODS_TAG_KEY = "#bookkeeping-periods";
  export function useBookkeepingPeriods(): import("swr").SWRResponse<({
      status: BookkeepingPeriodStatus;
      tasks: (RawTask & {
          status: "TODO" | "USER_MARKED_COMPLETED";
      })[];
      id: string;
      month: number;
      year: number;
  } & {
      status: BookkeepingPeriodStatus.NOT_STARTED | BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER | BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER | BookkeepingPeriodStatus.CLOSING_IN_REVIEW | BookkeepingPeriodStatus.CLOSED_OPEN_TASKS | BookkeepingPeriodStatus.CLOSED_COMPLETE;
  })[], any, any>;
  export {};

}
declare module '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingYearsStatus' {
  import { type UserVisibleTask } from '@layerfi/components/utils/bookkeeping/tasks/bookkeepingTasksFilters';
  export const useBookkeepingYearsStatus: () => {
      yearStatuses: {
          year: number;
          tasks: UserVisibleTask[] | undefined;
          unresolvedTasks: number | undefined;
          completed: boolean;
      }[];
      anyPreviousYearIncomplete: {
          year: number;
          tasks: UserVisibleTask[] | undefined;
          unresolvedTasks: number | undefined;
          completed: boolean;
      } | undefined;
      earliestIncompletePeriod: ({
          status: import("@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods").BookkeepingPeriodStatus;
          tasks: (import("@layerfi/components/types/tasks").RawTask & {
              status: "TODO" | "USER_MARKED_COMPLETED";
          })[];
          id: string;
          month: number;
          year: number;
      } & {
          status: import("@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods").BookkeepingPeriodStatus.NOT_STARTED | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.CLOSING_IN_REVIEW | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.CLOSED_OPEN_TASKS | import("./useBookkeepingPeriods").BookkeepingPeriodStatus.CLOSED_COMPLETE;
      }) | undefined;
      isLoading: boolean;
  };

}
declare module '@layerfi/components/hooks/bookkeeping/useBankAccounts' {
  import { BankAccount } from '@layerfi/components/types/linked_accounts';
  export const BANK_ACCOUNTS_TAG_KEY = "#bank-accounts";
  export const requiresNotification: (bankAccount: BankAccount) => boolean;
  export const useBankAccounts: () => {
      bankAccounts: BankAccount[];
      isLoading: boolean;
      error: any;
      disconnectedAccountsRequiringNotification: number;
  };

}
declare module '@layerfi/components/hooks/bookkeeping/useBookkeepingStatus' {
  export enum BookkeepingStatus {
      NOT_PURCHASED = "NOT_PURCHASED",
      ACTIVE = "ACTIVE",
      ONBOARDING = "ONBOARDING",
      BOOKKEEPING_PAUSED = "BOOKKEEPING_PAUSED"
  }
  export const BOOKKEEPING_TAG_KEY = "#bookkeeping";
  export function useBookkeepingStatus(): import("swr").SWRResponse<{
      status: BookkeepingStatus;
  }, any, any>;
  export function useEffectiveBookkeepingStatus(): BookkeepingStatus;

}
declare module '@layerfi/components/hooks/business/useUpdateBusiness' {
  export const BUSINESS_TAG_KEY = "business";
  export function useUpdateBusiness(): import("swr/mutation").SWRMutationResponse<import("../../types").Business, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly [`business:${string}`];
  } | undefined, Partial<import("@layerfi/components/types").Business>>;

}
declare module '@layerfi/components/hooks/businessPersonnel/types' {
  import type { EmailAddress, PhoneNumber } from '@layerfi/components/types/utility/branded';
  import type { EnumWithUnknownValues } from '@layerfi/components/types/utility/enumWithUnknownValues';
  type RawEmailAddressEntity = {
      id: string;
      email_address: EmailAddress;
  };
  type EmailAddressEntity = Pick<RawEmailAddressEntity, 'id'> & {
      emailAddress: EmailAddress;
  };
  type RawPhoneNumberEntity = {
      id: string;
      phone_number: PhoneNumber;
  };
  type PhoneNumberEntity = Pick<RawPhoneNumberEntity, 'id'> & {
      phoneNumber: PhoneNumber;
  };
  const PERSONNEL_ROLES: readonly ["ACCOUNTANT", "ADMINISTRATOR", "OWNER"];
  export type PersonnelRole = typeof PERSONNEL_ROLES[number];
  export function isPersonnelRole(role: string): role is PersonnelRole;
  type RawPersonnelRoleEntity = {
      id: string;
      role: EnumWithUnknownValues<PersonnelRole>;
  };
  type PersonnelRoleEntity = Pick<RawPersonnelRoleEntity, 'id'> & {
      role: PersonnelRole;
  };
  export type RawBusinessPersonnel = {
      id: string;
      full_name: string;
      preferred_name: string | null;
      external_id: string | null;
      email_addresses: ReadonlyArray<RawEmailAddressEntity>;
      phone_numbers: ReadonlyArray<RawPhoneNumberEntity>;
      roles: ReadonlyArray<RawPersonnelRoleEntity>;
  };
  export type BusinessPersonnel = Pick<RawBusinessPersonnel, 'id'> & {
      fullName: RawBusinessPersonnel['full_name'];
      preferredName: RawBusinessPersonnel['preferred_name'];
      externalId: RawBusinessPersonnel['external_id'];
      emailAddresses: ReadonlyArray<EmailAddressEntity>;
      phoneNumbers: ReadonlyArray<PhoneNumberEntity>;
      roles: ReadonlyArray<PersonnelRoleEntity>;
  };
  export {};

}
declare module '@layerfi/components/hooks/businessPersonnel/useBusinessPersonnel' {
  import { type PersonnelRole } from '@layerfi/components/hooks/businessPersonnel/types';
  export const BUSINESS_PERSONNEL_TAG_KEY = "#business-personnel";
  export function useBusinessPersonnel(): import("swr").SWRResponse<{
      id: string;
      fullName: string;
      preferredName: string | null;
      externalId: string | null;
      emailAddresses: readonly {
          id: string;
          emailAddress: import("@layerfi/components/types/utility/branded").EmailAddress;
      }[];
      phoneNumbers: readonly {
          id: string;
          phoneNumber: import("@layerfi/components/types/utility/branded").PhoneNumber;
      }[];
      roles: readonly ({
          id: string;
          role: import("@layerfi/components/types/utility/enumWithUnknownValues").EnumWithUnknownValues<PersonnelRole>;
      } & {
          role: PersonnelRole;
      })[];
  }[], any, any>;

}
declare module '@layerfi/components/hooks/businessPersonnel/useCreateBusinessPersonnel' {
  import type { BusinessPersonnel, PersonnelRole, RawBusinessPersonnel } from '@layerfi/components/hooks/businessPersonnel/types';
  type CreateBusinessPersonnelBody = Pick<RawBusinessPersonnel, 'full_name' | 'preferred_name' | 'external_id'> & {
      email_addresses: ReadonlyArray<{
          email_address: string;
      }>;
      phone_numbers: ReadonlyArray<{
          phone_number: string;
      }>;
      roles: ReadonlyArray<{
          role: PersonnelRole;
      }>;
  };
  export function useCreateBusinessPersonnel(): import("swr/mutation").SWRMutationResponse<BusinessPersonnel, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#business-personnel:create"];
  } | undefined, CreateBusinessPersonnelBody>;
  export {};

}
declare module '@layerfi/components/hooks/businessPersonnel/useUpdateBusinessPersonnel' {
  import { type UpdateBusinessPersonnelBody } from '@layerfi/components/api/layer/businessPersonnel/updateBusinessPersonnel';
  export function useUpdateBusinessPersonnel({ businessPersonnelId }: {
      businessPersonnelId?: string;
  }): import("swr/mutation").SWRMutationResponse<import("./types").BusinessPersonnel, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly businessPersonnelId: string;
      readonly tags: readonly [`#business-personnel:${string}`];
  } | undefined, UpdateBusinessPersonnelBody>;

}
declare module '@layerfi/components/hooks/categories/useCategories' {
  import { Category } from '@layerfi/components/types';
  import type { CategoriesListMode } from '@layerfi/components/types/categories';
  export const CATEGORIES_TAG_KEY = "#categories";
  export const getCategories: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          mode?: CategoriesListMode;
      } | undefined;
  } | undefined) => () => Promise<{
      data: {
          type: "Category_List";
          categories: Category[];
      };
  }>;
  type UseCategoriesOptions = {
      mode?: CategoriesListMode;
  };
  export function useCategories({ mode }?: UseCategoriesOptions): import("swr").SWRResponse<Category[], any, any>;
  export function usePreloadCategories(options?: UseCategoriesOptions): void;
  export {};

}
declare module '@layerfi/components/hooks/customAccounts/types' {
  import { Direction } from '@layerfi/components/types/bank_transactions';
  export enum CustomAccountSubtype {
      CHECKING = "CHECKING",
      SAVINGS = "SAVINGS",
      CREDIT_CARD = "CREDIT_CARD"
  }
  export enum CustomAccountType {
      DEPOSITORY = "DEPOSITORY",
      CREDIT = "CREDIT"
  }
  export type RawCustomAccount = {
      id: string;
      external_id: string | null;
      mask: string | null;
      account_name: string;
      institution_name: string | null;
      account_type: string;
      account_subtype: string;
      created_at: string | null;
      updated_at: string | null;
      archived_at: string | null;
      ledger_account_id: string;
      user_created: boolean;
  };
  export type CustomAccount = Pick<RawCustomAccount, 'id'> & {
      externalId: RawCustomAccount['external_id'];
      mask: RawCustomAccount['mask'];
      accountName: RawCustomAccount['account_name'];
      institutionName: RawCustomAccount['institution_name'];
      accountType: RawCustomAccount['account_type'];
      accountSubtype: RawCustomAccount['account_subtype'];
      createdAt: RawCustomAccount['created_at'];
      updatedAt: RawCustomAccount['updated_at'];
      archivedAt: RawCustomAccount['archived_at'];
      ledgerAccountId: RawCustomAccount['ledger_account_id'];
      userCreated: RawCustomAccount['user_created'];
  };
  export const mapRawCustomAccountToCustomAccount: (raw: RawCustomAccount) => CustomAccount;
  export type RawCustomTransaction = {
      external_id?: string | null;
      amount: number;
      direction: Direction;
      date: string;
      description: string;
      reference_number?: string | null;
  };
  export interface CustomAccountTransactionRow {
      date: string;
      description: string;
      amount: number;
      external_id?: string | null;
      reference_number?: string | null;
  }

}
declare module '@layerfi/components/hooks/customAccounts/useCreateCustomAccount' {
  import { type RawCustomAccount } from '@layerfi/components/hooks/customAccounts/types';
  type CreateCustomAccountBody = Pick<RawCustomAccount, 'account_name' | 'account_type' | 'account_subtype' | 'institution_name' | 'external_id' | 'mask' | 'user_created'>;
  export function useCreateCustomAccount(): import("swr/mutation").SWRMutationResponse<import("./types").CustomAccount, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#custom-accounts:create"];
  } | undefined, CreateCustomAccountBody>;
  export {};

}
declare module '@layerfi/components/hooks/customAccounts/useCreateCustomAccountTransactions' {
  import type { RawCustomTransaction } from '@layerfi/components/hooks/customAccounts/types';
  import { BankTransaction } from '@layerfi/components/types';
  import { APIError } from '@layerfi/components/models/APIError';
  type CreateCustomAccountTransactionsBody = {
      transactions: RawCustomTransaction[];
  };
  type CreateCustomAccountTransactionsArgs = CreateCustomAccountTransactionsBody & {
      customAccountId: string;
  };
  function buildKey({ access_token: accessToken, apiUrl, businessId, }: {
      access_token?: string;
      apiUrl?: string;
      businessId: string;
  }): {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#custom-accounts:create-transactions"];
  } | null;
  export function useCreateCustomAccountTransactions(): import("swr/mutation").SWRMutationResponse<BankTransaction[], APIError, () => ReturnType<typeof buildKey>, CreateCustomAccountTransactionsArgs>;
  export {};

}
declare module '@layerfi/components/hooks/customAccounts/useCustomAccountParseCsv' {
  import type { CustomAccountTransactionRow, RawCustomTransaction } from '@layerfi/components/hooks/customAccounts/types';
  import type { PreviewCsv } from '@layerfi/components/components/CsvUpload/types';
  import { APIError } from '@layerfi/components/models/APIError';
  type CustomAccountParseCsvArgs = {
      file: File;
      customAccountId: string;
  };
  export type CustomAccountParseCsvResponse = {
      is_valid: boolean;
      new_transactions_request: {
          transactions: RawCustomTransaction[];
      };
      new_transactions_preview: PreviewCsv<CustomAccountTransactionRow>;
      invalid_transactions_count: number;
      total_transactions_count: number;
  };
  function buildKey({ access_token: accessToken, apiUrl, businessId, }: {
      access_token?: string;
      apiUrl?: string;
      businessId: string;
  }): {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#custom-accounts:parse-csv"];
  } | undefined;
  export function useCustomAccountParseCsv(): import("swr/mutation").SWRMutationResponse<CustomAccountParseCsvResponse, APIError, () => ReturnType<typeof buildKey>, CustomAccountParseCsvArgs>;
  export {};

}
declare module '@layerfi/components/hooks/customAccounts/useCustomAccounts' {
  export const CUSTOM_ACCOUNTS_TAG_KEY = "#custom-accounts";
  type useCustomAccountsParams = {
      userCreated?: boolean;
  };
  export function useCustomAccounts({ userCreated }?: useCustomAccountsParams): import("swr").SWRResponse<import("./types").CustomAccount[], any, any>;
  export {};

}
declare module '@layerfi/components/hooks/mutation/useMinMutatingMutation' {
  import type { Key } from 'swr';
  import type { SWRMutationResponse } from 'swr/mutation';
  type UseMinLoadingMutationOptions<TData, TError, TMutationKey extends Key, TExtraArg> = {
      swrMutationResponse: SWRMutationResponse<TData, TError, TMutationKey, TExtraArg>;
      minMutatingMs?: number;
  };
  /**
   * Motivation:
   * - Some mutations are so fast that relying on the `isMutating` state can cause flickering.
   *
   * Any SWR mutation response wrapped in this hook will appear to be mutating for a minimum
   * duration.
   */
  export function useMinMutatingMutation<TData, TError, TMutationKey extends Key, TExtraArg>({ swrMutationResponse, minMutatingMs, }: UseMinLoadingMutationOptions<TData, TError, TMutationKey, TExtraArg>): SWRMutationResponse<TData, TError, TMutationKey, TExtraArg>;
  export {};

}
declare module '@layerfi/components/hooks/ref/useStopClickEventsRef' {
  export function useStopClickEventsRefCallback(): (element: HTMLElement | null) => void;

}
declare module '@layerfi/components/hooks/search/useDebouncedSearchQuery' {
  type UseDebouncedSearchQueryOptions = {
      initialInputState: string | (() => string);
  };
  export function useDebouncedSearchInput({ initialInputState, }: UseDebouncedSearchQueryOptions): {
      inputValue: string;
      searchQuery: string;
      handleInputChange: (value: string) => void;
  };
  export {};

}
declare module '@layerfi/components/hooks/useAccountingConfiguration/useAccountingConfiguration' {
  import { AccountingConfigurationSchemaType } from '@layerfi/components/schemas/accountingConfiguration';
  import { type SWRResponse } from 'swr';
  export const ACCOUNTING_CONFIGURATION_TAG_KEY = "#accounting-configuration";
  class AccountingConfigurationSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRResponse<AccountingConfigurationSchemaType>);
      get data(): {
          readonly id: string;
          readonly enableAccountNumbers: boolean;
      } | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
      get mutate(): import("swr").KeyedMutator<{
          readonly id: string;
          readonly enableAccountNumbers: boolean;
      }>;
  }
  type GetAccountingConfigurationParams = {
      businessId: string;
  };
  export function useAccountingConfiguration({ businessId }: GetAccountingConfigurationParams): AccountingConfigurationSWRResponse;
  export {};

}
declare module '@layerfi/components/hooks/useAuth' {
  export function useAuth(): import("swr").SWRResponse<{
      access_token: string;
      token_type: string;
      expires_in: number;
      apiUrl: "https://api.layerfi.com" | "https://sandbox.layerfi.com" | "https://staging.layerfi.com";
  }, any, {
      keepPreviousData: true;
      revalidateIfStale: false;
      revalidateOnFocus: false;
      revalidateOnReconnect: true;
      refreshInterval: (latestData: {
          access_token: string;
          token_type: string;
          expires_in: number;
          apiUrl: "https://api.layerfi.com" | "https://sandbox.layerfi.com" | "https://staging.layerfi.com";
      } | undefined) => number;
  }>;

}
declare module '@layerfi/components/hooks/useBankTransactions/types' {
  import { DateRange, Direction, DisplayState } from '@layerfi/components/types';
  import { TagFilterInput } from '@layerfi/components/types/tags';
  export interface NumericRangeFilter {
      min?: number;
      max?: number;
  }
  export interface AccountItem {
      id: string;
      name: string;
  }
  export type BankTransactionFilters = {
      amount?: NumericRangeFilter;
      account?: string[];
      direction?: Direction[];
      categorizationStatus?: DisplayState;
      dateRange?: DateRange;
      query?: string;
      tagFilter?: TagFilterInput;
  };
  export enum BankTransactionsDateFilterMode {
      MonthlyView = "MonthlyView",
      GlobalDateRange = "GlobalDateRange"
  }
  export type UseAugmentedBankTransactionsParams = {
      scope?: DisplayState;
      monthlyView?: boolean;
      applyGlobalDateRange?: boolean;
  };

}
declare module '@layerfi/components/hooks/useBankTransactions/useAugmentedBankTransactions' {
  import { TagFilterInput } from '@layerfi/components/types/tags';
  import { BankTransaction, CategoryUpdate } from '@layerfi/components/types';
  import { Direction, DisplayState } from '@layerfi/components/types/bank_transactions';
  import { BankTransactionFilters, BankTransactionsDateFilterMode, UseAugmentedBankTransactionsParams } from '@layerfi/components/hooks/useBankTransactions/types';
  import { type UseBankTransactionsOptions } from '@layerfi/components/hooks/useBankTransactions/useBankTransactions';
  export function bankTransactionFiltersToHookOptions(filters?: BankTransactionFilters): UseBankTransactionsOptions;
  export const useAugmentedBankTransactions: (params?: UseAugmentedBankTransactionsParams) => {
      data: BankTransaction[] | undefined;
      metadata: {
          pagination: {
              cursor?: string;
              has_more: boolean;
          };
      } | undefined;
      isLoading: boolean;
      isValidating: boolean;
      refetch: () => void;
      error: any;
      categorize: (bankTransactionId: BankTransaction["id"], newCategory: CategoryUpdate, notify?: boolean) => Promise<void>;
      match: (bankTransactionId: BankTransaction["id"], suggestedMatchId: string, notify?: boolean) => Promise<void>;
      updateOneLocal: (newBankTransaction: BankTransaction) => void;
      shouldHideAfterCategorize: () => boolean;
      removeAfterCategorize: (bankTransaction: BankTransaction) => void;
      filters: {
          dateRange?: import("@layerfi/components/types").DateRange;
          amount?: import("@layerfi/components/hooks/useBankTransactions/types").NumericRangeFilter;
          account?: string[];
          direction?: Direction[];
          categorizationStatus?: DisplayState;
          query?: string;
          tagFilter?: TagFilterInput;
      };
      setFilters: (newFilters: BankTransactionFilters) => void;
      dateFilterMode: BankTransactionsDateFilterMode | undefined;
      accountsList: import("@layerfi/components/hooks/useBankTransactions/types").AccountItem[];
      display: DisplayState;
      fetchMore: () => void;
      hasMore: boolean;
  };

}
declare module '@layerfi/components/hooks/useBankTransactions/useBankTransactions' {
  import { type GetBankTransactionsReturn } from '@layerfi/components/api/layer/bankTransactions';
  import type { BankTransaction } from '@layerfi/components/types';
  export const BANK_TRANSACTIONS_TAG_KEY = "#bank-transactions";
  export type UseBankTransactionsOptions = {
      categorized?: boolean;
      direction?: 'INFLOW' | 'OUTFLOW';
      query?: string;
      startDate?: Date;
      endDate?: Date;
      tagFilterQueryString?: string;
  };
  export function useBankTransactions({ categorized, direction, query, startDate, endDate, tagFilterQueryString, }: UseBankTransactionsOptions): import("swr/infinite").SWRInfiniteResponse<GetBankTransactionsReturn, any>;
  type BankTransactionsInvalidateOptions = {
      withPrecedingOptimisticUpdate?: boolean;
  };
  export function useBankTransactionsInvalidator(): {
      invalidateBankTransactions: (invalidateOptions?: BankTransactionsInvalidateOptions) => Promise<undefined[]>;
      debouncedInvalidateBankTransactions: import("lodash").DebouncedFunc<(invalidateOptions?: BankTransactionsInvalidateOptions) => Promise<undefined[]>>;
  };
  export function useBankTransactionsOptimisticUpdater(): {
      optimisticallyUpdateBankTransactions: (transformTransaction: (txn: BankTransaction) => BankTransaction) => Promise<undefined[]>;
  };
  export {};

}
declare module '@layerfi/components/hooks/useBankTransactions/useBankTransactionsDownload' {
  import type { UseBankTransactionsOptions } from '@layerfi/components/hooks/useBankTransactions/useBankTransactions';
  export function useBankTransactionsDownload(): import("swr/mutation").SWRMutationResponse<import("../../types/general").S3PresignedUrl, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#bank-transactions-download-excel"];
  } | undefined, UseBankTransactionsOptions>;

}
declare module '@layerfi/components/hooks/useBankTransactions/useBankTransactionsMetadata' {
  import { BankTransaction } from '@layerfi/components/types';
  export const GET_BANK_TRANSACTION_METADATA_TAG_KEY = "#bank-transaction-metadata";
  export function useBankTransactionMetadata({ bankTransactionId }: {
      bankTransactionId: BankTransaction['id'];
  }): import("swr").SWRResponse<import("../../types/bank_transactions").BankTransactionMetadata, any, any>;

}
declare module '@layerfi/components/hooks/useBankTransactions/useCategorizeBankTransaction' {
  import { type GetBankTransactionsReturn } from '@layerfi/components/api/layer/bankTransactions';
  import type { CategoryUpdate } from '@layerfi/components/types';
  import type { SWRInfiniteKeyedMutator } from 'swr/infinite';
  type CategorizeBankTransactionArgs = CategoryUpdate & {
      bankTransactionId: string;
  };
  type UseCategorizeBankTransactionOptions = {
      mutateBankTransactions: SWRInfiniteKeyedMutator<Array<GetBankTransactionsReturn>>;
  };
  export function useCategorizeBankTransaction({ mutateBankTransactions, }: UseCategorizeBankTransactionOptions): import("swr/mutation").SWRMutationResponse<import("../../types").BankTransaction, any, () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      tags: string[];
  } | undefined, CategorizeBankTransactionArgs>;
  export {};

}
declare module '@layerfi/components/hooks/useBankTransactions/useMatchBankTransaction' {
  import { type GetBankTransactionsReturn, type MatchBankTransactionBody } from '@layerfi/components/api/layer/bankTransactions';
  import type { SWRInfiniteKeyedMutator } from 'swr/infinite';
  type MatchBankTransactionArgs = MatchBankTransactionBody & {
      bankTransactionId: string;
  };
  type UseMatchBankTransactionOptions = {
      mutateBankTransactions: SWRInfiniteKeyedMutator<Array<GetBankTransactionsReturn>>;
  };
  export function useMatchBankTransaction({ mutateBankTransactions, }: UseMatchBankTransactionOptions): import("swr/mutation").SWRMutationResponse<import("../../types").BankTransactionMatch, any, () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      tags: string[];
  } | undefined, MatchBankTransactionArgs>;
  export {};

}
declare module '@layerfi/components/hooks/useBankTransactions/useUpdateBankTransactionMetadata' {
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  export type UpdateBankTransactionMetadataBody = {
      memo: string;
  };
  export function useUpdateBankTransactionMetadata({ bankTransactionId, onSuccess }: {
      bankTransactionId: string;
      onSuccess?: () => Awaitable<unknown>;
  }): import("swr/mutation").SWRMutationResponse<import("../../types/bank_transactions").BankTransactionMetadata, any, () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      bankTransactionId: string;
      tags: string[];
  } | undefined, UpdateBankTransactionMetadataBody>;

}
declare module '@layerfi/components/hooks/useBankTransactions/utils' {
  import { BankTransaction, DisplayState } from '@layerfi/components/types';
  import { AccountItem, NumericRangeFilter } from '@layerfi/components/hooks/useBankTransactions/types';
  export const collectAccounts: (transactions?: BankTransaction[]) => AccountItem[];
  export const uniqAccountsList: (arr: AccountItem[], track?: Set<unknown>) => AccountItem[];
  export const applyAmountFilter: (data?: BankTransaction[], filter?: NumericRangeFilter) => BankTransaction[] | undefined;
  export const applyAccountFilter: (data?: BankTransaction[], filter?: string[]) => BankTransaction[] | undefined;
  export const applyCategorizationStatusFilter: (data?: BankTransaction[], filter?: DisplayState) => BankTransaction[] | undefined;

}
declare module '@layerfi/components/hooks/useBills' {
  import { Bill } from '@layerfi/components/types/bills';
  import { DateRange, Metadata } from '@layerfi/components/types';
  import { Vendor } from '@layerfi/components/types/vendors';
  export type BillStatusFilter = 'PAID' | 'UNPAID';
  type UseBills = () => {
      data: Bill[];
      paginatedData: Bill[];
      currentPage: number;
      setCurrentPage: (page: number) => void;
      pageSize: number;
      metadata?: Metadata;
      billInDetails?: Bill;
      openBillDetails: (bill?: Bill) => void;
      showBillInDetails: boolean;
      closeBillDetails: () => void;
      status: BillStatusFilter;
      setStatus: (status: BillStatusFilter) => void;
      dateRange: DateRange;
      setDateRange: (dateRange: DateRange) => void;
      vendor: Vendor | null;
      setVendor: (vendor: Vendor | null) => void;
      fetchMore: () => void;
      hasMore: boolean;
      isLoading: boolean;
      isValidating: boolean;
      error?: Error;
      refetch: () => void;
  };
  export const useBills: UseBills;
  export {};

}
declare module '@layerfi/components/hooks/useChartOfAccounts/index' {
  export { useChartOfAccounts } from '@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts';
  export { useCreateChildAccount } from '@layerfi/components/hooks/useChartOfAccounts/useCreateChildAccount';

}
declare module '@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts' {
  import { FormError, DateRange, NewAccount } from '@layerfi/components/types';
  import { BaseSelectOption } from '@layerfi/components/types/general';
  import { NestedLedgerAccountType } from '@layerfi/components/schemas/generalLedger/ledgerAccount';
  export interface ChartOfAccountsForm {
      action: 'new' | 'edit';
      accountId?: string;
      data: {
          parent?: BaseSelectOption;
          stable_name?: string;
          name?: string;
          accountNumber?: string;
          type?: BaseSelectOption;
          subType?: BaseSelectOption;
          normality?: BaseSelectOption;
      };
      errors?: FormError[];
  }
  type Props = {
      startDate?: Date;
      endDate?: Date;
      withDates?: boolean;
  };
  export const flattenAccounts: (accounts: readonly NestedLedgerAccountType[]) => NestedLedgerAccountType[];
  export const useChartOfAccounts: ({ withDates, startDate: initialStartDate, endDate: initialEndDate }?: Props) => {
      data: {
          readonly accounts: readonly {
              readonly name: string;
              readonly stableName: string | null;
              readonly normality: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
              readonly accountType: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
                  readonly displayName: string;
              };
              readonly accountSubtype: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
                  readonly displayName: string;
              };
              readonly accountId: string;
              readonly accountNumber: string | null;
              readonly balance: number;
              readonly isDeletable: boolean | null;
              readonly subAccounts: readonly import("@layerfi/components/schemas/generalLedger/ledgerAccount").NestedLedgerAccount[];
          }[];
      } | undefined;
      isLoading: boolean;
      isValidating: boolean;
      isError: boolean;
      refetch: () => Promise<void>;
      create: (newAccount: NewAccount) => Promise<void>;
      form: ChartOfAccountsForm | undefined;
      sendingForm: boolean;
      apiError: string | undefined;
      addAccount: () => void;
      editAccount: (id: string) => void;
      deleteAccount: (accountId: string) => Promise<void>;
      cancelForm: () => void;
      changeFormData: (fieldName: string, value: string | BaseSelectOption | undefined) => void;
      submitForm: () => void;
      dateRange: {
          startDate: Date;
          endDate: Date;
      };
      changeDateRange: ({ startDate: newStartDate, endDate: newEndDate, }: Partial<DateRange>) => void;
  };
  export {};

}
declare module '@layerfi/components/hooks/useChartOfAccounts/useCreateChildAccount' {
  import { NewChildAccount } from '@layerfi/components/types/chart_of_accounts';
  type NewChildAccountWithParentAccountId = NewChildAccount & {
      accountId: string;
  };
  export function useCreateChildAccount(): import("swr/mutation").SWRMutationResponse<{
      readonly name: string;
      readonly stable_name: string | null;
      readonly normality: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
      readonly account_type: {
          readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
          readonly display_name: string;
      };
      readonly account_subtype: {
          readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
          readonly display_name: string;
      };
      readonly id: string;
      readonly account_number: string | null;
  }, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#create-child-account"];
  } | undefined, NewChildAccountWithParentAccountId>;
  export {};

}
declare module '@layerfi/components/hooks/useDataSync/index' {
  export { useDataSync } from '@layerfi/components/hooks/useDataSync/useDataSync';

}
declare module '@layerfi/components/hooks/useDataSync/useDataSync' {
  import { DataModel } from '@layerfi/components/types/general';
  type UseDataSync = () => {
      touch: (model: DataModel) => void;
      read: (model: DataModel, cacheKey: string) => void;
      syncTimestamps: Partial<Record<DataModel, number>>;
      readTimestamps: Partial<Record<string, {
          t: number;
          m: DataModel;
      }>>;
      hasBeenTouched: (cacheKey: string) => boolean;
      resetCaches: () => void;
  };
  export const useDataSync: UseDataSync;
  export {};

}
declare module '@layerfi/components/hooks/useDebounce/useDebounce' {
  export function useDebounce<F extends (...args: Parameters<F>) => ReturnType<F>>(fn: F): import("lodash").DebouncedFunc<(...args: Parameters<F>) => void>;

}
declare module '@layerfi/components/hooks/useElementSize/index' {
  export { useElementSize } from '@layerfi/components/hooks/useElementSize/useElementSize';

}
declare module '@layerfi/components/hooks/useElementSize/useElementSize' {
  export const useElementSize: <T extends HTMLElement>(callback: (target: T, entry: ResizeObserverEntry, size: {
      width: number;
      height: number;
      clientWidth: number;
      clientHeight: number;
  }) => void) => import("react").RefObject<T>;

}
declare module '@layerfi/components/hooks/useElementViewSize/useElementViewSize' {
  import { View } from '@layerfi/components/types/general';
  export const useElementViewSize: <T extends HTMLElement>() => {
      view: View;
      containerRef: import("react").RefObject<T>;
  };

}
declare module '@layerfi/components/hooks/useIsVisible/index' {
  export { useIsVisible } from '@layerfi/components/hooks/useIsVisible/useIsVisible';

}
declare module '@layerfi/components/hooks/useIsVisible/useIsVisible' {
  /**
   * Attach via ref to the element you want to monitor visibility of the element on the page
   *
   * @example
   *    const scrollPaginationRef = useRef(null)
   *    const isVisible = useIsVisible(scrollPaginationRef)
   *
   *    <div ref={scrollPaginationRef} />
   */
  export const useIsVisible: (ref: React.RefObject<HTMLElement>) => boolean;

}
declare module '@layerfi/components/hooks/useJournal/index' {
  export { useJournal } from '@layerfi/components/hooks/useJournal/useJournal';

}
declare module '@layerfi/components/hooks/useJournal/useJournal' {
  import { Layer } from '@layerfi/components/api/layer';
  import { FormError, FormErrorWithId } from '@layerfi/components/types';
  import { BaseSelectOption } from '@layerfi/components/types/general';
  import { JournalEntry, NewApiJournalEntry, NewFormJournalEntry } from '@layerfi/components/types/journal';
  import { LedgerEntryDirection } from '@layerfi/components/schemas/generalLedger/ledgerAccount';
  import { LedgerAccountBalance } from '@layerfi/components/types/journal';
  type UseJournal = () => {
      data?: ReadonlyArray<JournalEntry>;
      isLoading?: boolean;
      isLoadingEntry?: boolean;
      isValidating?: boolean;
      isValidatingEntry?: boolean;
      error?: unknown;
      errorEntry?: unknown;
      refetch: () => void;
      selectedEntryId?: string;
      setSelectedEntryId: (id?: string) => void;
      closeSelectedEntry: () => void;
      create: (newJournalEntry: NewApiJournalEntry) => void;
      changeFormData: (name: string, value: string | BaseSelectOption | undefined | number, lineItemIndex?: number, accounts?: LedgerAccountBalance[]) => void;
      submitForm: () => void;
      cancelForm: () => void;
      addEntry: () => void;
      sendingForm: boolean;
      form?: JournalFormTypes;
      apiError?: string;
      setForm: (form?: JournalFormTypes) => void;
      addEntryLine: (direction: LedgerEntryDirection) => void;
      removeEntryLine: (index: number) => void;
      reverseEntry: (entryId: string) => ReturnType<typeof Layer.reverseJournalEntry>;
      hasMore: boolean;
      fetchMore: () => void;
  };
  export interface JournalFormTypes {
      action: string;
      data: NewFormJournalEntry;
      errors?: {
          entry: FormError[];
          lineItems: FormErrorWithId[];
      } | undefined;
  }
  export const flattenAccounts: (accounts: LedgerAccountBalance[]) => LedgerAccountBalance[];
  export const useJournal: UseJournal;
  export {};

}
declare module '@layerfi/components/hooks/useLedgerAccounts/index' {
  export { useLedgerAccounts } from '@layerfi/components/hooks/useLedgerAccounts/useLedgerAccounts';

}
declare module '@layerfi/components/hooks/useLedgerAccounts/useLedgerAccounts' {
  import { LedgerAccounts, LedgerAccountsEntry } from '@layerfi/components/types';
  import type { LedgerAccountBalanceWithNodeType } from '@layerfi/components/types/chart_of_accounts';
  type UseLedgerAccounts = (showReversalEntries: boolean) => {
      data?: LedgerAccounts;
      entryData?: LedgerAccountsEntry;
      isLoading?: boolean;
      isLoadingEntry?: boolean;
      isValidating?: boolean;
      isValidatingEntry?: boolean;
      error?: unknown;
      errorEntry?: unknown;
      refetch: () => void;
      selectedAccount: LedgerAccountBalanceWithNodeType | undefined;
      setSelectedAccount: (account: LedgerAccountBalanceWithNodeType | undefined) => void;
      selectedEntryId?: string;
      setSelectedEntryId: (id?: string) => void;
      closeSelectedEntry: () => void;
      hasMore: boolean;
      fetchMore: () => void;
  };
  export const useLedgerAccounts: UseLedgerAccounts;
  export {};

}
declare module '@layerfi/components/hooks/useLedgerBalances/useLedgerBalances' {
  import { LedgerBalancesSchemaType } from '@layerfi/components/schemas/generalLedger/ledgerAccount';
  import { type SWRResponse } from 'swr';
  export const LEDGER_BALANCES_TAG_KEY = "#ledger-balances";
  class LedgerBalancesSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRResponse<LedgerBalancesSchemaType>);
      get data(): {
          readonly accounts: readonly {
              readonly name: string;
              readonly stableName: string | null;
              readonly normality: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
              readonly accountType: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
                  readonly displayName: string;
              };
              readonly accountSubtype: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
                  readonly displayName: string;
              };
              readonly accountId: string;
              readonly accountNumber: string | null;
              readonly balance: number;
              readonly isDeletable: boolean | null;
              readonly subAccounts: readonly import("@layerfi/components/schemas/generalLedger/ledgerAccount").NestedLedgerAccount[];
          }[];
      } | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
      get mutate(): import("swr").KeyedMutator<{
          readonly accounts: readonly {
              readonly name: string;
              readonly stableName: string | null;
              readonly normality: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
              readonly accountType: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
                  readonly displayName: string;
              };
              readonly accountSubtype: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
                  readonly displayName: string;
              };
              readonly accountId: string;
              readonly accountNumber: string | null;
              readonly balance: number;
              readonly isDeletable: boolean | null;
              readonly subAccounts: readonly import("@layerfi/components/schemas/generalLedger/ledgerAccount").NestedLedgerAccount[];
          }[];
      }>;
  }
  export function useLedgerBalances(withDates?: boolean, startDate?: Date, endDate?: Date): LedgerBalancesSWRResponse;
  export function useLedgerBalancesCacheActions(): {
      invalidateLedgerBalances: () => Promise<undefined[]>;
      forceReloadLedgerBalances: () => Promise<undefined[]>;
  };
  export {};

}
declare module '@layerfi/components/hooks/useLinkedAccounts/index' {
  export { useLinkedAccounts } from '@layerfi/components/hooks/useLinkedAccounts/useLinkedAccounts';

}
declare module '@layerfi/components/hooks/useLinkedAccounts/mockData' {
  import { LinkedAccount } from '@layerfi/components/types/linked_accounts';
  export const LINKED_ACCOUNTS_MOCK_DATA: LinkedAccount[];

}
declare module '@layerfi/components/hooks/useLinkedAccounts/useLinkedAccounts' {
  import { LoadedStatus } from '@layerfi/components/types/general';
  import { LinkedAccount, AccountSource } from '@layerfi/components/types/linked_accounts';
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  export function getAccountsNeedingConfirmation(linkedAccounts: ReadonlyArray<LinkedAccount>): LinkedAccount[];
  type UseLinkedAccounts = () => {
      data?: LinkedAccount[];
      isLoading: boolean;
      loadingStatus: LoadedStatus;
      isValidating: boolean;
      error: unknown;
      addConnection: (source: AccountSource) => void;
      removeConnection: (source: AccountSource, sourceId: string) => void;
      repairConnection: (source: AccountSource, sourceId: string) => void;
      updateConnectionStatus: () => void;
      refetchAccounts: () => Awaitable<void>;
      syncAccounts: () => void;
      unlinkAccount: (source: AccountSource, userCreated: boolean, accountId: string) => void;
      confirmAccount: (source: AccountSource, accountId: string) => void;
      excludeAccount: (source: AccountSource, accountId: string) => void;
      accountsToAddOpeningBalanceInModal: LinkedAccount[];
      setAccountsToAddOpeningBalanceInModal: (accounts: LinkedAccount[]) => void;
      breakConnection: (source: AccountSource, connectionExternalId: string) => void;
  };
  export const useLinkedAccounts: UseLinkedAccounts;
  export {};

}
declare module '@layerfi/components/hooks/useLinkedAccounts/useListExternalAccounts' {
  export const EXTERNAL_ACCOUNTS_TAG_KEY = "#external-accounts";
  export function useListExternalAccounts(): import("swr").SWRResponse<import("../../types/linked_accounts").LinkedAccount[], any, any>;

}
declare module '@layerfi/components/hooks/usePaginationRange/usePaginationRange' {
  export enum Dots {
      DotsLeft = "DotsLeft",
      DotsRight = "DotsRight"
  }
  export interface UsePaginationProps {
      totalCount: number;
      pageSize: number;
      siblingCount?: number;
      currentPage: number;
  }
  export type UsePaginationReturn = (Dots | number)[];
  export const usePaginationRange: ({ totalCount, pageSize, siblingCount, currentPage, }: UsePaginationProps) => UsePaginationReturn;

}
declare module '@layerfi/components/hooks/useProfitAndLoss/schemas' {
  import { Schema } from 'effect';
  import { Direction } from '@layerfi/components/types';
  export const TagFilterSchema: Schema.Struct<{
      key: typeof Schema.String;
      values: Schema.Array$<typeof Schema.String>;
  }>;
  export const PnlDetailLineSchema: Schema.Struct<{
      id: typeof Schema.String;
      entryId: Schema.PropertySignature<":", string, "entry_id", ":", string, false, never>;
      account: Schema.Struct<{
          id: typeof Schema.String;
          name: typeof Schema.String;
          stableName: Schema.PropertySignature<":", string, "stable_name", ":", string, false, never>;
          normality: typeof Schema.String;
          accountType: Schema.PropertySignature<":", {
              readonly value: string;
              readonly displayName: string;
          }, "account_type", ":", {
              readonly value: string;
              readonly display_name: string;
          }, false, never>;
          accountSubtype: Schema.PropertySignature<":", {
              readonly value: string;
              readonly displayName: string;
          }, "account_subtype", ":", {
              readonly value: string;
              readonly display_name: string;
          }, false, never>;
      }>;
      amount: typeof Schema.Number;
      direction: Schema.Enums<typeof Direction>;
      date: typeof Schema.String;
      source: Schema.optional<Schema.Union<[Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Transaction_Ledger_Entry_Source"]>;
          transactionId: Schema.PropertySignature<":", string, "transaction_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          accountName: Schema.PropertySignature<"?:", string | undefined, "account_name", "?:", string | undefined, false, never>;
          date: typeof Schema.String;
          amount: typeof Schema.Number;
          direction: Schema.Enums<typeof Direction>;
          counterparty: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          description: Schema.optional<typeof Schema.String>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Invoice_Ledger_Entry_Source"]>;
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
          customerDescription: Schema.PropertySignature<"?:", string | undefined, "customer_description", "?:", string | undefined, false, never>;
          date: typeof Schema.String;
          amount: typeof Schema.Number;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Manual_Ledger_Entry_Source"]>;
          manualEntryId: Schema.PropertySignature<":", string, "manual_entry_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
          createdBy: Schema.PropertySignature<":", string, "created_by", ":", string, false, never>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Invoice_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          amount: typeof Schema.Number;
          invoiceIdentifiers: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }[], "invoice_identifiers", ":", readonly {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }[], false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Refund_Allocation_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          amount: typeof Schema.Number;
          recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
          customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
          customerRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "customer_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Refund_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
          refundedToCustomerAmount: Schema.PropertySignature<":", number, "refunded_to_customer_amount", ":", number, false, never>;
          recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
          customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
          customerRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "customer_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Opening_Balance_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          accountName: Schema.PropertySignature<":", string, "account_name", ":", string, false, never>;
          openingBalanceId: Schema.PropertySignature<":", string, "opening_balance_id", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Payout_Ledger_Entry_Source"]>;
          payoutId: Schema.PropertySignature<":", string, "payout_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
          processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Quickbooks_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          quickbooksId: Schema.PropertySignature<"?:", string | null | undefined, "quickbooks_id", "?:", string | null | undefined, false, never>;
          importDate: Schema.PropertySignature<":", string, "import_date", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Invoice_Write_Off_Ledger_Entry_Source"]>;
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          invoiceNumber: Schema.PropertySignature<"?:", string | null | undefined, "invoice_number", "?:", string | null | undefined, false, never>;
          recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
          customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
          date: Schema.PropertySignature<":", string, "write_off_date", ":", string, false, never>;
          writeOffAmount: Schema.PropertySignature<":", number, "write_off_amount", ":", number, false, never>;
          invoiceIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "invoice_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Refund_Allocation_Ledger_Entry_Source"]>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
          vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
          vendorRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "vendor_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Refund_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
          refundedByVendorAmount: Schema.PropertySignature<":", number, "refunded_by_vendor_amount", ":", number, false, never>;
          vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
          vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
          vendorRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "vendor_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Payout_Ledger_Entry_Source"]>;
          vendorPayoutId: Schema.PropertySignature<":", string, "vendor_payout_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
          processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Payroll_Ledger_Entry_Source"]>;
          payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          payday: typeof Schema.String;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Payroll_Payment_Ledger_Entry_Source"]>;
          payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Bill_Ledger_Entry_Source"]>;
          billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
          vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
          vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
          date: typeof Schema.String;
          amount: typeof Schema.Number;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Bill_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
          billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          billIdentifiers: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }[], "bill_identifiers", ":", readonly {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }[], false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Credit_Ledger_Entry_Source"]>;
          vendorCreditId: Schema.PropertySignature<":", string, "vendor_credit_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          vendor: Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Customer_Credit_Ledger_Entry_Source"]>;
          customerCreditId: Schema.PropertySignature<":", string, "customer_credit_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          customer: Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>]>>;
  }>;
  export const PnlDetailLinesDataSchema: Schema.Struct<{
      type: typeof Schema.String;
      businessId: Schema.PropertySignature<":", string, "business_id", ":", string, false, never>;
      startDate: Schema.PropertySignature<":", string, "start_date", ":", string, false, never>;
      endDate: Schema.PropertySignature<":", string, "end_date", ":", string, false, never>;
      pnlStructureLineItemName: Schema.PropertySignature<":", string, "pnl_structure_line_item_name", ":", string, false, never>;
      reportingBasis: Schema.PropertySignature<"?:", string | null | undefined, "reporting_basis", "?:", string | null | undefined, false, never>;
      pnlStructure: Schema.PropertySignature<"?:", string | null | undefined, "pnl_structure", "?:", string | null | undefined, false, never>;
      tagFilter: Schema.PropertySignature<":", {
          readonly values: readonly string[];
          readonly key: string;
      } | null, "tag_filter", ":", {
          readonly values: readonly string[];
          readonly key: string;
      } | null, false, never>;
      lines: Schema.Array$<Schema.Struct<{
          id: typeof Schema.String;
          entryId: Schema.PropertySignature<":", string, "entry_id", ":", string, false, never>;
          account: Schema.Struct<{
              id: typeof Schema.String;
              name: typeof Schema.String;
              stableName: Schema.PropertySignature<":", string, "stable_name", ":", string, false, never>;
              normality: typeof Schema.String;
              accountType: Schema.PropertySignature<":", {
                  readonly value: string;
                  readonly displayName: string;
              }, "account_type", ":", {
                  readonly value: string;
                  readonly display_name: string;
              }, false, never>;
              accountSubtype: Schema.PropertySignature<":", {
                  readonly value: string;
                  readonly displayName: string;
              }, "account_subtype", ":", {
                  readonly value: string;
                  readonly display_name: string;
              }, false, never>;
          }>;
          amount: typeof Schema.Number;
          direction: Schema.Enums<typeof Direction>;
          date: typeof Schema.String;
          source: Schema.optional<Schema.Union<[Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Transaction_Ledger_Entry_Source"]>;
              transactionId: Schema.PropertySignature<":", string, "transaction_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              accountName: Schema.PropertySignature<"?:", string | undefined, "account_name", "?:", string | undefined, false, never>;
              date: typeof Schema.String;
              amount: typeof Schema.Number;
              direction: Schema.Enums<typeof Direction>;
              counterparty: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              description: Schema.optional<typeof Schema.String>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Invoice_Ledger_Entry_Source"]>;
              invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
              recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
              customerDescription: Schema.PropertySignature<"?:", string | undefined, "customer_description", "?:", string | undefined, false, never>;
              date: typeof Schema.String;
              amount: typeof Schema.Number;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Manual_Ledger_Entry_Source"]>;
              manualEntryId: Schema.PropertySignature<":", string, "manual_entry_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              memo: Schema.NullOr<typeof Schema.String>;
              createdBy: Schema.PropertySignature<":", string, "created_by", ":", string, false, never>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Invoice_Payment_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
              invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
              amount: typeof Schema.Number;
              invoiceIdentifiers: Schema.PropertySignature<":", readonly {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }[], "invoice_identifiers", ":", readonly {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }[], false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Refund_Allocation_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
              amount: typeof Schema.Number;
              recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
              customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
              customerRefundIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "customer_refund_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Refund_Payment_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
              refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
              refundedToCustomerAmount: Schema.PropertySignature<":", number, "refunded_to_customer_amount", ":", number, false, never>;
              recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
              customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
              customerRefundIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "customer_refund_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Opening_Balance_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              accountName: Schema.PropertySignature<":", string, "account_name", ":", string, false, never>;
              openingBalanceId: Schema.PropertySignature<":", string, "opening_balance_id", ":", string, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Payout_Ledger_Entry_Source"]>;
              payoutId: Schema.PropertySignature<":", string, "payout_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
              processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Quickbooks_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              quickbooksId: Schema.PropertySignature<"?:", string | null | undefined, "quickbooks_id", "?:", string | null | undefined, false, never>;
              importDate: Schema.PropertySignature<":", string, "import_date", ":", string, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Invoice_Write_Off_Ledger_Entry_Source"]>;
              invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              invoiceNumber: Schema.PropertySignature<"?:", string | null | undefined, "invoice_number", "?:", string | null | undefined, false, never>;
              recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
              customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
              date: Schema.PropertySignature<":", string, "write_off_date", ":", string, false, never>;
              writeOffAmount: Schema.PropertySignature<":", number, "write_off_amount", ":", number, false, never>;
              invoiceIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "invoice_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Vendor_Refund_Allocation_Ledger_Entry_Source"]>;
              refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
              vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
              vendorRefundIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "vendor_refund_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Vendor_Refund_Payment_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
              refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
              refundedByVendorAmount: Schema.PropertySignature<":", number, "refunded_by_vendor_amount", ":", number, false, never>;
              vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
              vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
              vendorRefundIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "vendor_refund_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Vendor_Payout_Ledger_Entry_Source"]>;
              vendorPayoutId: Schema.PropertySignature<":", string, "vendor_payout_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
              processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Payroll_Ledger_Entry_Source"]>;
              payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              payday: typeof Schema.String;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Payroll_Payment_Ledger_Entry_Source"]>;
              payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Bill_Ledger_Entry_Source"]>;
              billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
              vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
              vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
              date: typeof Schema.String;
              amount: typeof Schema.Number;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Bill_Payment_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
              billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              billIdentifiers: Schema.PropertySignature<":", readonly {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }[], "bill_identifiers", ":", readonly {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }[], false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Vendor_Credit_Ledger_Entry_Source"]>;
              vendorCreditId: Schema.PropertySignature<":", string, "vendor_credit_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              vendor: Schema.Struct<{
                  id: typeof Schema.UUID;
                  externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
                  individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
                  companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
                  email: Schema.NullOr<typeof Schema.String>;
                  mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
                  officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
                  status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
                  memo: Schema.NullOr<typeof Schema.String>;
                  _local: Schema.optional<Schema.Struct<{
                      isOptimistic: typeof Schema.Boolean;
                  }>>;
              }>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Customer_Credit_Ledger_Entry_Source"]>;
              customerCreditId: Schema.PropertySignature<":", string, "customer_credit_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              customer: Schema.Struct<{
                  id: typeof Schema.UUID;
                  externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
                  individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
                  companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
                  email: Schema.NullOr<typeof Schema.String>;
                  mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
                  officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
                  addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
                  status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
                  memo: Schema.NullOr<typeof Schema.String>;
                  _local: Schema.optional<Schema.Struct<{
                      isOptimistic: typeof Schema.Boolean;
                  }>>;
              }>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>]>>;
      }>>;
  }>;
  export const ProfitAndLossSummarySchema: Schema.Struct<{
      year: typeof Schema.Number;
      month: typeof Schema.Number;
      income: typeof Schema.Number;
      costOfGoodsSold: typeof Schema.Number;
      grossProfit: typeof Schema.Number;
      operatingExpenses: typeof Schema.Number;
      profitBeforeTaxes: typeof Schema.Number;
      taxes: typeof Schema.Number;
      netProfit: typeof Schema.Number;
      fullyCategorized: typeof Schema.Boolean;
      totalExpenses: typeof Schema.Number;
      uncategorizedInflows: typeof Schema.Number;
      uncategorizedOutflows: typeof Schema.Number;
      uncategorizedTransactions: Schema.PropertySignature<":", number, "uncategorized_transactions", ":", number, false, never>;
      categorizedTransactions: Schema.PropertySignature<":", number, "categorized_transactions", ":", number, false, never>;
  }>;
  export type ProfitAndLossSummary = typeof ProfitAndLossSummarySchema.Type;
  export const ProfitAndLossSummariesSchema: Schema.Struct<{
      type: Schema.Literal<["Profit_And_Loss_Summaries"]>;
      months: Schema.Array$<Schema.Struct<{
          year: typeof Schema.Number;
          month: typeof Schema.Number;
          income: typeof Schema.Number;
          costOfGoodsSold: typeof Schema.Number;
          grossProfit: typeof Schema.Number;
          operatingExpenses: typeof Schema.Number;
          profitBeforeTaxes: typeof Schema.Number;
          taxes: typeof Schema.Number;
          netProfit: typeof Schema.Number;
          fullyCategorized: typeof Schema.Boolean;
          totalExpenses: typeof Schema.Number;
          uncategorizedInflows: typeof Schema.Number;
          uncategorizedOutflows: typeof Schema.Number;
          uncategorizedTransactions: Schema.PropertySignature<":", number, "uncategorized_transactions", ":", number, false, never>;
          categorizedTransactions: Schema.PropertySignature<":", number, "categorized_transactions", ":", number, false, never>;
      }>>;
  }>;
  export type ProfitAndLossSummaries = typeof ProfitAndLossSummariesSchema.Type;
  export const ProfitAndLossSummariesRequestParamsSchema: Schema.Struct<{
      startYear: typeof Schema.Number;
      startMonth: typeof Schema.Number;
      endYear: typeof Schema.Number;
      endMonth: typeof Schema.Number;
      businessId: typeof Schema.String;
      tagKey: Schema.optional<typeof Schema.String>;
      tagValues: Schema.optional<typeof Schema.String>;
      reportingBasis: Schema.optional<typeof Schema.String>;
  }>;
  export type ProfitAndLossSummariesRequestParams = typeof ProfitAndLossSummariesRequestParamsSchema.Type;
  export const ProfitAndLossReportRequestParamsSchema: Schema.Struct<{
      startDate: typeof Schema.Date;
      endDate: typeof Schema.Date;
      includeUncategorized: Schema.optional<typeof Schema.Boolean>;
      businessId: typeof Schema.String;
      tagKey: Schema.optional<typeof Schema.String>;
      tagValues: Schema.optional<typeof Schema.String>;
      reportingBasis: Schema.optional<typeof Schema.String>;
  }>;
  export type ProfitAndLossReportRequestParams = typeof ProfitAndLossReportRequestParamsSchema.Type;
  export const ProfitAndLossReportSchema: Schema.Struct<{
      businessId: Schema.PropertySignature<":", string, "business_id", ":", string, false, never>;
      startDate: Schema.PropertySignature<":", Date, "start_date", ":", string, false, never>;
      endDate: Schema.PropertySignature<":", Date, "end_date", ":", string, false, never>;
      fullyCategorized: Schema.PropertySignature<":", boolean, "fully_categorized", ":", boolean, false, never>;
      grossProfit: Schema.PropertySignature<":", number, "gross_profit", ":", number, false, never>;
      grossProfitPercentDelta: Schema.PropertySignature<":", import("effect/BigDecimal").BigDecimal | undefined, "gross_profit_percent_delta", ":", string | undefined, false, never>;
      profitBeforeTaxes: Schema.PropertySignature<":", number, "profit_before_taxes", ":", number, false, never>;
      profitBeforeTaxesPercentDelta: Schema.PropertySignature<":", import("effect/BigDecimal").BigDecimal | undefined, "profit_before_taxes_percent_delta", ":", string | undefined, false, never>;
      netProfit: Schema.PropertySignature<":", number, "net_profit", ":", number, false, never>;
      netProfitPercentDelta: Schema.PropertySignature<":", import("effect/BigDecimal").BigDecimal | undefined, "net_profit_percent_delta", ":", string | undefined, false, never>;
      income: Schema.Struct<{
          lineItems: Schema.PropertySignature<":", readonly import("@layerfi/components/utils/schema/utils").LineItem[], "line_items", ":", readonly import("../../utils/schema/utils").LineItemEncoded[], false, never>;
          name: typeof Schema.String;
          displayName: Schema.PropertySignature<":", string, "display_name", ":", string, false, never>;
          value: typeof Schema.Number;
          isContra: Schema.PropertySignature<":", boolean, "is_contra", ":", boolean, false, never>;
          percentDelta: Schema.PropertySignature<"?:", import("effect/BigDecimal").BigDecimal | undefined, "percent_delta", "?:", string | undefined, false, never>;
      }>;
      costOfGoodsSold: Schema.PropertySignature<":", {
          readonly value: number;
          readonly displayName: string;
          readonly name: string;
          readonly isContra: boolean;
          readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
          readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
      }, "cost_of_goods_sold", ":", {
          readonly value: number;
          readonly display_name: string;
          readonly name: string;
          readonly is_contra: boolean;
          readonly line_items: readonly import("@layerfi/components/utils/schema/utils").LineItemEncoded[];
          readonly percent_delta?: string | undefined;
      }, false, never>;
      expenses: Schema.Struct<{
          lineItems: Schema.PropertySignature<":", readonly import("@layerfi/components/utils/schema/utils").LineItem[], "line_items", ":", readonly import("../../utils/schema/utils").LineItemEncoded[], false, never>;
          name: typeof Schema.String;
          displayName: Schema.PropertySignature<":", string, "display_name", ":", string, false, never>;
          value: typeof Schema.Number;
          isContra: Schema.PropertySignature<":", boolean, "is_contra", ":", boolean, false, never>;
          percentDelta: Schema.PropertySignature<"?:", import("effect/BigDecimal").BigDecimal | undefined, "percent_delta", "?:", string | undefined, false, never>;
      }>;
      taxes: Schema.Struct<{
          lineItems: Schema.PropertySignature<":", readonly import("@layerfi/components/utils/schema/utils").LineItem[], "line_items", ":", readonly import("../../utils/schema/utils").LineItemEncoded[], false, never>;
          name: typeof Schema.String;
          displayName: Schema.PropertySignature<":", string, "display_name", ":", string, false, never>;
          value: typeof Schema.Number;
          isContra: Schema.PropertySignature<":", boolean, "is_contra", ":", boolean, false, never>;
          percentDelta: Schema.PropertySignature<"?:", import("effect/BigDecimal").BigDecimal | undefined, "percent_delta", "?:", string | undefined, false, never>;
      }>;
      customLineItems: Schema.PropertySignature<":", {
          readonly value: number;
          readonly displayName: string;
          readonly name: string;
          readonly isContra: boolean;
          readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
          readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
      } | null, "custom_line_items", ":", {
          readonly value: number;
          readonly display_name: string;
          readonly name: string;
          readonly is_contra: boolean;
          readonly line_items: readonly import("@layerfi/components/utils/schema/utils").LineItemEncoded[];
          readonly percent_delta?: string | undefined;
      } | null, false, never>;
      otherOutflows: Schema.PropertySignature<":", {
          readonly value: number;
          readonly displayName: string;
          readonly name: string;
          readonly isContra: boolean;
          readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
          readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
      } | null, "other_outflows", ":", {
          readonly value: number;
          readonly display_name: string;
          readonly name: string;
          readonly is_contra: boolean;
          readonly line_items: readonly import("@layerfi/components/utils/schema/utils").LineItemEncoded[];
          readonly percent_delta?: string | undefined;
      } | null, false, never>;
      uncategorizedOutflows: Schema.PropertySignature<"?:", {
          readonly value: number;
          readonly displayName: string;
          readonly name: string;
          readonly isContra: boolean;
          readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
          readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
      } | undefined, "uncategorized_outflows", "?:", {
          readonly value: number;
          readonly display_name: string;
          readonly name: string;
          readonly is_contra: boolean;
          readonly line_items: readonly import("@layerfi/components/utils/schema/utils").LineItemEncoded[];
          readonly percent_delta?: string | undefined;
      } | undefined, false, never>;
      uncategorizedInflows: Schema.PropertySignature<"?:", {
          readonly value: number;
          readonly displayName: string;
          readonly name: string;
          readonly isContra: boolean;
          readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
          readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
      } | undefined, "uncategorized_inflows", "?:", {
          readonly value: number;
          readonly display_name: string;
          readonly name: string;
          readonly is_contra: boolean;
          readonly line_items: readonly import("@layerfi/components/utils/schema/utils").LineItemEncoded[];
          readonly percent_delta?: string | undefined;
      } | undefined, false, never>;
      personalExpenses: Schema.PropertySignature<":", {
          readonly value: number;
          readonly displayName: string;
          readonly name: string;
          readonly isContra: boolean;
          readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
          readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
      } | null, "personal_expenses", ":", {
          readonly value: number;
          readonly display_name: string;
          readonly name: string;
          readonly is_contra: boolean;
          readonly line_items: readonly import("@layerfi/components/utils/schema/utils").LineItemEncoded[];
          readonly percent_delta?: string | undefined;
      } | null, false, never>;
  }>;
  export type ProfitAndLoss = typeof ProfitAndLossReportSchema.Type;

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss' {
  import { ReportingBasis, SortDirection } from '@layerfi/components/types';
  import { type PnlChartLineItem } from '@layerfi/components/utils/profitAndLossUtils';
  export type Scope = 'expenses' | 'revenue';
  export type SidebarScope = Scope | undefined;
  export type PnlTagFilter = {
      key: string;
      values: string[];
  };
  type UseProfitAndLossOptions = {
      tagFilter?: PnlTagFilter;
      reportingBasis?: ReportingBasis;
  };
  type ProfitAndLossFilter = {
      sortBy?: string;
      sortDirection?: SortDirection;
      types?: string[];
  };
  export type ProfitAndLossFilters = Record<Scope, ProfitAndLossFilter | undefined>;
  export const useProfitAndLoss: ({ tagFilter, reportingBasis, }: UseProfitAndLossOptions) => {
      data: {
          readonly businessId: string;
          readonly startDate: Date;
          readonly endDate: Date;
          readonly income: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly costOfGoodsSold: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly grossProfit: number;
          readonly profitBeforeTaxes: number;
          readonly taxes: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly netProfit: number;
          readonly fullyCategorized: boolean;
          readonly uncategorizedInflows?: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | undefined;
          readonly uncategorizedOutflows?: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | undefined;
          readonly grossProfitPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
          readonly profitBeforeTaxesPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
          readonly netProfitPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
          readonly expenses: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly customLineItems: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | null;
          readonly otherOutflows: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | null;
          readonly personalExpenses: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | null;
      } | undefined;
      filteredDataRevenue: never[] | PnlChartLineItem[];
      filteredTotalRevenue: number | undefined;
      filteredDataExpenses: never[] | PnlChartLineItem[];
      filteredTotalExpenses: number | undefined;
      isLoading: boolean;
      isValidating: boolean;
      isError: boolean;
      refetch: () => void;
      sidebarScope: SidebarScope;
      setSidebarScope: import("react").Dispatch<import("react").SetStateAction<SidebarScope>>;
      sortBy: (scope: Scope, field: string, direction?: SortDirection) => void;
      filters: ProfitAndLossFilters;
      setFilterTypes: (scope: Scope, types: string[]) => void;
      tagFilter: PnlTagFilter | undefined;
      dateRange: {
          startDate: Date;
          endDate: Date;
      };
  };
  export {};

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLossDetailLines' {
  import { type SWRResponse } from 'swr';
  import { ReportingBasis } from '@layerfi/components/types';
  import { PnlDetailLineSchema, PnlDetailLinesDataSchema } from '@layerfi/components/hooks/useProfitAndLoss/schemas';
  export const LIST_PNL_DETAIL_LINES_TAG_KEY = "#list-pnl-detail-lines";
  type PnlStructureLineItemName = string;
  export type PnlDetailLinesBaseParams = {
      businessId: string;
      startDate: Date;
      endDate: Date;
      pnlStructureLineItemName: PnlStructureLineItemName;
  };
  export type PnlDetailLinesFilterParams = {
      tagFilter?: {
          key: string;
          values: string[];
      };
      reportingBasis?: ReportingBasis;
      pnlStructure?: string;
  };
  export type PnlDetailLine = typeof PnlDetailLineSchema.Type;
  export type PnlDetailLinesReturn = typeof PnlDetailLinesDataSchema.Type;
  class PnlDetailLinesSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRResponse<PnlDetailLinesReturn>);
      get data(): PnlDetailLinesReturn | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
      get refetch(): import("swr").KeyedMutator<{
          readonly type: string;
          readonly businessId: string;
          readonly startDate: string;
          readonly endDate: string;
          readonly reportingBasis?: string | null | undefined;
          readonly pnlStructureLineItemName: string;
          readonly pnlStructure?: string | null | undefined;
          readonly tagFilter: {
              readonly values: readonly string[];
              readonly key: string;
          } | null;
          readonly lines: readonly {
              readonly id: string;
              readonly amount: number;
              readonly account: {
                  readonly id: string;
                  readonly name: string;
                  readonly stableName: string;
                  readonly normality: string;
                  readonly accountType: {
                      readonly value: string;
                      readonly displayName: string;
                  };
                  readonly accountSubtype: {
                      readonly value: string;
                      readonly displayName: string;
                  };
              };
              readonly date: string;
              readonly source?: {
                  readonly type: "Transaction_Ledger_Entry_Source";
                  readonly externalId: string | null;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly description?: string | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly date: string;
                  readonly transactionId: string;
                  readonly direction: import("@layerfi/components/types").Direction;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly accountName?: string | undefined;
                  readonly counterparty?: string | null | undefined;
              } | {
                  readonly type: "Invoice_Ledger_Entry_Source";
                  readonly externalId: string | null;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly date: string;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly invoiceId: string;
                  readonly invoiceNumber: string | null;
                  readonly recipientName: string | null;
                  readonly customerDescription?: string | undefined;
              } | {
                  readonly type: "Manual_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo: string | null;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly manualEntryId: string;
                  readonly createdBy: string;
              } | {
                  readonly type: "Invoice_Payment_Ledger_Entry_Source";
                  readonly externalId: string | null;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly invoiceIdentifiers: readonly {
                      readonly id: string;
                      readonly externalId?: string | null | undefined;
                      readonly referenceNumber?: string | null | undefined;
                      readonly metadata?: unknown;
                  }[];
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly invoiceId: string;
                  readonly invoiceNumber: string | null;
              } | {
                  readonly type: "Refund_Allocation_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly customerRefundIdentifiers: {
                      readonly id: string;
                      readonly externalId?: string | null | undefined;
                      readonly referenceNumber?: string | null | undefined;
                      readonly metadata?: unknown;
                  };
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly recipientName?: string | null | undefined;
                  readonly customerDescription: string;
                  readonly refundId: string;
              } | {
                  readonly type: "Refund_Payment_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly customerRefundIdentifiers: {
                      readonly id: string;
                      readonly externalId?: string | null | undefined;
                      readonly referenceNumber?: string | null | undefined;
                      readonly metadata?: unknown;
                  };
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly recipientName?: string | null | undefined;
                  readonly customerDescription: string;
                  readonly refundId: string;
                  readonly refundPaymentId: string;
                  readonly refundedToCustomerAmount: number;
              } | {
                  readonly type: "Opening_Balance_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly accountName: string;
                  readonly openingBalanceId: string;
              } | {
                  readonly type: "Payout_Ledger_Entry_Source";
                  readonly externalId: string | null;
                  readonly memo?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly payoutId: string;
                  readonly paidOutAmount: number;
                  readonly processor?: string | null | undefined;
                  readonly completedAt: string;
              } | {
                  readonly type: "Quickbooks_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly quickbooksId?: string | null | undefined;
                  readonly importDate: string;
              } | {
                  readonly type: "Invoice_Write_Off_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly date: string;
                  readonly invoiceIdentifiers: {
                      readonly id: string;
                      readonly externalId?: string | null | undefined;
                      readonly referenceNumber?: string | null | undefined;
                      readonly metadata?: unknown;
                  };
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly invoiceId: string;
                  readonly invoiceNumber?: string | null | undefined;
                  readonly recipientName?: string | null | undefined;
                  readonly customerDescription: string;
                  readonly writeOffAmount: number;
              } | {
                  readonly type: "Vendor_Refund_Allocation_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly vendorRefundIdentifiers: {
                      readonly id: string;
                      readonly externalId?: string | null | undefined;
                      readonly referenceNumber?: string | null | undefined;
                      readonly metadata?: unknown;
                  };
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly refundId: string;
                  readonly vendorExternalId?: string | null | undefined;
                  readonly vendorDescription: string;
              } | {
                  readonly type: "Vendor_Refund_Payment_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly vendorRefundIdentifiers: {
                      readonly id: string;
                      readonly externalId?: string | null | undefined;
                      readonly referenceNumber?: string | null | undefined;
                      readonly metadata?: unknown;
                  };
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly refundId: string;
                  readonly refundPaymentId: string;
                  readonly vendorExternalId?: string | null | undefined;
                  readonly vendorDescription: string;
                  readonly refundedByVendorAmount: number;
              } | {
                  readonly type: "Vendor_Payout_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly paidOutAmount: number;
                  readonly processor?: string | null | undefined;
                  readonly completedAt: string;
                  readonly vendorPayoutId: string;
              } | {
                  readonly type: "Payroll_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly payrollId: string;
                  readonly payday: string;
              } | {
                  readonly type: "Payroll_Payment_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly payrollId: string;
              } | {
                  readonly type: "Bill_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly date: string;
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly vendorExternalId?: string | null | undefined;
                  readonly vendorDescription: string;
                  readonly billId: string;
                  readonly billNumber?: string | null | undefined;
              } | {
                  readonly type: "Bill_Payment_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly billIdentifiers: readonly {
                      readonly id: string;
                      readonly externalId?: string | null | undefined;
                      readonly referenceNumber?: string | null | undefined;
                      readonly metadata?: unknown;
                  }[];
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly billId: string;
                  readonly billNumber?: string | null | undefined;
              } | {
                  readonly type: "Vendor_Credit_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly vendor: {
                      readonly id: string;
                      readonly externalId: string | null;
                      readonly individualName: string | null;
                      readonly companyName: string | null;
                      readonly email: string | null;
                      readonly mobilePhone: string | null;
                      readonly officePhone: string | null;
                      readonly status: "ACTIVE" | "ARCHIVED";
                      readonly memo: string | null;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                  };
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly vendorCreditId: string;
              } | {
                  readonly type: "Customer_Credit_Ledger_Entry_Source";
                  readonly externalId?: string | null | undefined;
                  readonly memo?: string | null | undefined;
                  readonly amount: number;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
                  readonly customer: {
                      readonly id: string;
                      readonly externalId: string | null;
                      readonly individualName: string | null;
                      readonly companyName: string | null;
                      readonly email: string | null;
                      readonly mobilePhone: string | null;
                      readonly officePhone: string | null;
                      readonly addressString: string | null;
                      readonly status: "ACTIVE" | "ARCHIVED";
                      readonly memo: string | null;
                      readonly _local?: {
                          readonly isOptimistic: boolean;
                      } | undefined;
                  };
                  readonly displayDescription: string;
                  readonly entityName: string;
                  readonly customerCreditId: string;
              } | undefined;
              readonly direction: import("@layerfi/components/types").Direction;
              readonly entryId: string;
          }[];
      }>;
  }
  export function useProfitAndLossDetailLines({ startDate, endDate, pnlStructureLineItemName, tagFilter, reportingBasis, pnlStructure, }: PnlDetailLinesBaseParams & PnlDetailLinesFilterParams): PnlDetailLinesSWRResponse;
  export function usePnlDetailLinesInvalidator(): {
      invalidatePnlDetailLines: () => Promise<undefined[]>;
      debouncedInvalidatePnlDetailLines: import("lodash").DebouncedFunc<() => Promise<undefined[]>>;
  };
  export type GetProfitAndLossDetailLinesParams = {
      businessId: string;
      startDate: Date;
      endDate: Date;
      pnlStructureLineItemName: string;
      tagKey?: string;
      tagValues?: string;
      reportingBasis?: string;
      pnlStructure?: string;
  };
  export const getProfitAndLossDetailLines: (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossDetailLinesParams) => () => Promise<{
      data?: PnlDetailLinesReturn;
      params: GetProfitAndLossDetailLinesParams;
  }>;
  export {};

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLossDetailLinesExport' {
  import type { S3PresignedUrl } from '@layerfi/components/types/general';
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  import { PnlDetailLinesBaseParams, PnlDetailLinesFilterParams } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLossDetailLines';
  type UseProfitAndLossDetailLinesExportOptions = PnlDetailLinesBaseParams & PnlDetailLinesFilterParams & {
      onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>;
  };
  export function useProfitAndLossDetailLinesExport({ startDate, endDate, pnlStructureLineItemName, tagFilter, reportingBasis, pnlStructure, onSuccess, }: UseProfitAndLossDetailLinesExportOptions): import("swr/mutation").SWRMutationResponse<unknown, any, () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      startDate: Date;
      endDate: Date;
      pnlStructureLineItemName: string;
      tagFilter: {
          key: string;
          values: string[];
      } | undefined;
      reportingBasis: import("@layerfi/components/types").ReportingBasis | undefined;
      pnlStructure: string | undefined;
      tags: string[];
  } | undefined, never>;
  export {};

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLossGlobalInvalidator' {
  export const useProfitAndLossGlobalInvalidator: () => {
      invalidateProfitAndLoss: () => Promise<void>;
      debouncedInvalidateProfitAndLoss: import("lodash").DebouncedFunc<() => Promise<undefined[]>>;
  };

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLossLTM' {
  import { ReportingBasis } from '@layerfi/components/types';
  import type { ProfitAndLossSummary } from '@layerfi/components/hooks/useProfitAndLoss/schemas';
  type UseProfitAndLossLTMProps = {
      currentDate: Date;
      tagFilter?: {
          key: string;
          values: string[];
      };
      reportingBasis?: ReportingBasis;
  };
  export interface ProfitAndLossSummaryData extends ProfitAndLossSummary {
      isLoading?: boolean;
  }
  type UseProfitAndLossLTMReturn = (props?: UseProfitAndLossLTMProps) => {
      data: ProfitAndLossSummaryData[];
      isLoading: boolean;
      isError: boolean;
      setDate: (date: Date) => void;
      refetch: () => void;
  };
  /**
   * Hooks fetch Last Twelve Months sending 12 requests (one for each month).
   * Implementation is not perfect, but we cannot use loops and arrays with hooks.
   */
  export const useProfitAndLossLTM: UseProfitAndLossLTMReturn;
  export {};

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLossReport' {
  import { type SWRResponse } from 'swr';
  import { ProfitAndLoss, ProfitAndLossReportRequestParams } from '@layerfi/components/hooks/useProfitAndLoss/schemas';
  export const PNL_REPORT_TAG_KEY = "#profit-and-loss-report";
  class ProfitAndLossReportSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRResponse<ProfitAndLoss>);
      get data(): {
          readonly businessId: string;
          readonly startDate: Date;
          readonly endDate: Date;
          readonly income: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly costOfGoodsSold: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly grossProfit: number;
          readonly profitBeforeTaxes: number;
          readonly taxes: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly netProfit: number;
          readonly fullyCategorized: boolean;
          readonly uncategorizedInflows?: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | undefined;
          readonly uncategorizedOutflows?: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | undefined;
          readonly grossProfitPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
          readonly profitBeforeTaxesPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
          readonly netProfitPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
          readonly expenses: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly customLineItems: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | null;
          readonly otherOutflows: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | null;
          readonly personalExpenses: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | null;
      } | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
      get mutate(): import("swr").KeyedMutator<{
          readonly businessId: string;
          readonly startDate: Date;
          readonly endDate: Date;
          readonly income: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly costOfGoodsSold: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly grossProfit: number;
          readonly profitBeforeTaxes: number;
          readonly taxes: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly netProfit: number;
          readonly fullyCategorized: boolean;
          readonly uncategorizedInflows?: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | undefined;
          readonly uncategorizedOutflows?: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | undefined;
          readonly grossProfitPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
          readonly profitBeforeTaxesPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
          readonly netProfitPercentDelta: import("effect/BigDecimal").BigDecimal | undefined;
          readonly expenses: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          };
          readonly customLineItems: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | null;
          readonly otherOutflows: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | null;
          readonly personalExpenses: {
              readonly value: number;
              readonly displayName: string;
              readonly name: string;
              readonly isContra: boolean;
              readonly percentDelta?: import("effect/BigDecimal").BigDecimal | undefined;
              readonly lineItems: readonly import("@layerfi/components/utils/schema/utils").LineItem[];
          } | null;
      }>;
  }
  type UseProfitAndLossReportProps = Omit<ProfitAndLossReportRequestParams, 'businessId'>;
  export function useProfitAndLossReport({ startDate, endDate, tagKey, tagValues, reportingBasis, includeUncategorized }: UseProfitAndLossReportProps): ProfitAndLossReportSWRResponse;
  export const useProfitAndLossReportCacheActions: () => {
      invalidateProfitAndLossReport: () => Promise<undefined[]>;
      debouncedInvalidateProfitAndLossReport: import("lodash").DebouncedFunc<() => Promise<undefined[]>>;
  };
  export {};

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLossSummaries' {
  import { type SWRResponse } from 'swr';
  import { type ProfitAndLossSummaries, ProfitAndLossSummariesRequestParams } from '@layerfi/components/hooks/useProfitAndLoss/schemas';
  export const PNL_SUMMARIES_TAG_KEY = "#profit-and-loss-summaries";
  class ProfitAndLossSummariesSWRResponse {
      private swrResponse;
      constructor(swrResponse: SWRResponse<ProfitAndLossSummaries>);
      get data(): {
          readonly type: "Profit_And_Loss_Summaries";
          readonly months: readonly {
              readonly month: number;
              readonly year: number;
              readonly income: number;
              readonly costOfGoodsSold: number;
              readonly grossProfit: number;
              readonly operatingExpenses: number;
              readonly profitBeforeTaxes: number;
              readonly taxes: number;
              readonly netProfit: number;
              readonly fullyCategorized: boolean;
              readonly totalExpenses: number;
              readonly uncategorizedInflows: number;
              readonly uncategorizedOutflows: number;
              readonly uncategorizedTransactions: number;
              readonly categorizedTransactions: number;
          }[];
      } | undefined;
      get isLoading(): boolean;
      get isValidating(): boolean;
      get isError(): boolean;
      get mutate(): import("swr").KeyedMutator<{
          readonly type: "Profit_And_Loss_Summaries";
          readonly months: readonly {
              readonly month: number;
              readonly year: number;
              readonly income: number;
              readonly costOfGoodsSold: number;
              readonly grossProfit: number;
              readonly operatingExpenses: number;
              readonly profitBeforeTaxes: number;
              readonly taxes: number;
              readonly netProfit: number;
              readonly fullyCategorized: boolean;
              readonly totalExpenses: number;
              readonly uncategorizedInflows: number;
              readonly uncategorizedOutflows: number;
              readonly uncategorizedTransactions: number;
              readonly categorizedTransactions: number;
          }[];
      }>;
  }
  type UseProfitAndLossSummariesProps = Omit<ProfitAndLossSummariesRequestParams, 'businessId'>;
  export function useProfitAndLossSummaries({ startYear, startMonth, endYear, endMonth, tagKey, tagValues, reportingBasis }: UseProfitAndLossSummariesProps): ProfitAndLossSummariesSWRResponse;
  export const useProfitAndLossSummariesCacheActions: () => {
      invalidateProfitAndLossSummaries: () => Promise<undefined[]>;
      debouncedInvalidateProfitAndLossSummaries: import("lodash").DebouncedFunc<() => Promise<undefined[]>>;
  };
  export {};

}
declare module '@layerfi/components/hooks/useProfitAndLossComparison/index' {
  export { useProfitAndLossComparison } from '@layerfi/components/hooks/useProfitAndLossComparison/useProfitAndLossComparison';

}
declare module '@layerfi/components/hooks/useProfitAndLossComparison/useProfitAndLossComparison' {
  import { DateRange, MoneyFormat, ReportingBasis } from '@layerfi/components/types';
  import { MultiValue } from 'react-select';
  import { ProfitAndLossCompareConfig, TagComparisonOption } from '@layerfi/components/types/profit_and_loss';
  export type Scope = 'expenses' | 'revenue';
  export type SidebarScope = Scope | undefined;
  type Props = {
      reportingBasis?: ReportingBasis;
      comparisonConfig?: ProfitAndLossCompareConfig;
  };
  export function useProfitAndLossComparison({ reportingBasis, comparisonConfig, }: Props): {
      data: import("@layerfi/components/types/profit_and_loss").ProfitAndLossComparisonItem[] | undefined;
      isLoading: boolean;
      isValidating: boolean;
      isPeriodsSelectEnabled: boolean;
      compareModeActive: boolean;
      comparePeriods: number;
      setComparePeriods: import("react").Dispatch<import("react").SetStateAction<number>>;
      compareOptions: TagComparisonOption[];
      selectedCompareOptions: TagComparisonOption[];
      setSelectedCompareOptions: (values: MultiValue<{
          value: string;
          label: string;
      }>) => void;
      getProfitAndLossComparisonCsv: (dateRange: DateRange, moneyFormat?: MoneyFormat) => Promise<{
          data?: import("@layerfi/components/types/general").S3PresignedUrl;
          error?: unknown;
      }>;
      comparisonConfig: ProfitAndLossCompareConfig | undefined;
  };
  export {};

}
declare module '@layerfi/components/hooks/useProfitAndLossComparison/utils' {
  import { DateRange } from '@layerfi/components/types';
  import { DateRangePickerMode } from '@layerfi/components/providers/GlobalDateStore/GlobalDateStoreProvider';
  import { ProfitAndLossComparisonTags, TagComparisonOption } from '@layerfi/components/types/profit_and_loss';
  import { ReadonlyArrayWithAtLeastOne } from '@layerfi/components/utils/array/getArrayWithAtLeastOneOrFallback';
  export function prepareFiltersBody(compareOptions: TagComparisonOption[]): ReadonlyArrayWithAtLeastOne<ProfitAndLossComparisonTags> | undefined;
  export function preparePeriodsBody(dateRange: DateRange, comparePeriods: number, rangeDisplayMode: DateRangePickerMode): {
      type: "Comparison_Months";
      months: {
          year: number;
          month: number;
      }[] & ReadonlyArrayWithAtLeastOne<{
          year: number;
          month: number;
      }>;
  } | {
      type: "Comparison_Years";
      years: {
          year: number;
      }[] & ReadonlyArrayWithAtLeastOne<{
          year: number;
      }>;
  } | {
      readonly type: "Comparison_Date_Ranges";
      readonly date_ranges: readonly [{
          readonly start_date: string;
          readonly end_date: string;
      }];
  } | undefined;

}
declare module '@layerfi/components/hooks/useProjects' {
  type TagKey = string;
  type TagOptionValue = string;
  type TagCategoryOption = {
      label: string;
      value: TagOptionValue;
  };
  export function useTags(): {
      readonly hasActiveTag: false;
      readonly tagLabel: undefined;
      readonly tagKey: undefined;
      readonly activeValue: undefined;
      readonly valueOptions: undefined;
      readonly setActiveValue: ({ key, activeValue }: {
          key: TagKey;
          activeValue?: TagOptionValue;
      }) => void;
  } | {
      readonly hasActiveTag: true;
      readonly tagLabel: string;
      readonly tagKey: string;
      readonly activeValue: TagCategoryOption | undefined;
      readonly valueOptions: TagCategoryOption[];
      readonly setActiveValue: ({ key, activeValue }: {
          key: TagKey;
          activeValue?: TagOptionValue;
      }) => void;
  };
  export {};

}
declare module '@layerfi/components/hooks/useQuickbooks/index' {
  export { useQuickbooks } from '@layerfi/components/hooks/useQuickbooks/useQuickbooks';

}
declare module '@layerfi/components/hooks/useQuickbooks/useQuickbooks' {
  import { type StatusOfQuickbooksConnection } from '@layerfi/components/types/quickbooks';
  type UseQuickbooks = () => {
      linkQuickbooks: () => Promise<string>;
      unlinkQuickbooks: () => Promise<void>;
      syncFromQuickbooks: () => void;
      quickbooksConnectionStatus: StatusOfQuickbooksConnection | undefined;
  };
  export const useQuickbooks: UseQuickbooks;
  export {};

}
declare module '@layerfi/components/hooks/useReceipts/useReceipts' {
  import { DocumentWithStatus } from '@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts';
  import { BankTransaction } from '@layerfi/components/types';
  import { Awaitable } from '@layerfi/components/types/utility/promises';
  export interface UseReceiptsProps {
      bankTransaction: BankTransaction;
      isActive?: boolean;
  }
  type UseReceipts = (props: UseReceiptsProps) => {
      receiptUrls: DocumentWithStatus[];
      uploadReceipt: (file: File) => Awaitable<void>;
      archiveDocument: (document: DocumentWithStatus) => Awaitable<void>;
  };
  export const useReceipts: UseReceipts;
  export {};

}
declare module '@layerfi/components/hooks/useStatementOfCashFlow/useStatementOfCashFlow' {
  export function useStatementOfCashFlow({ startDate, endDate, }: {
      startDate?: Date;
      endDate?: Date;
  }): import("swr").SWRResponse<import("../../types").StatementOfCashFlow, any, any>;

}
declare module '@layerfi/components/hooks/useTableExpandRow/index' {
  export { useTableExpandRow } from '@layerfi/components/hooks/useTableExpandRow/useTableExpandRow';

}
declare module '@layerfi/components/hooks/useTableExpandRow/useTableExpandRow' {
  export const useTableExpandRow: () => {
      isOpen: (rowKey: string) => boolean;
      setIsOpen: (rowKey: string | string[], withoutAllRowsUpdate?: boolean) => void;
      expandedAllRows: boolean;
      toggleAllRows: () => void;
  };

}
declare module '@layerfi/components/hooks/useVendors' {
  import { Vendor } from '@layerfi/components/types/vendors';
  type UseVendors = () => {
      data: Vendor[];
  };
  export const useVendors: UseVendors;
  export {};

}
declare module '@layerfi/components/hooks/useWindowSize/index' {
  export { useWindowSize, useSizeClass } from '@layerfi/components/hooks/useWindowSize/useWindowSize';

}
declare module '@layerfi/components/hooks/useWindowSize/useWindowSize' {
  export const useWindowSize: () => number[];
  export type SizeClass = 'mobile' | 'tablet' | 'desktop';
  interface UseSizeClass {
      value: SizeClass;
      isMobile: boolean;
      isTablet: boolean;
      isDesktop: boolean;
  }
  export function useSizeClass(): UseSizeClass;
  export {};

}
declare module '@layerfi/components/hooks/visibility/useDelayedVisibility' {
  export function useDelayedVisibility({ delay, initialVisibility, }: {
      delay: number;
      initialVisibility?: boolean;
  }): {
      isVisible: boolean;
  };

}
declare module '@layerfi/components/icons/AlertCircle' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const AlertCircle: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default AlertCircle;

}
declare module '@layerfi/components/icons/AlertOctagon' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const AlertOctagon: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default AlertOctagon;

}
declare module '@layerfi/components/icons/ArrowRightCircle' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ArrowRightCircle: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default ArrowRightCircle;

}
declare module '@layerfi/components/icons/BackArrow' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const BackArrow: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default BackArrow;

}
declare module '@layerfi/components/icons/BarChart2' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const BarChart2: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default BarChart2;

}
declare module '@layerfi/components/icons/Bell' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Bell: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Bell;

}
declare module '@layerfi/components/icons/Calendar' {
  import { SVGProps } from 'react';
  const Calendar: (props: SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
  export default Calendar;

}
declare module '@layerfi/components/icons/Check' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Check: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Check;

}
declare module '@layerfi/components/icons/CheckCircle' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const CheckCircle: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default CheckCircle;

}
declare module '@layerfi/components/icons/CheckedCircle' {
  import { SVGProps } from 'react';
  type Props = SVGProps<SVGSVGElement> & {
      size: SVGProps<SVGSVGElement>['width'];
      fillColor: string;
      strokeColor: string;
  };
  const CheckedCircle: ({ fillColor, strokeColor, size, ...props }: Props) => import("react/jsx-runtime").JSX.Element;
  export default CheckedCircle;

}
declare module '@layerfi/components/icons/ChevronDown' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ChevronDown: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default ChevronDown;

}
declare module '@layerfi/components/icons/ChevronDownFill' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ChevronDownFill: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default ChevronDownFill;

}
declare module '@layerfi/components/icons/ChevronLeft' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ChevronLeft: ({ ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default ChevronLeft;

}
declare module '@layerfi/components/icons/ChevronRight' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ChevronRight: ({ ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default ChevronRight;

}
declare module '@layerfi/components/icons/ChevronRightFill' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ChevronRightFill: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default ChevronRightFill;

}
declare module '@layerfi/components/icons/ChevronUp' {
  import { SVGProps } from 'react';
  const ChevronUp: (props: SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
  export default ChevronUp;

}
declare module '@layerfi/components/icons/Clock' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Clock: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Clock;

}
declare module '@layerfi/components/icons/CloseIcon' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const CloseIcon: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default CloseIcon;

}
declare module '@layerfi/components/icons/Coffee' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const CoffeeIcon: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default CoffeeIcon;

}
declare module '@layerfi/components/icons/Cog' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Cog: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Cog;

}
declare module '@layerfi/components/icons/Collapse' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Collapse: ({ ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Collapse;

}
declare module '@layerfi/components/icons/CreditCard' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const CreditCard: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default CreditCard;

}
declare module '@layerfi/components/icons/Dataflow' {
  import { SVGProps } from 'react';
  const SvgComponent: (props: SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
  export default SvgComponent;

}
declare module '@layerfi/components/icons/Document' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Document: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Document;

}
declare module '@layerfi/components/icons/DownloadCloud' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const DownloadCloud: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default DownloadCloud;

}
declare module '@layerfi/components/icons/Edit2' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Edit2: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Edit2;

}
declare module '@layerfi/components/icons/Expand' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Expand: ({ ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Expand;

}
declare module '@layerfi/components/icons/Eye' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Eye: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Eye;

}
declare module '@layerfi/components/icons/File' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const File: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default File;

}
declare module '@layerfi/components/icons/Folder' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Folder: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Folder;

}
declare module '@layerfi/components/icons/FolderPlus' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const FolderPlus: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default FolderPlus;

}
declare module '@layerfi/components/icons/Inbox' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Inbox: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Inbox;

}
declare module '@layerfi/components/icons/InfoIcon' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const InfoIcon: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default InfoIcon;

}
declare module '@layerfi/components/icons/InstitutionIcon' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const InstitutionIcon: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default InstitutionIcon;

}
declare module '@layerfi/components/icons/Link' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Link: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Link;

}
declare module '@layerfi/components/icons/Link2' {
  import { SVGProps } from 'react';
  type Props = SVGProps<SVGSVGElement> & {
      size: SVGProps<SVGSVGElement>['width'];
  };
  const Link2: ({ size, ...props }: Props) => import("react/jsx-runtime").JSX.Element;
  export default Link2;

}
declare module '@layerfi/components/icons/LinkBroken' {
  import { SVGProps } from 'react';
  type Props = SVGProps<SVGSVGElement> & {
      size: SVGProps<SVGSVGElement>['width'];
  };
  const LinkBroken: ({ size, ...props }: Props) => import("react/jsx-runtime").JSX.Element;
  export default LinkBroken;

}
declare module '@layerfi/components/icons/Loader' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Loader: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Loader;

}
declare module '@layerfi/components/icons/MinimizeTwo' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const MinimizeTwo: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default MinimizeTwo;

}
declare module '@layerfi/components/icons/MoreVertical' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const MoreVertical: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default MoreVertical;

}
declare module '@layerfi/components/icons/Paperclip' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Paperclip: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Paperclip;

}
declare module '@layerfi/components/icons/PieChart' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const PieChart: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default PieChart;

}
declare module '@layerfi/components/icons/PlaidIcon' {
  const PlaidIcon: () => import("react/jsx-runtime").JSX.Element;
  export default PlaidIcon;

}
declare module '@layerfi/components/icons/Plus' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Plus: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Plus;

}
declare module '@layerfi/components/icons/PlusIcon' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const PlusIcon: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default PlusIcon;

}
declare module '@layerfi/components/icons/ProgressIcon' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ProgressIcon: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default ProgressIcon;

}
declare module '@layerfi/components/icons/QuickbooksIcon' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const QuickbooksIcon: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default QuickbooksIcon;

}
declare module '@layerfi/components/icons/RefreshCcw' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const RefreshCcw: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default RefreshCcw;

}
declare module '@layerfi/components/icons/Save' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Save: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Save;

}
declare module '@layerfi/components/icons/Scissors' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Scissors: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Scissors;

}
declare module '@layerfi/components/icons/ScissorsFullOpen' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ScissorsFullOpen: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default ScissorsFullOpen;

}
declare module '@layerfi/components/icons/ScissorsOpen' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ScissorsOpen: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default ScissorsOpen;

}
declare module '@layerfi/components/icons/SmileIcon' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const SmileIcon: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default SmileIcon;

}
declare module '@layerfi/components/icons/SortArrows' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const SortArrows: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default SortArrows;

}
declare module '@layerfi/components/icons/Sunrise' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Sunrise: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Sunrise;

}
declare module '@layerfi/components/icons/Trash' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Trash: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default Trash;

}
declare module '@layerfi/components/icons/TrendingUp' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const TrendingUp: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default TrendingUp;

}
declare module '@layerfi/components/icons/UploadCloud' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const UploadCloud: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default UploadCloud;

}
declare module '@layerfi/components/icons/WarningCircle' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const WarningCircle: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default WarningCircle;

}
declare module '@layerfi/components/icons/X' {
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const X: ({ size, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
  export default X;

}
declare module '@layerfi/components/icons/types' {
  import { SVGProps } from 'react';
  export type IconSvgProps = SVGProps<SVGSVGElement> & {
      size?: SVGProps<SVGSVGElement>['width'];
  };

}
declare module '@layerfi/components/index' {
  export { LayerProvider } from '@layerfi/components/providers/LayerProvider/index';
  export { Onboarding } from '@layerfi/components/components/Onboarding/index';
  export { LinkedAccounts } from '@layerfi/components/components/LinkedAccounts/index';
  export { BankTransactions } from '@layerfi/components/components/BankTransactions/BankTransactions';
  export { Integrations } from '@layerfi/components/components/Integrations/Integrations';
  export { ProfitAndLoss } from '@layerfi/components/components/ProfitAndLoss/index';
  export { StandaloneBalanceSheet as BalanceSheet } from '@layerfi/components/components/BalanceSheet/index';
  export { StandaloneStatementOfCashFlow as StatementOfCashFlow } from '@layerfi/components/components/StatementOfCashFlow/index';
  export { ChartOfAccounts } from '@layerfi/components/components/ChartOfAccounts/index';
  export { Journal } from '@layerfi/components/components/Journal/index';
  export { Tasks } from '@layerfi/components/components/Tasks/Tasks';
  export { ServiceOffering } from '@layerfi/components/components/ServiceOffering/index';
  export { ServiceOfferingAccounting, ServiceOfferingBookkeeping } from '@layerfi/components/components/ServiceOffering/offers';
  export { LinkAccounts } from '@layerfi/components/components/PlatformOnboarding/LinkAccounts';
  export { PlatformOnboarding } from '@layerfi/components/components/PlatformOnboarding/PlatformOnboarding';
  export { BookkeepingUpsellBar } from '@layerfi/components/components/UpsellBanner/index';
  export { BookkeepingOverview } from '@layerfi/components/views/BookkeepingOverview/index';
  export { AccountingOverview } from '@layerfi/components/views/AccountingOverview/index';
  export { BankTransactionsWithLinkedAccounts } from '@layerfi/components/views/BankTransactionsWithLinkedAccounts/index';
  export { GeneralLedgerView } from '@layerfi/components/views/GeneralLedger/index';
  export { ProjectProfitabilityView } from '@layerfi/components/views/ProjectProfitability/index';
  export { unstable_BillsView } from '@layerfi/components/views/Bills';
  export { Reports } from '@layerfi/components/views/Reports/index';
  export { ProfitAndLossView } from '@layerfi/components/components/ProfitAndLossView/index';
  export { Invoices } from '@layerfi/components/components/Invoices/Invoices';
  export { useLayerContext } from '@layerfi/components/contexts/LayerContext/index';
  export { useBankTransactionsContext } from '@layerfi/components/contexts/BankTransactionsContext/index';
  export { BankTransactionsProvider } from '@layerfi/components/providers/BankTransactionsProvider/index';
  export { useDataSync } from '@layerfi/components/hooks/useDataSync/index';
  export { DisplayState, Direction } from '@layerfi/components/types/bank_transactions';
  export { LinkingMetadata, EntityName } from '@layerfi/components/contexts/InAppLinkContext';

}
declare module '@layerfi/components/models/APIError' {
  export type APIErrorMessage = {
      type?: string;
      description?: string;
  };
  export class APIError extends Error {
      code?: number;
      info?: string;
      messages?: APIErrorMessage[];
      constructor(message: string, code?: number, messages?: APIErrorMessage[]);
      getMessage(): string;
      getAllMessages(): (string | undefined)[] | undefined;
  }

}
declare module '@layerfi/components/models/ErrorHandler' {
  import { APIError } from '@layerfi/components/models/APIError';
  type LayerErrorType = 'unauthenticated' | 'api' | 'render';
  type LayerErrorScope = 'BankTransaction' | 'ChartOfAccounts';
  export interface LayerError {
      type?: LayerErrorType;
      scope?: LayerErrorScope;
      payload: Error | APIError;
  }
  class ErrorHandlerClass {
      onErrorCallback?: (err: LayerError) => void | undefined;
      constructor();
      setOnError(errorFnc: ((err: LayerError) => void) | undefined): void;
      onError(err: LayerError): void;
  }
  export const errorHandler: ErrorHandlerClass;
  export const reportError: (payload: LayerError) => void;
  export {};

}
declare module '@layerfi/components/models/Money' {
  export const centsToDollars: (cents?: number) => string;
  export function centsToDollarsWithoutCommas(cents?: number): string;
  export const dollarsToCents: (dollars?: string) => number;
  const _default: {
      centsToDollars: (cents?: number) => string;
      dollarsToCents: (dollars?: string) => number;
  };
  export default _default;

}
declare module '@layerfi/components/providers/AccountConfirmationStoreProvider' {
  import { type PropsWithChildren } from 'react';
  type AccountConfirmationVisibility = 'PRELOADED' | 'DEFAULT' | 'DISMISSED';
  type AccountConfirmationStoreShape = {
      visibility: AccountConfirmationVisibility;
      actions: {
          dismiss: () => void;
          preload: () => void;
          reset: () => void;
      };
  };
  export function useAccountConfirmationStore(): AccountConfirmationStoreShape;
  export function useAccountConfirmationStoreActions(): {
      dismiss: () => void;
      preload: () => void;
      reset: () => void;
  };
  type AccountConfirmationStoreProviderProps = PropsWithChildren<{
      initialVisibility?: AccountConfirmationVisibility;
  }>;
  export function AccountConfirmationStoreProvider({ children, initialVisibility, }: AccountConfirmationStoreProviderProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/AuthInputProvider' {
  import { type PropsWithChildren } from 'react';
  type AuthInputShape = {
      appId?: string;
      appSecret?: string;
      businessAccessToken?: string;
  };
  export function useAuthInput(): AuthInputShape;
  export function AuthInputProvider({ appId, appSecret, businessAccessToken, children, }: PropsWithChildren<AuthInputShape>): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/BankTransactionsProvider/BankTransactionsProvider' {
  import { ReactNode } from 'react';
  interface BankTransactionsProviderProps {
      children: ReactNode;
  }
  export const BankTransactionsProvider: ({ children, }: BankTransactionsProviderProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/BankTransactionsProvider/index' {
  export { BankTransactionsProvider } from '@layerfi/components/providers/BankTransactionsProvider/BankTransactionsProvider';

}
declare module '@layerfi/components/providers/BusinessProvider/BusinessProvider' {
  import { PropsWithChildren } from 'react';
  import { LayerProviderProps } from '@layerfi/components/providers/LayerProvider/LayerProvider';
  type BusinessProviderProps = PropsWithChildren<Pick<LayerProviderProps, 'businessId' | 'theme' | 'onError' | 'eventCallbacks'>>;
  export const BusinessProvider: ({ businessId, children, theme, onError, eventCallbacks, }: PropsWithChildren<BusinessProviderProps>) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/Environment/EnvironmentInputProvider' {
  import { type PropsWithChildren } from 'react';
  import { type Environment } from '@layerfi/components/providers/Environment/environmentConfigs';
  type EnvironmentInputShape = {
      environment?: Environment;
      usePlaidSandbox?: boolean;
  };
  export function useEnvironment(): {
      environment: Environment;
      apiUrl: "https://api.layerfi.com" | "https://sandbox.layerfi.com" | "https://staging.layerfi.com";
      authUrl: "https://auth.layerfi.com/oauth2/token";
      scope: "https://api.layerfi.com/production" | "https://sandbox.layerfi.com/sandbox";
      usePlaidSandbox: boolean;
  };
  export function EnvironmentInputProvider({ children, environment, usePlaidSandbox, }: PropsWithChildren<EnvironmentInputShape>): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/Environment/environmentConfigs' {
  export type Environment = 'production' | 'sandbox' | 'staging' | 'internalStaging';
  export const EnvironmentConfigs: {
      readonly production: {
          readonly apiUrl: "https://api.layerfi.com";
          readonly authUrl: "https://auth.layerfi.com/oauth2/token";
          readonly scope: "https://api.layerfi.com/production";
          readonly usePlaidSandbox: false;
      };
      readonly sandbox: {
          readonly apiUrl: "https://sandbox.layerfi.com";
          readonly authUrl: "https://auth.layerfi.com/oauth2/token";
          readonly scope: "https://sandbox.layerfi.com/sandbox";
          readonly usePlaidSandbox: true;
      };
      readonly staging: {
          readonly apiUrl: "https://staging.layerfi.com";
          readonly authUrl: "https://auth.layerfi.com/oauth2/token";
          readonly scope: "https://sandbox.layerfi.com/sandbox";
          readonly usePlaidSandbox: true;
      };
      readonly internalStaging: {
          readonly apiUrl: "https://staging.layerfi.com";
          readonly authUrl: "https://auth.layerfi.com/oauth2/token";
          readonly scope: "https://sandbox.layerfi.com/sandbox";
          readonly usePlaidSandbox: true;
      };
  };

}
declare module '@layerfi/components/providers/GlobalDateStore/GlobalDateStoreProvider' {
  import { type PropsWithChildren } from 'react';
  import type { UnifiedPickerMode } from '@layerfi/components/components/DatePicker/ModeSelector/DatePickerModeSelector';
  const _DATE_PICKER_MODES: readonly ["dayPicker"];
  export type DatePickerMode = typeof _DATE_PICKER_MODES[number];
  const _RANGE_PICKER_MODES: readonly ["dayRangePicker", "monthPicker", "monthRangePicker", "yearPicker"];
  export type DateRangePickerMode = typeof _RANGE_PICKER_MODES[number];
  export const isDateRangePickerMode: (mode: string) => mode is DateRangePickerMode;
  export function useGlobalDate(): {
      date: Date;
  };
  export function useGlobalDateActions(): {
      setDate: (options: {
          date: Date;
      }) => void;
  };
  export function useGlobalDateRange({ displayMode }: {
      displayMode: DateRangePickerMode;
  }): {
      start: Date;
      end: Date;
  };
  export function useGlobalDateRangeActions(): {
      setRangeWithExplicitDisplayMode: (options: {
          start: Date;
          end: Date;
          displayMode: UnifiedPickerMode;
      }) => void;
      setDateRange: (options: {
          start: Date;
          end: Date;
      }) => void;
      setMonth: (options: {
          start: Date;
      }) => void;
      setMonthRange: (options: {
          start: Date;
          end: Date;
      }) => void;
      setYear: (options: {
          start: Date;
      }) => void;
  };
  export function useGlobalDatePeriodAlignedActions(): {
      setMonthByPeriod: (options: {
          monthNumber: number;
          yearNumber: number;
      }) => void;
  };
  type GlobalDateStoreProviderProps = PropsWithChildren;
  export function GlobalDateStoreProvider({ children, }: GlobalDateStoreProviderProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/GlobalDateStore/useGlobalDateRangePicker' {
  import { DateRangePickerMode } from '@layerfi/components/providers/GlobalDateStore/GlobalDateStoreProvider';
  import { type UnifiedPickerMode } from '@layerfi/components/components/DatePicker/ModeSelector/DatePickerModeSelector';
  import { type ReadonlyArrayWithAtLeastOne } from '@layerfi/components/utils/array/getArrayWithAtLeastOneOrFallback';
  export const getAllowedDateRangePickerModes: ({ allowedDatePickerModes, defaultDatePickerMode, }: {
      allowedDatePickerModes?: ReadonlyArray<DateRangePickerMode>;
      defaultDatePickerMode?: DateRangePickerMode;
  }) => ReadonlyArrayWithAtLeastOne<DateRangePickerMode>;
  export const getInitialDateRangePickerMode: ({ allowedDatePickerModes, defaultDatePickerMode, }: {
      allowedDatePickerModes?: ReadonlyArray<DateRangePickerMode>;
      defaultDatePickerMode?: DateRangePickerMode;
  }) => DateRangePickerMode;
  export type UseGlobalDateRangePickerProps = {
      displayMode: DateRangePickerMode;
      setDisplayMode: (displayMode: DateRangePickerMode) => void;
  };
  export function useGlobalDateRangePicker({ displayMode, setDisplayMode }: UseGlobalDateRangePickerProps): {
      rangeDisplayMode: "dayRangePicker" | "monthPicker" | "monthRangePicker" | "yearPicker";
      onChangeMode: (newMode: UnifiedPickerMode) => void;
      dateOrDateRange: Date | [Date, Date];
      onChangeDateOrDateRange: (dates: Date | [Date, Date | null]) => void;
  };

}
declare module '@layerfi/components/providers/InvoiceStore/InvoiceStoreProvider' {
  import { type PropsWithChildren } from 'react';
  import type { Invoice } from '@layerfi/components/features/invoices/invoiceSchemas';
  import { type InvoiceStatusOption } from '@layerfi/components/components/Invoices/InvoiceTable/InvoiceTable';
  import type { InvoiceFormMode } from '@layerfi/components/components/Invoices/InvoiceForm/InvoiceForm';
  export type InvoiceTableFilters = {
      status: InvoiceStatusOption;
      query: string;
  };
  export enum InvoiceRoute {
      Table = "Table",
      Detail = "Detail"
  }
  type InvoiceDetailRouteState = {
      route: InvoiceRoute.Detail;
  } & InvoiceFormMode;
  type InvoiceTableRouteState = {
      route: InvoiceRoute.Table;
  };
  type InvoiceRouteState = InvoiceDetailRouteState | InvoiceTableRouteState;
  export function useInvoiceRouteState(): InvoiceRouteState;
  export function useInvoiceDetail(): InvoiceFormMode;
  export function useInvoiceTableFilters(): {
      tableFilters: InvoiceTableFilters;
      setTableFilters: (patchFilters: Partial<InvoiceTableFilters>) => void;
  };
  export function useInvoiceNavigation(): {
      toCreateInvoice: () => void;
      toInvoiceTable: () => void;
      toViewInvoice: (invoice: Invoice) => void;
  };
  export function InvoiceStoreProvider(props: PropsWithChildren): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/LayerProvider/LayerProvider' {
  import { PropsWithChildren } from 'react';
  import { LayerError } from '@layerfi/components/models/ErrorHandler';
  import { LayerThemeConfig } from '@layerfi/components/types/layer_context';
  import type { Environment } from '@layerfi/components/providers/Environment/environmentConfigs';
  export type EventCallbacks = {
      onTransactionCategorized?: (bankTransactionId: string) => void;
      onTransactionsFetched?: () => void;
  };
  export type LayerProviderProps = {
      businessId: string;
      appId?: string;
      appSecret?: string;
      businessAccessToken?: string;
      environment?: Environment;
      theme?: LayerThemeConfig;
      usePlaidSandbox?: boolean;
      onError?: (error: LayerError) => void;
      eventCallbacks?: EventCallbacks;
  };
  export const LayerProvider: ({ appId, appSecret, businessAccessToken, environment, usePlaidSandbox, ...restProps }: PropsWithChildren<LayerProviderProps>) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/providers/LayerProvider/index' {
  export { LayerProvider } from '@layerfi/components/providers/LayerProvider/LayerProvider';

}
declare module '@layerfi/components/providers/LegacyModeProvider/LegacyModeProvider' {
  import { type PropsWithChildren } from 'react';
  export type BankTransactionsMode = 'bookkeeping-client' | 'self-serve';
  type LegacyModeShape = {
      overrideMode?: BankTransactionsMode;
  };
  export function useLegacyMode(): LegacyModeShape;
  export function LegacyModeProvider({ overrideMode, children, }: PropsWithChildren<LegacyModeShape>): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/LinkedAccountsProvider/LinkedAccountsProvider' {
  import { type PropsWithChildren } from 'react';
  export function LinkedAccountsProvider({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/providers/LinkedAccountsProvider/index' {
  export { LinkedAccountsProvider } from '@layerfi/components/providers/LinkedAccountsProvider/LinkedAccountsProvider';

}
declare module '@layerfi/components/providers/QuickbooksContextProvider/QuickbooksContextProvider' {
  import { type PropsWithChildren } from 'react';
  export function QuickbooksContextProvider({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/providers/ReceiptsProvider/ReceiptsProvider' {
  import { ReactNode } from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  interface ReceiptsProviderProps {
      children: ReactNode;
      bankTransaction: BankTransaction;
      isActive?: boolean;
  }
  export const ReceiptsProvider: ({ children, bankTransaction, isActive, }: ReceiptsProviderProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/ReceiptsProvider/index' {
  export { ReceiptsProvider } from '@layerfi/components/providers/ReceiptsProvider/ReceiptsProvider';

}
declare module '@layerfi/components/providers/ReportsModeStoreProvider/ReportsModeStoreProvider' {
  import { type PropsWithChildren } from 'react';
  import type { DatePickerMode, DateRangePickerMode } from '@layerfi/components/providers/GlobalDateStore/GlobalDateStoreProvider';
  export enum ReportKey {
      ProfitAndLoss = "ProfitAndLoss",
      BalanceSheet = "BalanceSheet",
      StatementOfCashFlows = "StatementOfCashFlows"
  }
  export type ReportModes = {
      [ReportKey.ProfitAndLoss]: DateRangePickerMode;
      [ReportKey.BalanceSheet]: DatePickerMode;
      [ReportKey.StatementOfCashFlows]: DateRangePickerMode;
  };
  type MutableReportKey = Exclude<ReportKey, ReportKey.BalanceSheet>;
  type ReportsModeStoreShape = {
      resetPnLModeToDefaultOnMount: boolean;
      modeByReport: ReportModes;
      actions: {
          setModeForReport: <K extends MutableReportKey>(report: K, mode: ReportModes[K]) => void;
      };
  };
  export function useReportModeStore(): ReportsModeStoreShape;
  export function useReportMode<K extends ReportKey>(report: K): ReportModes[K] | undefined;
  export function useReportModeActions(): {
      setModeForReport: <K extends MutableReportKey>(report: K, mode: ReportModes[K]) => void;
  };
  export function useReportModeWithFallback<K extends ReportKey>(report: K, fallback: ReportModes[K]): ReportModes[K];
  type ReportsModeStoreProviderProps = PropsWithChildren<{
      initialModes: Partial<ReportModes>;
      resetPnLModeToDefaultOnMount?: boolean;
  }>;
  export function ReportsModeStoreProvider({ children, initialModes, resetPnLModeToDefaultOnMount, }: ReportsModeStoreProviderProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/public/styles/publicClassname' {
  export const PUBLIC_CLASSNAME = "Layer__Public";

}
declare module '@layerfi/components/schemas/accountIdentifier' {
  import { Schema } from 'effect';
  export const AccountIdentifierSchema: Schema.Union<[Schema.Struct<{
      type: Schema.Literal<["StableName"]>;
      stableName: Schema.PropertySignature<":", string, "stable_name", ":", string, false, never>;
  }>, Schema.Struct<{
      type: Schema.Literal<["AccountId"]>;
      id: typeof Schema.String;
  }>]>;
  export type AccountIdentifier = typeof AccountIdentifierSchema.Type;
  export type AccountIdentifierEncoded = typeof AccountIdentifierSchema.Encoded;
  export const makeStableName: (stableName: string) => {
      readonly type: "StableName";
      readonly stableName: string;
  };
  export const makeAccountId: (id: string) => {
      readonly id: string;
      readonly type: "AccountId";
  };
  export const AccountIdentifierEquivalence: import("effect/Equivalence").Equivalence<{
      readonly type: "StableName";
      readonly stableName: string;
  } | {
      readonly id: string;
      readonly type: "AccountId";
  }>;

}
declare module '@layerfi/components/schemas/accountingConfiguration' {
  import { Schema } from 'effect';
  export enum ReportingBasis {
      Accrual = "ACCRUAL",
      Cash = "CASH",
      DeprecatedCash = "DEPRECATED_CASH",
      MoneyMovementOnly = "MONEY_MOVEMENT_ONLY"
  }
  export const ReportingBasisSchema: Schema.Enums<typeof ReportingBasis>;
  export enum AccountingConfigurationCategoryListMode {
      AllAccounts = "ALL_ACCOUNTS",
      RevenuesAndExpenses = "REVENUES_AND_EXPENSES"
  }
  export const CategoryListModeSchema: Schema.Enums<typeof AccountingConfigurationCategoryListMode>;
  export const AccountingConfigurationSchema: Schema.Struct<{
      id: typeof Schema.UUID;
      enableAccountNumbers: Schema.PropertySignature<":", boolean, "enable_account_numbers", ":", boolean, false, never>;
  }>;
  export type AccountingConfigurationSchemaType = typeof AccountingConfigurationSchema.Type;

}
declare module '@layerfi/components/schemas/customer' {
  import { Schema } from 'effect';
  export const CustomerSchema: Schema.Struct<{
      id: typeof Schema.UUID;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
      companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
      email: Schema.NullOr<typeof Schema.String>;
      mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
      officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
      addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
      status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
      memo: Schema.NullOr<typeof Schema.String>;
      _local: Schema.optional<Schema.Struct<{
          isOptimistic: typeof Schema.Boolean;
      }>>;
  }>;
  export type Customer = typeof CustomerSchema.Type;
  export const encodeCustomer: (a: {
      readonly id: string;
      readonly externalId: string | null;
      readonly individualName: string | null;
      readonly companyName: string | null;
      readonly email: string | null;
      readonly mobilePhone: string | null;
      readonly officePhone: string | null;
      readonly addressString: string | null;
      readonly status: "ACTIVE" | "ARCHIVED";
      readonly memo: string | null;
      readonly _local?: {
          readonly isOptimistic: boolean;
      } | undefined;
  }, overrideOptions?: import("effect/SchemaAST").ParseOptions) => {
      readonly id: string;
      readonly external_id: string | null;
      readonly individual_name: string | null;
      readonly company_name: string | null;
      readonly email: string | null;
      readonly mobile_phone: string | null;
      readonly office_phone: string | null;
      readonly address_string: string | null;
      readonly status: string;
      readonly memo: string | null;
      readonly _local?: {
          readonly isOptimistic: boolean;
      } | undefined;
  };

}
declare module '@layerfi/components/schemas/generalLedger/ledgerAccount' {
  import { Schema } from 'effect';
  export const AccountTypeSchema: Schema.Struct<{
      value: typeof Schema.String;
      displayName: Schema.PropertySignature<":", string, "display_name", ":", string, false, never>;
  }>;
  export const AccountSubtypeSchema: Schema.Struct<{
      value: typeof Schema.String;
      displayName: Schema.PropertySignature<":", string, "display_name", ":", string, false, never>;
  }>;
  export const AccountSchema: Schema.Struct<{
      id: typeof Schema.String;
      name: typeof Schema.String;
      stableName: Schema.PropertySignature<":", string, "stable_name", ":", string, false, never>;
      normality: typeof Schema.String;
      accountType: Schema.PropertySignature<":", {
          readonly value: string;
          readonly displayName: string;
      }, "account_type", ":", {
          readonly value: string;
          readonly display_name: string;
      }, false, never>;
      accountSubtype: Schema.PropertySignature<":", {
          readonly value: string;
          readonly displayName: string;
      }, "account_subtype", ":", {
          readonly value: string;
          readonly display_name: string;
      }, false, never>;
  }>;
  export enum LedgerEntryDirection {
      Credit = "CREDIT",
      Debit = "DEBIT"
  }
  export const LedgerEntryDirectionSchema: Schema.Enums<typeof LedgerEntryDirection>;
  export enum LedgerAccountType {
      Asset = "ASSET",
      Liability = "LIABILITY",
      Equity = "EQUITY",
      Revenue = "REVENUE",
      Expense = "EXPENSE"
  }
  export const LedgerAccountTypeSchema: Schema.Enums<typeof LedgerAccountType>;
  export enum LedgerAccountSubtype {
      BankAccounts = "BANK_ACCOUNTS",
      AccountsReceivable = "ACCOUNTS_RECEIVABLE",
      Inventory = "INVENTORY",
      PaymentProcessorClearingAccount = "PAYMENT_PROCESSOR_CLEARING_ACCOUNT",
      FixedAsset = "FIXED_ASSET",
      AccumulatedDepreciation = "ACCUMULATED_DEPRECIATION",
      Cash = "CASH",
      UndepositedFunds = "UNDEPOSITED_FUNDS",
      CurrentAsset = "CURRENT_ASSET",
      NonCurrentAsset = "NON_CURRENT_ASSET",
      PrepaidExpenses = "PREPAID_EXPENSES",
      DevelopmentCosts = "DEVELOPMENT_COSTS",
      LoansReceivable = "LOANS_RECEIVABLE",
      RefundsReceivable = "REFUNDS_RECEIVABLE",
      IntangibleAsset = "INTANGIBLE_ASSET",
      Liability = "LIABILITY",// @Deprecated
      AccountsPayable = "ACCOUNTS_PAYABLE",
      CreditCard = "CREDIT_CARD",
      TaxesPayable = "TAXES_PAYABLE",// @Deprecated
      IncomeTaxesPayable = "INCOME_TAXES_PAYABLE",
      SalesTaxesPayable = "SALES_TAXES_PAYABLE",
      OtherTaxesPayable = "OTHER_TAXES_PAYABLE",
      PayrollTaxesPayable = "PAYROLL_TAXES_PAYABLE",
      TaxLiability = "TAX_LIABILITY",// @Deprecated
      UnearnedRevenue = "UNEARNED_REVENUE",
      PayrollLiability = "PAYROLL_LIABILITY",
      PayrollClearing = "PAYROLL_CLEARING",
      LineOfCredit = "LINE_OF_CREDIT",
      Tips = "TIPS",
      RefundLiabilities = "REFUND_LIABILITIES",
      UndepositedOutflows = "UNDEPOSITED_OUTFLOWS",
      OutgoingPaymentClearingAccount = "OUTGOING_PAYMENT_CLEARING_ACCOUNT",
      CurrentLiability = "CURRENT_LIABILITY",// @Deprecated
      OtherCurrentLiability = "OTHER_CURRENT_LIABILITY",
      LoansPayable = "LOANS_PAYABLE",
      NotesPayable = "NOTES_PAYABLE",
      ShareholderLoan = "SHAREHOLDER_LOAN",
      NonCurrentLiability = "NON_CURRENT_LIABILITY",
      Contributions = "CONTRIBUTIONS",
      Distributions = "DISTRIBUTIONS",
      CommonStock = "COMMON_STOCK",
      PreferredStock = "PREFERRED_STOCK",
      AdditionalPaidInCapital = "ADDITIONAL_PAID_IN_CAPITAL",
      RetainedEarnings = "RETAINED_EARNINGS",
      AccumulatedAdjustments = "ACCUMULATED_ADJUSTMENTS",
      OpeningBalanceEquity = "OPENING_BALANCE_EQUITY",
      OtherEquity = "OTHER_EQUITY",
      Equity = "EQUITY",// @Deprecated
      Revenue = "REVENUE",
      Sales = "SALES",
      UncategorizedRevenue = "UNCATEGORIZED_REVENUE",
      ReturnsAllowances = "RETURNS_ALLOWANCES",
      DividendIncome = "DIVIDEND_INCOME",
      InterestIncome = "INTEREST_INCOME",
      OtherIncome = "OTHER_INCOME",
      Expense = "EXPENSE",// @Deprecated
      Cogs = "COGS",
      OperatingExpenses = "OPERATING_EXPENSES",
      Payroll = "PAYROLL",
      TaxesLicenses = "TAXES_LICENSES",
      UncategorizedExpense = "UNCATEGORIZED_EXPENSE",
      CharitableContributions = "CHARITABLE_CONTRIBUTIONS",
      LoanExpenses = "LOAN_EXPENSES",
      FinanceCosts = "FINANCE_COSTS",
      InterestExpenses = "INTEREST_EXPENSES",
      Depreciation = "DEPRECIATION",
      Amortization = "AMORTIZATION",
      BadDebt = "BAD_DEBT",
      OtherExpenses = "OTHER_EXPENSES"
  }
  export const LedgerAccountSubtypeSchema: Schema.Enums<typeof LedgerAccountSubtype>;
  export const LedgerAccountTypeWithDisplayNameSchema: Schema.Struct<{
      value: Schema.Enums<typeof LedgerAccountType>;
      displayName: Schema.PropertySignature<":", string, "display_name", ":", string, false, never>;
  }>;
  export const LedgerAccountSubtypeWithDisplayNameSchema: Schema.Struct<{
      value: Schema.Enums<typeof LedgerAccountSubtype>;
      displayName: Schema.PropertySignature<":", string, "display_name", ":", string, false, never>;
  }>;
  export const LedgerAccountSchema: Schema.Struct<{
      id: typeof Schema.String;
      name: typeof Schema.String;
      stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
      normality: Schema.Enums<typeof LedgerEntryDirection>;
      accountType: Schema.PropertySignature<":", {
          readonly value: LedgerAccountType;
          readonly displayName: string;
      }, "account_type", ":", {
          readonly value: LedgerAccountType;
          readonly display_name: string;
      }, false, never>;
      accountSubtype: Schema.PropertySignature<":", {
          readonly value: LedgerAccountSubtype;
          readonly displayName: string;
      }, "account_subtype", ":", {
          readonly value: LedgerAccountSubtype;
          readonly display_name: string;
      }, false, never>;
  }>;
  export type LedgerAccount = typeof LedgerAccountSchema.Type;
  const nestedLedgerAccountFields: {
      accountId: Schema.PropertySignature<":", string, "id", ":", string, false, never>;
      name: typeof Schema.String;
      stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
      accountNumber: Schema.PropertySignature<":", string | null, "account_number", ":", string | null, false, never>;
      normality: Schema.Enums<typeof LedgerEntryDirection>;
      accountType: Schema.PropertySignature<":", {
          readonly value: LedgerAccountType;
          readonly displayName: string;
      }, "account_type", ":", {
          readonly value: LedgerAccountType;
          readonly display_name: string;
      }, false, never>;
      accountSubtype: Schema.PropertySignature<":", {
          readonly value: LedgerAccountSubtype;
          readonly displayName: string;
      }, "account_subtype", ":", {
          readonly value: LedgerAccountSubtype;
          readonly display_name: string;
      }, false, never>;
      balance: typeof Schema.Number;
      isDeletable: Schema.PropertySignature<":", boolean | null, "is_deletable", ":", boolean | null, false, never>;
  };
  export interface NestedLedgerAccount extends Schema.Struct.Type<typeof nestedLedgerAccountFields> {
      subAccounts: ReadonlyArray<NestedLedgerAccount>;
  }
  export interface NestedLedgerAccountEncoded extends Schema.Struct.Encoded<typeof nestedLedgerAccountFields> {
      readonly sub_accounts: ReadonlyArray<NestedLedgerAccountEncoded>;
  }
  export const NestedLedgerAccountSchema: Schema.Struct<{
      subAccounts: Schema.PropertySignature<":", readonly NestedLedgerAccount[], "sub_accounts", ":", readonly NestedLedgerAccountEncoded[], false, never>;
      accountId: Schema.PropertySignature<":", string, "id", ":", string, false, never>;
      name: typeof Schema.String;
      stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
      accountNumber: Schema.PropertySignature<":", string | null, "account_number", ":", string | null, false, never>;
      normality: Schema.Enums<typeof LedgerEntryDirection>;
      accountType: Schema.PropertySignature<":", {
          readonly value: LedgerAccountType;
          readonly displayName: string;
      }, "account_type", ":", {
          readonly value: LedgerAccountType;
          readonly display_name: string;
      }, false, never>;
      accountSubtype: Schema.PropertySignature<":", {
          readonly value: LedgerAccountSubtype;
          readonly displayName: string;
      }, "account_subtype", ":", {
          readonly value: LedgerAccountSubtype;
          readonly display_name: string;
      }, false, never>;
      balance: typeof Schema.Number;
      isDeletable: Schema.PropertySignature<":", boolean | null, "is_deletable", ":", boolean | null, false, never>;
  }>;
  const nestedChartAccountFields: {
      accountId: Schema.PropertySignature<":", string, "id", ":", string, false, never>;
      name: typeof Schema.String;
      stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
      accountNumber: Schema.PropertySignature<":", string | null, "account_number", ":", string | null, false, never>;
      normality: Schema.Enums<typeof LedgerEntryDirection>;
      accountType: Schema.PropertySignature<":", {
          readonly value: LedgerAccountType;
          readonly displayName: string;
      }, "account_type", ":", {
          readonly value: LedgerAccountType;
          readonly display_name: string;
      }, false, never>;
      accountSubtype: Schema.PropertySignature<":", {
          readonly value: LedgerAccountSubtype;
          readonly displayName: string;
      }, "account_subtype", ":", {
          readonly value: LedgerAccountSubtype;
          readonly display_name: string;
      }, false, never>;
  };
  export interface NestedChartAccount extends Schema.Struct.Type<typeof nestedChartAccountFields> {
      subAccounts: ReadonlyArray<NestedChartAccount>;
  }
  export interface NestedChartAccountEncoded extends Schema.Struct.Encoded<typeof nestedChartAccountFields> {
      readonly sub_accounts: ReadonlyArray<NestedChartAccountEncoded>;
  }
  export const SingleChartAccountSchema: Schema.Struct<{
      accountId: Schema.PropertySignature<":", string, "id", ":", string, false, never>;
      name: typeof Schema.String;
      stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
      accountNumber: Schema.PropertySignature<":", string | null, "account_number", ":", string | null, false, never>;
      normality: Schema.Enums<typeof LedgerEntryDirection>;
      accountType: Schema.PropertySignature<":", {
          readonly value: LedgerAccountType;
          readonly displayName: string;
      }, "account_type", ":", {
          readonly value: LedgerAccountType;
          readonly display_name: string;
      }, false, never>;
      accountSubtype: Schema.PropertySignature<":", {
          readonly value: LedgerAccountSubtype;
          readonly displayName: string;
      }, "account_subtype", ":", {
          readonly value: LedgerAccountSubtype;
          readonly display_name: string;
      }, false, never>;
  }>;
  export const NestedChartAccountSchema: Schema.Struct<{
      subAccounts: Schema.PropertySignature<":", readonly NestedChartAccount[], "sub_accounts", ":", readonly NestedChartAccountEncoded[], false, never>;
      accountId: Schema.PropertySignature<":", string, "id", ":", string, false, never>;
      name: typeof Schema.String;
      stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
      accountNumber: Schema.PropertySignature<":", string | null, "account_number", ":", string | null, false, never>;
      normality: Schema.Enums<typeof LedgerEntryDirection>;
      accountType: Schema.PropertySignature<":", {
          readonly value: LedgerAccountType;
          readonly displayName: string;
      }, "account_type", ":", {
          readonly value: LedgerAccountType;
          readonly display_name: string;
      }, false, never>;
      accountSubtype: Schema.PropertySignature<":", {
          readonly value: LedgerAccountSubtype;
          readonly displayName: string;
      }, "account_subtype", ":", {
          readonly value: LedgerAccountSubtype;
          readonly display_name: string;
      }, false, never>;
  }>;
  export type NestedLedgerAccountType = typeof NestedLedgerAccountSchema.Type;
  export type NestedChartAccountType = typeof NestedChartAccountSchema.Type;
  export type SingleChartAccountType = typeof SingleChartAccountSchema.Type;
  export type SingleChartAccountEncodedType = typeof SingleChartAccountSchema.Encoded;
  export const ChartOfAccountsSchema: Schema.Struct<{
      accounts: Schema.Array$<Schema.Struct<{
          subAccounts: Schema.PropertySignature<":", readonly NestedChartAccount[], "sub_accounts", ":", readonly NestedChartAccountEncoded[], false, never>;
          accountId: Schema.PropertySignature<":", string, "id", ":", string, false, never>;
          name: typeof Schema.String;
          stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
          accountNumber: Schema.PropertySignature<":", string | null, "account_number", ":", string | null, false, never>;
          normality: Schema.Enums<typeof LedgerEntryDirection>;
          accountType: Schema.PropertySignature<":", {
              readonly value: LedgerAccountType;
              readonly displayName: string;
          }, "account_type", ":", {
              readonly value: LedgerAccountType;
              readonly display_name: string;
          }, false, never>;
          accountSubtype: Schema.PropertySignature<":", {
              readonly value: LedgerAccountSubtype;
              readonly displayName: string;
          }, "account_subtype", ":", {
              readonly value: LedgerAccountSubtype;
              readonly display_name: string;
          }, false, never>;
      }>>;
  }>;
  export const LedgerBalancesSchema: Schema.Struct<{
      accounts: Schema.Array$<Schema.Struct<{
          subAccounts: Schema.PropertySignature<":", readonly NestedLedgerAccount[], "sub_accounts", ":", readonly NestedLedgerAccountEncoded[], false, never>;
          accountId: Schema.PropertySignature<":", string, "id", ":", string, false, never>;
          name: typeof Schema.String;
          stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
          accountNumber: Schema.PropertySignature<":", string | null, "account_number", ":", string | null, false, never>;
          normality: Schema.Enums<typeof LedgerEntryDirection>;
          accountType: Schema.PropertySignature<":", {
              readonly value: LedgerAccountType;
              readonly displayName: string;
          }, "account_type", ":", {
              readonly value: LedgerAccountType;
              readonly display_name: string;
          }, false, never>;
          accountSubtype: Schema.PropertySignature<":", {
              readonly value: LedgerAccountSubtype;
              readonly displayName: string;
          }, "account_subtype", ":", {
              readonly value: LedgerAccountSubtype;
              readonly display_name: string;
          }, false, never>;
          balance: typeof Schema.Number;
          isDeletable: Schema.PropertySignature<":", boolean | null, "is_deletable", ":", boolean | null, false, never>;
      }>>;
  }>;
  export type LedgerBalancesSchemaType = typeof LedgerBalancesSchema.Type;
  export {};

}
declare module '@layerfi/components/schemas/generalLedger/ledgerEntry' {
  import { Schema } from 'effect';
  export enum ClassifierAgent {
      Sms = "SMS",
      Api = "API",
      LayerAuto = "LAYER_AUTO",
      LayerManual = "LAYER_MANUAL",
      QuickbooksSync = "QUICKBOOKS_SYNC",
      CheckPayrollSync = "CHECK_PAYROLL_SYNC"
  }
  export enum EntryType {
      Expense = "EXPENSE",
      Revenue = "REVENUE",
      OpeningBalance = "OPENING_BALANCE",
      Invoice = "INVOICE",
      InvoicePayment = "INVOICE_PAYMENT",
      InvoiceWriteOff = "INVOICE_WRITE_OFF",
      RefundAllocation = "REFUND_ALLOCATION",
      RefundPayment = "REFUND_PAYMENT",
      VendorRefundAllocation = "VENDOR_REFUND_ALLOCATION",
      VendorRefundPayment = "VENDOR_REFUND_PAYMENT",
      Manual = "MANUAL",
      Reversal = "REVERSAL",
      Payout = "PAYOUT",
      VendorPayout = "VENDOR_PAYOUT",
      Payroll = "PAYROLL",
      PayrollPayment = "PAYROLL_PAYMENT",
      Match = "MATCH",
      Quickbooks = "QUICKBOOKS",
      Bill = "BILL",
      BillPayment = "BILL_PAYMENT",
      VendorCredit = "VENDOR_CREDIT",
      CustomerCredit = "CUSTOMER_CREDIT"
  }
  export const LedgerAccountLineItemSchema: Schema.Struct<{
      id: typeof Schema.String;
      entryId: Schema.PropertySignature<":", string, "entry_id", ":", string, false, never>;
      entryNumber: Schema.PropertySignature<":", number | null, "entry_number", ":", number | null, false, never>;
      account: Schema.Struct<{
          id: typeof Schema.String;
          name: typeof Schema.String;
          stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
          normality: Schema.Enums<typeof import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection>;
          accountType: Schema.PropertySignature<":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
              readonly displayName: string;
          }, "account_type", ":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
              readonly display_name: string;
          }, false, never>;
          accountSubtype: Schema.PropertySignature<":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
              readonly displayName: string;
          }, "account_subtype", ":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
              readonly display_name: string;
          }, false, never>;
      }>;
      amount: typeof Schema.Number;
      direction: Schema.Enums<typeof import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection>;
      date: typeof Schema.Date;
      source: Schema.Union<[Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Transaction_Ledger_Entry_Source"]>;
          transactionId: Schema.PropertySignature<":", string, "transaction_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          accountName: Schema.PropertySignature<"?:", string | undefined, "account_name", "?:", string | undefined, false, never>;
          date: typeof Schema.String;
          amount: typeof Schema.Number;
          direction: Schema.Enums<typeof import("@layerfi/components/index").Direction>;
          counterparty: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          description: Schema.optional<typeof Schema.String>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Invoice_Ledger_Entry_Source"]>;
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
          customerDescription: Schema.PropertySignature<"?:", string | undefined, "customer_description", "?:", string | undefined, false, never>;
          date: typeof Schema.String;
          amount: typeof Schema.Number;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Manual_Ledger_Entry_Source"]>;
          manualEntryId: Schema.PropertySignature<":", string, "manual_entry_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
          createdBy: Schema.PropertySignature<":", string, "created_by", ":", string, false, never>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Invoice_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          amount: typeof Schema.Number;
          invoiceIdentifiers: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }[], "invoice_identifiers", ":", readonly {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }[], false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Refund_Allocation_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          amount: typeof Schema.Number;
          recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
          customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
          customerRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "customer_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Refund_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
          refundedToCustomerAmount: Schema.PropertySignature<":", number, "refunded_to_customer_amount", ":", number, false, never>;
          recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
          customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
          customerRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "customer_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Opening_Balance_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          accountName: Schema.PropertySignature<":", string, "account_name", ":", string, false, never>;
          openingBalanceId: Schema.PropertySignature<":", string, "opening_balance_id", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Payout_Ledger_Entry_Source"]>;
          payoutId: Schema.PropertySignature<":", string, "payout_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
          processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Quickbooks_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          quickbooksId: Schema.PropertySignature<"?:", string | null | undefined, "quickbooks_id", "?:", string | null | undefined, false, never>;
          importDate: Schema.PropertySignature<":", string, "import_date", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Invoice_Write_Off_Ledger_Entry_Source"]>;
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          invoiceNumber: Schema.PropertySignature<"?:", string | null | undefined, "invoice_number", "?:", string | null | undefined, false, never>;
          recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
          customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
          date: Schema.PropertySignature<":", string, "write_off_date", ":", string, false, never>;
          writeOffAmount: Schema.PropertySignature<":", number, "write_off_amount", ":", number, false, never>;
          invoiceIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "invoice_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Refund_Allocation_Ledger_Entry_Source"]>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
          vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
          vendorRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "vendor_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Refund_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
          refundedByVendorAmount: Schema.PropertySignature<":", number, "refunded_by_vendor_amount", ":", number, false, never>;
          vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
          vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
          vendorRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "vendor_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Payout_Ledger_Entry_Source"]>;
          vendorPayoutId: Schema.PropertySignature<":", string, "vendor_payout_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
          processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Payroll_Ledger_Entry_Source"]>;
          payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          payday: typeof Schema.String;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Payroll_Payment_Ledger_Entry_Source"]>;
          payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Bill_Ledger_Entry_Source"]>;
          billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
          vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
          vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
          date: typeof Schema.String;
          amount: typeof Schema.Number;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Bill_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
          billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          billIdentifiers: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }[], "bill_identifiers", ":", readonly {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }[], false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Credit_Ledger_Entry_Source"]>;
          vendorCreditId: Schema.PropertySignature<":", string, "vendor_credit_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          vendor: Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Customer_Credit_Ledger_Entry_Source"]>;
          customerCreditId: Schema.PropertySignature<":", string, "customer_credit_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          customer: Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>]>;
      entryReversalOf: Schema.PropertySignature<":", string | null, "entry_reversal_of", ":", string | null, false, never>;
      entryReversedBy: Schema.PropertySignature<":", string | null, "entry_reversed_by", ":", string | null, false, never>;
      isReversed: Schema.PropertySignature<":", boolean, "is_reversed", ":", boolean, false, never>;
      runningBalance: Schema.PropertySignature<":", number, "running_balance", ":", number, false, never>;
  }>;
  export const LedgerEntryLineItemSchema: Schema.Struct<{
      id: typeof Schema.String;
      entryId: Schema.PropertySignature<":", string, "entry_id", ":", string, false, never>;
      account: Schema.Struct<{
          id: typeof Schema.String;
          name: typeof Schema.String;
          stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
          normality: Schema.Enums<typeof import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection>;
          accountType: Schema.PropertySignature<":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
              readonly displayName: string;
          }, "account_type", ":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
              readonly display_name: string;
          }, false, never>;
          accountSubtype: Schema.PropertySignature<":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
              readonly displayName: string;
          }, "account_subtype", ":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
              readonly display_name: string;
          }, false, never>;
      }>;
      amount: typeof Schema.Number;
      direction: Schema.Enums<typeof import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection>;
      entryAt: Schema.PropertySignature<":", Date, "entry_at", ":", string, false, never>;
      customer: Schema.NullOr<Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>>;
      vendor: Schema.NullOr<Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>>;
  }>;
  export const LedgerEntrySchema: Schema.Struct<{
      id: typeof Schema.String;
      businessId: Schema.PropertySignature<":", string, "business_id", ":", string, false, never>;
      ledgerId: Schema.PropertySignature<":", string, "ledger_id", ":", string, false, never>;
      agent: Schema.Enums<typeof ClassifierAgent>;
      entryType: Schema.PropertySignature<":", EntryType, "entry_type", ":", EntryType, false, never>;
      entryNumber: Schema.PropertySignature<":", number | null, "entry_number", ":", number | null, false, never>;
      date: typeof Schema.Date;
      customer: Schema.NullOr<Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>>;
      vendor: Schema.NullOr<Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>>;
      entryAt: Schema.PropertySignature<":", Date, "entry_at", ":", string, false, never>;
      reversalOfId: Schema.PropertySignature<":", string | null, "reversal_of_id", ":", string | null, false, never>;
      reversalId: Schema.PropertySignature<":", string | null, "reversal_id", ":", string | null, false, never>;
      lineItems: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly name: string;
              readonly stableName: string | null;
              readonly normality: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
              readonly accountType: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
                  readonly displayName: string;
              };
              readonly accountSubtype: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
                  readonly displayName: string;
              };
          };
          readonly direction: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
          readonly customer: {
              readonly id: string;
              readonly externalId: string | null;
              readonly individualName: string | null;
              readonly companyName: string | null;
              readonly email: string | null;
              readonly mobilePhone: string | null;
              readonly officePhone: string | null;
              readonly addressString: string | null;
              readonly status: "ACTIVE" | "ARCHIVED";
              readonly memo: string | null;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
          } | null;
          readonly vendor: {
              readonly id: string;
              readonly externalId: string | null;
              readonly individualName: string | null;
              readonly companyName: string | null;
              readonly email: string | null;
              readonly mobilePhone: string | null;
              readonly officePhone: string | null;
              readonly status: "ACTIVE" | "ARCHIVED";
              readonly memo: string | null;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
          } | null;
          readonly entryId: string;
          readonly entryAt: Date;
      }[], "line_items", ":", readonly {
          readonly id: string;
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly name: string;
              readonly stable_name: string | null;
              readonly normality: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
              readonly account_type: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
                  readonly display_name: string;
              };
              readonly account_subtype: {
                  readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
                  readonly display_name: string;
              };
          };
          readonly direction: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
          readonly customer: {
              readonly id: string;
              readonly external_id: string | null;
              readonly individual_name: string | null;
              readonly company_name: string | null;
              readonly email: string | null;
              readonly mobile_phone: string | null;
              readonly office_phone: string | null;
              readonly address_string: string | null;
              readonly status: string;
              readonly memo: string | null;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
          } | null;
          readonly vendor: {
              readonly id: string;
              readonly external_id: string | null;
              readonly individual_name: string | null;
              readonly company_name: string | null;
              readonly email: string | null;
              readonly mobile_phone: string | null;
              readonly office_phone: string | null;
              readonly status: string;
              readonly memo: string | null;
              readonly _local?: {
                  readonly isOptimistic: boolean;
              } | undefined;
          } | null;
          readonly entry_id: string;
          readonly entry_at: string;
      }[], false, never>;
      source: Schema.Union<[Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Transaction_Ledger_Entry_Source"]>;
          transactionId: Schema.PropertySignature<":", string, "transaction_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          accountName: Schema.PropertySignature<"?:", string | undefined, "account_name", "?:", string | undefined, false, never>;
          date: typeof Schema.String;
          amount: typeof Schema.Number;
          direction: Schema.Enums<typeof import("@layerfi/components/index").Direction>;
          counterparty: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          description: Schema.optional<typeof Schema.String>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Invoice_Ledger_Entry_Source"]>;
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
          customerDescription: Schema.PropertySignature<"?:", string | undefined, "customer_description", "?:", string | undefined, false, never>;
          date: typeof Schema.String;
          amount: typeof Schema.Number;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Manual_Ledger_Entry_Source"]>;
          manualEntryId: Schema.PropertySignature<":", string, "manual_entry_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          memo: Schema.NullOr<typeof Schema.String>;
          createdBy: Schema.PropertySignature<":", string, "created_by", ":", string, false, never>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Invoice_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
          amount: typeof Schema.Number;
          invoiceIdentifiers: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }[], "invoice_identifiers", ":", readonly {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }[], false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Refund_Allocation_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          amount: typeof Schema.Number;
          recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
          customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
          customerRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "customer_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Refund_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
          refundedToCustomerAmount: Schema.PropertySignature<":", number, "refunded_to_customer_amount", ":", number, false, never>;
          recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
          customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
          customerRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "customer_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Opening_Balance_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          accountName: Schema.PropertySignature<":", string, "account_name", ":", string, false, never>;
          openingBalanceId: Schema.PropertySignature<":", string, "opening_balance_id", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Payout_Ledger_Entry_Source"]>;
          payoutId: Schema.PropertySignature<":", string, "payout_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
          processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Quickbooks_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          quickbooksId: Schema.PropertySignature<"?:", string | null | undefined, "quickbooks_id", "?:", string | null | undefined, false, never>;
          importDate: Schema.PropertySignature<":", string, "import_date", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Invoice_Write_Off_Ledger_Entry_Source"]>;
          invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          invoiceNumber: Schema.PropertySignature<"?:", string | null | undefined, "invoice_number", "?:", string | null | undefined, false, never>;
          recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
          customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
          date: Schema.PropertySignature<":", string, "write_off_date", ":", string, false, never>;
          writeOffAmount: Schema.PropertySignature<":", number, "write_off_amount", ":", number, false, never>;
          invoiceIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "invoice_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Refund_Allocation_Ledger_Entry_Source"]>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
          vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
          vendorRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "vendor_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Refund_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
          refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
          refundedByVendorAmount: Schema.PropertySignature<":", number, "refunded_by_vendor_amount", ":", number, false, never>;
          vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
          vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
          vendorRefundIdentifiers: Schema.PropertySignature<":", {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }, "vendor_refund_identifiers", ":", {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Payout_Ledger_Entry_Source"]>;
          vendorPayoutId: Schema.PropertySignature<":", string, "vendor_payout_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
          processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Payroll_Ledger_Entry_Source"]>;
          payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          payday: typeof Schema.String;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Payroll_Payment_Ledger_Entry_Source"]>;
          payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Bill_Ledger_Entry_Source"]>;
          billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
          vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
          vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
          date: typeof Schema.String;
          amount: typeof Schema.Number;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Bill_Payment_Ledger_Entry_Source"]>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
          billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          billIdentifiers: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly externalId?: string | null | undefined;
              readonly referenceNumber?: string | null | undefined;
              readonly metadata?: unknown;
          }[], "bill_identifiers", ":", readonly {
              readonly id: string;
              readonly external_id?: string | null | undefined;
              readonly reference_number?: string | null | undefined;
              readonly metadata?: unknown;
          }[], false, never>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Vendor_Credit_Ledger_Entry_Source"]>;
          vendorCreditId: Schema.PropertySignature<":", string, "vendor_credit_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          vendor: Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>, Schema.Struct<{
          displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
          entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
          type: Schema.Literal<["Customer_Credit_Ledger_Entry_Source"]>;
          customerCreditId: Schema.PropertySignature<":", string, "customer_credit_id", ":", string, false, never>;
          externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
          amount: typeof Schema.Number;
          customer: Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>;
          memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
          metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
          referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      }>]>;
      memo: Schema.NullOr<typeof Schema.String>;
      metadata: Schema.NullOr<typeof Schema.Unknown>;
      referenceNumber: Schema.PropertySignature<":", string | null, "reference_number", ":", string | null, false, never>;
  }>;
  export const LedgerSchema: Schema.Struct<{
      accounts: Schema.Array$<Schema.Struct<{
          subAccounts: Schema.PropertySignature<":", readonly import("@layerfi/components/schemas/generalLedger/ledgerAccount").NestedLedgerAccount[], "sub_accounts", ":", readonly import("./ledgerAccount").NestedLedgerAccountEncoded[], false, never>;
          accountId: Schema.PropertySignature<":", string, "id", ":", string, false, never>;
          name: typeof Schema.String;
          stableName: Schema.PropertySignature<":", string | null, "stable_name", ":", string | null, false, never>;
          accountNumber: Schema.PropertySignature<":", string | null, "account_number", ":", string | null, false, never>;
          normality: Schema.Enums<typeof import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection>;
          accountType: Schema.PropertySignature<":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
              readonly displayName: string;
          }, "account_type", ":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
              readonly display_name: string;
          }, false, never>;
          accountSubtype: Schema.PropertySignature<":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
              readonly displayName: string;
          }, "account_subtype", ":", {
              readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
              readonly display_name: string;
          }, false, never>;
          balance: typeof Schema.Number;
          isDeletable: Schema.PropertySignature<":", boolean | null, "is_deletable", ":", boolean | null, false, never>;
      }>>;
      enties: Schema.Array$<Schema.Struct<{
          id: typeof Schema.String;
          businessId: Schema.PropertySignature<":", string, "business_id", ":", string, false, never>;
          ledgerId: Schema.PropertySignature<":", string, "ledger_id", ":", string, false, never>;
          agent: Schema.Enums<typeof ClassifierAgent>;
          entryType: Schema.PropertySignature<":", EntryType, "entry_type", ":", EntryType, false, never>;
          entryNumber: Schema.PropertySignature<":", number | null, "entry_number", ":", number | null, false, never>;
          date: typeof Schema.Date;
          customer: Schema.NullOr<Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>>;
          vendor: Schema.NullOr<Schema.Struct<{
              id: typeof Schema.UUID;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
              companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
              email: Schema.NullOr<typeof Schema.String>;
              mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
              officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
              status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
              memo: Schema.NullOr<typeof Schema.String>;
              _local: Schema.optional<Schema.Struct<{
                  isOptimistic: typeof Schema.Boolean;
              }>>;
          }>>;
          entryAt: Schema.PropertySignature<":", Date, "entry_at", ":", string, false, never>;
          reversalOfId: Schema.PropertySignature<":", string | null, "reversal_of_id", ":", string | null, false, never>;
          reversalId: Schema.PropertySignature<":", string | null, "reversal_id", ":", string | null, false, never>;
          lineItems: Schema.PropertySignature<":", readonly {
              readonly id: string;
              readonly amount: number;
              readonly account: {
                  readonly id: string;
                  readonly name: string;
                  readonly stableName: string | null;
                  readonly normality: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
                  readonly accountType: {
                      readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
                      readonly displayName: string;
                  };
                  readonly accountSubtype: {
                      readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
                      readonly displayName: string;
                  };
              };
              readonly direction: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
              readonly customer: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly addressString: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly vendor: {
                  readonly id: string;
                  readonly externalId: string | null;
                  readonly individualName: string | null;
                  readonly companyName: string | null;
                  readonly email: string | null;
                  readonly mobilePhone: string | null;
                  readonly officePhone: string | null;
                  readonly status: "ACTIVE" | "ARCHIVED";
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly entryId: string;
              readonly entryAt: Date;
          }[], "line_items", ":", readonly {
              readonly id: string;
              readonly amount: number;
              readonly account: {
                  readonly id: string;
                  readonly name: string;
                  readonly stable_name: string | null;
                  readonly normality: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
                  readonly account_type: {
                      readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountType;
                      readonly display_name: string;
                  };
                  readonly account_subtype: {
                      readonly value: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerAccountSubtype;
                      readonly display_name: string;
                  };
              };
              readonly direction: import("@layerfi/components/schemas/generalLedger/ledgerAccount").LedgerEntryDirection;
              readonly customer: {
                  readonly id: string;
                  readonly external_id: string | null;
                  readonly individual_name: string | null;
                  readonly company_name: string | null;
                  readonly email: string | null;
                  readonly mobile_phone: string | null;
                  readonly office_phone: string | null;
                  readonly address_string: string | null;
                  readonly status: string;
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly vendor: {
                  readonly id: string;
                  readonly external_id: string | null;
                  readonly individual_name: string | null;
                  readonly company_name: string | null;
                  readonly email: string | null;
                  readonly mobile_phone: string | null;
                  readonly office_phone: string | null;
                  readonly status: string;
                  readonly memo: string | null;
                  readonly _local?: {
                      readonly isOptimistic: boolean;
                  } | undefined;
              } | null;
              readonly entry_id: string;
              readonly entry_at: string;
          }[], false, never>;
          source: Schema.Union<[Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Transaction_Ledger_Entry_Source"]>;
              transactionId: Schema.PropertySignature<":", string, "transaction_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              accountName: Schema.PropertySignature<"?:", string | undefined, "account_name", "?:", string | undefined, false, never>;
              date: typeof Schema.String;
              amount: typeof Schema.Number;
              direction: Schema.Enums<typeof import("@layerfi/components/index").Direction>;
              counterparty: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              description: Schema.optional<typeof Schema.String>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Invoice_Ledger_Entry_Source"]>;
              invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
              recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
              customerDescription: Schema.PropertySignature<"?:", string | undefined, "customer_description", "?:", string | undefined, false, never>;
              date: typeof Schema.String;
              amount: typeof Schema.Number;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Manual_Ledger_Entry_Source"]>;
              manualEntryId: Schema.PropertySignature<":", string, "manual_entry_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              memo: Schema.NullOr<typeof Schema.String>;
              createdBy: Schema.PropertySignature<":", string, "created_by", ":", string, false, never>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Invoice_Payment_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
              invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
              amount: typeof Schema.Number;
              invoiceIdentifiers: Schema.PropertySignature<":", readonly {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }[], "invoice_identifiers", ":", readonly {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }[], false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Refund_Allocation_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
              amount: typeof Schema.Number;
              recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
              customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
              customerRefundIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "customer_refund_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Refund_Payment_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
              refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
              refundedToCustomerAmount: Schema.PropertySignature<":", number, "refunded_to_customer_amount", ":", number, false, never>;
              recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
              customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
              customerRefundIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "customer_refund_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Opening_Balance_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              accountName: Schema.PropertySignature<":", string, "account_name", ":", string, false, never>;
              openingBalanceId: Schema.PropertySignature<":", string, "opening_balance_id", ":", string, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Payout_Ledger_Entry_Source"]>;
              payoutId: Schema.PropertySignature<":", string, "payout_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
              paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
              processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Quickbooks_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              quickbooksId: Schema.PropertySignature<"?:", string | null | undefined, "quickbooks_id", "?:", string | null | undefined, false, never>;
              importDate: Schema.PropertySignature<":", string, "import_date", ":", string, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Invoice_Write_Off_Ledger_Entry_Source"]>;
              invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              invoiceNumber: Schema.PropertySignature<"?:", string | null | undefined, "invoice_number", "?:", string | null | undefined, false, never>;
              recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
              customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
              date: Schema.PropertySignature<":", string, "write_off_date", ":", string, false, never>;
              writeOffAmount: Schema.PropertySignature<":", number, "write_off_amount", ":", number, false, never>;
              invoiceIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "invoice_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Vendor_Refund_Allocation_Ledger_Entry_Source"]>;
              refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
              vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
              vendorRefundIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "vendor_refund_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Vendor_Refund_Payment_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
              refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
              refundedByVendorAmount: Schema.PropertySignature<":", number, "refunded_by_vendor_amount", ":", number, false, never>;
              vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
              vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
              vendorRefundIdentifiers: Schema.PropertySignature<":", {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }, "vendor_refund_identifiers", ":", {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Vendor_Payout_Ledger_Entry_Source"]>;
              vendorPayoutId: Schema.PropertySignature<":", string, "vendor_payout_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
              processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Payroll_Ledger_Entry_Source"]>;
              payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              payday: typeof Schema.String;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Payroll_Payment_Ledger_Entry_Source"]>;
              payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Bill_Ledger_Entry_Source"]>;
              billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
              vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
              vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
              date: typeof Schema.String;
              amount: typeof Schema.Number;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Bill_Payment_Ledger_Entry_Source"]>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
              billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              billIdentifiers: Schema.PropertySignature<":", readonly {
                  readonly id: string;
                  readonly externalId?: string | null | undefined;
                  readonly referenceNumber?: string | null | undefined;
                  readonly metadata?: unknown;
              }[], "bill_identifiers", ":", readonly {
                  readonly id: string;
                  readonly external_id?: string | null | undefined;
                  readonly reference_number?: string | null | undefined;
                  readonly metadata?: unknown;
              }[], false, never>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Vendor_Credit_Ledger_Entry_Source"]>;
              vendorCreditId: Schema.PropertySignature<":", string, "vendor_credit_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              vendor: Schema.Struct<{
                  id: typeof Schema.UUID;
                  externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
                  individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
                  companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
                  email: Schema.NullOr<typeof Schema.String>;
                  mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
                  officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
                  status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
                  memo: Schema.NullOr<typeof Schema.String>;
                  _local: Schema.optional<Schema.Struct<{
                      isOptimistic: typeof Schema.Boolean;
                  }>>;
              }>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>, Schema.Struct<{
              displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
              entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
              type: Schema.Literal<["Customer_Credit_Ledger_Entry_Source"]>;
              customerCreditId: Schema.PropertySignature<":", string, "customer_credit_id", ":", string, false, never>;
              externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
              amount: typeof Schema.Number;
              customer: Schema.Struct<{
                  id: typeof Schema.UUID;
                  externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
                  individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
                  companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
                  email: Schema.NullOr<typeof Schema.String>;
                  mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
                  officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
                  addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
                  status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
                  memo: Schema.NullOr<typeof Schema.String>;
                  _local: Schema.optional<Schema.Struct<{
                      isOptimistic: typeof Schema.Boolean;
                  }>>;
              }>;
              memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
              metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
              referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
          }>]>;
          memo: Schema.NullOr<typeof Schema.String>;
          metadata: Schema.NullOr<typeof Schema.Unknown>;
          referenceNumber: Schema.PropertySignature<":", string | null, "reference_number", ":", string | null, false, never>;
      }>>;
  }>;

}
declare module '@layerfi/components/schemas/generalLedger/ledgerEntrySource' {
  import { Schema } from 'effect';
  import { Direction } from '@layerfi/components/types';
  import { LinkingMetadata } from '@layerfi/components/contexts/InAppLinkContext';
  export const FinancialEventIdentifiersSchema: Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>;
  export const TransactionLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Transaction_Ledger_Entry_Source"]>;
      transactionId: Schema.PropertySignature<":", string, "transaction_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      accountName: Schema.PropertySignature<"?:", string | undefined, "account_name", "?:", string | undefined, false, never>;
      date: typeof Schema.String;
      amount: typeof Schema.Number;
      direction: Schema.Enums<typeof Direction>;
      counterparty: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      description: Schema.optional<typeof Schema.String>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const InvoiceLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Invoice_Ledger_Entry_Source"]>;
      invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
      recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
      customerDescription: Schema.PropertySignature<"?:", string | undefined, "customer_description", "?:", string | undefined, false, never>;
      date: typeof Schema.String;
      amount: typeof Schema.Number;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const ManualLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Manual_Ledger_Entry_Source"]>;
      manualEntryId: Schema.PropertySignature<":", string, "manual_entry_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      memo: Schema.NullOr<typeof Schema.String>;
      createdBy: Schema.PropertySignature<":", string, "created_by", ":", string, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const InvoicePaymentLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Invoice_Payment_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
      invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
      amount: typeof Schema.Number;
      invoiceIdentifiers: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[], "invoice_identifiers", ":", readonly {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }[], false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const CustomerRefundAllocationLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Refund_Allocation_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
      amount: typeof Schema.Number;
      recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
      customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
      customerRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "customer_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const CustomerRefundPaymentLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Refund_Payment_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
      refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
      refundedToCustomerAmount: Schema.PropertySignature<":", number, "refunded_to_customer_amount", ":", number, false, never>;
      recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
      customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
      customerRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "customer_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const OpeningBalanceLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Opening_Balance_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      accountName: Schema.PropertySignature<":", string, "account_name", ":", string, false, never>;
      openingBalanceId: Schema.PropertySignature<":", string, "opening_balance_id", ":", string, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const PayoutLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Payout_Ledger_Entry_Source"]>;
      payoutId: Schema.PropertySignature<":", string, "payout_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
      processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const QuickBooksLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Quickbooks_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      quickbooksId: Schema.PropertySignature<"?:", string | null | undefined, "quickbooks_id", "?:", string | null | undefined, false, never>;
      importDate: Schema.PropertySignature<":", string, "import_date", ":", string, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const InvoiceWriteOffLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Invoice_Write_Off_Ledger_Entry_Source"]>;
      invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      invoiceNumber: Schema.PropertySignature<"?:", string | null | undefined, "invoice_number", "?:", string | null | undefined, false, never>;
      recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
      customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
      date: Schema.PropertySignature<":", string, "write_off_date", ":", string, false, never>;
      writeOffAmount: Schema.PropertySignature<":", number, "write_off_amount", ":", number, false, never>;
      invoiceIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "invoice_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const VendorRefundAllocationLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Vendor_Refund_Allocation_Ledger_Entry_Source"]>;
      refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
      vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
      vendorRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "vendor_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const VendorRefundPaymentLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Vendor_Refund_Payment_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
      refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
      refundedByVendorAmount: Schema.PropertySignature<":", number, "refunded_by_vendor_amount", ":", number, false, never>;
      vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
      vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
      vendorRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "vendor_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const VendorPayoutLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Vendor_Payout_Ledger_Entry_Source"]>;
      vendorPayoutId: Schema.PropertySignature<":", string, "vendor_payout_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
      processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const PayrollLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Payroll_Ledger_Entry_Source"]>;
      payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      payday: typeof Schema.String;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const PayrollPaymentLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Payroll_Payment_Ledger_Entry_Source"]>;
      payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const BillLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Bill_Ledger_Entry_Source"]>;
      billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
      vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
      vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
      date: typeof Schema.String;
      amount: typeof Schema.Number;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const BillPaymentLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Bill_Payment_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
      billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      billIdentifiers: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[], "bill_identifiers", ":", readonly {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }[], false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const VendorCreditLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Vendor_Credit_Ledger_Entry_Source"]>;
      vendorCreditId: Schema.PropertySignature<":", string, "vendor_credit_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      vendor: Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const CustomerCreditLedgerEntrySourceSchema: Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Customer_Credit_Ledger_Entry_Source"]>;
      customerCreditId: Schema.PropertySignature<":", string, "customer_credit_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      customer: Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>;
  export const LedgerEntrySourceSchema: Schema.Union<[Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Transaction_Ledger_Entry_Source"]>;
      transactionId: Schema.PropertySignature<":", string, "transaction_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      accountName: Schema.PropertySignature<"?:", string | undefined, "account_name", "?:", string | undefined, false, never>;
      date: typeof Schema.String;
      amount: typeof Schema.Number;
      direction: Schema.Enums<typeof Direction>;
      counterparty: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      description: Schema.optional<typeof Schema.String>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Invoice_Ledger_Entry_Source"]>;
      invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
      recipientName: Schema.PropertySignature<":", string | null, "recipient_name", ":", string | null, false, never>;
      customerDescription: Schema.PropertySignature<"?:", string | undefined, "customer_description", "?:", string | undefined, false, never>;
      date: typeof Schema.String;
      amount: typeof Schema.Number;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Manual_Ledger_Entry_Source"]>;
      manualEntryId: Schema.PropertySignature<":", string, "manual_entry_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      memo: Schema.NullOr<typeof Schema.String>;
      createdBy: Schema.PropertySignature<":", string, "created_by", ":", string, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Invoice_Payment_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
      invoiceNumber: Schema.PropertySignature<":", string | null, "invoice_number", ":", string | null, false, never>;
      amount: typeof Schema.Number;
      invoiceIdentifiers: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[], "invoice_identifiers", ":", readonly {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }[], false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Refund_Allocation_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
      amount: typeof Schema.Number;
      recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
      customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
      customerRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "customer_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Refund_Payment_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
      refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
      refundedToCustomerAmount: Schema.PropertySignature<":", number, "refunded_to_customer_amount", ":", number, false, never>;
      recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
      customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
      customerRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "customer_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Opening_Balance_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      accountName: Schema.PropertySignature<":", string, "account_name", ":", string, false, never>;
      openingBalanceId: Schema.PropertySignature<":", string, "opening_balance_id", ":", string, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Payout_Ledger_Entry_Source"]>;
      payoutId: Schema.PropertySignature<":", string, "payout_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
      processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Quickbooks_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      quickbooksId: Schema.PropertySignature<"?:", string | null | undefined, "quickbooks_id", "?:", string | null | undefined, false, never>;
      importDate: Schema.PropertySignature<":", string, "import_date", ":", string, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Invoice_Write_Off_Ledger_Entry_Source"]>;
      invoiceId: Schema.PropertySignature<":", string, "invoice_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      invoiceNumber: Schema.PropertySignature<"?:", string | null | undefined, "invoice_number", "?:", string | null | undefined, false, never>;
      recipientName: Schema.PropertySignature<"?:", string | null | undefined, "recipient_name", "?:", string | null | undefined, false, never>;
      customerDescription: Schema.PropertySignature<":", string, "customer_description", ":", string, false, never>;
      date: Schema.PropertySignature<":", string, "write_off_date", ":", string, false, never>;
      writeOffAmount: Schema.PropertySignature<":", number, "write_off_amount", ":", number, false, never>;
      invoiceIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "invoice_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Vendor_Refund_Allocation_Ledger_Entry_Source"]>;
      refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
      vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
      vendorRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "vendor_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Vendor_Refund_Payment_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      refundId: Schema.PropertySignature<":", string, "refund_id", ":", string, false, never>;
      refundPaymentId: Schema.PropertySignature<":", string, "refund_payment_id", ":", string, false, never>;
      refundedByVendorAmount: Schema.PropertySignature<":", number, "refunded_by_vendor_amount", ":", number, false, never>;
      vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
      vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
      vendorRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "vendor_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Vendor_Payout_Ledger_Entry_Source"]>;
      vendorPayoutId: Schema.PropertySignature<":", string, "vendor_payout_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      paidOutAmount: Schema.PropertySignature<":", number, "paid_out_amount", ":", number, false, never>;
      processor: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      completedAt: Schema.PropertySignature<":", string, "completed_at", ":", string, false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Payroll_Ledger_Entry_Source"]>;
      payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      payday: typeof Schema.String;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Payroll_Payment_Ledger_Entry_Source"]>;
      payrollId: Schema.PropertySignature<":", string, "payroll_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Bill_Ledger_Entry_Source"]>;
      billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
      vendorDescription: Schema.PropertySignature<":", string, "vendor_description", ":", string, false, never>;
      vendorExternalId: Schema.PropertySignature<"?:", string | null | undefined, "vendor_external_id", "?:", string | null | undefined, false, never>;
      date: typeof Schema.String;
      amount: typeof Schema.Number;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Bill_Payment_Ledger_Entry_Source"]>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      billId: Schema.PropertySignature<":", string, "bill_id", ":", string, false, never>;
      billNumber: Schema.PropertySignature<"?:", string | null | undefined, "bill_number", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      billIdentifiers: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[], "bill_identifiers", ":", readonly {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }[], false, never>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Vendor_Credit_Ledger_Entry_Source"]>;
      vendorCreditId: Schema.PropertySignature<":", string, "vendor_credit_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      vendor: Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>, Schema.Struct<{
      displayDescription: Schema.PropertySignature<":", string, "display_description", ":", string, false, never>;
      entityName: Schema.PropertySignature<":", string, "entity_name", ":", string, false, never>;
      type: Schema.Literal<["Customer_Credit_Ledger_Entry_Source"]>;
      customerCreditId: Schema.PropertySignature<":", string, "customer_credit_id", ":", string, false, never>;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      customer: Schema.Struct<{
          id: typeof Schema.UUID;
          externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
          individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
          companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
          email: Schema.NullOr<typeof Schema.String>;
          mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
          officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
          addressString: Schema.PropertySignature<":", string | null, "address_string", ":", string | null, false, never>;
          status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
          memo: Schema.NullOr<typeof Schema.String>;
          _local: Schema.optional<Schema.Struct<{
              isOptimistic: typeof Schema.Boolean;
          }>>;
      }>;
      memo: Schema.optional<Schema.NullOr<typeof Schema.String>>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
  }>]>;
  export const decodeLedgerEntrySource: (data: unknown) => {
      readonly type: "Transaction_Ledger_Entry_Source";
      readonly externalId: string | null;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly description?: string | undefined;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly transactionId: string;
      readonly direction: Direction;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly accountName?: string | undefined;
      readonly counterparty?: string | null | undefined;
  } | {
      readonly type: "Invoice_Ledger_Entry_Source";
      readonly externalId: string | null;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly invoiceId: string;
      readonly invoiceNumber: string | null;
      readonly recipientName: string | null;
      readonly customerDescription?: string | undefined;
  } | {
      readonly type: "Manual_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo: string | null;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly manualEntryId: string;
      readonly createdBy: string;
  } | {
      readonly type: "Invoice_Payment_Ledger_Entry_Source";
      readonly externalId: string | null;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly invoiceIdentifiers: readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[];
      readonly displayDescription: string;
      readonly entityName: string;
      readonly invoiceId: string;
      readonly invoiceNumber: string | null;
  } | {
      readonly type: "Refund_Allocation_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly customerRefundIdentifiers: {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      };
      readonly displayDescription: string;
      readonly entityName: string;
      readonly recipientName?: string | null | undefined;
      readonly customerDescription: string;
      readonly refundId: string;
  } | {
      readonly type: "Refund_Payment_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly customerRefundIdentifiers: {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      };
      readonly displayDescription: string;
      readonly entityName: string;
      readonly recipientName?: string | null | undefined;
      readonly customerDescription: string;
      readonly refundId: string;
      readonly refundPaymentId: string;
      readonly refundedToCustomerAmount: number;
  } | {
      readonly type: "Opening_Balance_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly accountName: string;
      readonly openingBalanceId: string;
  } | {
      readonly type: "Payout_Ledger_Entry_Source";
      readonly externalId: string | null;
      readonly memo?: string | null | undefined;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly payoutId: string;
      readonly paidOutAmount: number;
      readonly processor?: string | null | undefined;
      readonly completedAt: string;
  } | {
      readonly type: "Quickbooks_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly quickbooksId?: string | null | undefined;
      readonly importDate: string;
  } | {
      readonly type: "Invoice_Write_Off_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly invoiceIdentifiers: {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      };
      readonly displayDescription: string;
      readonly entityName: string;
      readonly invoiceId: string;
      readonly invoiceNumber?: string | null | undefined;
      readonly recipientName?: string | null | undefined;
      readonly customerDescription: string;
      readonly writeOffAmount: number;
  } | {
      readonly type: "Vendor_Refund_Allocation_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly vendorRefundIdentifiers: {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      };
      readonly displayDescription: string;
      readonly entityName: string;
      readonly refundId: string;
      readonly vendorExternalId?: string | null | undefined;
      readonly vendorDescription: string;
  } | {
      readonly type: "Vendor_Refund_Payment_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly vendorRefundIdentifiers: {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      };
      readonly displayDescription: string;
      readonly entityName: string;
      readonly refundId: string;
      readonly refundPaymentId: string;
      readonly vendorExternalId?: string | null | undefined;
      readonly vendorDescription: string;
      readonly refundedByVendorAmount: number;
  } | {
      readonly type: "Vendor_Payout_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly paidOutAmount: number;
      readonly processor?: string | null | undefined;
      readonly completedAt: string;
      readonly vendorPayoutId: string;
  } | {
      readonly type: "Payroll_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly payrollId: string;
      readonly payday: string;
  } | {
      readonly type: "Payroll_Payment_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly payrollId: string;
  } | {
      readonly type: "Bill_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly displayDescription: string;
      readonly entityName: string;
      readonly vendorExternalId?: string | null | undefined;
      readonly vendorDescription: string;
      readonly billId: string;
      readonly billNumber?: string | null | undefined;
  } | {
      readonly type: "Bill_Payment_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly billIdentifiers: readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[];
      readonly displayDescription: string;
      readonly entityName: string;
      readonly billId: string;
      readonly billNumber?: string | null | undefined;
  } | {
      readonly type: "Vendor_Credit_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly vendor: {
          readonly id: string;
          readonly externalId: string | null;
          readonly individualName: string | null;
          readonly companyName: string | null;
          readonly email: string | null;
          readonly mobilePhone: string | null;
          readonly officePhone: string | null;
          readonly status: "ACTIVE" | "ARCHIVED";
          readonly memo: string | null;
          readonly _local?: {
              readonly isOptimistic: boolean;
          } | undefined;
      };
      readonly displayDescription: string;
      readonly entityName: string;
      readonly vendorCreditId: string;
  } | {
      readonly type: "Customer_Credit_Ledger_Entry_Source";
      readonly externalId?: string | null | undefined;
      readonly memo?: string | null | undefined;
      readonly amount: number;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly customer: {
          readonly id: string;
          readonly externalId: string | null;
          readonly individualName: string | null;
          readonly companyName: string | null;
          readonly email: string | null;
          readonly mobilePhone: string | null;
          readonly officePhone: string | null;
          readonly addressString: string | null;
          readonly status: "ACTIVE" | "ARCHIVED";
          readonly memo: string | null;
          readonly _local?: {
              readonly isOptimistic: boolean;
          } | undefined;
      };
      readonly displayDescription: string;
      readonly entityName: string;
      readonly customerCreditId: string;
  } | null;
  export const convertLedgerEntrySourceToLinkingMetadata: (ledgerEntrySource: LedgerEntrySourceType) => LinkingMetadata;
  export type LedgerEntrySourceType = typeof LedgerEntrySourceSchema.Type;

}
declare module '@layerfi/components/schemas/match' {
  import { Schema } from 'effect';
  import { LinkingMetadata } from '@layerfi/components/contexts/InAppLinkContext';
  export const ApiMatchAdjustmentSchema: Schema.Struct<{
      amount: typeof Schema.Number;
      account: Schema.Struct<{
          id: typeof Schema.String;
          type: Schema.optional<typeof Schema.String>;
      }>;
      description: typeof Schema.String;
  }>;
  export const FinancialEventIdentifiersSchema: Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>;
  export const ManualJournalEntryMatchDetailsSchema: Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Journal_Entry_Match"]>;
  }>>;
  export const RefundPaymentMatchDetailsSchema: Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Refund_Payment_Match"]>;
      customerRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "customer_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
  }>>;
  export const VendorRefundPaymentMatchDetailsSchema: Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Vendor_Refund_Payment_Match"]>;
      vendorRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "vendor_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
  }>>;
  export const InvoicePaymentMatchDetailsSchema: Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Invoice_Match"]>;
      invoiceIdentifiers: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[], "invoice_identifiers", ":", readonly {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }[], false, never>;
  }>>;
  export const PayoutMatchDetailsSchema: Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Payout_Match"]>;
  }>>;
  export const VendorPayoutMatchDetailsSchema: Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Vendor_Payout_Match"]>;
  }>>;
  export const BillPaymentMatchDetailsSchema: Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Bill_Match"]>;
      billIdentifiers: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[], "bill_identifiers", ":", readonly {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }[], false, never>;
  }>>;
  export const PayrollPaymentMatchDetailsSchema: Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Payroll_Match"]>;
  }>>;
  export const TransferMatchDetailsSchema: Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Transfer_Match"]>;
      fromAccountName: Schema.PropertySignature<":", string, "from_account_name", ":", string, false, never>;
      toAccountName: Schema.PropertySignature<":", string, "to_account_name", ":", string, false, never>;
  }>>;
  export const MatchDetailsSchema: Schema.Union<[Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Journal_Entry_Match"]>;
  }>>, Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Refund_Payment_Match"]>;
      customerRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "customer_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
  }>>, Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Vendor_Refund_Payment_Match"]>;
      vendorRefundIdentifiers: Schema.PropertySignature<":", {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }, "vendor_refund_identifiers", ":", {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }, false, never>;
  }>>, Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Invoice_Match"]>;
      invoiceIdentifiers: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[], "invoice_identifiers", ":", readonly {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }[], false, never>;
  }>>, Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Payout_Match"]>;
  }>>, Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Vendor_Payout_Match"]>;
  }>>, Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Bill_Match"]>;
      billIdentifiers: Schema.PropertySignature<":", readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[], "bill_identifiers", ":", readonly {
          readonly id: string;
          readonly external_id?: string | null | undefined;
          readonly reference_number?: string | null | undefined;
          readonly metadata?: unknown;
      }[], false, never>;
  }>>, Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Payroll_Match"]>;
  }>>, Schema.extend<Schema.Struct<{
      id: typeof Schema.String;
      externalId: Schema.PropertySignature<"?:", string | null | undefined, "external_id", "?:", string | null | undefined, false, never>;
      amount: typeof Schema.Number;
      date: typeof Schema.String;
      description: typeof Schema.String;
      adjustment: Schema.NullOr<Schema.Struct<{
          amount: typeof Schema.Number;
          account: Schema.Struct<{
              id: typeof Schema.String;
              type: Schema.optional<typeof Schema.String>;
          }>;
          description: typeof Schema.String;
      }>>;
      referenceNumber: Schema.PropertySignature<"?:", string | null | undefined, "reference_number", "?:", string | null | undefined, false, never>;
      metadata: Schema.optional<Schema.NullOr<typeof Schema.Unknown>>;
  }>, Schema.Struct<{
      type: Schema.Literal<["Transfer_Match"]>;
      fromAccountName: Schema.PropertySignature<":", string, "from_account_name", ":", string, false, never>;
      toAccountName: Schema.PropertySignature<":", string, "to_account_name", ":", string, false, never>;
  }>>]>;
  export const SuggestedMatchWithTransactionSchema: Schema.Struct<{
      transactionId: Schema.PropertySignature<":", string, "transaction_id", ":", string, false, never>;
      suggestedMatchId: Schema.PropertySignature<":", string, "suggested_match_id", ":", string, false, never>;
  }>;
  export const SuggestedMatchesWithTransactionsSchema: Schema.Struct<{
      matchPairs: Schema.PropertySignature<":", readonly {
          readonly transactionId: string;
          readonly suggestedMatchId: string;
      }[], "match_pairs", ":", readonly {
          readonly transaction_id: string;
          readonly suggested_match_id: string;
      }[], false, never>;
  }>;
  export const decodeMatchDetails: (data: unknown) => ({
      readonly id: string;
      readonly externalId?: string | null | undefined;
      readonly amount: number;
      readonly description: string;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly adjustment: {
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly type?: string | undefined;
          };
          readonly description: string;
      } | null;
  } & {
      readonly type: "Journal_Entry_Match";
  }) | ({
      readonly id: string;
      readonly externalId?: string | null | undefined;
      readonly amount: number;
      readonly description: string;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly adjustment: {
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly type?: string | undefined;
          };
          readonly description: string;
      } | null;
  } & {
      readonly type: "Refund_Payment_Match";
      readonly customerRefundIdentifiers: {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      };
  }) | ({
      readonly id: string;
      readonly externalId?: string | null | undefined;
      readonly amount: number;
      readonly description: string;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly adjustment: {
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly type?: string | undefined;
          };
          readonly description: string;
      } | null;
  } & {
      readonly type: "Vendor_Refund_Payment_Match";
      readonly vendorRefundIdentifiers: {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      };
  }) | ({
      readonly id: string;
      readonly externalId?: string | null | undefined;
      readonly amount: number;
      readonly description: string;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly adjustment: {
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly type?: string | undefined;
          };
          readonly description: string;
      } | null;
  } & {
      readonly type: "Invoice_Match";
      readonly invoiceIdentifiers: readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[];
  }) | ({
      readonly id: string;
      readonly externalId?: string | null | undefined;
      readonly amount: number;
      readonly description: string;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly adjustment: {
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly type?: string | undefined;
          };
          readonly description: string;
      } | null;
  } & {
      readonly type: "Payout_Match";
  }) | ({
      readonly id: string;
      readonly externalId?: string | null | undefined;
      readonly amount: number;
      readonly description: string;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly adjustment: {
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly type?: string | undefined;
          };
          readonly description: string;
      } | null;
  } & {
      readonly type: "Vendor_Payout_Match";
  }) | ({
      readonly id: string;
      readonly externalId?: string | null | undefined;
      readonly amount: number;
      readonly description: string;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly adjustment: {
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly type?: string | undefined;
          };
          readonly description: string;
      } | null;
  } & {
      readonly type: "Bill_Match";
      readonly billIdentifiers: readonly {
          readonly id: string;
          readonly externalId?: string | null | undefined;
          readonly referenceNumber?: string | null | undefined;
          readonly metadata?: unknown;
      }[];
  }) | ({
      readonly id: string;
      readonly externalId?: string | null | undefined;
      readonly amount: number;
      readonly description: string;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly adjustment: {
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly type?: string | undefined;
          };
          readonly description: string;
      } | null;
  } & {
      readonly type: "Payroll_Match";
  }) | ({
      readonly id: string;
      readonly externalId?: string | null | undefined;
      readonly amount: number;
      readonly description: string;
      readonly referenceNumber?: string | null | undefined;
      readonly metadata?: unknown;
      readonly date: string;
      readonly adjustment: {
          readonly amount: number;
          readonly account: {
              readonly id: string;
              readonly type?: string | undefined;
          };
          readonly description: string;
      } | null;
  } & {
      readonly type: "Transfer_Match";
      readonly fromAccountName: string;
      readonly toAccountName: string;
  }) | null;
  export const convertMatchDetailsToLinkingMetadata: (matchDetails: MatchDetailsType) => LinkingMetadata;
  export type MatchDetailsType = typeof MatchDetailsSchema.Type;
  export type ApiMatchAdjustmentType = typeof ApiMatchAdjustmentSchema.Type;
  export type FinancialEventIdentifiersType = typeof FinancialEventIdentifiersSchema.Type;

}
declare module '@layerfi/components/schemas/vendor' {
  import { Schema } from 'effect';
  export const VendorSchema: Schema.Struct<{
      id: typeof Schema.UUID;
      externalId: Schema.PropertySignature<":", string | null, "external_id", ":", string | null, false, never>;
      individualName: Schema.PropertySignature<":", string | null, "individual_name", ":", string | null, false, never>;
      companyName: Schema.PropertySignature<":", string | null, "company_name", ":", string | null, false, never>;
      email: Schema.NullOr<typeof Schema.String>;
      mobilePhone: Schema.PropertySignature<":", string | null, "mobile_phone", ":", string | null, false, never>;
      officePhone: Schema.PropertySignature<":", string | null, "office_phone", ":", string | null, false, never>;
      status: Schema.transform<typeof Schema.NonEmptyTrimmedString, Schema.SchemaClass<"ACTIVE" | "ARCHIVED", "ACTIVE" | "ARCHIVED", never>>;
      memo: Schema.NullOr<typeof Schema.String>;
      _local: Schema.optional<Schema.Struct<{
          isOptimistic: typeof Schema.Boolean;
      }>>;
  }>;
  export const encodeVendor: (a: {
      readonly id: string;
      readonly externalId: string | null;
      readonly individualName: string | null;
      readonly companyName: string | null;
      readonly email: string | null;
      readonly mobilePhone: string | null;
      readonly officePhone: string | null;
      readonly status: "ACTIVE" | "ARCHIVED";
      readonly memo: string | null;
      readonly _local?: {
          readonly isOptimistic: boolean;
      } | undefined;
  }, overrideOptions?: import("effect/SchemaAST").ParseOptions) => {
      readonly id: string;
      readonly external_id: string | null;
      readonly individual_name: string | null;
      readonly company_name: string | null;
      readonly email: string | null;
      readonly mobile_phone: string | null;
      readonly office_phone: string | null;
      readonly status: string;
      readonly memo: string | null;
      readonly _local?: {
          readonly isOptimistic: boolean;
      } | undefined;
  };

}
declare module '@layerfi/components/types/api' {
  export interface PaginationMetadata {
      sort_by?: string;
      sort_order: string;
      cursor?: string;
      has_more: boolean;
  }
  export type Metadata = {
      pagination?: PaginationMetadata;
  };

}
declare module '@layerfi/components/types/authentication' {
  export type OAuthResponse = {
      access_token: string;
      token_type: string;
      expires_in: number;
  };
  export type ExpiringOAuthResponse = OAuthResponse & {
      expires_at: Date;
  };

}
declare module '@layerfi/components/types/balance_sheet' {
  import { LineItem } from '@layerfi/components/types/line_item';
  export interface BalanceSheet {
      business_id: string;
      type: 'Balance_Sheet';
      effective_date: string;
      start_date: string;
      end_date: string;
      assets: LineItem;
      liabilities_and_equity: LineItem;
      fully_categorized: boolean;
  }

}
declare module '@layerfi/components/types/bank_transactions' {
  import type { CustomerSchema } from '@layerfi/components/schemas/customer';
  import type { VendorSchema } from '@layerfi/components/schemas/vendor';
  import { MatchDetailsType } from '@layerfi/components/schemas/match';
  import { Categorization, CategorizationStatus, Category } from '@layerfi/components/types/categories';
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  import type { TransactionTagEncoded } from '@layerfi/components/features/tags/tagSchemas';
  export enum Direction {
      CREDIT = "CREDIT",
      DEBIT = "DEBIT"
  }
  export enum BankTransactionMatchType {
      CONFIRM_MATCH = "Confirm_Match"
  }
  export enum DisplayState {
      all = "all",
      review = "review",
      categorized = "categorized"
  }
  export type CategoryWithEntries = Category & {
      entries?: Array<CategoryEntry>;
  };
  type CategoryEntry = {
      type?: string;
      amount?: number;
      category: CategoryWithEntries;
  };
  export interface BankTransaction extends Record<string, unknown> {
      type: 'Bank_Transaction';
      account_name?: string;
      business_id: string;
      recently_categorized?: boolean;
      id: string;
      date: string;
      source: string;
      source_transaction_id: string;
      source_account_id: string;
      imported_at: string;
      description: string | null;
      amount: number;
      direction: Direction;
      counterparty_name: string;
      category: CategoryWithEntries | null;
      categorization_status: CategorizationStatus;
      categorization_flow: Categorization | null;
      categorization_method: string;
      error?: string;
      processing?: boolean;
      suggested_matches?: SuggestedMatch[];
      match?: BankTransactionMatch;
      document_ids: string[];
      transaction_tags: ReadonlyArray<TransactionTagEncoded>;
      customer: typeof CustomerSchema.Encoded | null;
      vendor: typeof VendorSchema.Encoded | null;
  }
  export interface SuggestedMatch {
      id: string;
      matchType: string;
      details: MatchDetailsType;
  }
  export interface BankTransactionMatch {
      bank_transaction: BankTransaction;
      id: string;
      match_type: string;
      details: MatchDetailsType;
  }
  export interface BankTransactionMetadata {
      memo: string | null;
  }
  export interface DocumentS3Urls {
      type: 'Document_S3_Urls';
      documentUrls: S3PresignedUrl[];
  }
  export {};

}
declare module '@layerfi/components/types/bills' {
  import type { TransactionTagEncoded } from '@layerfi/components/features/tags/tagSchemas';
  import { Vendor } from '@layerfi/components/types/vendors';
  const UNPAID_STATUS_MAP: {
      readonly SENT: "SENT";
      readonly PARTIALLY_PAID: "PARTIALLY_PAID";
      readonly RECEIVED: "RECEIVED";
  };
  export type UnpaidStatuses = typeof UNPAID_STATUS_MAP[keyof typeof UNPAID_STATUS_MAP];
  export const UNPAID_STATUSES: ("SENT" | "PARTIALLY_PAID" | "RECEIVED")[];
  const PAID_STATUS_MAP: {
      readonly PAID: "PAID";
  };
  export type PaidStatuses = typeof PAID_STATUS_MAP[keyof typeof PAID_STATUS_MAP];
  export const PAID_STATUS: "PAID";
  const VOIDED_STATUS_MAP: {
      readonly VOIDED: "VOIDED";
  };
  export type VoidedStatuses = typeof VOIDED_STATUS_MAP[keyof typeof VOIDED_STATUS_MAP];
  export const VOIDED_STATUS: "VOIDED";
  export type BillStatus = UnpaidStatuses | PaidStatuses | VoidedStatuses;
  export type BillTerm = 'DUE_ON_RECEIPT' | 'NET_10' | 'NET_15' | 'NET_30' | 'NET_60';
  export const BillTerms: {
      id: BillTerm;
      label: string;
  }[];
  export type Bill = {
      additional_sales_taxes: SalesTax[];
      additional_sales_taxes_total: number;
      bill_number: string;
      business_id: string;
      due_at: string;
      external_id: string;
      id: string;
      imported_at: string;
      line_items: BillLineItem[];
      outstanding_balance: number;
      paid_at?: string;
      payment_allocations: BillPaymentAllocation[];
      received_at: string;
      status: BillStatus;
      subtotal: number;
      terms: BillTerm;
      total_amount: number;
      transaction_tags: TransactionTagEncoded[];
      type: 'Bill';
      updated_at: string;
      voided_at: string | null;
      vendor: Vendor;
  };
  export type BillLineItem = {
      account_identifier?: {
          type: string;
          id: string;
      };
      bill_id: string;
      description: string;
      external_id: string;
      id: string;
      product_name: string;
      quantity: number;
      sales_taxes: SalesTax[] | null;
      sales_taxes_total?: number;
      subtotal: number;
      total_amount: number | string | null;
      unit_price: number;
      discount_amount?: number;
  };
  type BillPaymentAllocation = {
      bill_id: string;
      payment_id: string;
      amount: number;
      transaction_tags: TransactionTagEncoded[];
  };
  export type SalesTax = {
      amount: number;
      tax_account: TaxAccount;
  };
  type TaxAccount = {
      id?: string;
      name?: string;
      type?: string;
  };
  export const BillPaymentMethods: {
      readonly ACH: "ACH";
      readonly CASH: "Cash";
      readonly CHECK: "Check";
      readonly CREDIT_CARD: "Credit card";
      readonly CREDIT_BALANCE: "Credit balance";
      readonly OTHER: "Other";
  };
  export type BillPaymentMethod = typeof BillPaymentMethods[keyof typeof BillPaymentMethods];
  type BillPaymentPaymentAllocation = {
      amount: number;
      bill_id?: string;
      bill_external_id?: string;
  };
  export type BillPayment = {
      paid_at: string;
      method: BillPaymentMethod;
      amount: number;
      bill_payment_allocations: BillPaymentPaymentAllocation[];
  };
  export {};

}
declare module '@layerfi/components/types/business' {
  import { USStateCode } from '@layerfi/components/types/location';
  export interface Business {
      id: string;
      activation_at?: string;
      archived_at?: string;
      entity_type?: EntityType;
      external_id?: string;
      imported_at?: string;
      industry?: string;
      legal_name?: string;
      phone_number?: string;
      sms_categorization_start_date?: string;
      sms_enabled?: boolean;
      tin?: string;
      type?: string;
      updated_at?: string;
      us_state?: USStateCode;
  }
  export const ENTITY_TYPES: readonly [{
      readonly value: "SOLE_PROP";
      readonly label: "Sole Proprietorship";
  }, {
      readonly value: "C_CORP";
      readonly label: "C Corporation";
  }, {
      readonly value: "LLC";
      readonly label: "Limited Liability Company";
  }, {
      readonly value: "S_CORP";
      readonly label: "S Corporation";
  }, {
      readonly value: "PARTNERSHIP";
      readonly label: "Partnership";
  }];
  export type EntityType = (typeof ENTITY_TYPES)[number]['value'];

}
declare module '@layerfi/components/types/categories' {
  export enum CategoriesListMode {
      All = "ALL",
      Expenses = "EXPENSES",
      Revenue = "REVENUE",
      Default = "DEFAULT"
  }
  export enum CategorizationStatus {
      PENDING = "PENDING",
      READY_FOR_INPUT = "READY_FOR_INPUT",
      LAYER_REVIEW = "LAYER_REVIEW",
      CATEGORIZED = "CATEGORIZED",
      SPLIT = "SPLIT",
      JOURNALING = "JOURNALING",
      MATCHED = "MATCHED"
  }
  type BaseCategory = {
      display_name: string;
      category: string;
      subCategories: Array<Category> | null;
      description: string | null;
  };
  type AccountNestedCategory = {
      type: 'AccountNested';
      id: string;
      stable_name: string | null;
  } & BaseCategory;
  type OptionalAccountNestedCategory = {
      type: 'OptionalAccountNested';
      stable_name: string;
  } & BaseCategory;
  type ExclusionNestedCategory = {
      type: 'ExclusionNested';
      id: string;
  } & BaseCategory;
  export type Category = AccountNestedCategory | OptionalAccountNestedCategory | ExclusionNestedCategory;
  export function isAccountNestedCategory(v: Category): v is AccountNestedCategory;
  export function isOptionalAccountNestedCategory(v: Category): v is OptionalAccountNestedCategory;
  export function isExclusionNestedCategory(v: Category): v is ExclusionNestedCategory;
  export enum CategorizationType {
      AUTO = "AUTO",
      ASK_FROM_SUGGESTIONS = "ASK_FROM_SUGGESTIONS",
      MEALS = "MEALS",
      BUSINESS_TRAVEL_TRANSPORTATION = "BUSINESS_TRAVEL_TRANSPORTATION"
  }
  export interface AutoCategorization {
      type: CategorizationType.AUTO;
      category: Category;
  }
  export interface SuggestedCategorization {
      type: CategorizationType;
      suggestions: Category[];
  }
  export type Categorization = AutoCategorization | SuggestedCategorization;
  export type AccountIdentifierPayloadObject = {
      type: 'StableName';
      stable_name: string;
  } | {
      type: 'AccountId';
      id: string;
  } | {
      type: 'Exclusion';
      exclusion_type: string;
  };
  export type SingleCategoryUpdate = {
      type: 'Category';
      category: AccountIdentifierPayloadObject;
  };
  export type SplitCategoryUpdate = {
      type: 'Split';
      entries: {
          category: string | AccountIdentifierPayloadObject;
          amount: number;
      }[];
  };
  export type CategoryUpdate = SingleCategoryUpdate | SplitCategoryUpdate;
  export function hasSuggestions(categorization: Categorization | null): categorization is SuggestedCategorization;
  export {};

}
declare module '@layerfi/components/types/chart_of_accounts' {
  import { Direction } from '@layerfi/components/types/bank_transactions';
  import { NestedLedgerAccountType } from '@layerfi/components/schemas/generalLedger/ledgerAccount';
  export type AugmentedLedgerAccountBalance = NestedLedgerAccountType & {
      isMatching?: true;
  };
  export type NewAccount = {
      name: string;
      account_number?: string;
      normality: Direction;
      parent_id?: {
          type: 'AccountId';
          id: string;
      };
      account_type: string;
      account_subtype?: string;
  };
  export type EditAccount = {
      stable_name?: {
          type: 'StableName';
          stable_name: string;
      };
      name: string;
      account_number?: string;
      normality: Direction;
      parent_id?: {
          type: 'AccountId';
          id: string;
      };
      account_type: string;
      account_subtype?: string;
  };
  export type NewChildAccount = {
      name: string;
      stable_name?: {
          type: 'StableName';
          stable_name: string;
      };
  };
  export enum LedgerAccountNodeType {
      Leaf = "Leaf",
      Root = "Root",
      Parent = "Parent"
  }
  export type LedgerAccountBalanceWithNodeType = NestedLedgerAccountType & {
      nodeType: LedgerAccountNodeType;
  };

}
declare module '@layerfi/components/types/file_upload' {
  export interface FileMetadata {
      type: 'File_Metadata';
      id: string | null;
      fileType: string;
      fileName: string;
      documentType: DocumentType;
  }
  export type DocumentType = 'RECEIPT' | 'BANK_STATEMENT' | 'LOAN_STATEMENT' | 'PAYROLL_STATEMENT' | 'PAYOUT_STATEMENT' | 'OTHER';

}
declare module '@layerfi/components/types/general' {
  export type SortDirection = 'asc' | 'desc';
  export type View = 'mobile' | 'tablet' | 'desktop';
  export interface BaseSelectOption {
      label: string;
      value: string | number;
  }
  export interface S3PresignedUrl {
      type: 'S3_Presigned_Url';
      presignedUrl: string;
      fileType: string;
      fileName: string;
      createdAt: string;
      documentId?: string;
  }
  export type LoadedStatus = 'initial' | 'loading' | 'complete';
  export enum DataModel {
      BUSINESS = "BUSINESS",
      BALANCE_SHEET = "BALANCE_SHEET",
      BANK_TRANSACTIONS = "BANK_TRANSACTIONS",
      BILLS = "BILLS",
      LEDGER_ACCOUNTS = "LEDGER_ACCOUNTS",
      LINKED_ACCOUNTS = "LINKED_ACCOUNTS",
      PROFIT_AND_LOSS = "PROFIT_AND_LOSS",
      STATEMENT_OF_CASH_FLOWS = "STATEMENT_OF_CASH_FLOWS"
  }

}
declare module '@layerfi/components/types/journal' {
  import type { TransactionTagEncoded } from '@layerfi/components/features/tags/tagSchemas';
  import { LedgerEntrySourceType } from '@layerfi/components/schemas/generalLedger/ledgerEntrySource';
  import { LedgerEntryDirection, SingleChartAccountEncodedType } from '@layerfi/components/schemas/generalLedger/ledgerAccount';
  import { AccountIdentifierPayloadObject } from '@layerfi/components/types/categories';
  export interface JournalEntry {
      id: string;
      business_id: string;
      ledger_id: string;
      entry_type: string;
      entry_number: number;
      date: string;
      entry_at: string;
      reversal_of_id: string | null;
      reversal_id: string | null;
      line_items: JournalEntryLine[];
      source?: LedgerEntrySourceType;
      transaction_tags: ReadonlyArray<TransactionTagEncoded>;
  }
  export interface JournalEntryLine {
      id: string;
      entry_id: string;
      account: SingleChartAccountEncodedType;
      amount: number;
      direction: LedgerEntryDirection;
      entry_at: string;
      createdAt: string;
  }
  export type NewApiJournalEntry = {
      entry_at: string;
      created_by: string;
      memo: string;
      line_items: NewApiJournalEntryLineItem[];
  };
  export type NewApiJournalEntryLineItem = {
      account_identifier: AccountIdentifierPayloadObject;
      amount: number;
      direction: LedgerEntryDirection;
  };
  export type NewFormJournalEntry = {
      entry_at: string;
      created_by: string;
      memo: string;
      line_items: JournalEntryLineItem[];
  };
  export type JournalEntryLineItem = {
      account_identifier: {
          type: string;
          stable_name: string | null;
          id: string;
          name: string;
          subType: {
              value: string;
              label: string;
          } | undefined;
      };
      amount: number;
      direction: LedgerEntryDirection;
  };
  export type ApiAccountType = {
      value: string;
      display_name: string;
  };
  export type LedgerAccountBalance = {
      id: string;
      name: string;
      stable_name: string;
      account_number: string | null;
      account_type: ApiAccountType;
      account_subtype?: ApiAccountType;
      normality: LedgerEntryDirection;
      balance: number;
      is_deletable: boolean;
      sub_accounts: LedgerAccountBalance[];
  };

}
declare module '@layerfi/components/types/layer_context' {
  import { ToastProps } from '@layerfi/components/components/Toast/Toast';
  import { LayerError } from '@layerfi/components/models/ErrorHandler';
  import { EventCallbacks } from '@layerfi/components/providers/LayerProvider/LayerProvider';
  import { AccountingConfigurationSchemaType } from '@layerfi/components/schemas/accountingConfiguration';
  import { Business } from '@layerfi/components/types';
  import { DataModel } from '@layerfi/components/types/general';
  export type LayerContextValues = {
      businessId: string;
      business?: Business;
      theme?: LayerThemeConfig;
      colors: ColorsPalette;
      onboardingStep?: OnboardingStep;
      toasts: (ToastProps & {
          isExiting: boolean;
      })[];
      eventCallbacks?: EventCallbacks;
      accountingConfiguration?: AccountingConfigurationSchemaType;
  };
  export type LayerContextHelpers = {
      getColor: (shade: number) => ColorsPaletteOption | undefined;
      setLightColor: (color?: ColorConfig) => void;
      setDarkColor: (color?: ColorConfig) => void;
      setTextColor: (color?: ColorConfig) => void;
      setColors: (colors?: LayerThemeConfigColors) => void;
      setOnboardingStep: (value: OnboardingStep) => void;
      addToast: (toast: ToastProps) => void;
      removeToast: (toast: ToastProps) => void;
      onError?: (error: LayerError) => void;
      touch: (model: DataModel) => void;
      read: (model: DataModel, cacheKey: string) => void;
      syncTimestamps: Partial<Record<DataModel, number>>;
      readTimestamps: Partial<Record<string, {
          t: number;
          m: DataModel;
      }>>;
      expireDataCaches: () => void;
      hasBeenTouched: (cacheKey: string) => boolean;
  };
  export interface ColorHSLConfig {
      h: string;
      s: string;
      l: string;
  }
  export interface ColorHSLNumberConfig {
      h: number;
      s: number;
      l: number;
  }
  export interface ColorRGBConfig {
      r: string;
      g: string;
      b: string;
  }
  export interface ColorRGBNumberConfig {
      r: number;
      g: number;
      b: number;
  }
  export interface ColorHexConfig {
      hex: string;
  }
  export type ColorConfig = ColorHSLConfig | ColorRGBConfig | ColorHexConfig;
  export interface ColorsPaletteOption {
      hsl: ColorHSLNumberConfig;
      rgb: ColorRGBNumberConfig;
      hex: string;
  }
  export type ColorsPalette = Record<number, ColorsPaletteOption>;
  export interface LayerThemeConfigColors {
      dark?: ColorConfig;
      light?: ColorConfig;
      text?: ColorConfig;
  }
  export interface LayerThemeConfig {
      colors?: LayerThemeConfigColors;
  }
  export type OnboardingStep = undefined | 'connectAccount' | 'complete';
  export enum LayerContextActionName {
      setBusiness = "LayerContext.setBusiness",
      setTheme = "LayerContext.setTheme",
      setOnboardingStep = "LayerContext.setOnboardingStep",
      setColors = "LayerContext.setColors",
      setToast = "LayerContext.setToast",
      removeToast = "LayerContext.removeToast",
      setToastExit = "LayerContext.setToastExit"
  }
  export type LayerContextAction = {
      type: LayerContextActionName.setBusiness;
      payload: {
          business: LayerContextValues['business'];
      };
  } | {
      type: LayerContextActionName.setTheme;
      payload: {
          theme: LayerContextValues['theme'];
      };
  } | {
      type: LayerContextActionName.setOnboardingStep;
      payload: {
          onboardingStep: LayerContextValues['onboardingStep'];
      };
  } | {
      type: LayerContextActionName.setColors;
      payload: {
          colors: LayerContextValues['colors'];
      };
  } | {
      type: LayerContextActionName.setToast;
      payload: {
          toast: ToastProps;
      };
  } | {
      type: LayerContextActionName.removeToast;
      payload: {
          toast: ToastProps;
      };
  } | {
      type: LayerContextActionName.setToastExit;
      payload: {
          toast: ToastProps;
      };
  };

}
declare module '@layerfi/components/types/ledger_accounts' {
  import { LedgerEntrySourceType } from '@layerfi/components/schemas/generalLedger/ledgerEntrySource';
  import { BankTransaction, Direction } from '@layerfi/components/types/bank_transactions';
  export type LedgerAccountLineItems = LedgerAccountLineItem[];
  export interface LedgerAccountsEntry {
      business_id: string;
      date: string;
      entry_at: string;
      entry_number?: number;
      entry_type: string;
      id: string;
      invoice?: Record<string, string>;
      ledger_id: string;
      line_items: LedgerAccountLineItem[];
      reversal_id?: string;
      reversal_of_id?: string;
      type: string;
      transaction?: BankTransaction;
      source?: LedgerEntrySourceType;
  }
  export interface LedgerAccountsAccount {
      always_show_in_pnl?: boolean;
      id: string;
      name: string;
      normality: string;
      pnl_category?: string;
      stable_name: string;
  }
  export interface LedgerAccountLineItem {
      id: string;
      entry_id: string;
      entry_number?: number;
      account: LedgerAccountsAccount;
      amount: number;
      direction: Direction;
      date: string;
      source?: LedgerEntrySourceType;
      running_balance: number;
      entry_reversal_of?: string;
      entry_reversed_by?: string;
  }

}
declare module '@layerfi/components/types/line_item' {
  export interface LineItem {
      name: string;
      display_name: string;
      value: number | undefined;
      line_items?: LineItem[] | null;
      is_contra?: boolean;
  }

}
declare module '@layerfi/components/types/linked_accounts' {
  import type { PlaidInstitution } from 'react-plaid-link';
  import type { EnumWithUnknownValues } from '@layerfi/components/types/utility/enumWithUnknownValues';
  export type PublicToken = {
      public_token: string;
      institution: PlaidInstitution | null;
  };
  export type AccountSource = EnumWithUnknownValues<'PLAID' | 'STRIPE'>;
  const _KNOWN_ACCOUNT_NOTIFICATION_TYPES: readonly ["CONFIRM_RELEVANT", "CONFIRM_UNIQUE", "OPENING_BALANCE_MISSING"];
  type KnownAccountNotificationType = (typeof _KNOWN_ACCOUNT_NOTIFICATION_TYPES)[number];
  const _KNOWN_ACCOUNT_NOTIFICATION_SCOPES: readonly ["USER"];
  type KnownAccountNotificationScope = (typeof _KNOWN_ACCOUNT_NOTIFICATION_SCOPES)[number];
  type AccountNotificationType = EnumWithUnknownValues<KnownAccountNotificationType>;
  type AccountNotificationScope = EnumWithUnknownValues<KnownAccountNotificationScope>;
  type AccountNotification = {
      type: AccountNotificationType;
      scope: AccountNotificationScope;
  };
  export type LinkedAccount = {
      id: string;
      external_account_external_id: string;
      external_account_source: AccountSource;
      external_account_name: string;
      latest_balance_timestamp: {
          external_account_external_id: string;
          external_account_source: AccountSource;
          balance: number;
          at: string;
          created_at: string;
      };
      current_ledger_balance: number;
      institution: {
          name: string;
          logo: string | null;
      } | null;
      notifications?: ReadonlyArray<AccountNotification>;
      mask?: string;
      connection_id?: string;
      connection_external_id?: string;
      connection_needs_repair_as_of: string | null;
      is_syncing: boolean;
      user_created: boolean;
      reconnect_with_new_credentials: boolean;
  };
  export type LinkedAccounts = {
      type: string;
      external_accounts: Array<LinkedAccount>;
  };
  export type FinancialAccountInstitution = {
      id: string;
      name: string;
      logo: string | null;
  };
  export type BankAccount = {
      id: string;
      account_name: string | null;
      ledger_account_id: string;
      notes: string | null;
      institution: FinancialAccountInstitution | null;
      account_type: AccountType;
      account_subtype: AccountSubtype;
      notify_when_disconnected: boolean;
      is_disconnected: boolean;
      archived_at: string | null;
      external_accounts: LinkedAccount[];
  };
  export type AccountType = 'DEPOSITORY' | 'CREDIT' | 'LOAN';
  export type AccountSubtype = '_401A' | '_401K' | '_403B' | '_457B' | '_529' | 'BROKERAGE' | 'CASH_ISA' | 'CRYPTO_EXCHANGE' | 'EDUCATION_SAVINGS_ACCOUNT' | 'EBT' | 'FIXED_ANNUITY' | 'GIC' | 'HEALTH_REIMBURSEMENT_ARRANGEMENT' | 'HSA' | 'ISA' | 'IRA' | 'LIF' | 'LIFE_INSURANCE' | 'LIRA' | 'LRIF' | 'LRSP' | 'NON_CUSTODIAL_WALLET' | 'NON_TAXABLE_BROKERAGE_ACCOUNT' | 'OTHER' | 'OTHER_INSURANCE' | 'OTHER_ANNUITY' | 'PRIF' | 'RDSP' | 'RESP' | 'RLIF' | 'RRIF' | 'PENSION' | 'PROFIT_SHARING_PLAN' | 'RETIREMENT' | 'ROTH' | 'ROTH_401K' | 'RRSP' | 'SEP_IRA' | 'SIMPLE_IRA' | 'SIPP' | 'STOCK_PLAN' | 'THRIFT_SAVINGS_PLAN' | 'TFSA' | 'TRUST' | 'UGMA' | 'UTMA' | 'VARIABLE_ANNUITY' | 'CREDIT_CARD' | 'PAYPAL' | 'CD' | 'CHECKING' | 'SAVINGS' | 'MONEY_MARKET' | 'PREPAID' | 'AUTO' | 'BUSINESS' | 'COMMERCIAL' | 'CONSTRUCTION' | 'CONSUMER' | 'HOME_EQUITY' | 'LOAN' | 'MORTGAGE' | 'OVERDRAFT' | 'LINE_OF_CREDIT' | 'STUDENT' | 'CASH_MANAGEMENT' | 'KEOGH' | 'MUTUAL_FUND' | 'RECURRING' | 'REWARDS' | 'SAFE_DEPOSIT' | 'SARSEP' | 'PAYROLL' | 'NULL' | 'ENUM_UNKNOWN';
  export {};

}
declare module '@layerfi/components/types/location' {
  export const US_STATES: readonly [{
      readonly value: "AL";
      readonly label: "Alabama";
  }, {
      readonly value: "AK";
      readonly label: "Alaska";
  }, {
      readonly value: "AZ";
      readonly label: "Arizona";
  }, {
      readonly value: "AR";
      readonly label: "Arkansas";
  }, {
      readonly value: "CA";
      readonly label: "California";
  }, {
      readonly value: "CO";
      readonly label: "Colorado";
  }, {
      readonly value: "CT";
      readonly label: "Connecticut";
  }, {
      readonly value: "DE";
      readonly label: "Delaware";
  }, {
      readonly value: "DC";
      readonly label: "District of Columbia";
  }, {
      readonly value: "FL";
      readonly label: "Florida";
  }, {
      readonly value: "GA";
      readonly label: "Georgia";
  }, {
      readonly value: "HI";
      readonly label: "Hawaii";
  }, {
      readonly value: "ID";
      readonly label: "Idaho";
  }, {
      readonly value: "IL";
      readonly label: "Illinois";
  }, {
      readonly value: "IN";
      readonly label: "Indiana";
  }, {
      readonly value: "IA";
      readonly label: "Iowa";
  }, {
      readonly value: "KS";
      readonly label: "Kansas";
  }, {
      readonly value: "KY";
      readonly label: "Kentucky";
  }, {
      readonly value: "LA";
      readonly label: "Louisiana";
  }, {
      readonly value: "ME";
      readonly label: "Maine";
  }, {
      readonly value: "MD";
      readonly label: "Maryland";
  }, {
      readonly value: "MA";
      readonly label: "Massachusetts";
  }, {
      readonly value: "MI";
      readonly label: "Michigan";
  }, {
      readonly value: "MN";
      readonly label: "Minnesota";
  }, {
      readonly value: "MS";
      readonly label: "Mississippi";
  }, {
      readonly value: "MO";
      readonly label: "Missouri";
  }, {
      readonly value: "MT";
      readonly label: "Montana";
  }, {
      readonly value: "NE";
      readonly label: "Nebraska";
  }, {
      readonly value: "NV";
      readonly label: "Nevada";
  }, {
      readonly value: "NH";
      readonly label: "New Hampshire";
  }, {
      readonly value: "NJ";
      readonly label: "New Jersey";
  }, {
      readonly value: "NM";
      readonly label: "New Mexico";
  }, {
      readonly value: "NY";
      readonly label: "New York";
  }, {
      readonly value: "NC";
      readonly label: "North Carolina";
  }, {
      readonly value: "ND";
      readonly label: "North Dakota";
  }, {
      readonly value: "OH";
      readonly label: "Ohio";
  }, {
      readonly value: "OK";
      readonly label: "Oklahoma";
  }, {
      readonly value: "OR";
      readonly label: "Oregon";
  }, {
      readonly value: "PA";
      readonly label: "Pennsylvania";
  }, {
      readonly value: "RI";
      readonly label: "Rhode Island";
  }, {
      readonly value: "SC";
      readonly label: "South Carolina";
  }, {
      readonly value: "SD";
      readonly label: "South Dakota";
  }, {
      readonly value: "TN";
      readonly label: "Tennessee";
  }, {
      readonly value: "TX";
      readonly label: "Texas";
  }, {
      readonly value: "UT";
      readonly label: "Utah";
  }, {
      readonly value: "VT";
      readonly label: "Vermont";
  }, {
      readonly value: "VA";
      readonly label: "Virginia";
  }, {
      readonly value: "WA";
      readonly label: "Washington";
  }, {
      readonly value: "WV";
      readonly label: "West Virginia";
  }, {
      readonly value: "WI";
      readonly label: "Wisconsin";
  }, {
      readonly value: "WY";
      readonly label: "Wyoming";
  }, {
      readonly value: "PR";
      readonly label: "Puerto Rico";
  }];
  export type USState = typeof US_STATES[number];
  export type USStateCode = USState['value'];

}
declare module '@layerfi/components/types/profit_and_loss' {
  import type { ReportingBasis } from '@layerfi/components/types';
  import { ReadonlyArrayWithAtLeastOne } from '@layerfi/components/utils/array/getArrayWithAtLeastOneOrFallback';
  import { LineItem } from '@layerfi/components/utils/schema/utils';
  import { TagViewConfig } from '@layerfi/components/types/tags';
  export interface TagComparisonOption {
      displayName: string;
      tagFilterConfig: TagViewConfig;
  }
  export interface ProfitAndLossCompareConfig {
      tagComparisonOptions: TagComparisonOption[];
      defaultTagFilter: TagComparisonOption;
      defaultPeriods?: number;
  }
  export interface ProfitAndLossComparison {
      type: string;
      pnls: ProfitAndLossComparisonItem[];
  }
  export interface ProfitAndLossComparisonPnl {
      business_id: string;
      start_date: string;
      end_date: string;
      income: LineItem;
      cost_of_goods_sold: LineItem;
      gross_profit: number;
      expenses: LineItem;
      profit_before_taxes: number;
      taxes: LineItem;
      net_profit: number;
      other_outflows?: LineItem | null;
      personal_expenses?: LineItem | null;
      fully_categorized: boolean;
  }
  type ProfitAndLossComparisonPeriods = {
      type: 'Comparison_Months';
      months: ReadonlyArrayWithAtLeastOne<{
          year: number;
          month: number;
      }>;
  } | {
      type: 'Comparison_Years';
      years: ReadonlyArrayWithAtLeastOne<{
          year: number;
      }>;
  } | {
      type: 'Comparison_Date_Ranges';
      date_ranges: ReadonlyArrayWithAtLeastOne<{
          start_date: string;
          end_date: string;
      }>;
  };
  export type ProfitAndLossComparisonTags = {
      structure: string | undefined;
      required_tags?: ReadonlyArray<{
          key: string;
          value: string;
      }>;
  };
  export type ProfitAndLossComparisonRequestBody = {
      periods: ProfitAndLossComparisonPeriods;
      tag_filters?: ReadonlyArrayWithAtLeastOne<ProfitAndLossComparisonTags>;
      reporting_basis?: ReportingBasis;
  };
  export interface ProfitAndLossComparisonItem {
      period: {
          type: string;
          year?: number;
          month?: number;
          start_date?: string;
          end_date?: string;
      };
      tag_filter?: {
          key: string;
          values: string[];
      };
      pnl: ProfitAndLossComparisonPnl;
  }
  export {};

}
declare module '@layerfi/components/types/quickbooks' {
  export enum QuickbooksConnectionLastSyncStatus {
      SYNC_SUCCESS = "SYNC_SUCCESS",
      SYNC_FAILURE = "SYNC_FAILURE"
  }
  export type StatusOfQuickbooksConnection = {
      is_connected: boolean;
      is_syncing: boolean;
      last_synced_at?: string;
      last_sync_status?: QuickbooksConnectionLastSyncStatus;
  };

}
declare module '@layerfi/components/types/statement_of_cash_flow' {
  import { LineItem } from '@layerfi/components/types/line_item';
  export interface StatementOfCashFlow {
      business_id: string;
      type: 'Cashflow_Statement';
      start_date: string;
      end_date: string;
      financing_activities: LineItem;
      investing_activities: LineItem;
      operating_activities: LineItem;
      period_net_cash_increase: number;
      cash_at_end_of_period: number;
  }

}
declare module '@layerfi/components/types/table' {
  import { CSSProperties, ReactNode } from 'react';
  export interface TableContextProps {
      expandedRows: string[];
      setExpandedRows: (rowKey: string) => void;
      expandAllRows: (rowKeys: string[]) => void;
      expandedAllRows: boolean;
      setExpandedAllRows: (expanded: boolean) => void;
  }
  export enum TableCellAlign {
      RIGHT = "right",
      LEFT = "left"
  }
  export interface TableProps {
      children: ReactNode | ReactNode[];
      componentName?: string;
      borderCollapse?: 'collapse' | 'separate';
      bottomSpacing?: boolean;
  }
  export interface TableHeadProps {
      children: React.ReactNode;
  }
  export interface TableBodyProps {
      children: ReactNode | ReactNode[];
  }
  export interface TableRowProps {
      rowKey: string;
      children: ReactNode;
      depth?: number;
      expandable?: boolean;
      variant?: 'expandable' | 'main' | 'default' | 'summation';
      withDivider?: boolean;
      withDividerPosition?: 'top' | 'bottom';
      isExpanded?: boolean;
      handleExpand?: () => void;
      onClick?: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
      isHeadRow?: boolean;
      selected?: boolean;
  }
  export interface TableCellProps {
      children?: number | string | ReactNode;
      className?: string;
      isCurrency?: boolean;
      isHeaderCell?: boolean;
      align?: TableCellAlign;
      primary?: boolean;
      nowrap?: boolean;
      withExpandIcon?: boolean;
      fullWidth?: boolean;
      width?: string;
      style?: CSSProperties;
      colSpan?: number;
      onClick?: (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void;
  }

}
declare module '@layerfi/components/types/tags' {
  export type TagFilterInput = {
      tagKey: string;
      tagValues: string[];
  } | 'None';
  export type TagViewConfig = {
      structure?: string;
      tagFilters: TagFilterInput;
  };

}
declare module '@layerfi/components/types/tasks' {
  import { DocumentType } from '@layerfi/components/types/file_upload';
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  type Document = {
      document_type: DocumentType;
      file_name: string;
      presigned_url: S3PresignedUrl;
  };
  export type RawTask = {
      id: string;
      question: string;
      status: TasksStatus;
      title: string;
      transaction_id: string | null;
      type: string;
      user_marked_completed_at: string | null;
      user_response: string | null;
      user_response_type: TasksResponseType;
      archived_at: string | null;
      completed_at: string | null;
      created_at: string;
      updated_at: string;
      effective_date: string;
      document_type: DocumentType;
      documents: Document[];
  };
  const _TASKS_STATUSES: readonly ["TODO", "USER_MARKED_COMPLETED", "COMPLETED", "ARCHIVED"];
  export type TasksStatus = typeof _TASKS_STATUSES[number];
  export type TasksResponseType = 'FREE_RESPONSE' | 'UPLOAD_DOCUMENT';
  export {};

}
declare module '@layerfi/components/types/utility/branded' {
  const LayerBrandTypeId: unique symbol;
  type LayerBrand<in out ID extends string | symbol> = {
      readonly [LayerBrandTypeId]: {
          readonly [id in ID]: ID;
      };
  };
  type LayerBranded<T, ID extends string | symbol> = T & LayerBrand<ID>;
  export type EmailAddress = LayerBranded<string, 'EmailAddress'>;
  export type PhoneNumber = LayerBranded<string, 'PhoneNumber'>;
  export {};

}
declare module '@layerfi/components/types/utility/enumWithUnknownValues' {
  type UnknownEnumValue = string & Record<never, never>;
  export type EnumWithUnknownValues<T extends string> = T | UnknownEnumValue;
  export {};

}
declare module '@layerfi/components/types/utility/oneOf' {
  type OnlyFirst<First, Second> = First & {
      [Key in keyof Omit<Second, keyof First>]?: never;
  };
  type MergeTypes<Types extends Array<unknown>, Result = Record<never, never>> = Types extends [infer Head, ...infer Remaining] ? MergeTypes<Remaining, Result & Head> : Result;
  export type OneOf<Types extends Array<unknown>, Result = never, AllProperties = MergeTypes<Types>> = Types extends [infer Head, ...infer Remaining] ? OneOf<Remaining, Result | OnlyFirst<Head, AllProperties>, AllProperties> : Result;
  export {};

}
declare module '@layerfi/components/types/utility/pagination' {
  import { Schema } from 'effect';
  export enum SortOrder {
      ASC = "ASC",
      ASCENDING = "ASCENDING",
      DES = "DES",
      DESC = "DESC",
      DESCENDING = "DESCENDING"
  }
  export type SortParams<T> = {
      sortBy?: T;
      sortOrder?: SortOrder;
  };
  export type PaginationParams = {
      cursor?: string | null;
      limit?: number;
      showTotalCount?: boolean;
  };
  export const PaginatedResponseMetaSchema: Schema.Struct<{
      cursor: Schema.NullOr<typeof Schema.String>;
      hasMore: Schema.PropertySignature<":", boolean, "has_more", ":", boolean, false, never>;
      totalCount: Schema.PropertySignature<":", number | undefined, "total_count", ":", number | undefined, false, never>;
  }>;
  export type PaginatedResponseMeta = typeof PaginatedResponseMetaSchema.Type;

}
declare module '@layerfi/components/types/utility/promises' {
  export type Awaitable<T> = T | Promise<T>;

}
declare module '@layerfi/components/types/vendors' {
  export type VendorStatus = 'ACTIVE' | 'ARCHIVED';
  export type Vendor = {
      id: string;
      external_id: string;
      individual_name?: string;
      company_name?: string;
      email?: string;
      mobile_phone?: string;
      office_phone?: string;
      address_string?: string;
      notes?: string;
      status: VendorStatus;
  };

}
declare module '@layerfi/components/types' {
  import type { EnumWithUnknownValues } from '@layerfi/components/types/utility/enumWithUnknownValues';
  export { OAuthResponse } from '@layerfi/components/types/authentication';
  export { LayerContextValues, LayerContextActionName, LayerContextAction, LayerContextHelpers, } from '@layerfi/components/types/layer_context';
  export { Metadata } from '@layerfi/components/types/api';
  export { LineItem } from '@layerfi/components/types/line_item';
  export { BalanceSheet } from '@layerfi/components/types/balance_sheet';
  export { StatementOfCashFlow } from '@layerfi/components/types/statement_of_cash_flow';
  export { Direction, BankTransaction, DisplayState, SuggestedMatch, BankTransactionMatch, } from '@layerfi/components/types/bank_transactions';
  export { CategorizationStatus, Category, CategorizationType, AutoCategorization, SuggestedCategorization, SingleCategoryUpdate, SplitCategoryUpdate, CategoryUpdate, } from '@layerfi/components/types/categories';
  export { NewAccount, EditAccount, NewChildAccount, } from '@layerfi/components/types/chart_of_accounts';
  export { LedgerAccountLineItems as LedgerAccounts, LedgerAccountLineItem, LedgerAccountsAccount, LedgerAccountsEntry, } from '@layerfi/components/types/ledger_accounts';
  export { SortDirection } from '@layerfi/components/types/general';
  export { Business } from '@layerfi/components/types/business';
  export { Bill } from '@layerfi/components/types/bills';
  export interface FormError {
      field: string;
      message: string;
  }
  export interface FormErrorWithId extends FormError {
      id: number;
  }
  export { JournalEntry, JournalEntryLine, JournalEntryLineItem, } from '@layerfi/components/types/journal';
  export type DateRange<T = Date> = {
      startDate: T;
      endDate: T;
  };
  type StrictReportingBasis = 'CASH' | 'CASH_COLLECTED' | 'ACCRUAL';
  export type ReportingBasis = EnumWithUnknownValues<StrictReportingBasis>;
  export type MoneyFormat = 'CENTS' | 'DOLLAR_STRING';
  export type { LedgerEntrySourceType } from '@layerfi/components/schemas/generalLedger/ledgerEntrySource';

}
declare module '@layerfi/components/utils/array/getArrayWithAtLeastOneOrFallback' {
  export type ReadonlyArrayWithAtLeastOne<T> = readonly [T, ...T[]];
  export function isArrayWithAtLeastOne<T>(list: ReadonlyArray<T>): list is ReadonlyArrayWithAtLeastOne<T>;
  export function getArrayWithAtLeastOneOrFallback<T>(list: ReadonlyArray<T>, fallback: ReadonlyArrayWithAtLeastOne<T>): ReadonlyArrayWithAtLeastOne<T>;

}
declare module '@layerfi/components/utils/array/isStringArray' {
  export function isStringArray(input: unknown): input is ReadonlyArray<string>;

}
declare module '@layerfi/components/utils/array/range' {
  export function range(start: number, end: number): ReadonlyArray<number>;

}
declare module '@layerfi/components/utils/array/readonlyTransformations' {
  export function mapReadonly<S, T>(array: ReadonlyArray<S>, callbackFn: (value: S, index: number, array: ReadonlyArray<S>) => T): ReadonlyArray<T>;
  export function filterReadonly<T, S extends T>(array: ReadonlyArray<T>, predicate: (value: T, index: number, array: ReadonlyArray<T>) => value is S): ReadonlyArray<S>;

}
declare module '@layerfi/components/utils/bankTransactions' {
  import { CategoryOption } from '@layerfi/components/components/CategorySelect/CategorySelect';
  import { BankTransaction, DateRange } from '@layerfi/components/types';
  export const hasMatch: (bankTransaction?: BankTransaction) => boolean;
  export const isCredit: ({ direction }: Pick<BankTransaction, "direction">) => boolean;
  export const isAlreadyMatched: (bankTransaction?: BankTransaction) => string | undefined;
  export const countTransactionsToReview: ({ transactions, dateRange, }: {
      transactions?: BankTransaction[];
      dateRange?: DateRange;
  }) => number;
  export const getCategorizePayload: (category: CategoryOption) => {
      type: "Exclusion";
      exclusion_type: string;
      id?: undefined;
      stable_name?: undefined;
  } | {
      type: "AccountId";
      id: string;
      exclusion_type?: undefined;
      stable_name?: undefined;
  } | {
      type: "StableName";
      stable_name: string;
      exclusion_type?: undefined;
      id?: undefined;
  };
  export const hasReceipts: (bankTransaction?: BankTransaction) => boolean | undefined;

}
declare module '@layerfi/components/utils/bigDecimalUtils' {
  import { BigDecimal as BD } from 'effect';
  export const BIG_DECIMAL_ZERO: BD.BigDecimal;
  export const BIG_DECIMAL_ONE: BD.BigDecimal;
  export const BIG_DECIMAL_NEG_ONE: BD.BigDecimal;
  export const BIG_DECIMAL_ONE_HUNDRED: BD.BigDecimal;
  export const buildDecimalCharRegex: ({ allowNegative, allowPercent, allowDollar, }?: {
      allowNegative?: boolean | undefined;
      allowPercent?: boolean | undefined;
      allowDollar?: boolean | undefined;
  }) => RegExp;
  /**
   * Converts a BigDecimal dollar amount to its equivalent in cents as a number.
   * Example: 123.45 → 12345
   */
  export const convertBigDecimalToCents: (amount: BD.BigDecimal) => number;
  export const convertBigIntCentsToBigDecimal: (cents: bigint) => BD.BigDecimal;
  export const convertCentsToBigDecimal: (cents: number) => BD.BigDecimal;
  export const convertDecimalToPercent: (decimal: BD.BigDecimal) => BD.BigDecimal;
  export const convertPercentToDecimal: (percent: BD.BigDecimal) => BD.BigDecimal;
  export const roundDecimalToCents: (decimal: BD.BigDecimal) => BD.BigDecimal;
  export const safeDivide: (dividend: BD.BigDecimal, divisor: BD.BigDecimal) => BD.BigDecimal;
  export const negate: (value: BD.BigDecimal) => BD.BigDecimal;
  export function formatBigDecimalToString(value: BD.BigDecimal, options?: {
      mode?: 'percent' | 'currency' | 'decimal';
      minDecimalPlaces?: number;
      maxDecimalPlaces?: number;
  }): string;

}
declare module '@layerfi/components/utils/bills' {
  import { Bill } from '@layerfi/components/types/bills';
  export const isBillPaid: (status?: Bill["status"]) => status is "PAID";
  export const isBillUnpaid: (status?: Bill["status"]) => boolean;

}
declare module '@layerfi/components/utils/bookkeeping/bookkeepingStatusFilters' {
  import { BookkeepingStatus } from '@layerfi/components/hooks/bookkeeping/useBookkeepingStatus';
  type ActiveBookkeepingStatus = BookkeepingStatus.ACTIVE | BookkeepingStatus.ONBOARDING;
  export function isActiveBookkeepingStatus(status: BookkeepingStatus): status is ActiveBookkeepingStatus;
  type ActiveOrPausedBookkeepingStatus = ActiveBookkeepingStatus | BookkeepingStatus.BOOKKEEPING_PAUSED;
  export function isActiveOrPausedBookkeepingStatus(status: BookkeepingStatus): status is ActiveOrPausedBookkeepingStatus;
  export {};

}
declare module '@layerfi/components/utils/bookkeeping/isCategorizationEnabled' {
  import { BookkeepingStatus } from '@layerfi/components/hooks/bookkeeping/useBookkeepingStatus';
  export function isCategorizationEnabledForStatus(status: BookkeepingStatus): boolean | undefined;

}
declare module '@layerfi/components/utils/bookkeeping/periods/getFilteredBookkeepingPeriods' {
  import { type BookkeepingPeriod, BookkeepingPeriodStatus } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  type ActiveBookkeepingPeriodStatus = Exclude<BookkeepingPeriodStatus, BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE>;
  export function isActiveBookkeepingPeriod<T extends Pick<BookkeepingPeriod, 'status'>>(period: T): period is T & {
      status: ActiveBookkeepingPeriodStatus;
  };
  export {};

}
declare module '@layerfi/components/utils/bookkeeping/tasks/bookkeepingTasksFilters' {
  import type { RawTask, TasksStatus } from '@layerfi/components/types/tasks';
  export function isIncompleteTask<T extends Pick<RawTask, 'status'>>(task: T): task is T & {
      status: 'TODO';
  };
  export function getIncompleteTasks<T extends Pick<RawTask, 'status'>>(tasks: ReadonlyArray<T>): (T & {
      status: "TODO";
  })[];
  type UserVisibleTaskStatus = Exclude<TasksStatus, 'COMPLETED' | 'ARCHIVED'>;
  export type UserVisibleTask = RawTask & {
      status: UserVisibleTaskStatus;
  };
  export function getUserVisibleTasks<T extends Pick<RawTask, 'status'>>(tasks: ReadonlyArray<T>): (T & {
      status: UserVisibleTaskStatus;
  })[];
  type CompletedTaskStatus = Exclude<TasksStatus, 'TODO'>;
  export function isCompletedTask<T extends Pick<RawTask, 'status'>>(task: T): task is T & {
      status: CompletedTaskStatus;
  };
  export function getCompletedTasks<T extends Pick<RawTask, 'status'>>(tasks: ReadonlyArray<T>): (T & {
      status: CompletedTaskStatus;
  })[];
  export {};

}
declare module '@layerfi/components/utils/bookkeeping/tasks/getBookkeepingTaskStatusIcon' {
  import type { RawTask } from '@layerfi/components/types/tasks';
  export function getIconForTask(task: Pick<RawTask, 'status'>): import("react/jsx-runtime").JSX.Element | null;

}
declare module '@layerfi/components/utils/business' {
  import { Business } from '@layerfi/components/types';
  export const getActivationDate: (business?: Business) => Date | undefined;
  export const getEarliestDateToBrowse: (business?: Business) => Date | undefined;
  export const isDateAllowedToBrowse: (date: Date, business?: Business) => boolean;

}
declare module '@layerfi/components/utils/colors' {
  import { LayerThemeConfig, ColorsPalette } from '@layerfi/components/types/layer_context';
  /**
   * Convert `theme` config set in Provider into component styles.
   *
   * @param {LayerThemeConfig} theme - the theme set with provider
   */
  export const parseStylesFromThemeConfig: (theme?: LayerThemeConfig) => {};
  /**
   * Build same color palette in RGB, HSL and HEX as CSS variables.
   */
  export const buildColorsPalette: (theme?: LayerThemeConfig) => ColorsPalette;

}
declare module '@layerfi/components/utils/date' {
  export const getMonthNameFromNumber: (monthNumber: number) => string;

}
declare module '@layerfi/components/utils/delay/runDelayed' {
  export function runDelayedSync<T>(block: () => T, delayMs?: number): Promise<T>;

}
declare module '@layerfi/components/utils/form' {
  import { ValidationErrorMap } from '@tanstack/react-form';
  export const notEmpty: (value?: string | null) => boolean;
  export const validateEmailFormat: (email?: string, required?: boolean) => boolean;
  export function flattenValidationErrors(errors: ValidationErrorMap): string[];

}
declare module '@layerfi/components/utils/format' {
  /**
   * Capitalize first letter of the given text.
   */
  export const capitalizeFirstLetter: (text: string) => string;
  /**
   * Convert number into percentage.
   *
   * @example
   * 0.112 -> 11%
   * 0.09843 -> 9.8%
   * 0.00123 -> 0.12%
   */
  export const formatPercent: (value?: number, options?: Intl.NumberFormatOptions) => string | undefined;
  /**
   * Convert Enum-like (upper snakecase) text into human friendly format.
   */
  export const humanizeEnum: (text: string) => string;
  export const convertNumberToCurrency: (amount: number | undefined) => string;
  export const convertCurrencyToNumber: (amount: string) => string;
  /**
   * Convert amount to cents by multiplying by 100.
   * For example:
   * 100.00 -> 10000
   * 100.01 -> 10001
   * 100.001 -> 10000
   */
  export const convertToCents: (amount?: number | string | null) => number | undefined;
  /**
   * Convert amount from cents to dollars.
   * For example:
   * 10000 -> 100
   * 10001 -> 100.01
   */
  export const convertFromCents: (amount?: number | string | readonly string[] | null) => number | undefined;
  /**
   * Convert cents amount to currency in dollars.
   */
  export const convertCentsToCurrency: (amount?: number | string) => string | undefined;
  /**
   * Format date to a given format. By default, it uses the DATE_FORMAT.
   */
  export const formatDate: (date?: string | Date, dateFormat?: string) => string;

}
declare module '@layerfi/components/utils/helpers' {
  export const range: (start: number, end: number) => number[];
  export const sleep: (time: number) => Promise<unknown>;

}
declare module '@layerfi/components/utils/journal' {
  import { LedgerAccountLineItem, LedgerAccountsEntry } from '@layerfi/components/types';
  import { AccountIdentifierPayloadObject } from '@layerfi/components/types/categories';
  import { JournalEntry, JournalEntryLineItem } from '@layerfi/components/types/journal';
  export const getAccountIdentifierPayload: (journalLineItem: JournalEntryLineItem) => AccountIdentifierPayloadObject;
  export const entryNumber: (entry: JournalEntry | LedgerAccountsEntry) => string;
  export const lineEntryNumber: (ledgerEntryLine: LedgerAccountLineItem) => string;

}
declare module '@layerfi/components/utils/profitAndLossComparisonUtils' {
  import { DateRangePickerMode } from '@layerfi/components/providers/GlobalDateStore/GlobalDateStoreProvider';
  import { LineItem } from '@layerfi/components/utils/schema/utils';
  export const generateComparisonPeriods: (startDate: Date, numberOfPeriods: number, rangeDisplayMode: DateRangePickerMode) => {
      date: Date;
      label: string;
  }[];
  export const getComparisonValue: (name: string, depth: number, cellData: string | number | LineItem) => string | number;
  export const mergeComparisonLineItemsAtDepth: (lineItems: LineItem[]) => LineItem[];

}
declare module '@layerfi/components/utils/profitAndLossUtils' {
  import type { ProfitAndLoss } from '@layerfi/components/hooks/useProfitAndLoss/schemas';
  import { SidebarScope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import type { LineItem } from '@layerfi/components/utils/schema/utils';
  export type PnlChartLineItem = LineItem & {
      type: string;
      isHidden?: boolean;
      share?: number;
  };
  export const collectExpensesItems: (data: ProfitAndLoss) => PnlChartLineItem[];
  export const collectRevenueItems: (data: ProfitAndLoss) => PnlChartLineItem[];
  export const humanizeTitle: (sidebarView: SidebarScope) => "Expenses" | "Revenue" | "Profit & Loss";
  export const applyShare: (items: PnlChartLineItem[], total: number) => PnlChartLineItem[];

}
declare module '@layerfi/components/utils/request/toDefinedSearchParameters' {
  export type ParameterValues = Date | string | ReadonlyArray<string> | number | boolean;
  export function toDefinedSearchParameters(input: Record<string, ParameterValues | null | undefined>): URLSearchParams;

}
declare module '@layerfi/components/utils/schema/utils' {
  import { Schema } from 'effect';
  import { ZonedDateTime } from '@internationalized/date';
  export const ZonedDateTimeFromSelf: Schema.declare<ZonedDateTime, ZonedDateTime, readonly [], never>;
  const lineItemFields: {
      name: typeof Schema.String;
      displayName: Schema.PropertySignature<":", string, "display_name", ":", string, false, never>;
      value: typeof Schema.Number;
      isContra: Schema.PropertySignature<":", boolean, "is_contra", ":", boolean, false, never>;
      percentDelta: Schema.PropertySignature<"?:", import("effect/BigDecimal").BigDecimal | undefined, "percent_delta", "?:", string | undefined, false, never>;
  };
  export interface LineItem extends Schema.Struct.Type<typeof lineItemFields> {
      lineItems: ReadonlyArray<LineItem>;
  }
  export interface LineItemEncoded extends Schema.Struct.Encoded<typeof lineItemFields> {
      readonly line_items: ReadonlyArray<LineItemEncoded>;
  }
  export const LineItemSchema: Schema.Struct<{
      lineItems: Schema.PropertySignature<":", readonly LineItem[], "line_items", ":", readonly LineItemEncoded[], false, never>;
      name: typeof Schema.String;
      displayName: Schema.PropertySignature<":", string, "display_name", ":", string, false, never>;
      value: typeof Schema.Number;
      isContra: Schema.PropertySignature<":", boolean, "is_contra", ":", boolean, false, never>;
      percentDelta: Schema.PropertySignature<"?:", import("effect/BigDecimal").BigDecimal | undefined, "percent_delta", "?:", string | undefined, false, never>;
  }>;
  export {};

}
declare module '@layerfi/components/utils/styleUtils/sizeVariants' {
  const _SIZE_VARIANTS: readonly ["sm", "lg"];
  type SizeVariant = (typeof _SIZE_VARIANTS)[number];
  export type Variants = Partial<{
      size: SizeVariant;
  }>;
  export {};

}
declare module '@layerfi/components/utils/styleUtils/toDataProperties' {
  type AllowedDataValue = string | number | true;
  type DataPrefix<T extends Lowercase<string>> = `data-${T}`;
  type DataProperties<T> = {
      [K in keyof T as DataPrefix<Extract<K, Lowercase<string>>>]: T[K] extends AllowedDataValue ? T[K] : never;
  };
  export function toDataProperties<TKeys extends Lowercase<string>, TValues>(input: Record<TKeys, TValues>): DataProperties<Record<TKeys, Extract<TValues, AllowedDataValue>>>;
  export {};

}
declare module '@layerfi/components/utils/switch/assertUnreachable' {
  export function safeAssertUnreachable<T>({ value, message, fallbackValue, }: {
      value: never;
      message?: string;
      fallbackValue?: T;
  }): T | undefined;
  export function unsafeAssertUnreachable({ message, }: {
      value: never;
      message?: string;
  }): never;

}
declare module '@layerfi/components/utils/swr/compareWithStableHash' {
  /**
   * https://github.com/shuding/stable-hash/blob/main/src/index.ts
   *
   * This stable hash algorithm is (mostly) the default that is used by SWR.
   * We added special consideration for BigDecimal values to compare them by
   * using the BigDecimal.toString() method under the hood rather than going
   * through the default object handling which accesses every key, creating
   * an infinitely deeply nested BigDecimal (because BigDecimal.normalized
   * is also a BigDecimal, and accessing this key instantiates it).
   */
  export const compareWithStableHash: (a?: unknown, b?: unknown) => boolean;

}
declare module '@layerfi/components/utils/swr/defaultSWRConfig' {
  export const DEFAULT_SWR_CONFIG: {
      readonly refreshInterval: number;
      readonly revalidateIfStale: true;
      readonly revalidateOnFocus: false;
      readonly revalidateOnReconnect: false;
      readonly compare: (a?: unknown, b?: unknown) => boolean;
  };

}
declare module '@layerfi/components/utils/swr/getRelevantCacheKeys' {
  import { type Cache } from 'swr';
  type GetRelevantCacheKeysParameters = {
      cache: Cache<unknown>;
      predicate: (tags: ReadonlyArray<string>) => boolean;
      withPrecedingOptimisticUpdate?: boolean;
  };
  export function getRelevantCacheKeys({ cache, predicate, withPrecedingOptimisticUpdate, }: GetRelevantCacheKeysParameters): string[];
  export {};

}
declare module '@layerfi/components/utils/swr/useGlobalCacheActions' {
  type PredicateFn = (tags: ReadonlyArray<string>) => boolean;
  export function useGlobalCacheActions(): {
      invalidate: (predicate: PredicateFn, { withPrecedingOptimisticUpdate }?: {
          withPrecedingOptimisticUpdate?: boolean;
      }) => Promise<undefined[]>;
      patchCache: <unsafe_TData>(predicate: PredicateFn, transformData: (currentData?: unsafe_TData) => unsafe_TData, { withRevalidate }?: {
          withRevalidate: boolean;
      }) => Promise<(Awaited<unsafe_TData> | undefined)[]>;
      optimisticUpdate: <unsafe_TData>(predicate: PredicateFn, optimisticUpdateCallback: (displayedData: unsafe_TData) => unsafe_TData) => Promise<undefined[]>;
      forceReload: (predicate: PredicateFn) => Promise<undefined[]>;
  };
  export {};

}
declare module '@layerfi/components/utils/swr/withSWRKeyTags' {
  export function withSWRKeyTags(key: unknown, predicate: (tags: ReadonlyArray<string>) => boolean): boolean;

}
declare module '@layerfi/components/utils/time/timeUtils' {
  import { ZonedDateTime } from '@internationalized/date';
  export const toLocalDateString: (date: Date) => string;
  export function getDueDifference(dueDate: Date): number;
  export function isZonedDateTime(val: unknown): val is ZonedDateTime;

}
declare module '@layerfi/components/utils/vendors' {
  import { Vendor } from '@layerfi/components/types/vendors';
  export const getVendorName: (vendor?: Vendor) => string;

}
declare module '@layerfi/components/utils/zustand/useStoreWithDateSelected' {
  import type { StoreApi } from 'zustand';
  type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>;
  type ExtractState<S> = S extends {
      getState: () => infer T;
  } ? T : never;
  export function useStoreWithDateSelected<S extends ReadonlyStoreApi<unknown>>(api: S, selector: (state: ExtractState<S>) => Date): Date;
  export {};

}
declare module '@layerfi/components/views/AccountingOverview/AccountingOverview' {
  import { ReactNode } from 'react';
  import { ProfitAndLossDetailedChartsStringOverrides } from '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts';
  import { ProfitAndLossSummariesStringOverrides } from '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries';
  import { OnboardingStep } from '@layerfi/components/types/layer_context';
  import type { Variants } from '@layerfi/components/utils/styleUtils/sizeVariants';
  import { TagOption } from '@layerfi/components/views/ProjectProfitability/ProjectProfitability';
  interface AccountingOverviewStringOverrides {
      header?: string;
      profitAndLoss?: {
          detailedCharts?: ProfitAndLossDetailedChartsStringOverrides;
          summaries?: ProfitAndLossSummariesStringOverrides;
      };
  }
  export interface AccountingOverviewProps {
      title?: string;
      showTitle?: boolean;
      enableOnboarding?: boolean;
      onboardingStepOverride?: OnboardingStep;
      onTransactionsToReviewClick?: () => void;
      middleBanner?: ReactNode;
      chartColorsList?: string[];
      stringOverrides?: AccountingOverviewStringOverrides;
      tagFilter?: TagOption;
      slotProps?: {
          profitAndLoss?: {
              summaries?: {
                  variants?: Variants;
              };
          };
      };
  }
  export const AccountingOverview: ({ title, showTitle, enableOnboarding, onboardingStepOverride, onTransactionsToReviewClick, middleBanner, chartColorsList, stringOverrides, tagFilter, slotProps, }: AccountingOverviewProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/views/AccountingOverview/index' {
  export { AccountingOverview } from '@layerfi/components/views/AccountingOverview/AccountingOverview';

}
declare module '@layerfi/components/views/AccountingOverview/internal/TransactionsToReview' {
  import type { Variants } from '@layerfi/components/utils/styleUtils/sizeVariants';
  type TransactionsToReviewProps = {
      onClick?: () => void;
      usePnlDateRange?: boolean;
      tagFilter?: {
          key: string;
          values: string[];
      };
      variants?: Variants;
  };
  export function TransactionsToReview({ onClick, usePnlDateRange, tagFilter, variants, }: TransactionsToReviewProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts' {
  import { type BankTransactionsStringOverrides } from '@layerfi/components/components/BankTransactions/BankTransactions';
  import { BankTransactionsMode } from '@layerfi/components/providers/LegacyModeProvider/LegacyModeProvider';
  import { MobileComponentType } from '@layerfi/components/components/BankTransactions/constants';
  import { LinkingMetadata } from '@layerfi/components/contexts/InAppLinkContext';
  import { ReactNode } from 'react';
  interface BankTransactionsWithLinkedAccountsStringOverrides {
      title?: string;
      linkedAccounts?: BankTransactionsWithLinkedAccountsStringOverrides;
      bankTransactions?: BankTransactionsStringOverrides;
  }
  export interface BankTransactionsWithLinkedAccountsProps {
      title?: string;
      showTitle?: boolean;
      elevatedLinkedAccounts?: boolean;
      showBreakConnection?: boolean;
      showCustomerVendor?: boolean;
      showDescriptions?: boolean;
      showLedgerBalance?: boolean;
      showReceiptUploads?: boolean;
      showTags?: boolean;
      showTooltips?: boolean;
      showUnlinkItem?: boolean;
      showUploadOptions?: boolean;
      /**
       * @deprecated `mode` can be inferred from the bookkeeping configuration of a business
       */
      mode?: BankTransactionsMode;
      mobileComponent?: MobileComponentType;
      stringOverrides?: BankTransactionsWithLinkedAccountsStringOverrides;
      renderInAppLink?: (details: LinkingMetadata) => ReactNode;
  }
  export const BankTransactionsWithLinkedAccounts: ({ title, showTitle, elevatedLinkedAccounts, mode, showBreakConnection, showCustomerVendor, showDescriptions, showLedgerBalance, showReceiptUploads, showTags, showTooltips, showUnlinkItem, showUploadOptions, mobileComponent, stringOverrides, renderInAppLink, }: BankTransactionsWithLinkedAccountsProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/views/BankTransactionsWithLinkedAccounts/index' {
  export { BankTransactionsWithLinkedAccounts } from '@layerfi/components/views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts';

}
declare module '@layerfi/components/views/Bills' {
  export type BillsStringOverrides = {
      title?: string;
      paidToggleOption?: string;
      unpaidToggleOption?: string;
  };
  export type ChartOfAccountsOptions = {
      templateAccountsEditable?: boolean;
  };
  export type BillsViewProps = {
      showTitle?: boolean;
      stringOverrides?: BillsStringOverrides;
  };
  export const unstable_BillsView: (props: BillsViewProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/views/BookkeepingOverview/BookkeepingOverview' {
  import { ProfitAndLossDetailedChartsStringOverrides } from '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts';
  import { ProfitAndLossSummariesStringOverrides } from '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries';
  import { TasksStringOverrides } from '@layerfi/components/components/Tasks/Tasks';
  import { Variants } from '@layerfi/components/utils/styleUtils/sizeVariants';
  export interface BookkeepingOverviewProps {
      showTitle?: boolean;
      stringOverrides?: {
          title?: string;
          tasks?: TasksStringOverrides;
          profitAndLoss?: {
              header?: string;
              detailedCharts?: ProfitAndLossDetailedChartsStringOverrides;
              summaries?: ProfitAndLossSummariesStringOverrides;
          };
      };
      slotProps?: {
          profitAndLoss?: {
              summaries?: {
                  variants?: Variants;
              };
          };
      };
      onClickReconnectAccounts?: () => void;
      /**
       * @deprecated Use `stringOverrides.title` instead
       */
      title?: string;
  }
  export const BookkeepingOverview: ({ title, showTitle, onClickReconnectAccounts, stringOverrides, slotProps, }: BookkeepingOverviewProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/views/BookkeepingOverview/index' {
  export { BookkeepingOverview } from '@layerfi/components/views/BookkeepingOverview/BookkeepingOverview';

}
declare module '@layerfi/components/views/BookkeepingOverview/internal/BookkeepingProfitAndLossSummariesContainer' {
  import { PropsWithChildren } from 'react';
  export function BookkeepingProfitAndLossSummariesContainer({ children, }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/views/BookkeepingOverview/useKeepInMobileViewport' {
  export const useKeepInMobileViewport: () => {
      upperContentRef: import("react").RefObject<HTMLDivElement>;
      targetElementRef: import("react").RefObject<HTMLDivElement>;
      upperElementInFocus: import("react").MutableRefObject<boolean | null>;
  };

}
declare module '@layerfi/components/views/GeneralLedger/GeneralLedger' {
  import { ReactNode } from 'react';
  import { ChartOfAccountsStringOverrides } from '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts';
  import { JournalStringOverrides } from '@layerfi/components/components/Journal/Journal';
  import { LinkingMetadata } from '@layerfi/components/contexts/InAppLinkContext';
  export interface GeneralLedgerStringOverrides {
      title?: string;
      chartOfAccountsToggleOption?: string;
      journalToggleOption?: string;
      chartOfAccounts: ChartOfAccountsStringOverrides;
      journal: JournalStringOverrides;
  }
  export interface ChartOfAccountsOptions {
      templateAccountsEditable?: boolean;
      showReversalEntries?: boolean;
      showAddAccountButton?: boolean;
  }
  export interface GeneralLedgerProps {
      title?: string;
      showTitle?: boolean;
      stringOverrides?: GeneralLedgerStringOverrides;
      chartOfAccountsOptions?: ChartOfAccountsOptions;
      renderInAppLink?: (source: LinkingMetadata) => ReactNode;
  }
  export const GeneralLedgerView: ({ title, showTitle, stringOverrides, chartOfAccountsOptions, renderInAppLink, }: GeneralLedgerProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/views/GeneralLedger/index' {
  export { GeneralLedgerView } from '@layerfi/components/views/GeneralLedger/GeneralLedger';

}
declare module '@layerfi/components/views/ProjectProfitability/ProjectProfitability' {
  import { MoneyFormat } from '@layerfi/components/types';
  import type { DateRangePickerMode } from '@layerfi/components/providers/GlobalDateStore/GlobalDateStoreProvider';
  export type TagOption = {
      label: string;
      tagKey: string;
      tagValues: string[];
  };
  export interface ProjectsStringOverrides {
      title?: string;
  }
  export interface ProjectProfitabilityProps {
      valueOptions: TagOption[];
      showTitle?: boolean;
      stringOverrides?: ProjectsStringOverrides;
      datePickerMode?: DateRangePickerMode;
      csvMoneyFormat?: MoneyFormat;
  }
  export const ProjectProfitabilityView: ({ valueOptions, showTitle, stringOverrides, datePickerMode, csvMoneyFormat, }: ProjectProfitabilityProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/views/ProjectProfitability/index' {
  export { ProjectProfitabilityView } from '@layerfi/components/views/ProjectProfitability/ProjectProfitability';

}
declare module '@layerfi/components/views/Reports/Reports' {
  import { ReactNode } from 'react';
  import { BalanceSheetStringOverrides } from '@layerfi/components/components/BalanceSheet/BalanceSheet';
  import { ProfitAndLossDetailedChartsStringOverrides } from '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts';
  import { PnLDownloadButtonStringOverrides } from '@layerfi/components/components/ProfitAndLossDownloadButton/index';
  import { ProfitAndLossTableStringOverrides } from '@layerfi/components/components/ProfitAndLossTable/index';
  import { StatementOfCashFlowStringOverrides } from '@layerfi/components/components/StatementOfCashFlow/StatementOfCashFlow';
  import { View as ViewType } from '@layerfi/components/types/general';
  import type { TimeRangePickerConfig } from '@layerfi/components/views/Reports/reportTypes';
  import { ProfitAndLossCompareConfig } from '@layerfi/components/types/profit_and_loss';
  import { LinkingMetadata } from '@layerfi/components/contexts/InAppLinkContext';
  type ViewBreakpoint = ViewType | undefined;
  export interface ReportsStringOverrides {
      title?: string;
      downloadButton?: PnLDownloadButtonStringOverrides;
      profitAndLoss?: {
          detailedCharts?: ProfitAndLossDetailedChartsStringOverrides;
          table?: ProfitAndLossTableStringOverrides;
      };
      balanceSheet?: BalanceSheetStringOverrides;
      statementOfCashflow?: StatementOfCashFlowStringOverrides;
  }
  export interface ReportsProps {
      title?: string;
      showTitle?: boolean;
      stringOverrides?: ReportsStringOverrides;
      enabledReports?: ReportType[];
      comparisonConfig?: ProfitAndLossCompareConfig;
      profitAndLossConfig?: TimeRangePickerConfig;
      statementOfCashFlowConfig?: TimeRangePickerConfig;
      renderInAppLink?: (source: LinkingMetadata) => ReactNode;
  }
  type ReportType = 'profitAndLoss' | 'balanceSheet' | 'statementOfCashFlow';
  export interface ReportsPanelProps {
      openReport: ReportType;
      stringOverrides?: ReportsStringOverrides;
      profitAndLossConfig?: TimeRangePickerConfig;
      statementOfCashFlowConfig?: TimeRangePickerConfig;
      view: ViewBreakpoint;
      renderInAppLink?: (source: LinkingMetadata) => ReactNode;
  }
  export const Reports: ({ title, showTitle, stringOverrides, enabledReports, comparisonConfig, profitAndLossConfig, statementOfCashFlowConfig, renderInAppLink, }: ReportsProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/views/Reports/index' {
  export { Reports } from '@layerfi/components/views/Reports/Reports';

}
declare module '@layerfi/components/views/Reports/reportTypes' {
  import type { CustomDateRange } from '@layerfi/components/components/DatePicker/DatePickerOptions';
  import type { DateRangePickerMode } from '@layerfi/components/providers/GlobalDateStore/GlobalDateStoreProvider';
  import type { MoneyFormat } from '@layerfi/components/types';
  export type TimeRangePickerConfig = {
      /**
       * @deprecated Use `defaultDatePickerMode` instead
       */
      datePickerMode?: DateRangePickerMode;
      defaultDatePickerMode?: DateRangePickerMode;
      allowedDatePickerModes?: ReadonlyArray<DateRangePickerMode>;
      csvMoneyFormat?: MoneyFormat;
      customDateRanges?: CustomDateRange[];
  };

}
declare module '@layerfi/components' {
  import main = require('@layerfi/components/index');
  export = main;
}