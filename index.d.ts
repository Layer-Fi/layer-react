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
  export const post: <Return extends Record<string, unknown> = Record<string, unknown>, Body extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params;
      body?: Body;
  }) => Promise<Return>;
  export const put: <Return extends Record<string, unknown> = Record<string, unknown>, Body extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
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
  export {};

}
declare module '@layerfi/components/api/layer/bankTransactions' {
  import { CategoryUpdate, BankTransaction, Metadata } from '@layerfi/components/types';
  import { BankTransactionMatch, BankTransactionMatchType, BankTransactionMetadata, DocumentS3Urls } from '@layerfi/components/types/bank_transactions';
  import { FileMetadata } from '@layerfi/components/types/file_upload';
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  export type GetBankTransactionsReturn = {
      data?: BankTransaction[];
      meta?: Metadata;
      error?: unknown;
  };
  export interface GetBankTransactionsParams extends Record<string, string | undefined> {
      businessId: string;
      cursor?: string;
      categorized?: string;
      direction?: 'INFLOW' | 'OUTFLOW';
      startDate?: string;
      endDate?: string;
      tagFilterString?: string;
      sortOrder?: 'ASC' | 'DESC';
      sortBy?: string;
  }
  export const getBankTransactions: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetBankTransactionsParams | undefined;
  } | undefined) => () => Promise<GetBankTransactionsReturn>;
  export const categorizeBankTransaction: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: CategoryUpdate | undefined;
  } | undefined) => Promise<{
      data: BankTransaction;
      errors: unknown;
  }>;
  export const matchBankTransaction: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: {
          match_id: string;
          type: BankTransactionMatchType;
      } | undefined;
  } | undefined) => Promise<{
      data: BankTransactionMatch;
      errors: unknown;
  }>;
  export interface GetBankTransactionsCsvParams extends Record<string, string | undefined> {
      businessId: string;
      startDate?: string;
      endDate?: string;
      categorized?: 'true' | 'false';
      category?: string;
      month?: string;
      year?: string;
  }
  export const getBankTransactionsCsv: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data?: S3PresignedUrl;
      error?: unknown;
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

}
declare module '@layerfi/components/api/layer/bills' {
  import { Metadata } from '@layerfi/components/types';
  import { Bill, BillPayment } from '@layerfi/components/types/bills';
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
      body?: Record<string, unknown> | undefined;
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
declare module '@layerfi/components/api/layer/categories' {
  import { Category } from '@layerfi/components/types';
  export const getCategories: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          mode?: "ALL";
      } | undefined;
  } | undefined) => () => Promise<{
      data: {
          type: "Category_List";
          categories: Category[];
      };
  }>;

}
declare module '@layerfi/components/api/layer/chart_of_accounts' {
  import { Account, ChartOfAccounts, NewAccount, EditAccount, LedgerAccountsEntry } from '@layerfi/components/types';
  import { ChartWithBalances } from '@layerfi/components/types/chart_of_accounts';
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  import { LedgerAccountLineItems } from '@layerfi/components/types/ledger_accounts';
  export const getChartOfAccounts: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: ChartOfAccounts;
  }>;
  export const getLedgerAccountBalances: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: ChartWithBalances;
  }>;
  export const createAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: NewAccount | undefined;
  } | undefined) => Promise<{
      data: Account;
  }>;
  export const updateAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: EditAccount | undefined;
  } | undefined) => Promise<{
      data: Account;
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
  export const getJournal: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: JournalEntry[];
  }>;
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
  export const getLinkedAccounts: (baseUrl: string, accessToken: string | undefined, options?: {
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
      } & Partial<{
          is_unique: boolean;
          is_relevant: boolean;
      }> & {}) | ({
          is_relevant: true;
      } & Partial<{
          is_unique: boolean;
          is_relevant: boolean;
      }> & {}) | undefined;
  } | undefined) => Promise<never>;
  export const excludeAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          accountId: string;
      } | undefined;
      body?: ({
          is_irrelevant: true;
      } & Partial<{
          is_irrelevant: boolean;
          is_duplicate: boolean;
      }> & {}) | ({
          is_duplicate: true;
      } & Partial<{
          is_irrelevant: boolean;
          is_duplicate: boolean;
      }> & {}) | undefined;
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
  import { ProfitAndLoss } from '@layerfi/components/types';
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  import type { ProfitAndLossComparison, ProfitAndLossComparisonRequestBody, ProfitAndLossSummaries } from '@layerfi/components/types/profit_and_loss';
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
  type GetProfitAndLossParams = BaseProfitAndLossParams;
  type GetProfitAndLossCsvParams = BaseProfitAndLossParams & {
      moneyFormat?: string;
  };
  export const getProfitAndLoss: (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossParams) => () => Promise<{
      data?: ProfitAndLoss;
      error?: unknown;
  }>;
  export const compareProfitAndLoss: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: ProfitAndLossComparisonRequestBody | undefined;
  } | undefined) => Promise<{
      data?: ProfitAndLossComparison;
      error?: unknown;
  }>;
  export const getProfitAndLossSummaries: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data?: ProfitAndLossSummaries;
      error?: unknown;
  }>;
  export const getProfitAndLossCsv: (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossCsvParams) => () => Promise<{
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
  import { StatusOfSyncFromQuickbooks } from '@layerfi/components/types/quickbooks';
  export const syncFromQuickbooks: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  export const statusOfSyncFromQuickbooks: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
  } | undefined) => () => Promise<{
      data: StatusOfSyncFromQuickbooks;
  }>;
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
      data: {
          is_connected: boolean;
      };
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
  import { Task } from '@layerfi/components/types/tasks';
  export const submitResponseToTask: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: Task;
  }>;
  export const updateUploadDocumentTaskDescription: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: Task;
  }>;
  export const markTaskAsComplete: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: Task;
  }>;
  export const deleteTaskUploads: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: Task;
  }>;
  export const completeTaskWithUpload: (baseUrl: string, accessToken?: string) => ({ businessId, taskId, files, description, }: {
      businessId: string;
      taskId: string;
      files: File[];
      description?: string;
  }) => Promise<{
      data: FileMetadata;
      errors: unknown;
  }>;

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
      categorizeBankTransaction: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types").CategoryUpdate | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types").BankTransaction;
          errors: unknown;
      }>;
      matchBankTransaction: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: {
              match_id: string;
              type: import("@layerfi/components/types/bank_transactions").BankTransactionMatchType;
          } | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/bank_transactions").BankTransactionMatch;
          errors: unknown;
      }>;
      createAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types").NewAccount | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types").Account;
      }>;
      updateAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types").EditAccount | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types").Account;
      }>;
      getBalanceSheet: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              effectiveDate: Date;
          } | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types").BalanceSheet;
      }>;
      getBankTransactions: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: import("@layerfi/components/api/layer/bankTransactions").GetBankTransactionsParams | undefined;
      } | undefined) => () => Promise<import("@layerfi/components/api/layer/bankTransactions").GetBankTransactionsReturn>;
      getBankTransactionsCsv: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data?: import("@layerfi/components/types/general").S3PresignedUrl;
          error?: unknown;
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
          data: import("@layerfi/components/types/bills").Bill;
      }>;
      updateBill: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/bills").Bill;
      }>;
      createBillPayment: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types/bills").BillPayment | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/bills").BillPayment;
      }>;
      getCategories: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              mode?: "ALL";
          } | undefined;
      } | undefined) => () => Promise<{
          data: {
              type: "Category_List";
              categories: import("@layerfi/components/types").Category[];
          };
      }>;
      getChartOfAccounts: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types").ChartOfAccounts;
      }>;
      getLedgerAccountBalances: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/chart_of_accounts").ChartWithBalances;
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
      getProfitAndLoss: (apiUrl: string, accessToken: string | undefined, params: {
          businessId: string;
          startDate?: Date;
          endDate?: Date;
          month?: string;
          year?: string;
          tagKey?: string;
          tagValues?: string;
          reportingBasis?: string;
      }) => () => Promise<{
          data?: import("@layerfi/components/types").ProfitAndLoss;
          error?: unknown;
      }>;
      getProfitAndLossSummaries: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data?: import("@layerfi/components/types/profit_and_loss").ProfitAndLossSummaries;
          error?: unknown;
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
      getLinkedAccounts: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/linked_accounts").LinkedAccounts;
      }>;
      getJournal: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types").JournalEntry[];
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
          } & Partial<{
              is_unique: boolean;
              is_relevant: boolean;
          }> & {}) | ({
              is_relevant: true;
          } & Partial<{
              is_unique: boolean;
              is_relevant: boolean;
          }> & {}) | undefined;
      } | undefined) => Promise<never>;
      excludeAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              accountId: string;
          } | undefined;
          body?: ({
              is_irrelevant: true;
          } & Partial<{
              is_irrelevant: boolean;
              is_duplicate: boolean;
          }> & {}) | ({
              is_duplicate: true;
          } & Partial<{
              is_irrelevant: boolean;
              is_duplicate: boolean;
          }> & {}) | undefined;
      } | undefined) => Promise<never>;
      completeTaskWithUpload: (baseUrl: string, accessToken?: string) => ({ businessId, taskId, files, description, }: {
          businessId: string;
          taskId: string;
          files: File[];
          description?: string;
      }) => Promise<{
          data: import("@layerfi/components/types/file_upload").FileMetadata;
          errors: unknown;
      }>;
      submitResponseToTask: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/tasks").Task;
      }>;
      deleteTaskUploads: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/tasks").Task;
      }>;
      updateUploadDocumentTaskDescription: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/tasks").Task;
      }>;
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
      statusOfSyncFromQuickbooks: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/quickbooks").StatusOfSyncFromQuickbooks;
      }>;
      statusOfQuickbooksConnection: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
          } | undefined;
      } | undefined) => () => Promise<{
          data: {
              is_connected: boolean;
          };
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
  }
  export const ActionableList: <T>({ options, onClick, selectedId, showDescriptions, }: ActionableListProps<T>) => import("react/jsx-runtime").JSX.Element;
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
      children: ReactNode;
      icon?: ReactNode;
      onClick?: ButtonProps['onClick'];
      tooltip?: ReactNode;
      size?: BadgeSize;
      variant?: BadgeVariant;
      hoverable?: boolean;
  }
  export const Badge: ({ icon, onClick, children, tooltip, size, variant, hoverable, }: BadgeProps) => import("react/jsx-runtime").JSX.Element;

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
  }
  export const BadgeLoader: ({ children }: BadgeLoaderProps) => import("react/jsx-runtime").JSX.Element;

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
  export type BalanceSheetViewProps = PropsWithChildren & {
      withExpandAllButton?: boolean;
      asWidget?: boolean;
      stringOverrides?: BalanceSheetStringOverrides;
  };
  export type BalanceSheetProps = PropsWithChildren & {
      effectiveDate?: Date;
      asWidget?: boolean;
      stringOverrides?: BalanceSheetStringOverrides;
  };
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
  export { BalanceSheet } from '@layerfi/components/components/BalanceSheet/BalanceSheet';

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
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
      showTooltips: boolean;
      stringOverrides?: BankTransactionCTAStringOverrides;
  }
  export const BankTransactionList: ({ bankTransactions, editable, removeTransaction, containerWidth, showDescriptions, showReceiptUploads, showTooltips, stringOverrides, }: BankTransactionListProps) => import("react/jsx-runtime").JSX.Element;
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
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      showTooltips: boolean;
      removeTransaction: (bt: BankTransaction) => void;
      containerWidth?: number;
      stringOverrides?: BankTransactionCTAStringOverrides;
  };
  export const BankTransactionListItem: ({ index, dateFormat, bankTransaction, editable, showDescriptions, showReceiptUploads, showTooltips, containerWidth, removeTransaction, stringOverrides, }: Props) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionList/index' {
  export { BankTransactionList } from '@layerfi/components/components/BankTransactionList/BankTransactionList';

}
declare module '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileForms' {
  import { BankTransaction } from '@layerfi/components/types';
  import { Purpose } from '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileListItem';
  interface BankTransactionMobileFormsProps {
      purpose: Purpose;
      bankTransaction: BankTransaction;
      showTooltips: boolean;
      showCategorization?: boolean;
      showReceiptUploads?: boolean;
      showDescriptions?: boolean;
      isOpen?: boolean;
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
      showTooltips: boolean;
      showReceiptUploads?: boolean;
      showDescriptions?: boolean;
  }
  export const BankTransactionMobileList: ({ bankTransactions, removeTransaction, editable, initialLoad, showTooltips, showReceiptUploads, showDescriptions, }: BankTransactionMobileListProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileListItem' {
  import { BankTransaction } from '@layerfi/components/types';
  export interface BankTransactionMobileListItemProps {
      index: number;
      bankTransaction: BankTransaction;
      editable: boolean;
      removeTransaction: (bt: BankTransaction) => void;
      initialLoad?: boolean;
      showTooltips: boolean;
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
      isFirstItem?: boolean;
  }
  export enum Purpose {
      business = "business",
      personal = "personal",
      more = "more"
  }
  export const BankTransactionMobileListItem: ({ index, bankTransaction, removeTransaction, editable, initialLoad, showTooltips, isFirstItem, showDescriptions, showReceiptUploads, }: BankTransactionMobileListItemProps) => import("react/jsx-runtime").JSX.Element;

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
      showTooltips: boolean;
      showCategorization?: boolean;
      showReceiptUploads?: boolean;
      showDescriptions?: boolean;
  }
  export const BusinessForm: ({ bankTransaction, showTooltips, showCategorization, showReceiptUploads, showDescriptions, }: BusinessFormProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/MatchForm' {
  import { BankTransaction } from '@layerfi/components/types';
  export const MatchForm: ({ bankTransaction, showReceiptUploads, showDescriptions, }: {
      bankTransaction: BankTransaction;
      showReceiptUploads?: boolean;
      showDescriptions?: boolean;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/PersonalForm' {
  import { BankTransaction } from '@layerfi/components/types';
  interface PersonalFormProps {
      bankTransaction: BankTransaction;
      showReceiptUploads?: boolean;
      showDescriptions?: boolean;
  }
  export const PersonalForm: ({ bankTransaction, showReceiptUploads, showDescriptions, }: PersonalFormProps) => import("react/jsx-runtime").JSX.Element;
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
declare module '@layerfi/components/components/BankTransactionMobileList/index' {
  export { BankTransactionMobileList } from '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileList';

}
declare module '@layerfi/components/components/BankTransactionMobileList/useMemoText' {
  import { ReactNode } from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  interface MemoTextProps {
      bankTransaction: BankTransaction;
      isActive?: boolean;
  }
  interface MemoTextProviderProps extends MemoTextProps {
      children: ReactNode;
  }
  export type MemoTextContextType = ReturnType<typeof useMemoText>;
  export const MemoTextContext: import("react").Context<{
      memoText: string | undefined;
      setMemoText: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
      saveMemoText: () => Promise<void>;
  }>;
  export const useMemoTextContext: () => {
      memoText: string | undefined;
      setMemoText: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
      saveMemoText: () => Promise<void>;
  };
  const useMemoText: ({ bankTransaction, isActive }: MemoTextProps) => {
      memoText: string | undefined;
      setMemoText: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
      saveMemoText: () => Promise<void>;
  };
  export const MemoTextProvider: ({ children, bankTransaction, isActive, }: MemoTextProviderProps) => import("react/jsx-runtime").JSX.Element;
  export {};

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
  export const flattenCategories: (categories: Array<CategoryWithEntries>) => Option[];
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
  export const extractDescriptionForSplit: (category: CategoryWithEntries) => string;
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
      category: CategoryWithEntries;
  }) => import("react/jsx-runtime").JSX.Element | undefined;

}
declare module '@layerfi/components/components/BankTransactionRow/index' {
  export { BankTransactionRow } from '@layerfi/components/components/BankTransactionRow/BankTransactionRow';

}
declare module '@layerfi/components/components/BankTransactions/BankTransactions' {
  import { BankTransactionFilters } from '@layerfi/components/hooks/useBankTransactions/types';
  import { BankTransactionsTableStringOverrides } from '@layerfi/components/components/BankTransactionsTable/BankTransactionsTable';
  import { BankTransactionsHeaderStringOverrides } from '@layerfi/components/components/BankTransactions/BankTransactionsHeader';
  import { MobileComponentType } from '@layerfi/components/components/BankTransactions/constants';
  import type { LayerError } from '@layerfi/components/models/ErrorHandler';
  import { type BankTransactionsMode } from '@layerfi/components/providers/LegacyModeProvider/LegacyModeProvider';
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
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
      showTooltips?: boolean;
      monthlyView?: boolean;
      categorizeView?: boolean;
      mobileComponent?: MobileComponentType;
      filters?: BankTransactionFilters;
      hideHeader?: boolean;
      stringOverrides?: BankTransactionsStringOverrides;
  }
  export interface BankTransactionsWithErrorProps extends BankTransactionsProps {
      onError?: (error: LayerError) => void;
  }
  export const BankTransactions: ({ onError, mode, ...props }: BankTransactionsWithErrorProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactions/BankTransactionsHeader' {
  import { ChangeEvent } from 'react';
  import { DateRange, DisplayState } from '@layerfi/components/types';
  import { MobileComponentType } from '@layerfi/components/components/BankTransactions/constants';
  export interface BankTransactionsHeaderProps {
      shiftStickyHeader: number;
      asWidget?: boolean;
      categorizedOnly?: boolean;
      categorizeView?: boolean;
      display?: DisplayState;
      onCategorizationDisplayChange: (event: ChangeEvent<HTMLInputElement>) => void;
      mobileComponent?: MobileComponentType;
      withDatePicker?: boolean;
      listView?: boolean;
      dateRange?: DateRange;
      isDataLoading?: boolean;
      isSyncing?: boolean;
      setDateRange?: (value: DateRange) => void;
      stringOverrides?: BankTransactionsHeaderStringOverrides;
  }
  export interface BankTransactionsHeaderStringOverrides {
      header?: string;
      downloadButton?: string;
  }
  export const BankTransactionsHeader: ({ shiftStickyHeader, asWidget, categorizedOnly, categorizeView, display, onCategorizationDisplayChange, mobileComponent, withDatePicker, listView, dateRange, setDateRange, stringOverrides, isSyncing, }: BankTransactionsHeaderProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BankTransactions/DataStates' {
  import { BankTransaction } from '@layerfi/components/types';
  interface DataStatesProps {
      bankTransactions?: BankTransaction[];
      isLoading?: boolean;
      isValidating?: boolean;
      error?: unknown;
      refetch: () => void;
      editable: boolean;
  }
  export const DataStates: ({ bankTransactions, isLoading, isValidating, error, refetch, editable, }: DataStatesProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactions/constants' {
  import { CategorizationStatus } from '@layerfi/components/types';
  export type MobileComponentType = 'regularList' | 'mobileList';
  export const CategorizedCategories: CategorizationStatus[];
  export const ReviewCategories: CategorizationStatus[];

}
declare module '@layerfi/components/components/BankTransactions/index' {
  export { BankTransactions } from '@layerfi/components/components/BankTransactions/BankTransactions';

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
      initialLoad?: boolean;
      containerWidth: number;
      removeTransaction: (bt: BankTransaction) => void;
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
      showTooltips: boolean;
      stringOverrides?: BankTransactionsStringOverrides;
      isSyncing?: boolean;
      page?: number;
      lastPage?: boolean;
      onRefresh?: () => void;
  }
  export const BankTransactionsTable: ({ categorizeView, editable, isLoading, bankTransactions, initialLoad, containerWidth, removeTransaction, showDescriptions, showReceiptUploads, showTooltips, stringOverrides, isSyncing, page, lastPage, onRefresh, }: BankTransactionsTableProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionsTable/index' {
  export { BankTransactionsTable } from '@layerfi/components/components/BankTransactionsTable/BankTransactionsTable';

}
declare module '@layerfi/components/components/BookkeepingStatus/BookkeepingStatus' {
  import { BookkeepingPeriodStatus } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  type BookkeepingStatusProps = {
      month?: number;
      status?: BookkeepingPeriodStatus;
      emphasizeWarning?: boolean;
  };
  export const BookkeepingStatus: ({ status, month, emphasizeWarning }: BookkeepingStatusProps) => import("react/jsx-runtime").JSX.Element | undefined;
  export {};

}
declare module '@layerfi/components/components/BookkeepingStatus/BookkeepingStatusDescription' {
  import { BookkeepingPeriodStatus } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  type BookkeepingStatusDescriptionProps = {
      month?: number;
      status?: BookkeepingPeriodStatus;
  };
  export const BookkeepingStatusDescription: ({ month, status }: BookkeepingStatusDescriptionProps) => import("react/jsx-runtime").JSX.Element | undefined;
  export {};

}
declare module '@layerfi/components/components/BusinessForm/BusinessForm' {
  export type BusinessFormStringOverrides = {
      saveButton?: string;
  };
  export type BusinessFormProps = {
      stringOverrides?: BusinessFormStringOverrides;
  };
  export const BusinessForm: ({ stringOverrides }: BusinessFormProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/BusinessForm/useBusinessForm' {
  import { FormValidateOrFn, FormAsyncValidateOrFn } from '@tanstack/react-form';
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
  export const useBusinessForm: () => {
      form: import("@tanstack/react-form").ReactFormExtendedApi<BusinessFormData, FormValidateOrFn<BusinessFormData>, FormValidateOrFn<BusinessFormData>, FormAsyncValidateOrFn<BusinessFormData>, FormValidateOrFn<BusinessFormData>, FormAsyncValidateOrFn<BusinessFormData>, FormValidateOrFn<BusinessFormData>, FormAsyncValidateOrFn<BusinessFormData>, FormAsyncValidateOrFn<BusinessFormData>, FormAsyncValidateOrFn<BusinessFormData>>;
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
  import { ButtonProps } from '@layerfi/components/components/Button/Button';
  interface DownloadButtonProps {
      onClick?: () => void | Promise<void>;
      iconOnly?: boolean;
      isDownloading?: boolean;
      requestFailed?: boolean;
      text?: string;
      retryText?: string;
      errorText?: string;
      tooltip?: ButtonProps['tooltip'];
  }
  export const DownloadButton: ({ iconOnly, onClick, isDownloading, requestFailed, tooltip, text, retryText, errorText, }: DownloadButtonProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Button/ExpandButton' {
  import { ButtonHTMLAttributes } from 'react';
  type ExpandButtonProps = {
      collapsed?: boolean;
  } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;
  export const ExpandButton: ({ className, collapsed, ...props }: ExpandButtonProps) => import("react/jsx-runtime").JSX.Element;
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
  }
  export enum SubmitAction {
      SAVE = "save",
      UPDATE = "update"
  }
  export const SubmitButton: ({ active, className, processing, disabled, error, children, action, noIcon, variant, withRetry, ...props }: SubmitButtonProps) => import("react/jsx-runtime").JSX.Element;

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
  export { ExpandButton } from '@layerfi/components/components/Button/ExpandButton';
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
  type Props = {
      name?: string;
      bankTransaction: BankTransaction;
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
      HIDDEN = "hidden"
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
  import { CategoryOption } from '@layerfi/components/components/CategorySelect/CategorySelect';
  interface CategorySelectDrawerProps {
      onSelect: (value: CategoryOption) => void;
      selected?: CategoryOption;
      showTooltips: boolean;
  }
  export const CategorySelectDrawer: ({ onSelect, selected, showTooltips: _showTooltips, }: CategorySelectDrawerProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CategorySelect/index' {
  export { CategorySelect } from '@layerfi/components/components/CategorySelect/CategorySelect';

}
declare module '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts' {
  import { ChartOfAccountsTableStringOverrides } from '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel';
  import { LedgerAccountStringOverrides } from '@layerfi/components/components/LedgerAccount/LedgerAccountIndex';
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
  import { ChartWithBalances } from '@layerfi/components/types/chart_of_accounts';
  import { BaseSelectOption } from '@layerfi/components/types/general';
  export const useParentOptions: (data?: ChartWithBalances) => BaseSelectOption[];

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
  import { ChartWithBalances } from '@layerfi/components/types/chart_of_accounts';
  import { View } from '@layerfi/components/types/general';
  import { ChartOfAccountsTableStringOverrides, ExpandActionState } from '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel';
  export const ChartOfAccountsTable: ({ view, stringOverrides, data, error, expandAll, cumulativeIndex, accountsLength, templateAccountsEditable, }: {
      view: View;
      data: ChartWithBalances;
      stringOverrides?: ChartOfAccountsTableStringOverrides;
      error?: unknown;
      expandAll?: ExpandActionState;
      cumulativeIndex: number;
      accountsLength: number;
      templateAccountsEditable?: boolean;
  }) => import("react/jsx-runtime").JSX.Element;
  export const ChartOfAccountsTableContent: ({ stringOverrides, data, error, expandAll, templateAccountsEditable, }: {
      view: View;
      data: ChartWithBalances;
      stringOverrides?: ChartOfAccountsTableStringOverrides;
      error?: unknown;
      expandAll?: ExpandActionState;
      cumulativeIndex: number;
      accountsLength: number;
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
declare module '@layerfi/components/components/DataState/DataState' {
  import { ReactNode } from 'react';
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
  }
  export const DataState: ({ status, title, description, onRefresh, isLoading, icon, spacing, }: DataStateProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/DataState/index' {
  export { DataState, DataStateStatus } from '@layerfi/components/components/DataState/DataState';

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
  interface DateTimeProps {
      value: string;
      format?: string;
      dateFormat?: string;
      timeFormat?: string;
      onlyDate?: boolean;
      onlyTime?: boolean;
  }
  export const DateTime: ({ value, format, dateFormat, timeFormat, onlyDate, onlyTime, }: DateTimeProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/DateTime/index' {
  export { DateTime } from '@layerfi/components/components/DateTime/DateTime';

}
declare module '@layerfi/components/components/DetailsList/DetailsList' {
  import { ReactNode } from 'react';
  export interface DetailsListProps {
      title?: string;
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
declare module '@layerfi/components/components/Drawer/Drawer' {
  export const Drawer: ({ isOpen, onClose, children, }: {
      isOpen: boolean;
      onClose: () => void;
      children: React.ReactNode;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Drawer/index' {
  export { Drawer } from '@layerfi/components/components/Drawer/Drawer';

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
declare module '@layerfi/components/components/GlobalWidgets/GlobalWidgets' {
  export const GlobalWidgets: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/GlobalWidgets/index' {
  export { GlobalWidgets } from '@layerfi/components/components/GlobalWidgets/GlobalWidgets';

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
  import { CurrencyInputProps } from 'react-currency-input-field';
  export interface AmountInputProps extends Omit<CurrencyInputProps, 'onChange'> {
      onChange?: (value?: string) => void;
      isInvalid?: boolean;
      errorMessage?: string;
      leftText?: string;
  }
  export const AmountInput: ({ onChange, className, leftText, errorMessage, isInvalid, placeholder, ...props }: AmountInputProps) => import("react/jsx-runtime").JSX.Element;

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
declare module '@layerfi/components/components/Input/InputWithBadge' {
  import { HTMLProps } from 'react';
  import { BadgeVariant } from '@layerfi/components/components/Badge/index';
  export interface InputWithBadgeProps extends HTMLProps<HTMLInputElement> {
      isInvalid?: boolean;
      errorMessage?: string;
      leftText?: string;
      variant?: BadgeVariant;
      badge: React.ReactNode;
  }
  export const InputWithBadge: ({ className, isInvalid, errorMessage, leftText, badge, variant, ...props }: InputWithBadgeProps) => import("react/jsx-runtime").JSX.Element;

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
  }
  export const MultiSelect: <T>({ name, options, className, classNamePrefix, value, defaultValue, onChange, disabled, placeholder, isInvalid, errorMessage, styles, }: SelectProps<T>) => import("react/jsx-runtime").JSX.Element;

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
  import { GroupBase, OptionsOrGroups } from 'react-select';
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
  }
  export const Select: <T>({ name, options, className, classNamePrefix, value, onChange, disabled, placeholder, isInvalid, errorMessage, }: SelectProps<T>) => import("react/jsx-runtime").JSX.Element;

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
  export { InputWithBadge } from '@layerfi/components/components/Input/InputWithBadge';
  export { MultiSelect } from '@layerfi/components/components/Input/MultiSelect';

}
declare module '@layerfi/components/components/Journal/Journal' {
  import { JournalTableStringOverrides } from '@layerfi/components/components/JournalTable/JournalTableWithPanel';
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
  type UseJournalEntriesDownloadOptions = {
      startCutoff?: Date;
      endCutoff?: Date;
      onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>;
  };
  export function useJournalEntriesDownload({ startCutoff, endCutoff, onSuccess, }: UseJournalEntriesDownloadOptions): import("swr/mutation").SWRMutationResponse<unknown, any, () => {
      accessToken: string;
      apiUrl: string;
      businessId: string;
      startCutoff: Date | undefined;
      endCutoff: Date | undefined;
      tags: string[];
  } | undefined, never>;
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
  import { Direction, JournalEntryLineItem } from '@layerfi/components/types';
  import { LedgerAccountBalance } from '@layerfi/components/types/chart_of_accounts';
  import { BaseSelectOption } from '@layerfi/components/types/general';
  import { JournalConfig } from '@layerfi/components/components/Journal/Journal';
  export const JournalFormEntryLines: ({ entrylineItems, addEntryLine, removeEntryLine, changeFormData, sendingForm, config, }: {
      entrylineItems: JournalEntryLineItem[];
      addEntryLine: (direction: Direction) => void;
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
  import { JournalFormStringOverrides } from '@layerfi/components/components/JournalForm/JournalForm';
  export interface JournalTableStringOverrides {
      componentTitle?: string;
      componentSubtitle?: string;
      addEntryButton?: string;
      idColumnHeader?: string;
      dateColumnHeader?: string;
      transactionColumnHeader?: string;
      accountColumnHeader?: string;
      debitColumnHeader?: string;
      creditColumnHeader?: string;
      journalForm?: JournalFormStringOverrides;
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
  export interface LedgerAccountRowProps {
      row: LedgerAccountLineItem;
      index: number;
      initialLoad?: boolean;
      view: View;
  }
  export const LedgerAccountRow: ({ row, index, initialLoad, view, }: LedgerAccountRowProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/LedgerAccount/index' {
  export { LedgerAccount } from '@layerfi/components/components/LedgerAccount/LedgerAccountIndex';

}
declare module '@layerfi/components/components/LedgerAccountEntryDetails/LedgerAccountEntryDetails' {
  import { LedgerEntrySource } from '@layerfi/components/types/ledger_accounts';
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
      source: LedgerEntrySource;
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
  type Props = {
      text: string;
      config: {
          name: string;
          action: () => void;
      }[];
  };
  export const LinkedAccountPill: ({ text, config }: Props) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccountPill/index' {
  export { LinkedAccountPill } from '@layerfi/components/components/LinkedAccountPill/LinkedAccountPill';

}
declare module '@layerfi/components/components/LinkedAccountThumb/LinkedAccountThumb' {
  import { LinkedAccount } from '@layerfi/components/types/linked_accounts';
  export interface LinkedAccountThumbProps {
      account: LinkedAccount;
      asWidget?: boolean;
      showLedgerBalance?: boolean;
      pillConfig?: {
          text: string;
          config: {
              name: string;
              action: () => void;
          }[];
      };
  }
  export const LinkedAccountThumb: ({ account, asWidget, showLedgerBalance, pillConfig, }: LinkedAccountThumbProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/LinkedAccountThumb/index' {
  export { LinkedAccountThumb } from '@layerfi/components/components/LinkedAccountThumb/LinkedAccountThumb';

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
  }): import("swr/mutation").SWRMutationResponse<true | undefined, any, () => {
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
  }): import("swr/mutation").SWRMutationResponse<true | undefined, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly data: OpeningBalanceData[];
      readonly tags: readonly ["#linked-accounts", "#opening-balance"];
  } | undefined, never>;
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
  export const MatchForm: ({ classNamePrefix, bankTransaction, selectedMatchId, setSelectedMatchId, matchFormError, readOnly, }: MatchFormProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/MatchForm/MatchFormMobile' {
  import { MatchFormProps } from '@layerfi/components/components/MatchForm/MatchForm';
  export const MatchFormMobile: ({ classNamePrefix, bankTransaction, selectedMatchId, setSelectedMatchId, matchFormError, }: MatchFormProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/MatchForm/index' {
  export { MatchForm } from '@layerfi/components/components/MatchForm/MatchForm';
  export { MatchFormMobile } from '@layerfi/components/components/MatchForm/MatchFormMobile';

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
  }
  /**
   * Pagination wrapped into container with spacing and positioning.
   * Use PaginationContent component, if you want to render plain pagination element
   * without spacings and positioning.
   */
  export const Pagination: (props: PaginationProps) => import("react/jsx-runtime").JSX.Element;
  export const PaginationContent: ({ onPageChange, totalCount, siblingCount, currentPage, pageSize, hasMore, fetchMore, }: PaginationProps) => import("react/jsx-runtime").JSX.Element | null;

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
declare module '@layerfi/components/components/PeriodPicker/PeriodPicker' {
  export type PeriodPickerOption = 'month' | 'quarter' | 'year' | '2_months' | '3_months' | '6_months' | '12_months' | '2_quarters' | '3_quarters' | '4_quarters' | '8_quarters' | '2_years' | '3_years';
  interface PeriodPickerProps {
      onSelect: (option: {
          key: PeriodPickerOption;
          start_date: string;
          end_date: string;
      }) => void;
      defaultValue?: PeriodPickerOption;
  }
  export const PeriodPicker: ({ onSelect, defaultValue }: PeriodPickerProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/PeriodPicker/index' {
  export { PeriodPicker } from '@layerfi/components/components/PeriodPicker/PeriodPicker';

}
declare module '@layerfi/components/components/Pill/Pill' {
  import { PropsWithChildren } from 'react';
  type PillKind = 'default' | 'info' | 'success' | 'warning' | 'error';
  type Props = PropsWithChildren & {
      kind?: PillKind;
      onHover?: () => void;
      onClick?: () => void;
  };
  export const Pill: ({ children, kind, onHover, onClick }: Props) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Pill/index' {
  export { Pill } from '@layerfi/components/components/Pill/Pill';

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
declare module '@layerfi/components/components/PlatformOnboarding/Steps/LinkAccountsConfirmationStep' {
  export function LinkAccountsConfirmationStep(): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/PlatformOnboarding/Steps/LinkAccountsLinkStep' {
  export function LinkAccountsLinkStep(): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLoss/ProfitAndLoss' {
  import { PropsWithChildren } from 'react';
  import { ReportingBasis } from '@layerfi/components/types';
  import { ProfitAndLossCompareConfig } from '@layerfi/components/types/profit_and_loss';
  type Props = PropsWithChildren & {
      tagFilter?: {
          key: string;
          values: string[];
      };
      comparisonConfig?: ProfitAndLossCompareConfig;
      reportingBasis?: ReportingBasis;
      asContainer?: boolean;
  };
  const ProfitAndLoss: {
      ({ children, tagFilter, comparisonConfig, reportingBasis, asContainer, }: Props): import("react/jsx-runtime").JSX.Element;
      Chart: ({ forceRerenderOnDataChange, tagFilter, }: import("@layerfi/components/components/ProfitAndLossChart/ProfitAndLossChart").Props) => import("react/jsx-runtime").JSX.Element;
      Context: import("react").Context<{
          data: import("@layerfi/components/types").ProfitAndLoss | undefined;
          filteredDataRevenue: never[] | import("@layerfi/components/types/line_item").LineBaseItem[];
          filteredTotalRevenue: number | undefined;
          filteredDataExpenses: never[] | import("@layerfi/components/types/line_item").LineBaseItem[];
          filteredTotalExpenses: number | undefined;
          isLoading: boolean;
          isValidating: boolean;
          error: unknown;
          dateRange: {
              startDate: Date;
              endDate: Date;
          };
          changeDateRange: ({ startDate: start, endDate: end }: import("@layerfi/components/types").DateRange) => void;
          refetch: () => void;
          sidebarScope: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").SidebarScope;
          setSidebarScope: import("react").Dispatch<import("react").SetStateAction<import("../../hooks/useProfitAndLoss/useProfitAndLoss").SidebarScope>>;
          sortBy: (scope: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").Scope, field: string, direction?: import("../../types").SortDirection) => void;
          filters: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").ProfitAndLossFilters;
          setFilterTypes: (scope: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").Scope, types: string[]) => void;
          tagFilter: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").PnlTagFilter | undefined;
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
      Summaries: (props: {
          actionable?: boolean;
          stringOverrides?: import("@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries").ProfitAndLossSummariesStringOverrides;
          chartColorsList?: string[];
          variants?: import("@layerfi/components/utils/styleUtils/sizeVariants").Variants;
          revenueLabel?: string;
          vertical?: boolean;
      }) => import("react/jsx-runtime").JSX.Element;
      Table: (props: import("@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableComponent").ProfitAndLossTableProps) => import("react/jsx-runtime").JSX.Element;
      DetailedCharts: ({ scope, hideClose, showDatePicker, chartColorsList, stringOverrides, }: {
          scope?: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").SidebarScope;
          hideClose?: boolean;
          showDatePicker?: boolean;
          chartColorsList?: string[];
          stringOverrides?: import("@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts").ProfitAndLossDetailedChartsStringOverrides;
      }) => import("react/jsx-runtime").JSX.Element;
      Header: ({ text, className, headingClassName, withDatePicker, withStatus, }: import("@layerfi/components/components/ProfitAndLossHeader/ProfitAndLossHeader").ProfitAndLossHeaderProps) => import("react/jsx-runtime").JSX.Element;
      Report: ({ stringOverrides, allowedDatePickerModes, datePickerMode, defaultDatePickerMode, customDateRanges, csvMoneyFormat, parentRef, view, }: import("@layerfi/components/components/ProfitAndLossReport/ProfitAndLossReport").ProfitAndLossReportProps) => import("react/jsx-runtime").JSX.Element;
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
  import { Props as BaseProps } from 'recharts/types/component/Label';
  type Props = BaseProps & {
      animateFrom: number;
      setAnimateFrom: (x: number) => void;
      customCursorSize: {
          width: number;
          height: number;
      };
      setCustomCursorSize: (width: number, height: number, x: number) => void;
  };
  export const Indicator: ({ className, animateFrom, setAnimateFrom, customCursorSize, setCustomCursorSize, viewBox, }: Props) => import("react/jsx-runtime").JSX.Element | null;
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
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/DetailedChart' {
  import { SidebarScope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { LineBaseItem } from '@layerfi/components/types/line_item';
  interface DetailedChartProps {
      filteredData: LineBaseItem[];
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
  import { LineBaseItem } from '@layerfi/components/types/line_item';
  export interface DetailedTableStringOverrides {
      categoryColumnHeader?: string;
      typeColumnHeader?: string;
      valueColumnHeader?: string;
  }
  export interface DetailedTableProps {
      filteredData: LineBaseItem[];
      hoveredItem?: string;
      setHoveredItem: (name?: string) => void;
      sidebarScope: SidebarScope;
      filters: ProfitAndLossFilters;
      sortBy: (scope: Scope, field: string, direction?: SortDirection) => void;
      chartColorsList?: string[];
      stringOverrides?: DetailedTableStringOverrides;
  }
  export interface TypeColorMapping {
      color: string;
      opacity: number;
  }
  export const mapTypesToColors: (data: LineBaseItem[], colorList?: string[]) => TypeColorMapping[];
  export const DetailedTable: ({ filteredData, sidebarScope, filters, sortBy, hoveredItem, setHoveredItem, chartColorsList, stringOverrides, }: DetailedTableProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/Filters' {
  import { Scope, SidebarScope, ProfitAndLossFilters } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { LineBaseItem } from '@layerfi/components/types/line_item';
  export interface FiltersProps {
      filteredData: LineBaseItem[];
      sidebarScope: SidebarScope;
      filters: ProfitAndLossFilters;
      setFilterTypes: (scope: Scope, types: string[]) => void;
  }
  export const Filters: ({ filteredData, sidebarScope, filters, setFilterTypes, }: FiltersProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts' {
  import { SidebarScope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { DetailedTableStringOverrides } from '@layerfi/components/components/ProfitAndLossDetailedCharts/DetailedTable';
  export interface ProfitAndLossDetailedChartsStringOverrides {
      detailedTableStringOverrides?: DetailedTableStringOverrides;
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
  import { RefObject } from 'react';
  import { View as ViewType } from '@layerfi/components/types/general';
  import { ReportsStringOverrides } from '@layerfi/components/views/Reports/Reports';
  import type { TimeRangePickerConfig } from '@layerfi/components/views/Reports/reportTypes';
  type ViewBreakpoint = ViewType | undefined;
  export type ProfitAndLossReportProps = {
      stringOverrides?: ReportsStringOverrides;
      parentRef?: RefObject<HTMLDivElement>;
      view?: ViewBreakpoint;
  } & TimeRangePickerConfig;
  export const ProfitAndLossReport: ({ stringOverrides, allowedDatePickerModes, datePickerMode, defaultDatePickerMode, customDateRanges, csvMoneyFormat, parentRef, view, }: ProfitAndLossReportProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossReport/index' {
  export { ProfitAndLossReport } from '@layerfi/components/components/ProfitAndLossReport/ProfitAndLossReport';

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries' {
  import { type ReactNode } from 'react';
  import type { Variants } from '@layerfi/components/utils/styleUtils/sizeVariants';
  export interface ProfitAndLossSummariesStringOverrides {
      revenueLabel?: string;
      expensesLabel?: string;
      netProfitLabel?: string;
  }
  type ProfitAndLossSummariesProps = {
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
  type Internal_ProfitAndLossSummariesProps = {
      slots?: {
          unstable_AdditionalListItems?: [ReactNode];
      };
  } & ProfitAndLossSummariesProps;
  export function Internal_ProfitAndLossSummaries({ actionable, revenueLabel, stringOverrides, chartColorsList, slots, variants, }: Internal_ProfitAndLossSummariesProps): import("react/jsx-runtime").JSX.Element;
  export const ProfitAndLossSummaries: (props: ProfitAndLossSummariesProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/index' {
  export { ProfitAndLossSummaries } from '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries';

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
  import type { Scope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import type { ProfitAndLoss } from '@layerfi/components/types';
  import type { LineBaseItem } from '@layerfi/components/types/line_item';
  import { Variants } from '@layerfi/components/utils/styleUtils/sizeVariants';
  export function toMiniChartData({ scope, data, }: {
      scope: Scope;
      data?: ProfitAndLoss;
  }): LineBaseItem[];
  type ProfitAndLossMiniChartProps = {
      data: LineBaseItem[];
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
  export interface ProfitAndLossTableStringOverrides {
      grossProfitLabel?: string;
      profitBeforeTaxesLabel?: string;
      netProfitLabel?: string;
  }
  export type ProfitAndLossTableProps = {
      lockExpanded?: boolean;
      asContainer?: boolean;
      stringOverrides?: ProfitAndLossTableStringOverrides;
  };
  export const ProfitAndLossTableComponent: ({ asContainer, stringOverrides, }: ProfitAndLossTableProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableWithProvider' {
  import { ProfitAndLossTableProps } from '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTableComponent';
  export const ProfitAndLossTableWithProvider: (props: ProfitAndLossTableProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossTable/empty_profit_and_loss_report' {
  import { ProfitAndLoss } from '@layerfi/components/types';
  const _default: ProfitAndLoss;
  export default _default;

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
declare module '@layerfi/components/components/ProjectProfitability/ProjectSelector' {
  export function ProjectSelector(): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Quickbooks/Quickbooks' {
  const Quickbooks: () => import("react/jsx-runtime").JSX.Element;
  export { Quickbooks };

}
declare module '@layerfi/components/components/Quickbooks/index' {
  export { Quickbooks } from '@layerfi/components/components/Quickbooks/Quickbooks';

}
declare module '@layerfi/components/components/RadioButtonGroup/RadioButton' {
  import type { ChangeEvent } from 'react';
  type Props = {
      checked: boolean;
      label: string;
      name: string;
      onChange: (event: ChangeEvent<HTMLInputElement>) => void;
      value: string;
      disabled?: boolean;
      size: 'small' | 'large';
  };
  export const RadioButton: ({ checked, label, name, onChange, value, disabled, size, }: Props) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/RadioButtonGroup/RadioButtonGroup' {
  export type RadioButtonLabel = {
      label: string;
      value: string;
      disabled?: boolean;
  };
  type Props = {
      name: string;
      size?: 'small' | 'large';
      buttons: RadioButtonLabel[];
      selected?: RadioButtonLabel['value'];
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  export const RadioButtonGroup: ({ name, size, buttons, onChange, selected, }: Props) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/RadioButtonGroup/index' {
  export { RadioButtonGroup } from '@layerfi/components/components/RadioButtonGroup/RadioButtonGroup';

}
declare module '@layerfi/components/components/SelectVendor/SelectVendor' {

}
declare module '@layerfi/components/components/SkeletonBalanceSheetRow/SkeletonBalanceSheetRow' {
  import { PropsWithChildren } from 'react';
  type Props = PropsWithChildren;
  export const SkeletonBalanceSheetRow: ({ children }: Props) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/SkeletonBalanceSheetRow/index' {
  export { SkeletonBalanceSheetRow } from '@layerfi/components/components/SkeletonBalanceSheetRow/SkeletonBalanceSheetRow';

}
declare module '@layerfi/components/components/SkeletonLoader/SkeletonLoader' {
  export interface SkeletonLoaderProps {
      width?: string;
      height?: string;
      className?: string;
  }
  export const SkeletonLoader: ({ height, width, className, }: SkeletonLoaderProps) => import("react/jsx-runtime").JSX.Element;

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
  export type StatementOfCashFlowProps = {
      stringOverrides?: StatementOfCashFlowStringOverrides;
  } & TimeRangePickerConfig;
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
  export { StatementOfCashFlow } from '@layerfi/components/components/StatementOfCashFlow/StatementOfCashFlow';

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
  }
  export const Tab: ({ checked, label, name, onChange, value, leftIcon, disabled, disabledMessage, index, }: TabProps) => import("react/jsx-runtime").JSX.Element;
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
declare module '@layerfi/components/components/Tabs/index' {
  export { Tabs } from '@layerfi/components/components/Tabs/Tabs';

}
declare module '@layerfi/components/components/Tasks/TaskMonthTile' {
  import { TaskMonthTileProps } from '@layerfi/components/components/Tasks/types';
  /**
   * @TODO - data.tasks.length uses all tasks, not only incomplete
   */
  const TaskMonthTile: ({ data, onClick, active, disabled }: TaskMonthTileProps) => import("react/jsx-runtime").JSX.Element;
  export { TaskMonthTile };

}
declare module '@layerfi/components/components/Tasks/Tasks' {
  import { ReactNode } from 'react';
  export interface TasksStringOverrides {
      header?: string;
  }
  export type TasksProps = {
      tasksHeader?: string;
      collapsable?: boolean;
      defaultCollapsed?: boolean;
      collapsedWhenComplete?: boolean;
      stringOverrides?: TasksStringOverrides;
  };
  export const Tasks: (props: TasksProps) => import("react/jsx-runtime").JSX.Element;
  export const TasksProvider: ({ children }: {
      children: ReactNode;
  }) => import("react/jsx-runtime").JSX.Element;
  export const TasksComponent: ({ collapsable, defaultCollapsed, collapsedWhenComplete, tasksHeader, stringOverrides, }: {
      tasksHeader?: string;
      collapsable?: boolean;
      defaultCollapsed?: boolean;
      collapsedWhenComplete?: boolean;
      stringOverrides?: TasksStringOverrides;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/TasksContext' {
  import { useTasks } from '@layerfi/components/hooks/useTasks/index';
  export type TasksContextType = ReturnType<typeof useTasks>;
  export const TasksContext: import("react").Context<{
      data?: import("@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods").BookkeepingPeriod[];
      isLoading?: boolean;
      isValidating?: boolean;
      error?: unknown;
      currentDate: Date;
      setCurrentDate: (date: Date) => void;
      refetch: () => void;
      submitResponseToTask: (taskId: string, userResponse: string) => void;
      uploadDocumentsForTask: (taskId: string, files: File[], description?: string) => Promise<void>;
      deleteUploadsForTask: (taskId: string) => void;
      updateDocUploadTaskDescription: (taskId: string, userResponse: string) => void;
  }>;
  export const useTasksContext: () => {
      data?: import("@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods").BookkeepingPeriod[];
      isLoading?: boolean;
      isValidating?: boolean;
      error?: unknown;
      currentDate: Date;
      setCurrentDate: (date: Date) => void;
      refetch: () => void;
      submitResponseToTask: (taskId: string, userResponse: string) => void;
      uploadDocumentsForTask: (taskId: string, files: File[], description?: string) => Promise<void>;
      deleteUploadsForTask: (taskId: string) => void;
      updateDocUploadTaskDescription: (taskId: string, userResponse: string) => void;
  };

}
declare module '@layerfi/components/components/Tasks/TasksHeader' {
  export const TasksHeader: ({ tasksHeader, collapsable, open, toggleContent, highlightYears, }: {
      tasksHeader?: string;
      collapsable?: boolean;
      open?: boolean;
      toggleContent: () => void;
      highlightYears?: number[];
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/TasksList' {
  import { BookkeepingPeriod } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  export const TasksList: ({ data, pageSize }: {
      data?: BookkeepingPeriod[];
      pageSize?: number;
  }) => import("react/jsx-runtime").JSX.Element[] | undefined;

}
declare module '@layerfi/components/components/Tasks/TasksListItem' {
  import { Task } from '@layerfi/components/types/tasks';
  export const TasksListItem: ({ task, goToNextPageIfAllComplete, defaultOpen, }: {
      task: Task;
      goToNextPageIfAllComplete: (task: Task) => void;
      defaultOpen: boolean;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/TasksMonthSelector' {
  import { TasksMonthSelectorProps } from '@layerfi/components/components/Tasks/types';
  const TasksMonthSelector: ({ tasks, year, currentDate, onClick }: TasksMonthSelectorProps) => import("react/jsx-runtime").JSX.Element;
  export { TasksMonthSelector };

}
declare module '@layerfi/components/components/Tasks/TasksPanelNotification' {
  export const TasksPanelNotification: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/TasksPending' {
  import { BookkeepingPeriodStatus } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  export const TasksPending: ({ bookkeepingMonthStatus }: {
      bookkeepingMonthStatus?: BookkeepingPeriodStatus;
  }) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/TasksYearsTabs' {
  export const TasksYearsTabs: () => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/Tasks/types' {
  import { BookkeepingPeriod } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  import { Task } from '@layerfi/components/types/tasks';
  export type TasksMonthSelectorProps = {
      tasks?: BookkeepingPeriod[];
      currentDate: Date;
      year: number;
      onClick: (date: Date) => void;
  };
  export type MonthData = {
      year: number;
      month: number;
      total: number;
      completed: number;
      tasks: Task[];
      monthStr: string;
      startDate: Date;
      endDate: Date;
      disabled?: boolean;
  };
  export type TaskMonthTileProps = {
      data: BookkeepingPeriod;
      active?: boolean;
      disabled?: boolean;
      onClick: TasksMonthSelectorProps['onClick'];
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
      type?: 'success' | 'default';
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
  type TooltipContentProps = Omit<HTMLProps<HTMLDivElement>, 'style'>;
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
          update: () => void;
          x: number;
          y: number;
          placement: import("@floating-ui/utils").Placement;
          strategy: import("@floating-ui/utils").Strategy;
          middlewareData: import("@floating-ui/core").MiddlewareData;
          isPositioned: boolean;
          floatingStyles: React.CSSProperties;
          open: boolean;
          onOpenChange: (open: boolean, event?: Event, reason?: import("@floating-ui/react").OpenChangeReason) => void;
          events: import("@floating-ui/react").FloatingEvents;
          dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
          nodeId: string | undefined;
          floatingId: string;
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
          update: () => void;
          x: number;
          y: number;
          placement: import("@floating-ui/utils").Placement;
          strategy: import("@floating-ui/utils").Strategy;
          middlewareData: import("@floating-ui/core").MiddlewareData;
          isPositioned: boolean;
          floatingStyles: React.CSSProperties;
          open: boolean;
          onOpenChange: (open: boolean, event?: Event, reason?: import("@floating-ui/react").OpenChangeReason) => void;
          events: import("@floating-ui/react").FloatingEvents;
          dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
          nodeId: string | undefined;
          floatingId: string;
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
  }
  export const Heading: ({ as: Component, className, children, size, }: HeadingProps) => import("react/jsx-runtime").JSX.Element;

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
declare module '@layerfi/components/components/Wizard/Wizard' {
  import { type PropsWithChildren, type ReactNode } from 'react';
  import type { Awaitable } from '@layerfi/components/types/utility/promises';
  export function useWizard(): {
      next: () => Promise<void>;
      previous: () => void;
  };
  type WizardProps = PropsWithChildren<{
      Header: ReactNode;
      Footer: ReactNode;
      onComplete?: () => Awaitable<void>;
  }>;
  export function Wizard({ Header, Footer, onComplete, children, }: WizardProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ui/Button/Button' {
  import { type ButtonProps } from 'react-aria-components';
  type ButtonVariant = 'solid' | 'ghost';
  type ButtonSize = 'md' | 'lg';
  const Button: import("react").ForwardRefExoticComponent<Omit<ButtonProps, "className"> & {
      icon?: true;
      size?: ButtonSize;
      variant?: ButtonVariant;
  } & import("react").RefAttributes<HTMLButtonElement>>;
  export { Button };

}
declare module '@layerfi/components/components/ui/Checkbox/Checkbox' {
  import { type CheckboxProps as AriaCheckboxProps } from 'react-aria-components';
  type CheckboxVariant = 'default' | 'success';
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
declare module '@layerfi/components/components/ui/Loading/LoadingSpinner' {
  import { type LucideProps } from 'lucide-react';
  export function LoadingSpinner({ size }: Pick<LucideProps, 'size'>): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ui/Modal/Modal' {
  import { type ComponentProps } from 'react';
  import { type DialogProps, type ModalOverlayProps } from 'react-aria-components';
  type ModalSize = 'md' | 'lg';
  const ModalOverlay: import("react").ForwardRefExoticComponent<Omit<ModalOverlayProps, "className"> & import("react").RefAttributes<HTMLDivElement>>;
  const InternalModal: import("react").ForwardRefExoticComponent<{
      size?: ModalSize;
      flexBlock?: boolean;
  } & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLDivElement>>;
  const Dialog: import("react").ForwardRefExoticComponent<Omit<DialogProps, "className"> & import("react").RefAttributes<HTMLElement>>;
  type AllowedModalOverlayProps = Pick<ComponentProps<typeof ModalOverlay>, 'isOpen' | 'onOpenChange'>;
  type AllowedInternalModalProps = Pick<ComponentProps<typeof InternalModal>, 'flexBlock' | 'size'>;
  type AllowedDialogProps = Pick<ComponentProps<typeof Dialog>, 'children'>;
  type ModalProps = AllowedModalOverlayProps & AllowedInternalModalProps & AllowedDialogProps;
  export function Modal({ isOpen, size, flexBlock, onOpenChange, children, }: ModalProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ui/Modal/ModalSlots' {
  import { type PropsWithChildren } from 'react';
  type ModalContextBarProps = {
      onClose?: () => void;
  };
  function ModalContextBar({ onClose }: ModalContextBarProps): import("react/jsx-runtime").JSX.Element;
  const ModalHeading: import("react").ForwardRefExoticComponent<Omit<Omit<Omit<Omit<import("react-aria-components").HeadingProps & import("react").RefAttributes<HTMLHeadingElement>, "className"> & {
      align?: "center";
      pbe?: import("@layerfi/components/components/ui/sharedUITypes").Spacing;
      size?: "2xs" | "xs" | "sm" | "lg";
  }, "ref"> & import("react").RefAttributes<HTMLHeadingElement>, "slot" | "level">, "ref"> & import("react").RefAttributes<HTMLHeadingElement>>;
  const ModalDescription: import("react").ForwardRefExoticComponent<Omit<Omit<{
      size?: "xs" | "sm" | "md" | "lg";
      pbe?: import("@layerfi/components/components/ui/sharedUITypes").Spacing;
      pbs?: import("@layerfi/components/components/ui/sharedUITypes").Spacing;
      align?: "center";
      variant?: "subtle";
  } & Pick<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, "ref">, "slot"> & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLParagraphElement>, "slot">, "ref"> & import("react").RefAttributes<HTMLParagraphElement>>;
  function ModalContent({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;
  function ModalActions({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;
  export { ModalContextBar, ModalHeading, ModalDescription, ModalContent, ModalActions, };

}
declare module '@layerfi/components/components/ui/Stack/Stack' {
  import { type PropsWithChildren } from 'react';
  import type { Spacing } from '@layerfi/components/components/ui/sharedUITypes';
  export type StackProps = PropsWithChildren<{
      align?: 'start' | 'center';
      gap?: Spacing;
      justify?: 'start' | 'center' | 'end';
      pbs?: Spacing;
      pbe?: Spacing;
      slot?: string;
      className?: string;
  }>;
  export function VStack(props: StackProps): import("react/jsx-runtime").JSX.Element;
  export function HStack(props: StackProps): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/components/ui/Typography/Heading' {
  import type { Spacing } from '@layerfi/components/components/ui/sharedUITypes';
  type HeadingDataProps = {
      align?: 'center';
      pbe?: Spacing;
      size?: '2xs' | 'xs' | 'sm' | 'lg';
  };
  const Heading: import("react").ForwardRefExoticComponent<Omit<Omit<import("react-aria-components").HeadingProps & import("react").RefAttributes<HTMLHeadingElement>, "className"> & HeadingDataProps, "ref"> & import("react").RefAttributes<HTMLHeadingElement>>;
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
  const P: import("react").ForwardRefExoticComponent<{
      size?: "xs" | "sm" | "md" | "lg";
      pbe?: Spacing;
      pbs?: Spacing;
      align?: "center";
      variant?: "subtle";
  } & Pick<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, "ref">, "slot"> & {
      children?: import("react").ReactNode | undefined;
  } & import("react").RefAttributes<HTMLParagraphElement>>;
  export { P };

}
declare module '@layerfi/components/components/ui/sharedUITypes' {
  export type Spacing = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl';

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
  import { useBankTransactions } from '@layerfi/components/hooks/useBankTransactions/index';
  import { DisplayState } from '@layerfi/components/types';
  export type BankTransactionsContextType = ReturnType<typeof useBankTransactions>;
  export const BankTransactionsContext: import("react").Context<{
      data?: import("@layerfi/components/types").BankTransaction[];
      metadata?: import("@layerfi/components/types").Metadata;
      loadingStatus: import("@layerfi/components/types/general").LoadedStatus;
      isLoading: boolean;
      isValidating: boolean;
      error: unknown;
      hasMore?: boolean;
      filters?: import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters;
      accountsList?: import("@layerfi/components/hooks/useBankTransactions/types").AccountItem[];
      display: DisplayState;
      categorize: (id: import("@layerfi/components/types").BankTransaction["id"], newCategory: import("../../types").CategoryUpdate, notify?: boolean) => Promise<void>;
      match: (id: import("@layerfi/components/types").BankTransaction["id"], matchId: import("../../types").BankTransaction["id"], notify?: boolean) => Promise<void>;
      updateOneLocal: (bankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      shouldHideAfterCategorize: (bankTransaction: import("@layerfi/components/types").BankTransaction) => boolean;
      removeAfterCategorize: (bankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      refetch: () => void;
      setFilters: (filters?: Partial<import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters>) => void;
      activate: () => void;
      fetchMore: () => void;
  }>;
  export const useBankTransactionsContext: () => {
      data?: import("@layerfi/components/types").BankTransaction[];
      metadata?: import("@layerfi/components/types").Metadata;
      loadingStatus: import("@layerfi/components/types/general").LoadedStatus;
      isLoading: boolean;
      isValidating: boolean;
      error: unknown;
      hasMore?: boolean;
      filters?: import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters;
      accountsList?: import("@layerfi/components/hooks/useBankTransactions/types").AccountItem[];
      display: DisplayState;
      categorize: (id: import("@layerfi/components/types").BankTransaction["id"], newCategory: import("../../types").CategoryUpdate, notify?: boolean) => Promise<void>;
      match: (id: import("@layerfi/components/types").BankTransaction["id"], matchId: import("../../types").BankTransaction["id"], notify?: boolean) => Promise<void>;
      updateOneLocal: (bankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      shouldHideAfterCategorize: (bankTransaction: import("@layerfi/components/types").BankTransaction) => boolean;
      removeAfterCategorize: (bankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      refetch: () => void;
      setFilters: (filters?: Partial<import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters>) => void;
      activate: () => void;
      fetchMore: () => void;
  };

}
declare module '@layerfi/components/contexts/BankTransactionsContext/index' {
  export { BankTransactionsContext, useBankTransactionsContext, } from '@layerfi/components/contexts/BankTransactionsContext/BankTransactionsContext';

}
declare module '@layerfi/components/contexts/ChartOfAccountsContext/ChartOfAccountsContext' {
  import { useChartOfAccounts } from '@layerfi/components/hooks/useChartOfAccounts/index';
  export type ChartOfAccountsContextType = ReturnType<typeof useChartOfAccounts>;
  export const ChartOfAccountsContext: import("react").Context<{
      data: import("@layerfi/components/types/chart_of_accounts").ChartWithBalances | undefined;
      isLoading: boolean;
      isValidating: boolean;
      error: any;
      refetch: () => Promise<{
          data: import("@layerfi/components/types/chart_of_accounts").ChartWithBalances;
      } | undefined>;
      create: (newAccount: import("@layerfi/components/types").NewAccount) => Promise<void>;
      form: import("@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts").ChartOfAccountsForm | undefined;
      sendingForm: boolean;
      apiError: string | undefined;
      addAccount: () => void;
      editAccount: (id: string) => void;
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
declare module '@layerfi/components/contexts/DrawerContext/DrawerContext' {
  import { useDrawer } from '@layerfi/components/hooks/useDrawer/index';
  export type DrawerContextType = ReturnType<typeof useDrawer>;
  export const DrawerContext: import("react").Context<{
      content?: import("react").ReactNode;
      setContent: (content: import("react").ReactNode) => void;
      finishClosing: () => void;
      isClosing: boolean;
      close: () => void;
  }>;

}
declare module '@layerfi/components/contexts/DrawerContext/index' {
  export { DrawerContext } from '@layerfi/components/contexts/DrawerContext/DrawerContext';

}
declare module '@layerfi/components/contexts/JournalContext/JournalContext' {
  import { useJournal } from '@layerfi/components/hooks/useJournal/index';
  export type JournalContextType = ReturnType<typeof useJournal>;
  export const JournalContext: import("react").Context<{
      data?: import("@layerfi/components/types").JournalEntry[];
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
      changeFormData: (name: string, value: string | import("@layerfi/components/types/general").BaseSelectOption | undefined | number, lineItemIndex?: number, accounts?: import("../../types/chart_of_accounts").LedgerAccountBalance[]) => void;
      submitForm: () => void;
      cancelForm: () => void;
      addEntry: () => void;
      sendingForm: boolean;
      form?: import("@layerfi/components/hooks/useJournal/useJournal").JournalFormTypes;
      apiError?: string;
      setForm: (form?: import("@layerfi/components/hooks/useJournal/useJournal").JournalFormTypes) => void;
      addEntryLine: (direction: import("@layerfi/components/index").Direction) => void;
      removeEntryLine: (index: number) => void;
      reverseEntry: (entryId: string) => ReturnType<(baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<never, never>>>;
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
      accountId?: string;
      setAccountId: (id?: string) => void;
      selectedEntryId?: string;
      setSelectedEntryId: (id?: string) => void;
      closeSelectedEntry: () => void;
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
      unlinkAccount: (source: import("@layerfi/components/types/linked_accounts").AccountSource, accountId: string) => void;
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
declare module '@layerfi/components/contexts/ReceiptsContext/ReceiptsContext' {
  import { useReceipts } from '@layerfi/components/hooks/useReceipts/index';
  export type ReceiptsContextType = ReturnType<typeof useReceipts>;
  export const ReceiptsContext: import("react").Context<{
      receiptUrls: import("@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts").DocumentWithStatus[];
      uploadReceipt: (file: File) => void;
      archiveDocument: (document: import("@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts").DocumentWithStatus) => void;
  }>;
  export const useReceiptsContext: () => {
      receiptUrls: import("@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts").DocumentWithStatus[];
      uploadReceipt: (file: File) => void;
      archiveDocument: (document: import("@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts").DocumentWithStatus) => void;
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
declare module '@layerfi/components/hooks/balanceSheet/useBalanceSheet' {
  export function useBalanceSheet({ effectiveDate, }: {
      effectiveDate?: Date;
  }): import("swr").SWRResponse<import("../../types").BalanceSheet, any, any>;

}
declare module '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods' {
  import type { Task } from '@layerfi/components/types/tasks';
  import type { EnumWithUnknownValues } from '@layerfi/components/types/utility/enumWithUnknownValues';
  const BOOKKEEPING_PERIOD_STATUSES: readonly ["BOOKKEEPING_NOT_PURCHASED", "NOT_STARTED", "IN_PROGRESS_NO_TASKS", "IN_PROGRESS_OPEN_TASKS", "CLOSED_IN_REVIEW", "CLOSED_OPEN_TASKS", "CLOSED_COMPLETE"];
  export type BookkeepingPeriodStatus = typeof BOOKKEEPING_PERIOD_STATUSES[number];
  type RawBookkeepingPeriodStatus = EnumWithUnknownValues<BookkeepingPeriodStatus>;
  export type BookkeepingPeriod = {
      id: string;
      month: number;
      year: number;
      status: RawBookkeepingPeriodStatus;
      tasks: ReadonlyArray<Task>;
  };
  export function useBookkeepingPeriods(): import("swr").SWRResponse<{
      test: number;
      status: "NOT_STARTED" | "BOOKKEEPING_NOT_PURCHASED" | "IN_PROGRESS_NO_TASKS" | "IN_PROGRESS_OPEN_TASKS" | "CLOSED_IN_REVIEW" | "CLOSED_OPEN_TASKS" | "CLOSED_COMPLETE";
      id: string;
      month: number;
      year: number;
      tasks: ReadonlyArray<Task>;
  }[], any, any>;
  export {};

}
declare module '@layerfi/components/hooks/bookkeeping/useBookkeepingStatus' {
  const BOOKKEEPING_STATUSES: readonly ["NOT_PURCHASED", "ACTIVE", "ONBOARDING", "BOOKKEEPING_PAUSED"];
  export type BookkeepingStatus = typeof BOOKKEEPING_STATUSES[number];
  export function isActiveBookkeepingStatus(status: BookkeepingStatus): status is "ACTIVE" | "ONBOARDING";
  export function useBookkeepingStatus(): import("swr").SWRResponse<{
      status: "ACTIVE" | "NOT_PURCHASED" | "ONBOARDING" | "BOOKKEEPING_PAUSED";
  }, any, any>;
  export function useEffectiveBookkeepingStatus(): "ACTIVE" | "NOT_PURCHASED" | "ONBOARDING" | "BOOKKEEPING_PAUSED";
  export {};

}
declare module '@layerfi/components/hooks/business/useUpdateBusiness' {
  export const BUSINESS_TAG_KEY = "business";
  export function useUpdateBusiness(): import("swr/mutation").SWRMutationResponse<import("../../types").Business | undefined, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly [`business:${string}`];
  } | undefined, Partial<import("@layerfi/components/types").Business>> & {
      trigger: (extraArgument: Partial<import("@layerfi/components/types").Business>, options?: (import("swr/mutation").SWRMutationConfiguration<import("../../types").Business | undefined, any, () => {
          readonly accessToken: string;
          readonly apiUrl: string;
          readonly businessId: string;
          readonly tags: readonly [`business:${string}`];
      } | undefined, Partial<import("@layerfi/components/types").Business>, unknown> & {
          throwOnError: false;
      }) | undefined) => Promise<import("@layerfi/components/types").Business | undefined>;
  };

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
  export function useCreateBusinessPersonnel(): import("swr/mutation").SWRMutationResponse<BusinessPersonnel | undefined, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly tags: readonly ["#business-personnel:create"];
  } | undefined, CreateBusinessPersonnelBody> & {
      trigger: (extraArgument: CreateBusinessPersonnelBody, options?: (import("swr/mutation").SWRMutationConfiguration<BusinessPersonnel | undefined, any, () => {
          readonly accessToken: string;
          readonly apiUrl: string;
          readonly businessId: string;
          readonly tags: readonly ["#business-personnel:create"];
      } | undefined, CreateBusinessPersonnelBody, unknown> & {
          throwOnError: false;
      }) | undefined) => Promise<BusinessPersonnel | undefined>;
  };
  export {};

}
declare module '@layerfi/components/hooks/businessPersonnel/useUpdateBusinessPersonnel' {
  import { type UpdateBusinessPersonnelBody } from '@layerfi/components/api/layer/businessPersonnel/updateBusinessPersonnel';
  export function useUpdateBusinessPersonnel({ businessPersonnelId }: {
      businessPersonnelId?: string;
  }): import("swr/mutation").SWRMutationResponse<import("./types").BusinessPersonnel | undefined, any, () => {
      readonly accessToken: string;
      readonly apiUrl: string;
      readonly businessId: string;
      readonly businessPersonnelId: string;
      readonly tags: readonly [`#business-personnel:${string}`];
  } | undefined, UpdateBusinessPersonnelBody> & {
      trigger: (extraArgument: UpdateBusinessPersonnelBody, options?: (import("swr/mutation").SWRMutationConfiguration<import("./types").BusinessPersonnel | undefined, any, () => {
          readonly accessToken: string;
          readonly apiUrl: string;
          readonly businessId: string;
          readonly businessPersonnelId: string;
          readonly tags: readonly [`#business-personnel:${string}`];
      } | undefined, UpdateBusinessPersonnelBody, unknown> & {
          throwOnError: false;
      }) | undefined) => Promise<import("@layerfi/components/hooks/businessPersonnel/types").BusinessPersonnel | undefined>;
  };

}
declare module '@layerfi/components/hooks/categories/useAllCategories' {
  export function useAllCategories(): import("swr").SWRResponse<import("../../types").Category[], any, any>;

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
declare module '@layerfi/components/hooks/useBankTransactions/index' {
  export { useBankTransactions } from '@layerfi/components/hooks/useBankTransactions/useBankTransactions';

}
declare module '@layerfi/components/hooks/useBankTransactions/types' {
  import { BankTransaction, CategoryUpdate, DateRange, Direction, DisplayState, Metadata } from '@layerfi/components/types';
  import { LoadedStatus } from '@layerfi/components/types/general';
  import { TagFilterInput } from '@layerfi/components/types/tags';
  export interface NumericRangeFilter {
      min?: number;
      max?: number;
  }
  export interface AccountItem {
      id: string;
      name: string;
  }
  export interface BankTransactionFilters {
      amount?: NumericRangeFilter;
      account?: string[];
      direction?: Direction[];
      categorizationStatus?: DisplayState;
      dateRange?: Partial<DateRange>;
      tagFilter?: TagFilterInput;
  }
  export type UseBankTransactionsParams = {
      scope?: DisplayState;
      monthlyView?: boolean;
  };
  export type UseBankTransactions = (params?: UseBankTransactionsParams) => {
      data?: BankTransaction[];
      metadata?: Metadata;
      loadingStatus: LoadedStatus;
      isLoading: boolean;
      isValidating: boolean;
      error: unknown;
      hasMore?: boolean;
      filters?: BankTransactionFilters;
      accountsList?: AccountItem[];
      display: DisplayState;
      categorize: (id: BankTransaction['id'], newCategory: CategoryUpdate, notify?: boolean) => Promise<void>;
      match: (id: BankTransaction['id'], matchId: BankTransaction['id'], notify?: boolean) => Promise<void>;
      updateOneLocal: (bankTransaction: BankTransaction) => void;
      shouldHideAfterCategorize: (bankTransaction: BankTransaction) => boolean;
      removeAfterCategorize: (bankTransaction: BankTransaction) => void;
      refetch: () => void;
      setFilters: (filters?: Partial<BankTransactionFilters>) => void;
      activate: () => void;
      fetchMore: () => void;
  };

}
declare module '@layerfi/components/hooks/useBankTransactions/useBankTransactions' {
  import { UseBankTransactions } from "@layerfi/components/hooks/useBankTransactions/types";
  export const useBankTransactions: UseBankTransactions;

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
declare module '@layerfi/components/hooks/useChartOfAccounts/index' {
  export { useChartOfAccounts } from '@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts';

}
declare module '@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts' {
  import { FormError, DateRange, NewAccount } from '@layerfi/components/types';
  import { LedgerAccountBalance } from '@layerfi/components/types/chart_of_accounts';
  import { BaseSelectOption } from '@layerfi/components/types/general';
  export interface ChartOfAccountsForm {
      action: 'new' | 'edit';
      accountId?: string;
      data: {
          parent?: BaseSelectOption;
          stable_name?: string;
          name?: string;
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
  export const flattenAccounts: (accounts: LedgerAccountBalance[]) => LedgerAccountBalance[];
  export const useChartOfAccounts: ({ withDates, startDate: initialStartDate, endDate: initialEndDate }?: Props) => {
      data: import("@layerfi/components/types/chart_of_accounts").ChartWithBalances | undefined;
      isLoading: boolean;
      isValidating: boolean;
      error: any;
      refetch: () => Promise<{
          data: import("@layerfi/components/types/chart_of_accounts").ChartWithBalances;
      } | undefined>;
      create: (newAccount: NewAccount) => Promise<void>;
      form: ChartOfAccountsForm | undefined;
      sendingForm: boolean;
      apiError: string | undefined;
      addAccount: () => void;
      editAccount: (id: string) => void;
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
declare module '@layerfi/components/hooks/useDrawer/index' {
  export { useDrawer } from '@layerfi/components/hooks/useDrawer/useDrawer';

}
declare module '@layerfi/components/hooks/useDrawer/useDrawer' {
  import { ReactNode } from 'react';
  type UseDrawer = () => {
      content?: ReactNode;
      setContent: (content: ReactNode) => void;
      finishClosing: () => void;
      isClosing: boolean;
      close: () => void;
  };
  export const useDrawer: UseDrawer;
  export {};

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
  import { Direction, FormError, FormErrorWithId } from '@layerfi/components/types';
  import { LedgerAccountBalance } from '@layerfi/components/types/chart_of_accounts';
  import { BaseSelectOption } from '@layerfi/components/types/general';
  import { JournalEntry, NewApiJournalEntry, NewFormJournalEntry } from '@layerfi/components/types/journal';
  type UseJournal = () => {
      data?: JournalEntry[];
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
      addEntryLine: (direction: Direction) => void;
      removeEntryLine: (index: number) => void;
      reverseEntry: (entryId: string) => ReturnType<typeof Layer.reverseJournalEntry>;
  };
  export interface JournalFormTypes {
      action: string;
      data: NewFormJournalEntry;
      errors?: {
          entry: FormError[];
          lineItems: FormErrorWithId[];
      } | undefined;
  }
  export const useJournal: UseJournal;
  export {};

}
declare module '@layerfi/components/hooks/useLedgerAccounts/index' {
  export { useLedgerAccounts } from '@layerfi/components/hooks/useLedgerAccounts/useLedgerAccounts';

}
declare module '@layerfi/components/hooks/useLedgerAccounts/useLedgerAccounts' {
  import { LedgerAccounts, LedgerAccountsEntry } from '@layerfi/components/types';
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
      accountId?: string;
      setAccountId: (id?: string) => void;
      selectedEntryId?: string;
      setSelectedEntryId: (id?: string) => void;
      closeSelectedEntry: () => void;
  };
  export const useLedgerAccounts: UseLedgerAccounts;
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
      unlinkAccount: (source: AccountSource, accountId: string) => void;
      confirmAccount: (source: AccountSource, accountId: string) => void;
      excludeAccount: (source: AccountSource, accountId: string) => void;
      accountsToAddOpeningBalanceInModal: LinkedAccount[];
      setAccountsToAddOpeningBalanceInModal: (accounts: LinkedAccount[]) => void;
      breakConnection: (source: AccountSource, connectionExternalId: string) => void;
  };
  export const useLinkedAccounts: UseLinkedAccounts;
  export {};

}
declare module '@layerfi/components/hooks/usePagination/index' {
  export { usePagination, DOTS } from '@layerfi/components/hooks/usePagination/usePagination';

}
declare module '@layerfi/components/hooks/usePagination/usePagination' {
  export const DOTS = "...";
  export interface UsePaginationProps {
      totalCount: number;
      pageSize: number;
      siblingCount?: number;
      currentPage: number;
  }
  export type UsePaginationReturn = (string | number)[] | undefined;
  export const usePagination: ({ totalCount, pageSize, siblingCount, currentPage, }: UsePaginationProps) => UsePaginationReturn;

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss' {
  import { ReportingBasis, SortDirection, type DateRange } from '@layerfi/components/types';
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
      data: import("@layerfi/components/types").ProfitAndLoss | undefined;
      filteredDataRevenue: never[] | import("@layerfi/components/types/line_item").LineBaseItem[];
      filteredTotalRevenue: number | undefined;
      filteredDataExpenses: never[] | import("@layerfi/components/types/line_item").LineBaseItem[];
      filteredTotalExpenses: number | undefined;
      isLoading: boolean;
      isValidating: boolean;
      error: unknown;
      dateRange: {
          startDate: Date;
          endDate: Date;
      };
      changeDateRange: ({ startDate: start, endDate: end }: DateRange) => void;
      refetch: () => void;
      sidebarScope: SidebarScope;
      setSidebarScope: import("react").Dispatch<import("react").SetStateAction<SidebarScope>>;
      sortBy: (scope: Scope, field: string, direction?: SortDirection) => void;
      filters: ProfitAndLossFilters;
      setFilterTypes: (scope: Scope, types: string[]) => void;
      tagFilter: PnlTagFilter | undefined;
  };
  export {};

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLossLTM' {
  import { ReportingBasis } from '@layerfi/components/types';
  import { LoadedStatus } from '@layerfi/components/types/general';
  import { ProfitAndLossSummary } from '@layerfi/components/types/profit_and_loss';
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
      isLoading?: boolean;
      loaded?: LoadedStatus;
      error?: unknown;
      pullData: (date: Date) => void;
      refetch: () => void;
  };
  /**
   * Hooks fetch Last Twelve Months sending 12 requests (one for each month).
   * Implementation is not perfect, but we cannot use loops and arrays with hooks.
   */
  export const useProfitAndLossLTM: UseProfitAndLossLTMReturn;
  export {};

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLossQuery' {
  import { ProfitAndLoss, ReportingBasis } from '@layerfi/components/types';
  type UseProfitAndLossQueryProps = {
      startDate: Date;
      endDate: Date;
      tagFilter?: {
          key: string;
          values: string[];
      };
      reportingBasis?: ReportingBasis;
  };
  type UseProfitAndLossQueryReturn = (props?: UseProfitAndLossQueryProps) => {
      data?: ProfitAndLoss;
      isLoading: boolean;
      isValidating: boolean;
      error: unknown;
      refetch: () => void;
      startDate: Date;
      endDate: Date;
  };
  export const useProfitAndLossQuery: UseProfitAndLossQueryReturn;
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
  type UseQuickbooks = () => {
      linkQuickbooks: () => Promise<string>;
      unlinkQuickbooks: () => void;
      syncFromQuickbooks: () => void;
      isSyncingFromQuickbooks: boolean;
      quickbooksIsLinked: boolean | null;
  };
  export const useQuickbooks: UseQuickbooks;
  export {};

}
declare module '@layerfi/components/hooks/useReceipts/index' {
  export { useReceipts } from '@layerfi/components/hooks/useReceipts/useReceipts';

}
declare module '@layerfi/components/hooks/useReceipts/useReceipts' {
  import { DocumentWithStatus } from '@layerfi/components/components/BankTransactionReceipts/BankTransactionReceipts';
  import { BankTransaction } from '@layerfi/components/types';
  export interface UseReceiptsProps {
      bankTransaction: BankTransaction;
      isActive?: boolean;
  }
  type UseReceipts = (props: UseReceiptsProps) => {
      receiptUrls: DocumentWithStatus[];
      uploadReceipt: (file: File) => void;
      archiveDocument: (document: DocumentWithStatus) => void;
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
declare module '@layerfi/components/hooks/useTasks/index' {
  export { useTasks } from '@layerfi/components/hooks/useTasks/useTasks';

}
declare module '@layerfi/components/hooks/useTasks/mockData' {
  import { Task } from '@layerfi/components/types/tasks';
  export const mockData: Task[];

}
declare module '@layerfi/components/hooks/useTasks/useTasks' {
  import { BookkeepingPeriod } from '@layerfi/components/hooks/bookkeeping/periods/useBookkeepingPeriods';
  type UseTasks = () => {
      data?: BookkeepingPeriod[];
      isLoading?: boolean;
      isValidating?: boolean;
      error?: unknown;
      currentDate: Date;
      setCurrentDate: (date: Date) => void;
      refetch: () => void;
      submitResponseToTask: (taskId: string, userResponse: string) => void;
      uploadDocumentsForTask: (taskId: string, files: File[], description?: string) => Promise<void>;
      deleteUploadsForTask: (taskId: string) => void;
      updateDocUploadTaskDescription: (taskId: string, userResponse: string) => void;
  };
  export const useTasks: UseTasks;
  export {};

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
  export { BankTransactions } from '@layerfi/components/components/BankTransactions/index';
  export { Quickbooks } from '@layerfi/components/components/Quickbooks/index';
  export { ProfitAndLoss } from '@layerfi/components/components/ProfitAndLoss/index';
  export { BalanceSheet } from '@layerfi/components/components/BalanceSheet/index';
  export { StatementOfCashFlow } from '@layerfi/components/components/StatementOfCashFlow/index';
  export { ChartOfAccounts } from '@layerfi/components/components/ChartOfAccounts/index';
  export { Journal } from '@layerfi/components/components/Journal/index';
  export { Tasks } from '@layerfi/components/components/Tasks/Tasks';
  export { LinkAccounts } from '@layerfi/components/components/PlatformOnboarding/LinkAccounts';
  export { BookkeepingUpsellBar } from '@layerfi/components/components/UpsellBanner/index';
  export { BookkeepingOverview } from '@layerfi/components/views/BookkeepingOverview/index';
  export { AccountingOverview } from '@layerfi/components/views/AccountingOverview/index';
  export { BankTransactionsWithLinkedAccounts } from '@layerfi/components/views/BankTransactionsWithLinkedAccounts/index';
  export { GeneralLedgerView } from '@layerfi/components/views/GeneralLedger/index';
  export { ProjectProfitabilityView } from '@layerfi/components/views/ProjectProfitability/index';
  export { Reports } from '@layerfi/components/views/Reports/index';
  export { ProfitAndLossView } from '@layerfi/components/components/ProfitAndLossView/index';
  export { useLayerContext } from '@layerfi/components/contexts/LayerContext/index';
  export { useBankTransactionsContext } from '@layerfi/components/contexts/BankTransactionsContext/index';
  export { BankTransactionsProvider } from '@layerfi/components/providers/BankTransactionsProvider/index';
  export { useDataSync } from '@layerfi/components/hooks/useDataSync/index';
  export { DisplayState, Direction } from '@layerfi/components/types/bank_transactions';

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
  const _DATE_PICKER_MODES: readonly ["dayPicker"];
  export type DatePickerMode = typeof _DATE_PICKER_MODES[number];
  const _RANGE_PICKER_MODES: readonly ["dayRangePicker", "monthPicker", "monthRangePicker", "yearPicker"];
  export type DateRangePickerMode = typeof _RANGE_PICKER_MODES[number];
  export function useGlobalDate(): {
      date: Date;
      displayMode: "dayPicker";
  };
  export function useGlobalDateActions(): {
      set: (options: {
          date: Date;
      }) => void;
  };
  export function useGlobalDateRange(): {
      start: Date;
      end: Date;
      rangeDisplayMode: "dayRangePicker" | "monthPicker" | "monthRangePicker" | "yearPicker";
  };
  export function useGlobalDateRangeActions(): {
      setRange: (options: {
          start: Date;
          end: Date;
      }) => void;
      setRangeDisplayMode: (options: {
          rangeDisplayMode: DateRangePickerMode;
      }) => void;
      setRangeWithExplicitDisplayMode: (options: {
          start: Date;
          end: Date;
          rangeDisplayMode: DateRangePickerMode;
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
  type GlobalDateStoreProviderProps = PropsWithChildren;
  export function GlobalDateStoreProvider({ children, }: GlobalDateStoreProviderProps): import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/GlobalDateStore/useGlobalDateRangePicker' {
  import { type DateRangePickerMode } from '@layerfi/components/providers/GlobalDateStore/GlobalDateStoreProvider';
  export function useGlobalDateRangePicker({ allowedDatePickerModes, defaultDatePickerMode, onSetMonth, }: {
      allowedDatePickerModes?: ReadonlyArray<DateRangePickerMode>;
      defaultDatePickerMode?: DateRangePickerMode;
      onSetMonth?: (startOfMonth: Date) => void;
  }): {
      allowedDateRangePickerModes: import("@layerfi/components/utils/array/getArrayWithAtLeastOneOrFallback").ReadonlyArrayWithAtLeastOne<"dayRangePicker" | "monthPicker" | "monthRangePicker" | "yearPicker">;
      dateFormat: "MMM d" | undefined;
      rangeDisplayMode: "dayRangePicker" | "monthPicker" | "monthRangePicker" | "yearPicker";
      selected: Date | [Date, Date];
      setSelected: ({ start, end }: {
          start: Date;
          end: Date;
      }) => void;
      setRangeDisplayMode: (options: {
          rangeDisplayMode: DateRangePickerMode;
      }) => void;
  };

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
  import { Categorization, CategorizationStatus, Category } from '@layerfi/components/types/categories';
  import { S3PresignedUrl } from '@layerfi/components/types/general';
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
      category: CategoryWithEntries;
      categorization_status: CategorizationStatus;
      categorization_flow: Categorization | null;
      categorization_method: string;
      error?: string;
      processing?: boolean;
      suggested_matches?: SuggestedMatch[];
      match?: BankTransactionMatch;
      document_ids: string[];
  }
  export interface SuggestedMatch {
      id: string;
      matchType: string;
      details: {
          amount: number;
          date: string;
          description: string;
          id: string;
          type: string;
      };
  }
  export interface BankTransactionMatch {
      bank_transaction: BankTransaction;
      id: string;
      match_type?: string;
      details: {
          amount: number;
          date: string;
          description: string;
          id: string;
          type: string;
      };
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
  import { TransactionTag } from '@layerfi/components/types/tags';
  import { Vendor } from '@layerfi/components/types/vendors';
  const UNPAID_STATUS_MAP: {
      readonly SENT: "SENT";
      readonly PARTIALLY_PAID: "PARTIALLY_PAID";
  };
  export type UnpaidStatuses = typeof UNPAID_STATUS_MAP[keyof typeof UNPAID_STATUS_MAP];
  export const UNPAID_STATUSES: ("SENT" | "PARTIALLY_PAID")[];
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
  type BillTerm = 'DUE_ON_RECEIPT' | 'NET_10' | 'NET_15' | 'NET_30' | 'NET_60';
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
      transaction_tags: TransactionTag[];
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
      transaction_tags: TransactionTag[];
  };
  type SalesTax = {
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
  import { Category } from '@layerfi/components/types/categories';
  export interface ChartOfAccounts {
      type: string;
      accounts: Account[];
      entries?: unknown[];
  }
  export interface AccountEntry {
      account: Account;
      amount?: number;
      createdAt?: string;
      direction: Direction;
      entry_at?: string;
      entry_id?: string;
      id?: string;
  }
  export interface Account {
      id: string;
      number: number;
      pnlCategory?: Category;
      headerForPnlCategory?: Category;
      name: string;
      accountStableName?: string;
      description?: string;
      scheduleCLine?: string;
      scheduleCLineDescription?: string;
      sub_accounts?: Account[];
      hidePnl: boolean;
      showInPnlIfEmpty: boolean;
      normality: Direction;
      balance: number;
      selfOnlyBalance: number;
      entries?: AccountEntry[];
  }
  export type ChartWithBalances = {
      accounts: LedgerAccountBalance[];
  };
  export type ApiAccountType = {
      value: string;
      display_name: string;
  };
  export type LedgerAccountBalance = {
      id: string;
      name: string;
      stable_name: string;
      account_type: ApiAccountType;
      account_subtype?: ApiAccountType;
      normality: Direction;
      balance: number;
      sub_accounts: LedgerAccountBalance[];
  };
  export type NewAccount = {
      name: string;
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
      normality: Direction;
      parent_id?: {
          type: 'AccountId';
          id: string;
      };
      account_type: string;
      account_subtype?: string;
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
      CHART_OF_ACCOUNTS = "CHART_OF_ACCOUNTS",
      JOURNAL = "JOURNAL",
      LEDGER_ACCOUNTS = "LEDGER_ACCOUNTS",
      LINKED_ACCOUNTS = "LINKED_ACCOUNTS",
      PROFIT_AND_LOSS = "PROFIT_AND_LOSS",
      STATEMENT_OF_CASH_FLOWS = "STATEMENT_OF_CASH_FLOWS",
      TASKS = "TASKS"
  }

}
declare module '@layerfi/components/types/journal' {
  import { Account } from '@layerfi/components/types';
  import { Direction } from '@layerfi/components/types/bank_transactions';
  import { AccountIdentifierPayloadObject } from '@layerfi/components/types/categories';
  import { LedgerEntrySource } from '@layerfi/components/types/ledger_accounts';
  export interface JournalEntry {
      id: string;
      business_id: string;
      ledger_id: string;
      agent: string;
      entry_type: string;
      entry_number: number;
      date: string;
      entry_at: string;
      reversal_of_id: string | null;
      reversal_id: string | null;
      line_items: JournalEntryLine[];
      source?: LedgerEntrySource;
  }
  export interface JournalEntryLine {
      id: string;
      entry_id: string;
      account: Account;
      amount: number;
      direction: Direction;
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
      direction: Direction;
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
          stable_name: string;
          id: string;
          name: string;
          subType: {
              value: string;
              label: string;
          } | undefined;
      };
      amount: number;
      direction: Direction;
  };

}
declare module '@layerfi/components/types/layer_context' {
  import { ToastProps } from '@layerfi/components/components/Toast/Toast';
  import { LayerError } from '@layerfi/components/models/ErrorHandler';
  import { EventCallbacks } from '@layerfi/components/providers/LayerProvider/LayerProvider';
  import { Business, Category } from '@layerfi/components/types';
  import { DataModel } from '@layerfi/components/types/general';
  export type LayerContextValues = {
      businessId: string;
      business?: Business;
      categories: Category[];
      theme?: LayerThemeConfig;
      colors: ColorsPalette;
      onboardingStep?: OnboardingStep;
      toasts: (ToastProps & {
          isExiting: boolean;
      })[];
      eventCallbacks?: EventCallbacks;
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
      setCategories = "LayerContext.setCategories",
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
      type: LayerContextActionName.setCategories;
      payload: {
          categories: LayerContextValues['categories'];
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
  import { BankTransaction, Direction } from '@layerfi/components/types/bank_transactions';
  export type LedgerAccountLineItems = LedgerAccountLineItem[];
  export interface LedgerAccountsEntry {
      agent?: string;
      business_id: string;
      date: string;
      entry_at: string;
      entry_number?: number;
      entry_type: string;
      id: string;
      invoice?: Record<string, string>;
      ledger_id: string;
      line_items: LedgerAccountLineItem[];
      manual_entry?: boolean;
      reversal_id?: string;
      reversal_of_id?: string;
      type: string;
      transaction?: BankTransaction;
      source?: LedgerEntrySource;
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
      source?: LedgerEntrySource;
      running_balance: number;
      entry_reversal_of?: string;
      entry_reversed_by?: string;
  }
  export interface LedgerEntrySource {
      display_description: string;
      entity_name: string;
      type: string;
  }
  export interface TransactionLedgerEntrySource extends LedgerEntrySource {
      transaction_id: string;
      external_id: string;
      account_name: string;
      date: string;
      amount: number;
      direction: Direction;
      counterparty?: string;
  }
  export interface InvoiceLedgerEntrySource extends LedgerEntrySource {
      invoice_id: string;
      external_id: string;
      invoice_number: string;
      recipient_name: string;
      date: string;
      amount: number;
  }
  export interface ManualLedgerEntrySource extends LedgerEntrySource {
      manual_entry_id: string;
      memo: string;
      created_by: string;
  }
  export interface InvoicePaymentLedgerEntrySource extends LedgerEntrySource {
      external_id: string;
      invoice_id: string;
      invoice_number: string;
      amount: number;
  }
  export interface RefundLedgerEntrySource extends LedgerEntrySource {
      external_id: string;
      refund_id: string;
      refunded_to_customer_amount: number;
      recipient_name: string;
  }
  export interface RefundPaymentLedgerEntrySource extends LedgerEntrySource {
      external_id: string;
      refund_id: string;
      refund_payment_id: string;
      refunded_to_customer_amount: number;
      recipient_name: string;
  }
  export interface OpeningBalanceLedgerEntrySource extends LedgerEntrySource {
      account_name: string;
  }
  export interface PayoutLedgerEntrySource extends LedgerEntrySource {
      payout_id: string;
      external_id: string;
      paid_out_amount: number;
      processor: string;
      completed_at: string;
  }

}
declare module '@layerfi/components/types/line_item' {
  export interface LineItem {
      name?: string;
      display_name: string;
      value: number | undefined;
      line_items?: LineItem[] | null;
      is_contra?: boolean;
  }
  export interface LineBaseItem {
      name?: string;
      display_name: string;
      value: number;
      type: string;
      share?: number;
      hidden?: boolean;
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
  type KnownAccountNotificationType = typeof _KNOWN_ACCOUNT_NOTIFICATION_TYPES[number];
  const _KNOWN_ACCOUNT_NOTIFICATION_SCOPES: readonly ["USER"];
  type KnownAccountNotificationScope = typeof _KNOWN_ACCOUNT_NOTIFICATION_SCOPES[number];
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
  };
  export type LinkedAccounts = {
      type: string;
      external_accounts: Array<LinkedAccount>;
  };
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
  import { LineItem } from '@layerfi/components/types/line_item';
  import { TagViewConfig } from '@layerfi/components/types/tags';
  export interface ProfitAndLoss {
      type: 'Profit_And_Loss';
      business_id: string;
      start_date: string;
      end_date: string;
      income: LineItem;
      cost_of_goods_sold?: LineItem | null;
      gross_profit: number;
      expenses: LineItem;
      profit_before_taxes: number;
      taxes: LineItem;
      net_profit: number;
      other_outflows?: LineItem | null;
      personal_expenses?: LineItem | null;
      fully_categorized: boolean;
  }
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
  export interface ProfitAndLossSummary {
      year: number;
      month: number;
      income: number;
      costOfGoodsSold: number;
      grossProfit: number;
      operatingExpenses: number;
      profitBeforeTaxes: number;
      taxes: number;
      netProfit: number;
      fullyCategorized: boolean;
      totalExpenses: number;
      uncategorizedInflows: number;
      uncategorizedOutflows: number;
      totalExpensesInverse?: number;
      uncategorizedOutflowsInverse?: number;
      uncategorized_transactions: number;
  }
  export interface ProfitAndLossSummaries {
      type: 'Profit_And_Loss_Summaries';
      months: ProfitAndLossSummary[];
  }
  export {};

}
declare module '@layerfi/components/types/quickbooks' {
  export type StatusOfSyncFromQuickbooks = {
      is_syncing: boolean;
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
  export type TransactionTag = {
      id: string;
      key: string;
      value: string;
      created_at: string;
      updated_at: string;
      deleted_at?: string;
  };
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
  export type Task = {
      id: string;
      question: string;
      status: TasksStatusType;
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
  export type TasksStatusType = 'COMPLETED' | 'TODO' | 'USER_MARKED_COMPLETED';
  export type TasksResponseType = 'FREE_RESPONSE' | 'UPLOAD_DOCUMENT';
  export function isComplete(taskType: TasksStatusType): boolean;
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
      [Key in keyof Omit<Second, keyof First>]: never;
  };
  type MergeTypes<Types extends Array<unknown>, Result = Record<never, never>> = Types extends [infer Head, ...infer Remaining] ? MergeTypes<Remaining, Result & Head> : Result;
  export type OneOf<Types extends Array<unknown>, Result = never, AllProperties = MergeTypes<Types>> = Types extends [infer Head, ...infer Remaining] ? OneOf<Remaining, Result | OnlyFirst<Head, AllProperties>, AllProperties> : Result;
  export {};

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
  export { ProfitAndLoss } from '@layerfi/components/types/profit_and_loss';
  export { LineItem } from '@layerfi/components/types/line_item';
  export { BalanceSheet } from '@layerfi/components/types/balance_sheet';
  export { StatementOfCashFlow } from '@layerfi/components/types/statement_of_cash_flow';
  export { Direction, BankTransaction, DisplayState, } from '@layerfi/components/types/bank_transactions';
  export { CategorizationStatus, Category, CategorizationType, AutoCategorization, SuggestedCategorization, SingleCategoryUpdate, SplitCategoryUpdate, CategoryUpdate, } from '@layerfi/components/types/categories';
  export { ChartOfAccounts, Account, NewAccount, EditAccount, } from '@layerfi/components/types/chart_of_accounts';
  export { LedgerAccountLineItems as LedgerAccounts, LedgerAccountLineItem, LedgerAccountsAccount, LedgerAccountsEntry, } from '@layerfi/components/types/ledger_accounts';
  export { SortDirection } from '@layerfi/components/types/general';
  export { Business } from '@layerfi/components/types/business';
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
declare module '@layerfi/components/utils/bills' {
  import { Bill } from '@layerfi/components/types/bills';
  export const isBillPaid: (status?: Bill["status"]) => status is "PAID";
  export const isBillUnpaid: (status?: Bill["status"]) => boolean;

}
declare module '@layerfi/components/utils/bookkeeping/isCategorizationEnabled' {
  import type { BookkeepingStatus } from '@layerfi/components/hooks/bookkeeping/useBookkeepingStatus';
  export function isCategorizationEnabledForStatus(status: BookkeepingStatus): boolean | undefined;

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
  /** Get month name from number. Index starts from 0 (January = 0, December = 11) */
  export const getMonthNameFromNumber: (month: number) => string;

}
declare module '@layerfi/components/utils/delay/runDelayed' {
  export function runDelayedSync<T>(block: () => T, delayMs?: number): Promise<T>;

}
declare module '@layerfi/components/utils/form' {
  export const notEmpty: (value?: string) => boolean;
  export const validateEmailFormat: (email?: string, required?: boolean) => boolean;

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
  export const debounce: <F extends (...args: Parameters<F>) => ReturnType<F>>(fnc: F, timeout?: number) => (...args: Parameters<F>) => void;
  export const sleep: (time: number) => Promise<unknown>;
  /**
   * Convert the account name into stable_name
   */
  export const convertToStableName: (name: string) => string;

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
  import { LineItem } from '@layerfi/components/types';
  export const generateComparisonPeriods: (startDate: Date, numberOfPeriods: number, rangeDisplayMode: DateRangePickerMode) => string[];
  export const getComparisonValue: (name: string, depth: number, cellData: string | number | LineItem) => string | number;
  export const mergeComparisonLineItemsAtDepth: (lineItems: LineItem[]) => LineItem[];

}
declare module '@layerfi/components/utils/profitAndLossUtils' {
  import { SidebarScope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { LineBaseItem } from '@layerfi/components/types/line_item';
  import { ProfitAndLoss } from '@layerfi/components/types/profit_and_loss';
  export const collectExpensesItems: (data: ProfitAndLoss) => LineBaseItem[];
  export const collectRevenueItems: (data: ProfitAndLoss) => LineBaseItem[];
  export const humanizeTitle: (sidebarView: SidebarScope) => "Expenses" | "Revenue" | "Profit & Loss";
  export const applyShare: (items: LineBaseItem[], total: number) => LineBaseItem[];

}
declare module '@layerfi/components/utils/request/toDefinedSearchParameters' {
  export type ParameterValues = Date | string | ReadonlyArray<string> | number | boolean;
  export function toDefinedSearchParameters(input: Record<string, ParameterValues | null | undefined>): URLSearchParams;

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
declare module '@layerfi/components/utils/switch/safeAssertUnreachable' {
  export function safeAssertUnreachable(value: never, message?: string): never;

}
declare module '@layerfi/components/utils/swr/defaultSWRConfig' {
  export const DEFAULT_SWR_CONFIG: {
      readonly refreshInterval: 0;
      readonly revalidateOnFocus: false;
      readonly revalidateOnReconnect: false;
      readonly revalidateIfStale: false;
  };

}
declare module '@layerfi/components/utils/swr/withSWRKeyTags' {
  export function withSWRKeyTags(key: unknown, predicate: (tags: ReadonlyArray<string>) => boolean): boolean;

}
declare module '@layerfi/components/utils/time/timeUtils' {
  export const toLocalDateString: (date: Date) => string;

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
      showTransactionsToReview?: boolean;
      slotProps?: {
          profitAndLoss?: {
              summaries?: {
                  variants?: Variants;
              };
          };
      };
  }
  export const AccountingOverview: ({ title, showTitle, enableOnboarding, onboardingStepOverride, onTransactionsToReviewClick, middleBanner, chartColorsList, stringOverrides, tagFilter, showTransactionsToReview, slotProps, }: AccountingOverviewProps) => import("react/jsx-runtime").JSX.Element;
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
  import { BankTransactionsStringOverrides } from '@layerfi/components/components/BankTransactions/BankTransactions';
  import { BankTransactionsMode } from '@layerfi/components/providers/LegacyModeProvider/LegacyModeProvider';
  import { MobileComponentType } from '@layerfi/components/components/BankTransactions/constants';
  interface BankTransactionsWithLinkedAccountsStringOverrides {
      title?: string;
      linkedAccounts?: BankTransactionsWithLinkedAccountsStringOverrides;
      bankTransactions?: BankTransactionsStringOverrides;
  }
  export interface BankTransactionsWithLinkedAccountsProps {
      title?: string;
      showTitle?: boolean;
      elevatedLinkedAccounts?: boolean;
      showLedgerBalance?: boolean;
      showUnlinkItem?: boolean;
      showBreakConnection?: boolean;
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
      showTooltips?: boolean;
      /**
       * @deprecated `mode` can be inferred from the bookkeeping configuration of a business
       */
      mode?: BankTransactionsMode;
      mobileComponent?: MobileComponentType;
      stringOverrides?: BankTransactionsWithLinkedAccountsStringOverrides;
  }
  export const BankTransactionsWithLinkedAccounts: ({ title, showTitle, elevatedLinkedAccounts, showLedgerBalance, showUnlinkItem, showBreakConnection, mode, showDescriptions, showReceiptUploads, showTooltips, mobileComponent, stringOverrides, }: BankTransactionsWithLinkedAccountsProps) => import("react/jsx-runtime").JSX.Element;
  export {};

}
declare module '@layerfi/components/views/BankTransactionsWithLinkedAccounts/index' {
  export { BankTransactionsWithLinkedAccounts } from '@layerfi/components/views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts';

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
      /**
       * @deprecated Use `stringOverrides.title` instead
       */
      title?: string;
  }
  export const BookkeepingOverview: ({ title, showTitle, stringOverrides, slotProps, }: BookkeepingOverviewProps) => import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/views/BookkeepingOverview/index' {
  export { BookkeepingOverview } from '@layerfi/components/views/BookkeepingOverview/BookkeepingOverview';

}
declare module '@layerfi/components/views/BookkeepingOverview/internal/BookkeepingProfitAndLossSummariesContainer' {
  import { PropsWithChildren } from 'react';
  export function BookkeepingProfitAndLossSummariesContainer({ children, }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;

}
declare module '@layerfi/components/views/GeneralLedger/GeneralLedger' {
  import { ChartOfAccountsStringOverrides } from '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts';
  import { JournalStringOverrides } from '@layerfi/components/components/Journal/Journal';
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
  }
  export const GeneralLedgerView: ({ title, showTitle, stringOverrides, chartOfAccountsOptions, }: GeneralLedgerProps) => import("react/jsx-runtime").JSX.Element;

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
  import { RefObject } from 'react';
  import { BalanceSheetStringOverrides } from '@layerfi/components/components/BalanceSheet/BalanceSheet';
  import { ProfitAndLossDetailedChartsStringOverrides } from '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts';
  import { PnLDownloadButtonStringOverrides } from '@layerfi/components/components/ProfitAndLossDownloadButton/index';
  import { ProfitAndLossTableStringOverrides } from '@layerfi/components/components/ProfitAndLossTable/index';
  import { StatementOfCashFlowStringOverrides } from '@layerfi/components/components/StatementOfCashFlow/StatementOfCashFlow';
  import { View as ViewType } from '@layerfi/components/types/general';
  import type { TimeRangePickerConfig } from '@layerfi/components/views/Reports/reportTypes';
  import { ProfitAndLossCompareConfig } from '@layerfi/components/types/profit_and_loss';
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
  }
  type ReportType = 'profitAndLoss' | 'balanceSheet' | 'statementOfCashFlow';
  export interface ReportsPanelProps {
      containerRef: RefObject<HTMLDivElement>;
      openReport: ReportType;
      stringOverrides?: ReportsStringOverrides;
      profitAndLossConfig?: TimeRangePickerConfig;
      statementOfCashFlowConfig?: TimeRangePickerConfig;
      view: ViewBreakpoint;
  }
  export const Reports: ({ title, showTitle, stringOverrides, enabledReports, comparisonConfig, profitAndLossConfig, statementOfCashFlowConfig, }: ReportsProps) => import("react/jsx-runtime").JSX.Element;
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