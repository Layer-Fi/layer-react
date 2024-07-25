declare module '@layerfi/components/api/layer/authenticate' {
  import { OAuthResponse } from '@layerfi/components/types';
  type AuthenticationArguments = {
      appId: string;
      appSecret: string;
      authenticationUrl?: string;
      scope: string;
  };
  export const authenticate: ({ appId, appSecret, authenticationUrl, scope, }: AuthenticationArguments) => () => Promise<OAuthResponse>;
  export {};

}
declare module '@layerfi/components/api/layer/authenticated_http' {
  export type HTTPVerb = 'get' | 'put' | 'post' | 'patch' | 'options' | 'delete';
  export const get: <Return extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params | undefined;
  } | undefined) => () => Promise<Return>;
  export const request: (verb: HTTPVerb) => <Return extends Record<string, unknown> = Record<string, unknown>, Body_1 extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params | undefined;
      body?: Body_1 | undefined;
  } | undefined) => Promise<Return>;
  export const post: <Return extends Record<string, unknown> = Record<string, unknown>, Body_1 extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params | undefined;
      body?: Body_1 | undefined;
  } | undefined) => Promise<Return>;
  export const put: <Return extends Record<string, unknown> = Record<string, unknown>, Body_1 extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params | undefined;
      body?: Body_1 | undefined;
  } | undefined) => Promise<Return>;
  export const deleteRequest: <Return extends Record<string, unknown> = Record<string, unknown>, Body_1 extends Record<string, unknown> = Record<string, unknown>, Params extends Record<string, string | undefined> = Record<string, string | undefined>>(url: (params: Params) => string) => (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Params | undefined;
      body?: Body_1 | undefined;
  } | undefined) => Promise<Return>;
  export const postWithFormData: <Return extends Record<string, unknown> = Record<string, unknown>>(url: string, formData: FormData, baseUrl: string, accessToken: string | undefined) => Promise<Return>;

}
declare module '@layerfi/components/api/layer/balance_sheet' {
  import { BalanceSheet } from '@layerfi/components/types';
  export const getBalanceSheet: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetBalanceSheetParams | undefined;
  } | undefined) => () => Promise<GetBalanceSheetReturn>;
  export type GetBalanceSheetReturn = {
      data?: BalanceSheet;
      error?: unknown;
  };
  export interface GetBalanceSheetParams extends Record<string, string | undefined> {
      businessId: string;
      effectiveDate: string;
  }

}
declare module '@layerfi/components/api/layer/bankTransactions' {
  import { CategoryUpdate, BankTransaction, Metadata } from '@layerfi/components/types';
  import { BankTransactionMatch, BankTransactionMatchType, BankTransactionMetadata, DocumentS3Urls, FileMetadata } from '@layerfi/components/types/bank_transactions';
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
      data?: S3PresignedUrl | undefined;
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
  export const uploadBankTransactionDocument: (baseUrl: string, accessToken: string) => ({ businessId, bankTransactionId, file, documentType, }: {
      businessId: string;
      bankTransactionId: string;
      file: File;
      documentType: string;
  }) => Promise<{
      data: FileMetadata;
      errors: unknown;
  }>;

}
declare module '@layerfi/components/api/layer/business' {
  import { Business } from '@layerfi/components/types';
  export const getBusiness: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: Business;
  }>;

}
declare module '@layerfi/components/api/layer/categories' {
  import { Category } from '@layerfi/components/types';
  export const getCategories: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: {
          type: 'Category_List';
          categories: Category[];
      };
  }>;

}
declare module '@layerfi/components/api/layer/chart_of_accounts' {
  import { Account, ChartOfAccounts, NewAccount, EditAccount, LedgerAccountsEntry } from '@layerfi/components/types';
  import { ChartWithBalances } from '@layerfi/components/types/chart_of_accounts';
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

}
declare module '@layerfi/components/api/layer/journal' {
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
  export const getLinkedAccounts: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
      } | undefined;
  } | undefined) => () => Promise<{
      data: LinkedAccounts;
  }>;
  export const confirmConnection: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          accountId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
  export const denyConnection: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: {
          businessId: string;
          accountId: string;
      } | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<Record<string, unknown>>;
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
          type: 'Link_Token';
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
          type: 'Link_Token';
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

}
declare module '@layerfi/components/api/layer/profit_and_loss' {
  import { ProfitAndLoss } from '@layerfi/components/types';
  import { S3PresignedUrl } from '@layerfi/components/types/general';
  import { ProfitAndLossSummaries } from '@layerfi/components/types/profit_and_loss';
  export const getProfitAndLoss: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data?: ProfitAndLoss | undefined;
      error?: unknown;
  }>;
  export const getProfitAndLossSummaries: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data?: ProfitAndLossSummaries | undefined;
      error?: unknown;
  }>;
  export const getProfitAndLossCsv: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data?: S3PresignedUrl | undefined;
      error?: unknown;
  }>;

}
declare module '@layerfi/components/api/layer/quickbooks' {
  import { StatusOfSyncFromQuickbooks } from "@layerfi/components/types/quickbooks";
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
  export const getStatementOfCashFlow: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: GetStatementOfCashFlowParams | undefined;
  } | undefined) => () => Promise<GetStatementOfCashFlowReturn>;
  export type GetStatementOfCashFlowReturn = {
      data?: StatementOfCashFlow;
      error?: unknown;
  };
  export interface GetStatementOfCashFlowParams extends Record<string, string | undefined> {
      businessId: string;
      startDate: string;
      endDate: string;
  }

}
declare module '@layerfi/components/api/layer/tasks' {
  import { TaskTypes } from '@layerfi/components/types/tasks';
  export const getTasks: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: TaskTypes[];
  }>;
  export const submitResponseToTask: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: TaskTypes;
  }>;
  export const markTaskAsComplete: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: Record<string, unknown> | undefined;
  } | undefined) => Promise<{
      data: TaskTypes;
  }>;

}
declare module '@layerfi/components/api/layer' {
  export const Layer: {
      authenticate: ({ appId, appSecret, authenticationUrl, scope, }: {
          appId: string;
          appSecret: string;
          authenticationUrl?: string | undefined;
          scope: string;
      }) => () => Promise<import("@layerfi/components/types").OAuthResponse>;
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
          params?: import("@layerfi/components/api/layer/balance_sheet").GetBalanceSheetParams | undefined;
      } | undefined) => () => Promise<import("@layerfi/components/api/layer/balance_sheet").GetBalanceSheetReturn>;
      getBankTransactions: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: import("@layerfi/components/api/layer/bankTransactions").GetBankTransactionsParams | undefined;
      } | undefined) => () => Promise<import("@layerfi/components/api/layer/bankTransactions").GetBankTransactionsReturn>;
      getBankTransactionsCsv: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data?: import("@layerfi/components/types/general").S3PresignedUrl | undefined;
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
      updateBankTransactionMetadata: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: {
              memo: string;
          } | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/bank_transactions").BankTransactionMetadata;
          errors: unknown;
      }>;
      uploadBankTransactionDocument: (baseUrl: string, accessToken: string) => ({ businessId, bankTransactionId, file, documentType, }: {
          businessId: string;
          bankTransactionId: string;
          file: File;
          documentType: string;
      }) => Promise<{
          data: import("@layerfi/components/types/bank_transactions").FileMetadata;
          errors: unknown;
      }>;
      getCategories: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
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
      getProfitAndLoss: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data?: import("@layerfi/components/types").ProfitAndLoss | undefined;
          error?: unknown;
      }>;
      getProfitAndLossSummaries: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data?: import("@layerfi/components/types/profit_and_loss").ProfitAndLossSummaries | undefined;
          error?: unknown;
      }>;
      getProfitAndLossCsv: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data?: import("@layerfi/components/types/general").S3PresignedUrl | undefined;
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
      confirmConnection: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              accountId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      denyConnection: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: {
              businessId: string;
              accountId: string;
          } | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<Record<string, unknown>>;
      getTasks: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data: import("@layerfi/components/types/tasks").TaskTypes[];
      }>;
      submitResponseToTask: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: Record<string, unknown> | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types/tasks").TaskTypes;
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
      getStatementOfCashFlow: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: import("@layerfi/components/api/layer/statement-of-cash-flow").GetStatementOfCashFlowParams | undefined;
      } | undefined) => () => Promise<import("@layerfi/components/api/layer/statement-of-cash-flow").GetStatementOfCashFlowReturn>;
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
  };

}
declare module '@layerfi/components/api/util' {
  export const formStringFromObject: (object: Record<string, string | number | boolean>) => string;

}
declare module '@layerfi/components/components/ActionableList/ActionableList' {
  import React from 'react';
  export interface ActionableListOption<T> {
      label: string;
      id: string;
      value: T;
      asLink?: boolean;
      secondary?: boolean;
  }
  interface ActionableListProps<T> {
      options: ActionableListOption<T>[];
      onClick: (item: ActionableListOption<T>) => void;
      selected?: ActionableListOption<T>;
  }
  export const ActionableList: <T>({ options, onClick, selected, }: ActionableListProps<T>) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ActionableList/index' {
  export { ActionableList, ActionableListOption } from '@layerfi/components/components/ActionableList/ActionableList';

}
declare module '@layerfi/components/components/ActionableRow/ActionableRow' {
  import React, { ReactNode } from 'react';
  interface ActionableRowProps {
      icon?: ReactNode;
      iconBox?: ReactNode;
      title?: string | ReactNode;
      description?: string | ReactNode;
      button?: ReactNode;
      onClick?: () => void;
  }
  export const ActionableRow: ({ icon, iconBox, title, description, button, onClick, }: ActionableRowProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ActionableRow/index' {
  export { ActionableRow } from '@layerfi/components/components/ActionableRow/ActionableRow';

}
declare module '@layerfi/components/components/Badge/Badge' {
  import React, { ReactNode } from 'react';
  import { ButtonProps } from '@layerfi/components/components/Button/Button';
  export enum BadgeSize {
      SMALL = "small",
      MEDIUM = "medium"
  }
  export enum BadgeVariant {
      DEFAULT = "default",
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
  export const Badge: ({ icon, onClick, children, tooltip, size, variant, hoverable, }: BadgeProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Badge/index' {
  export { Badge } from '@layerfi/components/components/Badge/Badge';
  export { BadgeVariant } from '@layerfi/components/components/Badge/Badge';

}
declare module '@layerfi/components/components/BadgeLoader/BadgeLoader' {
  import React, { ReactNode } from 'react';
  export interface BadgeLoaderProps {
      children?: ReactNode;
      size?: number;
  }
  export const BadgeLoader: ({ children }: BadgeLoaderProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/BadgeLoader/index' {
  export { BadgeLoader } from '@layerfi/components/components/BadgeLoader/BadgeLoader';

}
declare module '@layerfi/components/components/BalanceSheet/BalanceSheet' {
  import React, { PropsWithChildren } from 'react';
  export type BalanceSheetViewProps = PropsWithChildren & {
      withExpandAllButton?: boolean;
      asWidget?: boolean;
  };
  export type BalanceSheetProps = PropsWithChildren & {
      effectiveDate?: Date;
      asWidget?: boolean;
  };
  export const BalanceSheet: (props: BalanceSheetProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/BalanceSheet/constants' {
  export const BALANCE_SHEET_ROWS: {
      name: string;
      displayName: string;
      lineItem: string;
  }[];

}
declare module '@layerfi/components/components/BalanceSheet/index' {
  export { BalanceSheet } from '@layerfi/components/components/BalanceSheet/BalanceSheet';

}
declare module '@layerfi/components/components/BalanceSheetDatePicker/BalanceSheetDatePicker' {
  import React from 'react';
  export type BalanceSheetDatePickerProps = {
      effectiveDate: Date;
      setEffectiveDate: (date: Date) => void;
  };
  export const BalanceSheetDatePicker: ({ effectiveDate, setEffectiveDate, }: BalanceSheetDatePickerProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/BalanceSheetDatePicker/index' {
  export { BalanceSheetDatePicker } from '@layerfi/components/components/BalanceSheetDatePicker/BalanceSheetDatePicker';

}
declare module '@layerfi/components/components/BalanceSheetExpandAllButton/BalanceSheetExpandAllButton' {
  import React from 'react';
  export const BalanceSheetExpandAllButton: () => React.JSX.Element;

}
declare module '@layerfi/components/components/BalanceSheetExpandAllButton/index' {
  export { BalanceSheetExpandAllButton } from '@layerfi/components/components/BalanceSheetExpandAllButton/BalanceSheetExpandAllButton';

}
declare module '@layerfi/components/components/BalanceSheetTable/BalanceSheetTable' {
  import React from 'react';
  import { BalanceSheet } from '@layerfi/components/types';
  type BalanceSheetRowProps = {
      name: string;
      displayName: string;
      lineItem: string;
  };
  export const BalanceSheetTable: ({ data, config, }: {
      data: BalanceSheet;
      config: BalanceSheetRowProps[];
  }) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BalanceSheetTable/index' {
  export { BalanceSheetTable } from '@layerfi/components/components/BalanceSheetTable/BalanceSheetTable';

}
declare module '@layerfi/components/components/BankTransactionList/Assignment' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  export interface AssignmentProps {
      bankTransaction: BankTransaction;
  }
  export const Assignment: ({ bankTransaction }: AssignmentProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionList/BankTransactionList' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  interface BankTransactionListProps {
      bankTransactions?: BankTransaction[];
      editable: boolean;
      containerWidth: number;
      removeTransaction: (id: string) => void;
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
  }
  export const BankTransactionList: ({ bankTransactions, editable, removeTransaction, containerWidth, showDescriptions, showReceiptUploads, }: BankTransactionListProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionList/BankTransactionListItem' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  type Props = {
      index: number;
      dateFormat: string;
      bankTransaction: BankTransaction;
      editable: boolean;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
      removeTransaction: (id: string) => void;
      containerWidth?: number;
  };
  export const BankTransactionListItem: ({ index, dateFormat, bankTransaction, editable, showDescriptions, showReceiptUploads, containerWidth, }: Props) => React.JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/BankTransactionList/index' {
  export { BankTransactionList } from '@layerfi/components/components/BankTransactionList/BankTransactionList';

}
declare module '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileForms' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  import { Purpose } from '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileListItem';
  interface BankTransactionMobileFormsProps {
      purpose: Purpose;
      bankTransaction: BankTransaction;
  }
  export const BankTransactionMobileForms: ({ purpose, bankTransaction, }: BankTransactionMobileFormsProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileList' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  export interface BankTransactionMobileListProps {
      bankTransactions?: BankTransaction[];
      editable: boolean;
      removeTransaction: (id: string) => void;
      initialLoad?: boolean;
  }
  export const BankTransactionMobileList: ({ bankTransactions, removeTransaction, editable, initialLoad, }: BankTransactionMobileListProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileListItem' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  export interface BankTransactionMobileListItemProps {
      index: number;
      bankTransaction: BankTransaction;
      editable: boolean;
      removeTransaction: (id: string) => void;
      initialLoad?: boolean;
  }
  export enum Purpose {
      business = "business",
      personal = "personal",
      more = "more"
  }
  export const BankTransactionMobileListItem: ({ index, bankTransaction, removeTransaction, editable, initialLoad, }: BankTransactionMobileListItemProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/BusinessCategories' {
  import React from 'react';
  import { Option } from '@layerfi/components/components/BankTransactionMobileList/utils';
  export interface BusinessCategoriesProps {
      select: (category: Option) => void;
  }
  export const BusinessCategories: ({ select }: BusinessCategoriesProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/BusinessForm' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  interface BusinessFormProps {
      bankTransaction: BankTransaction;
  }
  export const BusinessForm: ({ bankTransaction }: BusinessFormProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/MatchForm' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  export const MatchForm: ({ bankTransaction, }: {
      bankTransaction: BankTransaction;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/PersonalForm' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  interface PersonalFormProps {
      bankTransaction: BankTransaction;
  }
  export const PersonalForm: ({ bankTransaction }: PersonalFormProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/SplitAndMatchForm' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  interface SplitAndMatchFormProps {
      bankTransaction: BankTransaction;
  }
  export const SplitAndMatchForm: ({ bankTransaction, }: SplitAndMatchFormProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/SplitForm' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  export const SplitForm: ({ bankTransaction, }: {
      bankTransaction: BankTransaction;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/BankTransactionMobileList/TransactionToOpenContext' {
  /// <reference types="react" />
  type UseTransactionToOpen = () => {
      transactionIdToOpen?: string;
      setTransactionIdToOpen: (id: string) => void;
      clearTransactionIdToOpen: () => void;
  };
  export const useTransactionToOpen: UseTransactionToOpen;
  export type TransactionToOpenContextType = ReturnType<typeof useTransactionToOpen>;
  export const TransactionToOpenContext: import("react").Context<{
      transactionIdToOpen?: string | undefined;
      setTransactionIdToOpen: (id: string) => void;
      clearTransactionIdToOpen: () => void;
  }>;
  export {};

}
declare module '@layerfi/components/components/BankTransactionMobileList/constants' {
  export const PersonalCategories: string[];

}
declare module '@layerfi/components/components/BankTransactionMobileList/index' {
  export { BankTransactionMobileList } from '@layerfi/components/components/BankTransactionMobileList/BankTransactionMobileList';

}
declare module '@layerfi/components/components/BankTransactionMobileList/utils' {
  import { BankTransaction, Category } from '@layerfi/components/types';
  import { CategoryOptionPayload } from '@layerfi/components/components/CategorySelect/CategorySelect';
  export interface Option {
      label: string;
      id: string;
      value: {
          type: 'CATEGORY' | 'SELECT_CATEGORY' | 'GROUP';
          payload?: CategoryOptionPayload;
          items?: Option[];
      };
      asLink?: boolean;
      secondary?: boolean;
  }
  export const mapCategoryToOption: (category: Category) => Option;
  export const flattenCategories: (categories: Category[]) => Option[];
  export const getAssignedValue: (bankTransaction: BankTransaction) => Option | undefined;

}
declare module '@layerfi/components/components/BankTransactionRow/BankTransactionRow' {
  import React from 'react';
  import { BankTransaction, Category } from '@layerfi/components/types';
  type Props = {
      index: number;
      editable: boolean;
      dateFormat: string;
      bankTransaction: BankTransaction;
      removeTransaction: (id: string) => void;
      containerWidth?: number;
      initialLoad?: boolean;
      showDescriptions: boolean;
      showReceiptUploads: boolean;
  };
  export type LastSubmittedForm = 'simple' | 'match' | 'split' | undefined;
  export const extractDescriptionForSplit: (category: Category) => string;
  export const getDefaultSelectedCategory: (bankTransaction: BankTransaction) => import("@layerfi/components/components/CategorySelect/CategorySelect").CategoryOption | undefined;
  export const BankTransactionRow: ({ index, editable, dateFormat, bankTransaction, removeTransaction, containerWidth, initialLoad, showDescriptions, showReceiptUploads, }: Props) => React.JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/BankTransactionRow/MatchBadge' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  export interface MatchBadgeProps {
      bankTransaction: BankTransaction;
      classNamePrefix: string;
      dateFormat: string;
      text?: string;
  }
  export const MatchBadge: ({ bankTransaction, classNamePrefix, dateFormat, text, }: MatchBadgeProps) => React.JSX.Element | undefined;

}
declare module '@layerfi/components/components/BankTransactionRow/SplitTooltipDetails' {
  import React from 'react';
  import { Category } from '@layerfi/components/types';
  export const SplitTooltipDetails: ({ classNamePrefix, category, }: {
      classNamePrefix: string;
      category: Category;
  }) => React.JSX.Element | undefined;

}
declare module '@layerfi/components/components/BankTransactionRow/index' {
  export { BankTransactionRow } from '@layerfi/components/components/BankTransactionRow/BankTransactionRow';

}
declare module '@layerfi/components/components/BankTransactions/BankTransactions' {
  import React from 'react';
  import { BankTransactionFilters } from '@layerfi/components/hooks/useBankTransactions/types';
  import { MobileComponentType } from '@layerfi/components/components/BankTransactions/constants';
  export interface BankTransactionsProps {
      asWidget?: boolean;
      pageSize?: number;
      categorizedOnly?: boolean;
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
      monthlyView?: boolean;
      categorizeView?: boolean;
      mobileComponent?: MobileComponentType;
      filters?: BankTransactionFilters;
      hideHeader?: boolean;
  }
  export interface BankTransactionsWithErrorProps extends BankTransactionsProps {
      onError?: (error: Error) => void;
  }
  export const BankTransactions: ({ onError, ...props }: BankTransactionsWithErrorProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/BankTransactions/BankTransactionsHeader' {
  import React, { ChangeEvent } from 'react';
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
      setDateRange?: (value: DateRange) => void;
  }
  export const BankTransactionsHeader: ({ shiftStickyHeader, asWidget, categorizedOnly, categorizeView, display, onCategorizationDisplayChange, mobileComponent, withDatePicker, listView, dateRange, setDateRange, }: BankTransactionsHeaderProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/BankTransactions/DataStates' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  interface DataStatesProps {
      bankTransactions?: BankTransaction[];
      isLoading?: boolean;
      isValidating?: boolean;
      error?: unknown;
      refetch: () => void;
      editable: boolean;
  }
  export const DataStates: ({ bankTransactions, isLoading, isValidating, error, refetch, editable, }: DataStatesProps) => React.JSX.Element;
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
declare module '@layerfi/components/components/BankTransactionsTable/BankTransactionsTable' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  interface BankTransactionsTableProps {
      bankTransactions?: BankTransaction[];
      editable: boolean;
      categorizeView?: boolean;
      isLoading?: boolean;
      initialLoad?: boolean;
      containerWidth: number;
      removeTransaction: (id: string) => void;
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
  }
  export const BankTransactionsTable: ({ categorizeView, editable, isLoading, bankTransactions, initialLoad, containerWidth, removeTransaction, showDescriptions, showReceiptUploads, }: BankTransactionsTableProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BankTransactionsTable/index' {
  export { BankTransactionsTable } from '@layerfi/components/components/BankTransactionsTable/BankTransactionsTable';

}
declare module '@layerfi/components/components/Button/BackButton' {
  import React, { ButtonHTMLAttributes } from 'react';
  export interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      textOnly?: boolean;
  }
  export const BackButton: ({ className, children, textOnly, ...props }: BackButtonProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/Button' {
  import React, { ButtonHTMLAttributes, ReactNode } from 'react';
  export enum ButtonVariant {
      primary = "primary",
      secondary = "secondary"
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
  }
  export const Button: ({ className, children, variant, leftIcon, rightIcon, iconOnly, iconAsPrimary, justify, fullWidth, ...props }: ButtonProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/CloseButton' {
  import React, { ButtonHTMLAttributes } from 'react';
  export interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      textOnly?: boolean;
  }
  export const CloseButton: ({ className, children, textOnly, ...props }: CloseButtonProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/ExpandButton' {
  import React, { ButtonHTMLAttributes } from 'react';
  export interface ExpandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      collapsed?: boolean;
  }
  export const ExpandButton: ({ className, children, collapsed, ...props }: ExpandButtonProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/IconButton' {
  import React, { ButtonHTMLAttributes, ReactNode } from 'react';
  export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      icon: ReactNode;
      active?: boolean;
      withBorder?: boolean;
  }
  export const IconButton: ({ className, children, icon, active, withBorder, ...props }: IconButtonProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/Link' {
  import React, { HTMLAttributeAnchorTarget, LinkHTMLAttributes, ReactNode } from 'react';
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
  export const Link: ({ className, children, variant, leftIcon, rightIcon, iconOnly, iconAsPrimary, justify, fullWidth, ...props }: LinkProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/RetryButton' {
  import React, { ButtonHTMLAttributes } from 'react';
  export interface RetryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      processing?: boolean;
      disabled?: boolean;
      error: string;
      fullWidth?: boolean;
  }
  export const RetryButton: ({ className, processing, disabled, error, children, ...props }: RetryButtonProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/SubmitButton' {
  import React, { ButtonHTMLAttributes } from 'react';
  export interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      processing?: boolean;
      disabled?: boolean;
      error?: boolean | string;
      active?: boolean;
      iconOnly?: boolean;
      action?: SubmitAction;
      noIcon?: boolean;
  }
  export enum SubmitAction {
      SAVE = "save",
      UPDATE = "update"
  }
  export const SubmitButton: ({ active, className, processing, disabled, error, children, action, noIcon, ...props }: SubmitButtonProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/TextButton' {
  import React, { ButtonHTMLAttributes } from 'react';
  export type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
  export const TextButton: ({ className, children, ...props }: TextButtonProps) => React.JSX.Element;

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
  export { Link } from '@layerfi/components/components/Button/Link';

}
declare module '@layerfi/components/components/Card/Card' {
  import React, { ReactNode } from 'react';
  export interface CardProps {
      children: ReactNode;
      className?: string;
  }
  export const Card: ({ children, className }: CardProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Card/index' {
  export { Card } from '@layerfi/components/components/Card/Card';

}
declare module '@layerfi/components/components/CategorySelect/CategorySelect' {
  import React from 'react';
  import { BankTransaction, Category } from '@layerfi/components/types';
  import { SuggestedMatch } from '@layerfi/components/types/bank_transactions';
  import { CategoryEntry } from '@layerfi/components/types/categories';
  type Props = {
      name?: string;
      bankTransaction: BankTransaction;
      value: CategoryOption | undefined;
      onChange: (newValue: CategoryOption) => void;
      disabled?: boolean;
      className?: string;
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
      date?: string;
      amount?: number;
      type?: string;
      stable_name?: string;
      entries?: CategoryEntry[];
      subCategories?: Category[];
  }
  export interface CategoryOption {
      type: string;
      disabled?: boolean;
      payload: CategoryOptionPayload;
  }
  export const mapCategoryToOption: (category: Category) => CategoryOption;
  export const mapSuggestedMatchToOption: (record: SuggestedMatch) => CategoryOption;
  export const CategorySelect: ({ bankTransaction, name, value, onChange, disabled, className, excludeMatches, asDrawer, }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CategorySelect/CategorySelectDrawer' {
  import React from 'react';
  import { CategoryOption } from '@layerfi/components/components/CategorySelect/CategorySelect';
  interface CategorySelectDrawerProps {
      onSelect: (value: CategoryOption) => void;
      selected?: CategoryOption;
  }
  export const CategorySelectDrawer: ({ onSelect, selected, }: CategorySelectDrawerProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CategorySelect/index' {
  export { CategorySelect } from '@layerfi/components/components/CategorySelect/CategorySelect';

}
declare module '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts' {
  import React from 'react';
  export type View = 'mobile' | 'tablet' | 'desktop';
  export interface ChartOfAccountsProps {
      asWidget?: boolean;
      withDateControl?: boolean;
      withExpandAllButton?: boolean;
  }
  export const ChartOfAccounts: (props: ChartOfAccountsProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccounts/index' {
  export { ChartOfAccounts, View } from '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts';

}
declare module '@layerfi/components/components/ChartOfAccountsDatePicker/ChartOfAccountsDatePicker' {
  import React from 'react';
  export const ChartOfAccountsDatePicker: () => React.JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccountsDatePicker/index' {
  export { ChartOfAccountsDatePicker } from '@layerfi/components/components/ChartOfAccountsDatePicker/ChartOfAccountsDatePicker';

}
declare module '@layerfi/components/components/ChartOfAccountsForm/ChartOfAccountsForm' {
  import React from 'react';
  export const ChartOfAccountsForm: () => React.JSX.Element | undefined;

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
declare module '@layerfi/components/components/ChartOfAccountsRow/ChartOfAccountsRow' {
  import React from 'react';
  import { LedgerAccountBalance } from '@layerfi/components/types/chart_of_accounts';
  import { View } from '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts';
  import { ExpandActionState } from '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTable';
  type ChartOfAccountsRowProps = {
      account: LedgerAccountBalance;
      depth?: number;
      index: number;
      cumulativeIndex?: number;
      expanded: boolean;
      acountsLength: number;
      defaultOpen?: boolean;
      view?: View;
      expandAll?: ExpandActionState;
  };
  export const ChartOfAccountsRow: ({ account, depth, index, cumulativeIndex, expanded, defaultOpen, acountsLength, view, expandAll, }: ChartOfAccountsRowProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ChartOfAccountsRow/index' {
  export { ChartOfAccountsRow } from '@layerfi/components/components/ChartOfAccountsRow/ChartOfAccountsRow';

}
declare module '@layerfi/components/components/ChartOfAccountsSidebar/ChartOfAccountsSidebar' {
  import React, { RefObject } from 'react';
  export const ChartOfAccountsSidebar: ({ parentRef: _parentRef, }: {
      parentRef?: RefObject<HTMLDivElement>;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccountsSidebar/index' {
  export { ChartOfAccountsSidebar } from '@layerfi/components/components/ChartOfAccountsSidebar/ChartOfAccountsSidebar';

}
declare module '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTable' {
  import React, { RefObject } from 'react';
  import { View } from '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts';
  export type ExpandActionState = undefined | 'expanded' | 'collapsed';
  export const ChartOfAccountsTable: ({ view, containerRef, asWidget, withDateControl, withExpandAllButton, }: {
      view: View;
      containerRef: RefObject<HTMLDivElement>;
      asWidget?: boolean | undefined;
      withDateControl?: boolean | undefined;
      withExpandAllButton?: boolean | undefined;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccountsTable/index' {
  export { ChartOfAccountsTable } from '@layerfi/components/components/ChartOfAccountsTable/ChartOfAccountsTable';

}
declare module '@layerfi/components/components/Container/Container' {
  import React, { CSSProperties, ReactNode } from 'react';
  export interface ContainerProps {
      name: string;
      className?: string;
      asWidget?: boolean;
      elevated?: boolean;
      transparentBg?: boolean;
      children: ReactNode;
      style?: CSSProperties;
  }
  export const Container: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLDivElement>>;

}
declare module '@layerfi/components/components/Container/Header' {
  import React, { CSSProperties, ReactNode } from 'react';
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
  export const Header: React.ForwardRefExoticComponent<HeaderProps & React.RefAttributes<HTMLElement>>;

}
declare module '@layerfi/components/components/Container/index' {
  export { Container } from '@layerfi/components/components/Container/Container';
  export { Header } from '@layerfi/components/components/Container/Header';

}
declare module '@layerfi/components/components/DataState/DataState' {
  import React, { ReactNode } from 'react';
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
  }
  export const DataState: ({ status, title, description, onRefresh, isLoading, icon, }: DataStateProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/DataState/index' {
  export { DataState, DataStateStatus } from '@layerfi/components/components/DataState/DataState';

}
declare module '@layerfi/components/components/DatePicker/DatePicker' {
  import React from 'react';
  import 'react-datepicker/dist/react-datepicker.css';
  interface DatePickerProps {
      mode: 'dayPicker' | 'dayRangePicker' | 'monthPicker' | 'monthRangePicker' | 'timePicker';
      selected: Date | [Date | null, Date | null];
      onChange: (date: Date | [Date, Date | null]) => void;
      dateFormat?: string;
      timeIntervals?: number;
      timeCaption?: string;
      placeholderText?: string;
      options?: string[];
      wrapperClassName?: string;
      calendarClassName?: string;
      popperClassName?: string;
      currentDateOption?: boolean;
      minDate?: Date;
  }
  export const DatePicker: ({ selected, onChange, mode, dateFormat, timeIntervals, timeCaption, placeholderText, options, wrapperClassName, calendarClassName, popperClassName, minDate, currentDateOption, ...props }: DatePickerProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/DatePicker/DatePickerOptions' {
  import React from 'react';
  export const DatePickerOptions: ({ options, setSelectedDate, }: {
      options: string[];
      setSelectedDate: (dates: [Date | null, Date | null]) => void;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/DatePicker/index' {
  export { DatePicker } from '@layerfi/components/components/DatePicker/DatePicker';

}
declare module '@layerfi/components/components/DateTime/DateTime' {
  import React from 'react';
  interface DateTimeProps {
      value: string;
      format?: string;
      dateFormat?: string;
      timeFormat?: string;
      onlyDate?: boolean;
      onlyTime?: boolean;
  }
  export const DateTime: ({ value, format, dateFormat, timeFormat, onlyDate, onlyTime, }: DateTimeProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/DateTime/index' {
  export { DateTime } from '@layerfi/components/components/DateTime/DateTime';

}
declare module '@layerfi/components/components/DetailsList/DetailsList' {
  import React, { ReactNode } from 'react';
  export interface DetailsListProps {
      title?: string;
      className?: string;
      children: ReactNode;
      actions?: ReactNode;
  }
  export const DetailsList: ({ title, children, className, actions, }: DetailsListProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/DetailsList/DetailsListItem' {
  import React, { ReactNode } from 'react';
  export interface DetailsListItemProps {
      label: string;
      children: ReactNode | string;
      isLoading?: boolean;
  }
  export const DetailsListItem: ({ label, children, isLoading, }: DetailsListItemProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/DetailsList/index' {
  export { DetailsList } from '@layerfi/components/components/DetailsList/DetailsList';
  export { DetailsListItem } from '@layerfi/components/components/DetailsList/DetailsListItem';

}
declare module '@layerfi/components/components/Drawer/Drawer' {
  import React from 'react';
  export const Drawer: ({ isOpen, onClose, children, }: {
      isOpen: boolean;
      onClose: () => void;
      children: React.ReactNode;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/Drawer/index' {
  export { Drawer } from '@layerfi/components/components/Drawer/Drawer';

}
declare module '@layerfi/components/components/ErrorBoundary/ErrorBoundary' {
  import React, { ErrorInfo, Component } from 'react';
  import { LayerError } from '@layerfi/components/models/ErrorHandler';
  interface ErrorBoundaryProps {
      onError?: (error: Error) => void;
  }
  interface ErrorBoundaryState {
      hasError?: boolean;
  }
  export class ErrorBoundary extends Component<React.PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
      onError: (err: LayerError) => void;
      constructor(props: any);
      static getDerivedStateFromError(_error: Error): {
          hasError: boolean;
      };
      componentDidCatch(error: Error, _info: ErrorInfo): void;
      render(): any;
  }
  export {};

}
declare module '@layerfi/components/components/ErrorBoundary/ErrorBoundaryMessage' {
  import React from 'react';
  export const ErrorBoundaryMessage: () => React.JSX.Element;

}
declare module '@layerfi/components/components/ErrorBoundary/index' {
  export { ErrorBoundary } from '@layerfi/components/components/ErrorBoundary/ErrorBoundary';

}
declare module '@layerfi/components/components/ExpandedBankTransactionRow/APIErrorNotifications' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  interface APIErrorNotificationsProps {
      bankTransaction: BankTransaction;
      containerWidth?: number;
  }
  export const APIErrorNotifications: ({ bankTransaction, containerWidth, }: APIErrorNotificationsProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ExpandedBankTransactionRow/ExpandedBankTransactionRow' {
  import React from 'react';
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
  };
  export type SaveHandle = {
      save: () => void;
  };
  export const ExpandedBankTransactionRow: React.ForwardRefExoticComponent<Props & React.RefAttributes<SaveHandle>>;
  export {};

}
declare module '@layerfi/components/components/ExpandedBankTransactionRow/index' {
  export { ExpandedBankTransactionRow } from '@layerfi/components/components/ExpandedBankTransactionRow/ExpandedBankTransactionRow';

}
declare module '@layerfi/components/components/GlobalWidgets/GlobalWidgets' {
  import React from 'react';
  export const GlobalWidgets: () => React.JSX.Element;

}
declare module '@layerfi/components/components/GlobalWidgets/index' {
  export { GlobalWidgets } from '@layerfi/components/components/GlobalWidgets/GlobalWidgets';

}
declare module '@layerfi/components/components/HoverMenu/HoverMenu' {
  import React, { ReactNode } from 'react';
  export interface HoverMenuProps {
      children: ReactNode;
      config: {
          name: string;
          action: () => void;
      }[];
  }
  export const HoverMenu: ({ children, config }: HoverMenuProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/HoverMenu/index' {
  export { HoverMenu, HoverMenuProps } from '@layerfi/components/components/HoverMenu/HoverMenu';

}
declare module '@layerfi/components/components/IconBox/IconBox' {
  import React, { ReactNode } from 'react';
  interface IconBoxProps {
      children: ReactNode;
  }
  export const IconBox: ({ children }: IconBoxProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/IconBox/index' {
  export { IconBox } from '@layerfi/components/components/IconBox/IconBox';

}
declare module '@layerfi/components/components/Input/FileInput' {
  import React from 'react';
  export interface FileInputProps {
      text?: string;
      onUpload?: (file: File) => void;
  }
  export const FileInput: ({ text, onUpload }: FileInputProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Input/Input' {
  import React, { HTMLProps } from 'react';
  export interface InputProps extends HTMLProps<HTMLInputElement> {
      isInvalid?: boolean;
      errorMessage?: string;
      leftText?: string;
  }
  export const Input: ({ className, isInvalid, errorMessage, leftText, ...props }: InputProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Input/InputGroup' {
  import React, { ReactNode } from 'react';
  export interface InputGroupProps {
      label?: string;
      name?: string;
      className?: string;
      children?: ReactNode;
      inline?: boolean;
  }
  export const InputGroup: ({ label, name, className, inline, children, }: InputGroupProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Input/InputWithBadge' {
  import React, { HTMLProps } from 'react';
  import { BadgeVariant } from '@layerfi/components/components/Badge/index';
  export interface InputWithBadgeProps extends HTMLProps<HTMLInputElement> {
      isInvalid?: boolean;
      errorMessage?: string;
      leftText?: string;
      variant?: BadgeVariant;
      badge: React.ReactNode;
  }
  export const InputWithBadge: ({ className, isInvalid, errorMessage, leftText, badge, variant, ...props }: InputWithBadgeProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Input/Select' {
  import React from 'react';
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
  export const Select: <T>({ name, options, className, classNamePrefix, value, onChange, disabled, placeholder, isInvalid, errorMessage, }: SelectProps<T>) => React.JSX.Element;

}
declare module '@layerfi/components/components/Input/index' {
  export { Input } from '@layerfi/components/components/Input/Input';
  export { InputGroup } from '@layerfi/components/components/Input/InputGroup';
  export { FileInput } from '@layerfi/components/components/Input/FileInput';
  export { Select } from '@layerfi/components/components/Input/Select';
  export { InputWithBadge } from '@layerfi/components/components/Input/InputWithBadge';

}
declare module '@layerfi/components/components/Journal/Journal' {
  import React from 'react';
  export type View = 'mobile' | 'tablet' | 'desktop';
  export interface JournalConfig {
      form: {
          addEntryLinesLimit?: number;
      };
  }
  export interface JournalProps {
      asWidget?: boolean;
      config?: JournalConfig;
  }
  export const JOURNAL_CONFIG: JournalConfig;
  export const Journal: (props: JournalProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Journal/index' {
  export { Journal, View } from '@layerfi/components/components/Journal/Journal';

}
declare module '@layerfi/components/components/JournalEntryDetails/JournalEntryDetails' {
  import React from 'react';
  export const JournalEntryDetails: () => React.JSX.Element;

}
declare module '@layerfi/components/components/JournalEntryDetails/index' {
  export { JournalEntryDetails } from '@layerfi/components/components/JournalEntryDetails/JournalEntryDetails';

}
declare module '@layerfi/components/components/JournalForm/JournalForm' {
  import React from 'react';
  import { JournalConfig } from '@layerfi/components/components/Journal/Journal';
  export const JournalForm: ({ config }: {
      config: JournalConfig;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/JournalForm/JournalFormEntryLines' {
  import React from 'react';
  import { Direction, JournalEntryLineItem } from '@layerfi/components/types';
  import { LedgerAccountBalance } from '@layerfi/components/types/chart_of_accounts';
  import { BaseSelectOption } from '@layerfi/components/types/general';
  import { JournalConfig } from '@layerfi/components/components/Journal/Journal';
  export const JournalFormEntryLines: ({ entrylineItems, addEntryLine, removeEntryLine, changeFormData, sendingForm, config, }: {
      entrylineItems: JournalEntryLineItem[];
      addEntryLine: (direction: Direction) => void;
      removeEntryLine: (index: number) => void;
      changeFormData: (name: string, value: string | BaseSelectOption | number | undefined, lineItemIndex: number, accounts?: LedgerAccountBalance[] | undefined) => void;
      sendingForm: boolean;
      config: JournalConfig;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/JournalForm/index' {
  export { JournalForm } from '@layerfi/components/components/JournalForm/JournalForm';

}
declare module '@layerfi/components/components/JournalRow/JournalRow' {
  import React from 'react';
  import { JournalEntry, JournalEntryLine, JournalEntryLineItem } from '@layerfi/components/types';
  import { View } from '@layerfi/components/components/Journal/index';
  export interface JournalRowProps {
      row: JournalEntry | JournalEntryLine | JournalEntryLineItem;
      index: number;
      initialLoad?: boolean;
      view: View;
      lineItemsLength?: number;
      defaultOpen?: boolean;
      expanded?: boolean;
      depth?: number;
      cumulativeIndex?: number;
      selectedEntries?: boolean;
  }
  export const JournalRow: ({ row, index, initialLoad, view, lineItemsLength, defaultOpen, expanded, depth, cumulativeIndex, selectedEntries, }: JournalRowProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/JournalRow/index' {
  export { JournalRow } from '@layerfi/components/components/JournalRow/JournalRow';

}
declare module '@layerfi/components/components/JournalSidebar/JournalSidebar' {
  import React, { RefObject } from 'react';
  import { JournalConfig } from '@layerfi/components/components/Journal/Journal';
  export const JournalSidebar: ({ parentRef: _parentRef, config, }: {
      parentRef?: React.RefObject<HTMLDivElement> | undefined;
      config: JournalConfig;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/JournalSidebar/index' {
  export { JournalSidebar } from '@layerfi/components/components/JournalSidebar/JournalSidebar';

}
declare module '@layerfi/components/components/JournalTable/JournalTable' {
  import React, { RefObject } from 'react';
  import { View } from '@layerfi/components/components/Journal/index';
  import { JournalConfig } from '@layerfi/components/components/Journal/Journal';
  export const JournalTable: ({ view, containerRef, pageSize, config, }: {
      view: View;
      containerRef: RefObject<HTMLDivElement>;
      pageSize?: number | undefined;
      config: JournalConfig;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/JournalTable/index' {
  export { JournalTable } from '@layerfi/components/components/JournalTable/JournalTable';

}
declare module '@layerfi/components/components/LedgerAccount/LedgerAccountIndex' {
  import React, { RefObject } from 'react';
  import { View } from '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts';
  export interface LedgerAccountProps {
      view: View;
      containerRef: RefObject<HTMLDivElement>;
      pageSize?: number;
  }
  export const LedgerAccount: ({ containerRef, pageSize, view, }: LedgerAccountProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/LedgerAccount/LedgerAccountRow' {
  import React from 'react';
  import { LedgerAccountLineItem } from '@layerfi/components/types';
  import { View } from '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts';
  export interface LedgerAccountRowProps {
      row: LedgerAccountLineItem;
      index: number;
      initialLoad?: boolean;
      view: View;
  }
  export const LedgerAccountRow: ({ row, index, initialLoad, view, }: LedgerAccountRowProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/LedgerAccount/index' {
  export { LedgerAccount } from '@layerfi/components/components/LedgerAccount/LedgerAccountIndex';

}
declare module '@layerfi/components/components/LedgerAccountEntryDetails/LedgerAccountEntryDetails' {
  import React from 'react';
  import { LedgerEntrySource } from '@layerfi/components/types/ledger_accounts';
  export const SourceDetailView: ({ source }: {
      source: LedgerEntrySource;
  }) => React.JSX.Element | null;
  export const LedgerAccountEntryDetails: () => React.JSX.Element;

}
declare module '@layerfi/components/components/LedgerAccountEntryDetails/index' {
  export { LedgerAccountEntryDetails } from '@layerfi/components/components/LedgerAccountEntryDetails/LedgerAccountEntryDetails';

}
declare module '@layerfi/components/components/LinkedAccountOptions/LinkedAccountOptions' {
  import React from 'react';
  import { HoverMenuProps } from '@layerfi/components/components/HoverMenu/index';
  interface LinkedAccountOptionsProps extends HoverMenuProps {
      showLedgerBalance?: boolean;
  }
  export const LinkedAccountOptions: ({ children, config, showLedgerBalance, }: LinkedAccountOptionsProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccountOptions/index' {
  export { LinkedAccountOptions } from '@layerfi/components/components/LinkedAccountOptions/LinkedAccountOptions';

}
declare module '@layerfi/components/components/LinkedAccountPill/LinkedAccountPill' {
  import React from 'react';
  type Props = {
      text: string;
      config: {
          name: string;
          action: () => void;
      }[];
  };
  export const LinkedAccountPill: ({ text, config }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccountPill/index' {
  export { LinkedAccountPill } from '@layerfi/components/components/LinkedAccountPill/LinkedAccountPill';

}
declare module '@layerfi/components/components/LinkedAccountThumb/LinkedAccountThumb' {
  import React from 'react';
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
  export const LinkedAccountThumb: ({ account, asWidget, showLedgerBalance, pillConfig, }: LinkedAccountThumbProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/LinkedAccountThumb/index' {
  export { LinkedAccountThumb } from '@layerfi/components/components/LinkedAccountThumb/LinkedAccountThumb';

}
declare module '@layerfi/components/components/LinkedAccounts/LinkedAccounts' {
  import React from 'react';
  export interface LinkedAccountsProps {
      asWidget?: boolean;
      elevated?: boolean;
      showLedgerBalance?: boolean;
      showUnlinkItem?: boolean;
      showBreakConnection?: boolean;
  }
  export const LinkedAccounts: (props: LinkedAccountsProps) => React.JSX.Element;
  export const LinkedAccountsComponent: ({ asWidget, elevated, showLedgerBalance, showUnlinkItem, showBreakConnection, }: LinkedAccountsProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/LinkedAccounts/LinkedAccountsContent' {
  import React from 'react';
  interface LinkedAccountsDataProps {
      asWidget?: boolean;
      showLedgerBalance?: boolean;
      showUnlinkItem?: boolean;
      showBreakConnection?: boolean;
  }
  export const LinkedAccountsContent: ({ asWidget, showLedgerBalance, showUnlinkItem, showBreakConnection, }: LinkedAccountsDataProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/LinkedAccounts/index' {
  export { LinkedAccounts } from '@layerfi/components/components/LinkedAccounts/LinkedAccounts';

}
declare module '@layerfi/components/components/Loader/Loader' {
  import React, { ReactNode } from 'react';
  export interface LoaderProps {
      children?: ReactNode;
      size?: number;
  }
  export const Loader: ({ children, size }: LoaderProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Loader/index' {
  export { Loader } from '@layerfi/components/components/Loader/Loader';

}
declare module '@layerfi/components/components/MatchForm/MatchForm' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  export interface MatchFormProps {
      classNamePrefix: string;
      bankTransaction: BankTransaction;
      selectedMatchId?: string;
      setSelectedMatchId: (val?: string) => void;
      matchFormError?: string;
  }
  export const MatchForm: ({ classNamePrefix, bankTransaction, selectedMatchId, setSelectedMatchId, matchFormError, }: MatchFormProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/MatchForm/MatchFormMobile' {
  import React from 'react';
  import { MatchFormProps } from '@layerfi/components/components/MatchForm/MatchForm';
  export const MatchFormMobile: ({ classNamePrefix, bankTransaction, selectedMatchId, setSelectedMatchId, matchFormError, }: MatchFormProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/MatchForm/index' {
  export { MatchForm } from '@layerfi/components/components/MatchForm/MatchForm';
  export { MatchFormMobile } from '@layerfi/components/components/MatchForm/MatchFormMobile';

}
declare module '@layerfi/components/components/NotificationCard/NotificationCard' {
  import React, { ReactNode } from 'react';
  export interface NotificationCardProps {
      onClick: () => void;
      children: ReactNode;
      className?: string;
  }
  export const NotificationCard: ({ onClick, children, className, }: NotificationCardProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/NotificationCard/index' {
  export { NotificationCard } from '@layerfi/components/components/NotificationCard/NotificationCard';

}
declare module '@layerfi/components/components/Onboarding/ConnectAccount' {
  import React from 'react';
  import { OnboardingStep } from '@layerfi/components/types/layer_context';
  export interface ConnectAccountProps {
      onboardingStep: OnboardingStep;
      onTransactionsToReviewClick?: () => void;
      currentMonthOnly?: boolean;
  }
  export const ConnectAccount: ({ onboardingStep, onTransactionsToReviewClick, }: ConnectAccountProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Onboarding/Onboarding' {
  import React from 'react';
  export interface OnboardingProps {
      onTransactionsToReviewClick?: () => void;
  }
  export const Onboarding: (props: OnboardingProps) => React.JSX.Element;
  export const OnboardingContent: ({ onTransactionsToReviewClick, }: OnboardingProps) => React.JSX.Element | null;

}
declare module '@layerfi/components/components/Onboarding/index' {
  export { Onboarding } from '@layerfi/components/components/Onboarding/Onboarding';

}
declare module '@layerfi/components/components/Pagination/Pagination' {
  import React from 'react';
  export interface PaginationProps {
      currentPage: number;
      pageSize: number;
      onPageChange: (page: number) => void;
      totalCount: number;
      siblingCount?: number;
      hasMore?: boolean;
      fetchMore?: () => void;
  }
  export const Pagination: ({ onPageChange, totalCount, siblingCount, currentPage, pageSize, hasMore, fetchMore }: PaginationProps) => React.JSX.Element | undefined;

}
declare module '@layerfi/components/components/Pagination/index' {
  export { Pagination } from '@layerfi/components/components/Pagination/Pagination';

}
declare module '@layerfi/components/components/Panel/Panel' {
  import React, { ReactNode, RefObject } from 'react';
  export interface PanelProps {
      children: ReactNode;
      className?: string;
      sidebar?: ReactNode;
      sidebarIsOpen?: boolean;
      header?: ReactNode;
      parentRef?: RefObject<HTMLDivElement>;
      defaultSidebarHeight?: boolean;
  }
  export const Panel: ({ children, className, sidebar, header, sidebarIsOpen, parentRef, defaultSidebarHeight, }: PanelProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Panel/index' {
  export { Panel } from '@layerfi/components/components/Panel/Panel';

}
declare module '@layerfi/components/components/Pill/Pill' {
  import React, { PropsWithChildren } from 'react';
  type PillKind = 'default' | 'info' | 'success' | 'warning' | 'error';
  type Props = PropsWithChildren & {
      kind?: PillKind;
      onHover?: () => void;
  };
  export const Pill: ({ children, kind, onHover }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLoss/ProfitAndLoss' {
  import React, { PropsWithChildren } from 'react';
  import { ReportingBasis } from '@layerfi/components/types';
  type Props = PropsWithChildren & {
      tagFilter?: {
          key: string;
          values: string[];
      };
      reportingBasis?: ReportingBasis;
      asContainer?: boolean;
  };
  const ProfitAndLoss: {
      ({ children, tagFilter, reportingBasis, asContainer, }: Props): React.JSX.Element;
      Chart: () => React.JSX.Element;
      Context: React.Context<{
          data: import("@layerfi/components/types").ProfitAndLoss | undefined;
          filteredDataRevenue: import("@layerfi/components/types/line_item").LineBaseItem[];
          filteredTotalRevenue?: number | undefined;
          filteredDataExpenses: import("@layerfi/components/types/line_item").LineBaseItem[];
          filteredTotalExpenses?: number | undefined;
          isLoading: boolean;
          isValidating: boolean;
          error: unknown;
          dateRange: import("@layerfi/components/types").DateRange;
          changeDateRange: (dateRange: Partial<import("@layerfi/components/types").DateRange>) => void;
          refetch: () => void;
          sidebarScope: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").SidebarScope;
          setSidebarScope: (view: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").SidebarScope) => void;
          filters: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").ProfitAndLossFilters;
          sortBy: (scope: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").Scope, field: string, direction?: import("../../types").SortDirection | undefined) => void;
          setFilterTypes: (scope: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").Scope, types: string[]) => void;
      }>;
      DatePicker: () => React.JSX.Element;
      Summaries: ({ vertical, revenueLabel, actionable, }: {
          revenueLabel?: string | undefined;
          vertical?: boolean | undefined;
          actionable?: boolean | undefined;
      }) => React.JSX.Element;
      Table: ({ lockExpanded, asContainer }: {
          lockExpanded?: boolean | undefined;
          asContainer?: boolean | undefined;
      }) => React.JSX.Element;
      DetailedCharts: ({ scope, hideClose, showDatePicker, }: {
          scope?: import("@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss").SidebarScope;
          hideClose?: boolean | undefined;
          showDatePicker?: boolean | undefined;
      }) => React.JSX.Element;
  };
  export { ProfitAndLoss };

}
declare module '@layerfi/components/components/ProfitAndLoss/index' {
  export { ProfitAndLoss } from '@layerfi/components/components/ProfitAndLoss/ProfitAndLoss';

}
declare module '@layerfi/components/components/ProfitAndLossChart/Indicator' {
  import React from 'react';
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
  export const Indicator: ({ className, animateFrom, setAnimateFrom, customCursorSize, setCustomCursorSize, viewBox, }: Props) => React.JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossChart/ProfitAndLossChart' {
  import React from 'react';
  export const ProfitAndLossChart: () => React.JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossChart/index' {
  export { ProfitAndLossChart } from '@layerfi/components/components/ProfitAndLossChart/ProfitAndLossChart';

}
declare module '@layerfi/components/components/ProfitAndLossDatePicker/ProfitAndLossDatePicker' {
  import React from 'react';
  export const ProfitAndLossDatePicker: () => React.JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDatePicker/index' {
  export { ProfitAndLossDatePicker } from '@layerfi/components/components/ProfitAndLossDatePicker/ProfitAndLossDatePicker';

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/DetailedChart' {
  import React from 'react';
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
  }
  export const DetailedChart: ({ filteredData, filteredTotal, hoveredItem, setHoveredItem, sidebarScope, date, isLoading, showDatePicker, }: DetailedChartProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/DetailedTable' {
  import React from 'react';
  import { Scope, SidebarScope, ProfitAndLossFilters } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { SortDirection } from '@layerfi/components/types';
  import { LineBaseItem } from '@layerfi/components/types/line_item';
  export interface DetailedTableProps {
      filteredData: LineBaseItem[];
      hoveredItem?: string;
      setHoveredItem: (name?: string) => void;
      sidebarScope: SidebarScope;
      filters: ProfitAndLossFilters;
      sortBy: (scope: Scope, field: string, direction?: SortDirection) => void;
  }
  export const mapColorsToTypes: (data: any[]) => {
      color: any;
      opacity: any;
  }[];
  export const DetailedTable: ({ filteredData, sidebarScope, filters, sortBy, hoveredItem, setHoveredItem, }: DetailedTableProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/Filters' {
  import React from 'react';
  import { Scope, SidebarScope, ProfitAndLossFilters } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { LineBaseItem } from '@layerfi/components/types/line_item';
  export interface FiltersProps {
      filteredData: LineBaseItem[];
      sidebarScope: SidebarScope;
      filters: ProfitAndLossFilters;
      setFilterTypes: (scope: Scope, types: string[]) => void;
  }
  export const Filters: ({ filteredData, sidebarScope, filters, setFilterTypes, }: FiltersProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts' {
  import React from 'react';
  import { SidebarScope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  export const ProfitAndLossDetailedCharts: ({ scope, hideClose, showDatePicker, }: {
      scope?: SidebarScope;
      hideClose?: boolean | undefined;
      showDatePicker?: boolean | undefined;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossDetailedCharts/index' {
  export { ProfitAndLossDetailedCharts } from '@layerfi/components/components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts';

}
declare module '@layerfi/components/components/ProfitAndLossRow/ProfitAndLossRow' {
  import React from 'react';
  import { SidebarScope } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';
  import { Direction, LineItem } from '@layerfi/components/types';
  type Props = {
      variant?: string;
      depth?: number;
      maxDepth?: number;
      lineItem?: LineItem | null;
      direction?: Direction;
      scope?: SidebarScope;
      setSidebarScope?: (name: SidebarScope) => void;
      lockExpanded?: boolean;
  };
  export const ProfitAndLossRow: ({ variant, lineItem, depth, maxDepth, direction, lockExpanded, scope, setSidebarScope, }: Props) => React.JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossRow/index' {
  export { ProfitAndLossRow } from '@layerfi/components/components/ProfitAndLossRow/ProfitAndLossRow';

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/MiniChart' {
  import React from 'react';
  import { LineBaseItem } from '@layerfi/components/types/line_item';
  export interface MiniChartProps {
      data: LineBaseItem[];
  }
  export const MiniChart: ({ data }: MiniChartProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries' {
  import React from 'react';
  type Props = {
      revenueLabel?: string;
      vertical?: boolean;
      actionable?: boolean;
  };
  export const ProfitAndLossSummaries: ({ vertical, revenueLabel, actionable, }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/index' {
  export { ProfitAndLossSummaries } from '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries';

}
declare module '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTable' {
  import React from 'react';
  type Props = {
      lockExpanded?: boolean;
      asContainer?: boolean;
  };
  export const ProfitAndLossTable: ({ lockExpanded, asContainer }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossTable/empty_profit_and_loss_report' {
  import { ProfitAndLoss } from '@layerfi/components/types';
  const _default: ProfitAndLoss;
  export default _default;

}
declare module '@layerfi/components/components/ProfitAndLossTable/index' {
  export { ProfitAndLossTable } from '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTable';

}
declare module '@layerfi/components/components/ProfitAndLossView/ProfitAndLossView' {
  import React, { RefObject } from 'react';
  export interface ProfitAndLossViewProps {
      hideTable?: boolean;
      hideChart?: boolean;
      showDetailedCharts?: boolean;
  }
  export interface ProfitAndLossViewPanelProps extends ProfitAndLossViewProps {
      containerRef: RefObject<HTMLDivElement>;
  }
  export const ProfitAndLossView: (props: ProfitAndLossViewProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossView/index' {
  export { ProfitAndLossView } from '@layerfi/components/components/ProfitAndLossView/ProfitAndLossView';

}
declare module '@layerfi/components/components/Quickbooks/Quickbooks' {
  import React from "react";
  const Quickbooks: () => React.JSX.Element;
  export { Quickbooks };

}
declare module '@layerfi/components/components/Quickbooks/index' {
  export { Quickbooks } from '@layerfi/components/components/Quickbooks/Quickbooks';

}
declare module '@layerfi/components/components/SkeletonLoader/SkeletonLoader' {
  import React from 'react';
  export interface SkeletonLoaderProps {
      width?: string;
      height?: string;
      className?: string;
  }
  export const SkeletonLoader: ({ height, width, className, }: SkeletonLoaderProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/SkeletonLoader/index' {
  export { SkeletonLoader } from '@layerfi/components/components/SkeletonLoader/SkeletonLoader';

}
declare module '@layerfi/components/components/StatementOfCashFlow/StatementOfCashFlow' {
  import React from 'react';
  export const StatementOfCashFlow: () => React.JSX.Element;

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
declare module '@layerfi/components/components/StatementOfCashFlow/index' {
  export { StatementOfCashFlow } from '@layerfi/components/components/StatementOfCashFlow/StatementOfCashFlow';

}
declare module '@layerfi/components/components/StatementOfCashFlowTable/StatementOfCashFlowTable' {
  import React from 'react';
  import { StatementOfCashFlow } from '@layerfi/components/types';
  type StatementOfCashFlowRowProps = {
      name: string;
      displayName: string;
      lineItem: string | undefined;
      summarize: boolean;
      type: string;
  };
  export const StatementOfCashFlowTable: ({ data, config, }: {
      data: StatementOfCashFlow;
      config: StatementOfCashFlowRowProps[];
  }) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/StatementOfCashFlowTable/index' {
  export { StatementOfCashFlowTable } from '@layerfi/components/components/StatementOfCashFlowTable/StatementOfCashFlowTable';

}
declare module '@layerfi/components/components/Table/Table' {
  import React from 'react';
  import { TableProps } from '@layerfi/components/types/table';
  export const Table: ({ componentName, children, borderCollapse, bottomSpacing, }: TableProps) => React.JSX.Element;

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
  import React from 'react';
  import { TableBodyProps } from '@layerfi/components/types/table';
  export const TableBody: ({ children }: TableBodyProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/TableBody/index' {
  export { TableBody } from '@layerfi/components/components/TableBody/TableBody';

}
declare module '@layerfi/components/components/TableCell/TableCell' {
  import React from 'react';
  import { TableCellProps } from '@layerfi/components/types/table';
  export const TableCell: ({ children, isHeaderCell, isCurrency, primary, withExpandIcon, }: TableCellProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/TableCell/index' {
  export { TableCell } from '@layerfi/components/components/TableCell/TableCell';

}
declare module '@layerfi/components/components/TableHead/TableHead' {
  import React from 'react';
  import { TableHeadProps } from '@layerfi/components/types/table';
  export const TableHead: ({ children }: TableHeadProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/TableHead/index' {
  export { TableHead } from '@layerfi/components/components/TableHead/TableHead';

}
declare module '@layerfi/components/components/TableRow/TableRow' {
  import React from 'react';
  import { TableRowProps } from '@layerfi/components/types/table';
  export const TableRow: React.FC<TableRowProps>;

}
declare module '@layerfi/components/components/TableRow/index' {
  export { TableRow } from '@layerfi/components/components/TableRow/TableRow';

}
declare module '@layerfi/components/components/Tabs/Tab' {
  import React, { ChangeEvent, ReactNode } from 'react';
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
  export const Tab: ({ checked, label, name, onChange, value, leftIcon, disabled, disabledMessage, index, }: TabProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Tabs/Tabs' {
  import React, { ChangeEvent, ReactNode } from 'react';
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
  export const Tabs: ({ name, options, selected, onChange }: TabsProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Tabs/index' {
  export { Tabs } from '@layerfi/components/components/Tabs/Tabs';

}
declare module '@layerfi/components/components/Tasks/Tasks' {
  import React, { ReactNode } from 'react';
  import { useTasks } from '@layerfi/components/hooks/useTasks/index';
  export type UseTasksContextType = ReturnType<typeof useTasks>;
  export const UseTasksContext: React.Context<{
      data?: import("@layerfi/components/types/tasks").TaskTypes[] | undefined;
      isLoading?: boolean | undefined;
      loadedStatus?: import("@layerfi/components/types/general").LoadedStatus | undefined;
      isValidating?: boolean | undefined;
      error?: unknown;
      refetch: () => void;
      submitResponseToTask: (taskId: string, userResponse: string) => void;
  }>;
  export const useTasksContext: () => {
      data?: import("@layerfi/components/types/tasks").TaskTypes[] | undefined;
      isLoading?: boolean | undefined;
      loadedStatus?: import("@layerfi/components/types/general").LoadedStatus | undefined;
      isValidating?: boolean | undefined;
      error?: unknown;
      refetch: () => void;
      submitResponseToTask: (taskId: string, userResponse: string) => void;
  };
  export const Tasks: ({ tasksHeader, collapsable, defaultCollapsed, collapsedWhenComplete, }: {
      tasksHeader?: string | undefined;
      collapsable?: boolean | undefined;
      defaultCollapsed?: boolean | undefined;
      collapsedWhenComplete?: boolean | undefined;
  }) => React.JSX.Element;
  export const TasksProvider: ({ children }: {
      children: ReactNode;
  }) => React.JSX.Element;
  export const TasksComponent: ({ tasksHeader, collapsable, defaultCollapsed, collapsedWhenComplete, }: {
      tasksHeader?: string | undefined;
      collapsable?: boolean | undefined;
      defaultCollapsed?: boolean | undefined;
      collapsedWhenComplete?: boolean | undefined;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/Tasks/index' {
  export { Tasks, TasksProvider, TasksComponent } from '@layerfi/components/components/Tasks/Tasks';

}
declare module '@layerfi/components/components/TasksHeader/TasksHeader' {
  import React from 'react';
  export const TasksHeader: ({ tasksHeader, collapsable, open, toggleContent, }: {
      tasksHeader?: string | undefined;
      collapsable?: boolean | undefined;
      open?: boolean | undefined;
      toggleContent: () => void;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/TasksHeader/index' {
  export { TasksHeader } from '@layerfi/components/components/TasksHeader/TasksHeader';

}
declare module '@layerfi/components/components/TasksList/TasksList' {
  import React from 'react';
  export const TasksList: ({ pageSize }: {
      pageSize?: number | undefined;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/TasksList/index' {
  export { TasksList } from '@layerfi/components/components/TasksList/TasksList';

}
declare module '@layerfi/components/components/TasksListItem/TasksListItem' {
  import React from 'react';
  import { TaskTypes } from '@layerfi/components/types/tasks';
  export const TasksListItem: ({ task, index, }: {
      task: TaskTypes;
      index: number;
  }) => React.JSX.Element;

}
declare module '@layerfi/components/components/TasksListItem/index' {
  export { TasksListItem } from '@layerfi/components/components/TasksListItem/TasksListItem';

}
declare module '@layerfi/components/components/TasksPending/TasksPending' {
  import React from 'react';
  export const TasksPending: () => React.JSX.Element;

}
declare module '@layerfi/components/components/TasksPending/index' {
  export { TasksPending } from '@layerfi/components/components/TasksPending/TasksPending';

}
declare module '@layerfi/components/components/Textarea/Textarea' {
  import React, { HTMLProps } from 'react';
  export interface TextareaProps extends HTMLProps<HTMLTextAreaElement> {
      isInvalid?: boolean;
      errorMessage?: string;
  }
  export const Textarea: ({ className, isInvalid, errorMessage, ...props }: TextareaProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Textarea/index' {
  export { Textarea } from '@layerfi/components/components/Textarea/Textarea';

}
declare module '@layerfi/components/components/Toast/Toast' {
  import React from 'react';
  export interface ToastProps {
      id?: string;
      content: string;
      duration?: number;
      isExiting?: boolean;
  }
  export const ToastsContainer: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;

}
declare module '@layerfi/components/components/Toggle/Toggle' {
  import React, { CSSProperties, ChangeEvent, ReactNode } from 'react';
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
  export const Toggle: ({ name, options, selected, onChange, size, }: ToggleProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Toggle/index' {
  export { Toggle } from '@layerfi/components/components/Toggle/Toggle';

}
declare module '@layerfi/components/components/Tooltip/Tooltip' {
  import React, { ReactNode } from 'react';
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
  } & TooltipOptions) => React.JSX.Element;
  export const TooltipTrigger: React.ForwardRefExoticComponent<Omit<React.HTMLProps<HTMLElement> & {
      asChild?: boolean | undefined;
  }, "ref"> & React.RefAttributes<HTMLElement>>;
  export const TooltipContent: React.ForwardRefExoticComponent<Omit<React.HTMLProps<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;

}
declare module '@layerfi/components/components/Tooltip/index' {
  export { Tooltip, TooltipTrigger, TooltipContent } from '@layerfi/components/components/Tooltip/Tooltip';
  export { useTooltip } from '@layerfi/components/components/Tooltip/useTooltip';

}
declare module '@layerfi/components/components/Tooltip/useTooltip' {
  import React from 'react';
  import { TooltipOptions } from '@layerfi/components/components/Tooltip/Tooltip';
  export type ContextType = ReturnType<typeof useTooltip> | null;
  export const TooltipContext: React.Context<ContextType>;
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
          reference: React.MutableRefObject<import("@floating-ui/react-dom").ReferenceType | null>;
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
          onOpenChange: (open: boolean, event?: Event | undefined, reason?: import("@floating-ui/react").OpenChangeReason | undefined) => void;
          events: import("@floating-ui/react").FloatingEvents;
          dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
          nodeId: string | undefined;
          floatingId: string;
          refs: import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
          elements: import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
      };
      getReferenceProps: (userProps?: React.HTMLProps<Element> | undefined) => Record<string, unknown>;
      getFloatingProps: (userProps?: React.HTMLProps<HTMLElement> | undefined) => Record<string, unknown>;
      getItemProps: (userProps?: (Omit<React.HTMLProps<HTMLElement>, "active" | "selected"> & {
          active?: boolean | undefined;
          selected?: boolean | undefined;
      }) | undefined) => Record<string, unknown>;
      open: boolean;
      setOpen: (open: boolean) => void;
      isMounted: boolean;
      styles: React.CSSProperties;
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
          reference: React.MutableRefObject<import("@floating-ui/react-dom").ReferenceType | null>;
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
          onOpenChange: (open: boolean, event?: Event | undefined, reason?: import("@floating-ui/react").OpenChangeReason | undefined) => void;
          events: import("@floating-ui/react").FloatingEvents;
          dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
          nodeId: string | undefined;
          floatingId: string;
          refs: import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
          elements: import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
      };
      getReferenceProps: (userProps?: React.HTMLProps<Element> | undefined) => Record<string, unknown>;
      getFloatingProps: (userProps?: React.HTMLProps<HTMLElement> | undefined) => Record<string, unknown>;
      getItemProps: (userProps?: (Omit<React.HTMLProps<HTMLElement>, "active" | "selected"> & {
          active?: boolean | undefined;
          selected?: boolean | undefined;
      }) | undefined) => Record<string, unknown>;
      open: boolean;
      setOpen: (open: boolean) => void;
      isMounted: boolean;
      styles: React.CSSProperties;
      disabled: boolean | undefined;
  };

}
declare module '@layerfi/components/components/TransactionToReviewCard/TransactionToReviewCard' {
  import React from 'react';
  export interface TransactionToReviewCardProps {
      onClick?: () => void;
      usePnlDateRange?: boolean;
  }
  export const TransactionToReviewCard: ({ onClick, usePnlDateRange, }: TransactionToReviewCardProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/TransactionToReviewCard/index' {
  export { TransactionToReviewCard } from '@layerfi/components/components/TransactionToReviewCard/TransactionToReviewCard';

}
declare module '@layerfi/components/components/Typography/ErrorText' {
  import React from 'react';
  import { TextProps } from '@layerfi/components/components/Typography/Text';
  export type ErrorTextProps = TextProps;
  export const ErrorText: ({ className, ...props }: ErrorTextProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Typography/Heading' {
  import React, { ReactNode } from 'react';
  export enum HeadingSize {
      primary = "primary",
      secondary = "secondary"
  }
  export interface HeadingProps {
      as?: React.ElementType;
      className?: string;
      children: ReactNode;
      size?: HeadingSize;
  }
  export const Heading: ({ as: Component, className, children, size, }: HeadingProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Typography/Text' {
  import React, { ReactNode } from 'react';
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
      htmlFor?: string;
      withTooltip?: TextUseTooltip;
      tooltipOptions?: TextTooltipOptions;
  }
  export const Text: ({ as: Component, className, children, size, weight, withTooltip, ...props }: TextProps) => React.JSX.Element;
  export const TextWithTooltip: ({ as: Component, className, children, size, weight, withTooltip, tooltipOptions, ...props }: TextProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Typography/index' {
  export { Text, TextSize, TextWeight, TextUseTooltip } from '@layerfi/components/components/Typography/Text';
  export { Heading, HeadingSize } from '@layerfi/components/components/Typography/Heading';
  export { ErrorText } from '@layerfi/components/components/Typography/ErrorText';

}
declare module '@layerfi/components/components/UpsellBanner/BookkeepingUpsellBar' {
  import React from 'react';
  interface BookkeepingUpsellBarProps {
      onClick?: () => void;
      href?: string;
  }
  export const BookkeepingUpsellBar: ({ onClick, href, }: BookkeepingUpsellBarProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/UpsellBanner/index' {
  export { BookkeepingUpsellBar } from '@layerfi/components/components/UpsellBanner/BookkeepingUpsellBar';

}
declare module '@layerfi/components/components/View/View' {
  import React, { ReactNode } from 'react';
  export interface ViewProps {
      children: ReactNode;
      title?: string;
      headerControls?: ReactNode;
      type?: 'default' | 'panel';
      withSidebar?: boolean;
      sidebar?: ReactNode;
      viewClassName?: string;
  }
  export const View: ({ title, children, headerControls, type, withSidebar, sidebar, viewClassName, }: ViewProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/View/index' {
  export { View } from '@layerfi/components/components/View/View';

}
declare module '@layerfi/components/components/ViewHeader/ViewHeader' {
  import React, { ReactNode } from 'react';
  export interface ViewHeaderProps {
      title?: string;
      controls?: ReactNode;
  }
  export const ViewHeader: ({ title, controls }: ViewHeaderProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/ViewHeader/index' {
  export { ViewHeader } from '@layerfi/components/components/ViewHeader/ViewHeader';

}
declare module '@layerfi/components/config/charts' {
  export const INACTIVE_OPACITY_LEVELS: number[];
  export const DEFAULT_CHART_OPACITY: number[];
  export const DEFAULT_CHART_COLOR_TYPE: string[];
  export const DEFAULT_CHART_COLORS: {
      color: string;
      opacity: number;
  }[];
  export const TASKS_CHARTS_COLORS: {
      done: string;
      pending: string;
  };

}
declare module '@layerfi/components/config/general' {
  export const DATE_FORMAT = "LLL d, yyyy";
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
declare module '@layerfi/components/contexts/BalanceSheetContext/BalanceSheetContext' {
  /// <reference types="react" />
  import { useBalanceSheet } from '@layerfi/components/hooks/useBalanceSheet/index';
  export type BalanceSheetContextType = ReturnType<typeof useBalanceSheet>;
  export const BalanceSheetContext: import("react").Context<{
      data: import("@layerfi/components/types").BalanceSheet | undefined;
      isLoading: boolean;
      error: unknown;
      refetch: () => void;
  }>;

}
declare module '@layerfi/components/contexts/BalanceSheetContext/index' {
  export { BalanceSheetContext } from '@layerfi/components/contexts/BalanceSheetContext/BalanceSheetContext';

}
declare module '@layerfi/components/contexts/BankTransactionsContext/BankTransactionsContext' {
  /// <reference types="react" />
  import { useBankTransactions } from '@layerfi/components/hooks/useBankTransactions/index';
  import { DisplayState } from '@layerfi/components/types';
  export type BankTransactionsContextType = ReturnType<typeof useBankTransactions>;
  export const BankTransactionsContext: import("react").Context<{
      data?: import("@layerfi/components/types").BankTransaction[] | undefined;
      metadata: import("@layerfi/components/types").Metadata;
      loadingStatus: import("@layerfi/components/types/general").LoadedStatus;
      isLoading: boolean;
      isValidating: boolean;
      error: unknown;
      filters?: import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters | undefined;
      accountsList?: import("@layerfi/components/hooks/useBankTransactions/types").AccountItem[] | undefined;
      display: DisplayState;
      categorize: (id: string, newCategory: import("@layerfi/components/types").CategoryUpdate, notify?: boolean | undefined) => Promise<void>;
      match: (id: string, matchId: string, notify?: boolean | undefined) => Promise<void>;
      updateOneLocal: (bankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      refetch: () => void;
      setFilters: (filters?: Partial<import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters> | undefined) => void;
      activate: () => void;
      fetchMore: () => void;
  }>;
  export const useBankTransactionsContext: () => {
      data?: import("@layerfi/components/types").BankTransaction[] | undefined;
      metadata: import("@layerfi/components/types").Metadata;
      loadingStatus: import("@layerfi/components/types/general").LoadedStatus;
      isLoading: boolean;
      isValidating: boolean;
      error: unknown;
      filters?: import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters | undefined;
      accountsList?: import("@layerfi/components/hooks/useBankTransactions/types").AccountItem[] | undefined;
      display: DisplayState;
      categorize: (id: string, newCategory: import("@layerfi/components/types").CategoryUpdate, notify?: boolean | undefined) => Promise<void>;
      match: (id: string, matchId: string, notify?: boolean | undefined) => Promise<void>;
      updateOneLocal: (bankTransaction: import("@layerfi/components/types").BankTransaction) => void;
      refetch: () => void;
      setFilters: (filters?: Partial<import("@layerfi/components/hooks/useBankTransactions/types").BankTransactionFilters> | undefined) => void;
      activate: () => void;
      fetchMore: () => void;
  };

}
declare module '@layerfi/components/contexts/BankTransactionsContext/index' {
  export { BankTransactionsContext, useBankTransactionsContext } from '@layerfi/components/contexts/BankTransactionsContext/BankTransactionsContext';

}
declare module '@layerfi/components/contexts/ChartOfAccountsContext/ChartOfAccountsContext' {
  /// <reference types="react" />
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
  /// <reference types="react" />
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
  /// <reference types="react" />
  import { useJournal } from '@layerfi/components/hooks/useJournal/index';
  export type JournalContextType = ReturnType<typeof useJournal>;
  export const JournalContext: import("react").Context<{
      data?: import("@layerfi/components/types").JournalEntry[] | undefined;
      isLoading?: boolean | undefined;
      isLoadingEntry?: boolean | undefined;
      isValidating?: boolean | undefined;
      isValidatingEntry?: boolean | undefined;
      error?: unknown;
      errorEntry?: unknown;
      refetch: () => void;
      selectedEntryId?: string | undefined;
      setSelectedEntryId: (id?: string | undefined) => void;
      closeSelectedEntry: () => void;
      create: (newJournalEntry: import("@layerfi/components/types/journal").NewApiJournalEntry) => void;
      changeFormData: (name: string, value: string | number | import("@layerfi/components/types/general").BaseSelectOption | undefined, lineItemIndex?: number | undefined, accounts?: import("../../types/chart_of_accounts").LedgerAccountBalance[] | undefined) => void;
      submitForm: () => void;
      cancelForm: () => void;
      addEntry: () => void;
      sendingForm: boolean;
      form?: import("@layerfi/components/hooks/useJournal/useJournal").JournalFormTypes | undefined;
      apiError?: string | undefined;
      setForm: (form?: import("@layerfi/components/hooks/useJournal/useJournal").JournalFormTypes | undefined) => void;
      addEntryLine: (direction: import("@layerfi/components/types").Direction) => void;
      removeEntryLine: (index: number) => void;
  }>;

}
declare module '@layerfi/components/contexts/JournalContext/index' {
  export { JournalContext } from '@layerfi/components/contexts/JournalContext/JournalContext';

}
declare module '@layerfi/components/contexts/LayerContext/LayerContext' {
  /// <reference types="react" />
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
  /// <reference types="react" />
  import { useLedgerAccounts } from '@layerfi/components/hooks/useLedgerAccounts/index';
  export type LedgerAccountsContextType = ReturnType<typeof useLedgerAccounts>;
  export const LedgerAccountsContext: import("react").Context<{
      data?: import("@layerfi/components/types").LedgerAccounts | undefined;
      entryData?: import("@layerfi/components/types").LedgerAccountsEntry | undefined;
      isLoading?: boolean | undefined;
      isLoadingEntry?: boolean | undefined;
      isValidating?: boolean | undefined;
      isValidatingEntry?: boolean | undefined;
      error?: unknown;
      errorEntry?: unknown;
      refetch: () => void;
      accountId?: string | undefined;
      setAccountId: (id?: string | undefined) => void;
      selectedEntryId?: string | undefined;
      setSelectedEntryId: (id?: string | undefined) => void;
      closeSelectedEntry: () => void;
  }>;

}
declare module '@layerfi/components/contexts/LedgerAccountsContext/index' {
  export { LedgerAccountsContext } from '@layerfi/components/contexts/LedgerAccountsContext/LedgerAccountsContext';

}
declare module '@layerfi/components/contexts/LinkedAccountsContext/LinkedAccountsContext' {
  /// <reference types="react" />
  import { useLinkedAccounts } from '@layerfi/components/hooks/useLinkedAccounts/index';
  export type LinkedAccountsContextType = ReturnType<typeof useLinkedAccounts>;
  export const LinkedAccountsContext: import("react").Context<{
      data?: import("@layerfi/components/types/linked_accounts").LinkedAccount[] | undefined;
      isLoading: boolean;
      loadingStatus: import("@layerfi/components/types/general").LoadedStatus;
      isValidating: boolean;
      error: unknown;
      addConnection: (source: import("@layerfi/components/types/linked_accounts").Source) => void;
      removeConnection: (source: import("@layerfi/components/types/linked_accounts").Source, sourceId: string) => void;
      repairConnection: (source: import("@layerfi/components/types/linked_accounts").Source, sourceId: string) => void;
      updateConnectionStatus: () => void;
      refetchAccounts: () => void;
      syncAccounts: () => void;
      unlinkAccount: (source: import("@layerfi/components/types/linked_accounts").Source, accountId: string) => void;
      confirmAccount: (source: import("@layerfi/components/types/linked_accounts").Source, accountId: string) => void;
      denyAccount: (source: import("@layerfi/components/types/linked_accounts").Source, accountId: string) => void;
      breakConnection: (source: import("@layerfi/components/types/linked_accounts").Source, connectionExternalId: string) => void;
  }>;

}
declare module '@layerfi/components/contexts/LinkedAccountsContext/index' {
  export { LinkedAccountsContext } from '@layerfi/components/contexts/LinkedAccountsContext/LinkedAccountsContext';

}
declare module '@layerfi/components/contexts/StatementOfCashContext/StatementOfCashFlowContext' {
  /// <reference types="react" />
  import { useStatementOfCashFlow } from '@layerfi/components/hooks/useStatementOfCashFlow/index';
  export type StatementOfCashFlowContextType = ReturnType<typeof useStatementOfCashFlow>;
  export const StatementOfCashFlowContext: import("react").Context<{
      data: import("@layerfi/components/types").StatementOfCashFlow | undefined;
      isLoading: boolean;
      error: unknown;
      refetch: () => void;
  }>;

}
declare module '@layerfi/components/contexts/StatementOfCashContext/index' {
  export { StatementOfCashFlowContext } from '@layerfi/components/contexts/StatementOfCashContext/StatementOfCashFlowContext';

}
declare module '@layerfi/components/contexts/TableContext/TableContext' {
  import React, { ReactNode } from 'react';
  import { TableContextProps } from '@layerfi/components/types/table';
  export const TableContext: React.Context<TableContextProps>;
  interface TableProviderProps {
      children: ReactNode;
  }
  export const TableProvider: React.FC<TableProviderProps>;
  export {};

}
declare module '@layerfi/components/contexts/TableContext/index' {
  export { TableContext, TableProvider } from '@layerfi/components/contexts/TableContext/TableContext';

}
declare module '@layerfi/components/contexts/TasksContext/TasksContext' {
  /// <reference types="react" />
  import { useTasks } from '@layerfi/components/hooks/useTasks/index';
  export type TasksContextType = ReturnType<typeof useTasks>;
  export const TasksContext: import("react").Context<{
      data?: import("@layerfi/components/types/tasks").TaskTypes[] | undefined;
      isLoading?: boolean | undefined;
      loadedStatus?: import("@layerfi/components/types/general").LoadedStatus | undefined;
      isValidating?: boolean | undefined;
      error?: unknown;
      refetch: () => void;
      submitResponseToTask: (taskId: string, userResponse: string) => void;
  }>;

}
declare module '@layerfi/components/contexts/TasksContext/index' {
  export { TasksContext } from '@layerfi/components/contexts/TasksContext/TasksContext';

}
declare module '@layerfi/components/hooks/useBalanceSheet/index' {
  export { useBalanceSheet } from '@layerfi/components/hooks/useBalanceSheet/useBalanceSheet';

}
declare module '@layerfi/components/hooks/useBalanceSheet/useBalanceSheet' {
  import { BalanceSheet } from '@layerfi/components/types';
  type UseBalanceSheet = (date?: Date) => {
      data: BalanceSheet | undefined;
      isLoading: boolean;
      error: unknown;
      refetch: () => void;
  };
  export const useBalanceSheet: UseBalanceSheet;
  export {};

}
declare module '@layerfi/components/hooks/useBankTransactions/index' {
  export { useBankTransactions } from '@layerfi/components/hooks/useBankTransactions/useBankTransactions';

}
declare module '@layerfi/components/hooks/useBankTransactions/types' {
  import { BankTransaction, CategoryUpdate, DateRange, Direction, DisplayState, Metadata } from '@layerfi/components/types';
  import { LoadedStatus } from '@layerfi/components/types/general';
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
  }
  export type UseBankTransactions = (params?: {
      scope?: DisplayState;
  }) => {
      data?: BankTransaction[];
      metadata: Metadata;
      loadingStatus: LoadedStatus;
      isLoading: boolean;
      isValidating: boolean;
      error: unknown;
      filters?: BankTransactionFilters;
      accountsList?: AccountItem[];
      display: DisplayState;
      categorize: (id: BankTransaction['id'], newCategory: CategoryUpdate, notify?: boolean) => Promise<void>;
      match: (id: BankTransaction['id'], matchId: BankTransaction['id'], notify?: boolean) => Promise<void>;
      updateOneLocal: (bankTransaction: BankTransaction) => void;
      refetch: () => void;
      setFilters: (filters?: Partial<BankTransactionFilters>) => void;
      activate: () => void;
      fetchMore: () => void;
  };

}
declare module '@layerfi/components/hooks/useBankTransactions/useBankTransactions' {
  import { UseBankTransactions } from '@layerfi/components/hooks/useBankTransactions/types';
  export const useBankTransactions: UseBankTransactions;

}
declare module '@layerfi/components/hooks/useBankTransactions/utils' {
  import { BankTransaction, DateRange, Direction, DisplayState } from '@layerfi/components/types';
  import { AccountItem, NumericRangeFilter } from '@layerfi/components/hooks/useBankTransactions/types';
  export const collectAccounts: (transactions?: BankTransaction[]) => AccountItem[];
  export const uniqAccountsList: (arr: AccountItem[], track?: Set<unknown>) => AccountItem[];
  export const applyAmountFilter: (data?: BankTransaction[], filter?: NumericRangeFilter) => BankTransaction[] | undefined;
  export const applyAccountFilter: (data?: BankTransaction[], filter?: string[]) => BankTransaction[] | undefined;
  export const applyDirectionFilter: (data?: BankTransaction[], filter?: Direction[]) => BankTransaction[] | undefined;
  export const applyCategorizationStatusFilter: (data?: BankTransaction[], filter?: DisplayState) => BankTransaction[] | undefined;
  export const appplyDateRangeFilter: (data?: BankTransaction[], filter?: Partial<DateRange>) => BankTransaction[] | undefined;

}
declare module '@layerfi/components/hooks/useChartOfAccounts/index' {
  export { useChartOfAccounts } from '@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts';

}
declare module '@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts' {
  import { FormError, DateRange, NewAccount } from '@layerfi/components/types';
  import { ChartWithBalances, LedgerAccountBalance } from '@layerfi/components/types/chart_of_accounts';
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
      data: ChartWithBalances | undefined;
      isLoading: boolean;
      isValidating: boolean;
      error: any;
      refetch: () => Promise<{
          data: ChartWithBalances;
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
      read: (model: DataModel) => void;
      syncTimestamps: Partial<Record<DataModel, number>>;
      readTimestamps: Partial<Record<DataModel, number>>;
      hasBeenTouched: (model: DataModel) => boolean;
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
  /// <reference types="react" />
  export const useElementSize: <T extends HTMLElement>(callback: (target: T, entry: ResizeObserverEntry, size: {
      width: number;
      height: number;
      clientWidth: number;
      clientHeight: number;
  }) => void) => import("react").RefObject<T>;

}
declare module '@layerfi/components/hooks/useJournal/index' {
  export { useJournal } from '@layerfi/components/hooks/useJournal/useJournal';

}
declare module '@layerfi/components/hooks/useJournal/useJournal' {
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
      changeFormData: (name: string, value: string | BaseSelectOption | undefined | number, lineItemIndex?: number, accounts?: LedgerAccountBalance[] | undefined) => void;
      submitForm: () => void;
      cancelForm: () => void;
      addEntry: () => void;
      sendingForm: boolean;
      form?: JournalFormTypes;
      apiError?: string;
      setForm: (form?: JournalFormTypes) => void;
      addEntryLine: (direction: Direction) => void;
      removeEntryLine: (index: number) => void;
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
  type UseLedgerAccounts = () => {
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
  import { LinkedAccount, Source } from '@layerfi/components/types/linked_accounts';
  type UseLinkedAccounts = () => {
      data?: LinkedAccount[];
      isLoading: boolean;
      loadingStatus: LoadedStatus;
      isValidating: boolean;
      error: unknown;
      addConnection: (source: Source) => void;
      removeConnection: (source: Source, sourceId: string) => void;
      repairConnection: (source: Source, sourceId: string) => void;
      updateConnectionStatus: () => void;
      refetchAccounts: () => void;
      syncAccounts: () => void;
      unlinkAccount: (source: Source, accountId: string) => void;
      confirmAccount: (source: Source, accountId: string) => void;
      denyAccount: (source: Source, accountId: string) => void;
      breakConnection: (source: Source, connectionExternalId: string) => void;
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
declare module '@layerfi/components/hooks/useProfitAndLoss/index' {
  export { useProfitAndLoss } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss' {
  import { ProfitAndLoss, DateRange, ReportingBasis, SortDirection } from '@layerfi/components/types';
  import { LineBaseItem } from '@layerfi/components/types/line_item';
  export type Scope = 'expenses' | 'revenue';
  export type SidebarScope = Scope | undefined;
  type Props = {
      startDate?: Date;
      endDate?: Date;
      tagFilter?: {
          key: string;
          values: string[];
      };
      reportingBasis?: ReportingBasis;
  };
  type ProfitAndLossFilter = {
      sortBy?: string;
      sortDirection?: SortDirection;
      types?: string[];
  };
  export type ProfitAndLossFilters = Record<Scope, ProfitAndLossFilter | undefined>;
  type UseProfitAndLoss = (props?: Props) => {
      data: ProfitAndLoss | undefined;
      filteredDataRevenue: LineBaseItem[];
      filteredTotalRevenue?: number;
      filteredDataExpenses: LineBaseItem[];
      filteredTotalExpenses?: number;
      isLoading: boolean;
      isValidating: boolean;
      error: unknown;
      dateRange: DateRange;
      changeDateRange: (dateRange: Partial<DateRange>) => void;
      refetch: () => void;
      sidebarScope: SidebarScope;
      setSidebarScope: (view: SidebarScope) => void;
      filters: ProfitAndLossFilters;
      sortBy: (scope: Scope, field: string, direction?: SortDirection) => void;
      setFilterTypes: (scope: Scope, types: string[]) => void;
  };
  export const useProfitAndLoss: UseProfitAndLoss;
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
      error?: any;
      pullData: (date: Date) => void;
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
      error: any;
      refetch: () => void;
      startDate: Date;
      endDate: Date;
  };
  export const useProfitAndLossQuery: UseProfitAndLossQueryReturn;
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
declare module '@layerfi/components/hooks/useStatementOfCashFlow/index' {
  export { useStatementOfCashFlow } from '@layerfi/components/hooks/useStatementOfCashFlow/useStatementOfCashFlow';

}
declare module '@layerfi/components/hooks/useStatementOfCashFlow/useStatementOfCashFlow' {
  import { StatementOfCashFlow } from '@layerfi/components/types';
  type UseStatementOfCashFlow = (startDate?: Date, endDate?: Date) => {
      data: StatementOfCashFlow | undefined;
      isLoading: boolean;
      error: unknown;
      refetch: () => void;
  };
  export const useStatementOfCashFlow: UseStatementOfCashFlow;
  export {};

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
declare module '@layerfi/components/hooks/useTasks/useTasks' {
  import { LoadedStatus } from '@layerfi/components/types/general';
  import { TaskTypes } from '@layerfi/components/types/tasks';
  type UseTasks = () => {
      data?: TaskTypes[];
      isLoading?: boolean;
      loadedStatus?: LoadedStatus;
      isValidating?: boolean;
      error?: unknown;
      refetch: () => void;
      submitResponseToTask: (taskId: string, userResponse: string) => void;
  };
  export const useTasks: UseTasks;
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
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const AlertCircle: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default AlertCircle;

}
declare module '@layerfi/components/icons/AlertOctagon' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const AlertOctagon: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default AlertOctagon;

}
declare module '@layerfi/components/icons/BackArrow' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const BackArrow: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default BackArrow;

}
declare module '@layerfi/components/icons/Bell' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Bell: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Bell;

}
declare module '@layerfi/components/icons/Check' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Check: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Check;

}
declare module '@layerfi/components/icons/CheckCircle' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const CheckCircle: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default CheckCircle;

}
declare module '@layerfi/components/icons/ChevronDown' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ChevronDown: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default ChevronDown;

}
declare module '@layerfi/components/icons/ChevronDownFill' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ChevronDownFill: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default ChevronDownFill;

}
declare module '@layerfi/components/icons/ChevronLeft' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ChevronLeft: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default ChevronLeft;

}
declare module '@layerfi/components/icons/ChevronRight' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ChevronRight: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default ChevronRight;

}
declare module '@layerfi/components/icons/CloseIcon' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const CloseIcon: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default CloseIcon;

}
declare module '@layerfi/components/icons/Coffee' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const CoffeeIcon: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default CoffeeIcon;

}
declare module '@layerfi/components/icons/CreditCard' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const CreditCard: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default CreditCard;

}
declare module '@layerfi/components/icons/DownloadCloud' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const DownloadCloud: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default DownloadCloud;

}
declare module '@layerfi/components/icons/Edit2' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Edit2: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Edit2;

}
declare module '@layerfi/components/icons/Folder' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Folder: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Folder;

}
declare module '@layerfi/components/icons/Inbox' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Inbox: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Inbox;

}
declare module '@layerfi/components/icons/InstitutionIcon' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const InstitutionIcon: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default InstitutionIcon;

}
declare module '@layerfi/components/icons/Link' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Link: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Link;

}
declare module '@layerfi/components/icons/Loader' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Loader: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Loader;

}
declare module '@layerfi/components/icons/MinimizeTwo' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const MinimizeTwo: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default MinimizeTwo;

}
declare module '@layerfi/components/icons/MoreVertical' {
  import React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const MoreVertical: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default MoreVertical;

}
declare module '@layerfi/components/icons/PieChart' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const PieChart: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default PieChart;

}
declare module '@layerfi/components/icons/PlaidIcon' {
  import React from 'react';
  const PlaidIcon: () => React.JSX.Element;
  export default PlaidIcon;

}
declare module '@layerfi/components/icons/PlusIcon' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const PlusIcon: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default PlusIcon;

}
declare module '@layerfi/components/icons/ProgressIcon' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ProgressIcon: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default ProgressIcon;

}
declare module '@layerfi/components/icons/RefreshCcw' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const RefreshCcw: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default RefreshCcw;

}
declare module '@layerfi/components/icons/Save' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Save: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Save;

}
declare module '@layerfi/components/icons/Scissors' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Scissors: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Scissors;

}
declare module '@layerfi/components/icons/ScissorsFullOpen' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ScissorsFullOpen: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default ScissorsFullOpen;

}
declare module '@layerfi/components/icons/SmileIcon' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const SmileIcon: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default SmileIcon;

}
declare module '@layerfi/components/icons/SortArrows' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const SortArrows: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default SortArrows;

}
declare module '@layerfi/components/icons/Sunrise' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Sunrise: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Sunrise;

}
declare module '@layerfi/components/icons/Trash' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const Trash: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default Trash;

}
declare module '@layerfi/components/icons/UploadCloud' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const UploadCloud: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default UploadCloud;

}
declare module '@layerfi/components/icons/X' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const X: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
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
  export { Tasks } from '@layerfi/components/components/Tasks/index';
  export { BookkeepingUpsellBar } from '@layerfi/components/components/UpsellBanner/index';
  export { BookkeepingOverview } from '@layerfi/components/views/BookkeepingOverview/index';
  export { AccountingOverview } from '@layerfi/components/views/AccountingOverview/index';
  export { BankTransactionsWithLinkedAccounts } from '@layerfi/components/views/BankTransactionsWithLinkedAccounts/index';
  export { GeneralLedgerView } from '@layerfi/components/views/GeneralLedger/index';
  export { Reports } from '@layerfi/components/views/Reports/index';
  export { ProfitAndLossView } from '@layerfi/components/components/ProfitAndLossView/index';
  export { useLayerContext } from '@layerfi/components/contexts/LayerContext/index';
  export { useBankTransactionsContext } from '@layerfi/components/contexts/BankTransactionsContext/index';

}
declare module '@layerfi/components/models/APIError' {
  export interface APIErrorMessage {
      type?: string;
      description?: string;
  }
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
  export const dollarsToCents: (dollars?: string) => number;
  const _default: {
      centsToDollars: (cents?: number) => string;
      dollarsToCents: (dollars?: string) => number;
  };
  export default _default;

}
declare module '@layerfi/components/providers/BankTransactionsProvider/BankTransactionsProvider' {
  import React, { ReactNode } from 'react';
  interface BankTransactionsProviderProps {
      children: ReactNode;
  }
  export const BankTransactionsProvider: ({ children, }: BankTransactionsProviderProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/BankTransactionsProvider/index' {
  export { BankTransactionsProvider } from '@layerfi/components/providers/BankTransactionsProvider/BankTransactionsProvider';

}
declare module '@layerfi/components/providers/LayerProvider/LayerProvider' {
  import React, { PropsWithChildren } from 'react';
  import { LayerError } from '@layerfi/components/models/ErrorHandler';
  import { LayerThemeConfig } from '@layerfi/components/types/layer_context';
  type LayerEnvironmentConfig = {
      url: string;
      scope: string;
      apiUrl: string;
  };
  export const LayerEnvironment: Record<string, LayerEnvironmentConfig>;
  export type Props = {
      businessId: string;
      appId?: string;
      appSecret?: string;
      businessAccessToken?: string;
      environment?: keyof typeof LayerEnvironment;
      theme?: LayerThemeConfig;
      usePlaidSandbox?: boolean;
      onError?: (error: LayerError) => void;
  };
  export const LayerProvider: ({ appId, appSecret, businessId, children, businessAccessToken, environment, theme, usePlaidSandbox, onError, }: PropsWithChildren<Props>) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/LayerProvider/index' {
  export { LayerProvider } from '@layerfi/components/providers/LayerProvider/LayerProvider';

}
declare module '@layerfi/components/providers/LinkedAccountsProvider/LinkedAccountsProvider' {
  import React, { ReactNode } from 'react';
  interface LinkedAccountsProviderProps {
      children: ReactNode;
  }
  export const LinkedAccountsProvider: ({ children, }: LinkedAccountsProviderProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/LinkedAccountsProvider/index' {
  export { LinkedAccountsProvider } from '@layerfi/components/providers/LinkedAccountsProvider/LinkedAccountsProvider';

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
  import { S3PresignedUrl } from "@layerfi/components/types/general";
  export enum Direction {
      CREDIT = "CREDIT",
      DEBIT = "DEBIT"
  }
  export enum BankTransactionMatchType {
      CONFIRM_MATCH = "Confirm_Match"
  }
  export enum DisplayState {
      review = "review",
      categorized = "categorized"
  }
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
      category: Category;
      categorization_status: CategorizationStatus;
      categorization_flow: Categorization;
      categorization_method: string;
      error?: string;
      processing?: boolean;
      suggested_matches?: SuggestedMatch[];
      match?: BankTransactionMatch;
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
  export interface FileMetadata {
      type: 'File_Metadata';
      id: string | null;
      fileType: string;
      fileName: string;
      documentType: string;
  }

}
declare module '@layerfi/components/types/business' {
  export interface Business {
      id: string;
      activation_at?: string;
      archived_at?: string;
      entity_type?: string;
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
      us_state?: string;
  }

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
  export interface CategoryEntry {
      amount?: number;
      category: Category;
  }
  export interface Category {
      id: string;
      type: string;
      display_name: string;
      category: string;
      stable_name?: string;
      subCategories?: Category[];
      entries?: CategoryEntry[];
  }
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
  export function hasSuggestions(categorization: Categorization): categorization is SuggestedCategorization;

}
declare module '@layerfi/components/types/chart_of_accounts' {
  import { Direction } from '@layerfi/components/types/bank_transactions';
  import { Category } from '@layerfi/components/types/categories';
  export interface ChartOfAccounts {
      type: string;
      accounts: Account[];
      entries?: any[];
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
      stable_name?: string;
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
declare module '@layerfi/components/types/general' {
  export type SortDirection = 'asc' | 'desc';
  export interface BaseSelectOption {
      label: string;
      value: string | number;
  }
  export interface S3PresignedUrl {
      type: 'S3_Presigned_Url';
      presignedUrl: string;
      fileType: string;
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
      date: string;
      entry_at: string;
      reversal_of_id: string | null;
      reversal_id: string | null;
      line_items: JournalEntryLineItem[];
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
  import { Business, Category } from '@layerfi/components/types';
  import { ExpiringOAuthResponse } from '@layerfi/components/types/authentication';
  import { DataModel } from '@layerfi/components/types/general';
  export type LayerContextValues = {
      auth: ExpiringOAuthResponse;
      businessId: string;
      business?: Business;
      categories: Category[];
      apiUrl: string;
      theme?: LayerThemeConfig;
      colors: ColorsPalette;
      usePlaidSandbox?: boolean;
      onboardingStep?: OnboardingStep;
      environment: string;
      toasts: (ToastProps & {
          isExiting: boolean;
      })[];
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
      read: (model: DataModel) => void;
      syncTimestamps: Partial<Record<DataModel, number>>;
      readTimestamps: Partial<Record<DataModel, number>>;
      hasBeenTouched: (model: DataModel) => boolean;
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
      setAuth = "LayerContext.setAuth",
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
      type: LayerContextActionName.setAuth;
      payload: {
          auth: LayerContextValues['auth'];
      };
  } | {
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
      account: LedgerAccountsAccount;
      amount: number;
      direction: Direction;
      date: string;
      source?: LedgerEntrySource;
      running_balance: number;
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
  export interface RefundPaymentLedgerEntrySource extends LedgerEntrySource {
      external_id: string;
      refund_id: string;
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
  import { PlaidInstitution } from 'react-plaid-link';
  export interface LinkedAccounts {
      type: string;
      external_accounts: LinkedAccount[];
  }
  export interface LinkedAccount {
      id: string;
      external_account_external_id: string;
      external_account_source: Source;
      external_account_name: string;
      latest_balance_timestamp: {
          external_account_external_id: string;
          external_account_source: Source;
          balance: number;
          at: string;
          created_at: string;
      };
      current_ledger_balance: number;
      institution: {
          name: string;
          logo: string | null;
      };
      mask?: string;
      connection_id?: string;
      connection_external_id?: string;
      connection_needs_repair_as_of: string | null;
      requires_user_confirmation_as_of: string | null;
  }
  export type PublicToken = {
      public_token: string;
      institution: PlaidInstitution | null;
  };
  export type Source = 'PLAID' | 'STRIPE';

}
declare module '@layerfi/components/types/profit_and_loss' {
  import { LineItem } from '@layerfi/components/types/line_item';
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
  }
  export interface ProfitAndLossSummaries {
      type: 'Profit_And_Loss_Summaries';
      months: ProfitAndLossSummary[];
  }

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
  import { ReactNode } from 'react';
  export interface TableContextProps {
      expandedRows: string[];
      setExpandedRows: (rowKey: string) => void;
      expandAllRows: (rowKeys: string[]) => void;
      expandedAllRows: boolean;
      setExpandedAllRows: (expanded: boolean) => void;
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
      variant?: 'expandable' | 'default' | 'summation';
      withDivider?: boolean;
      withDividerPosition?: 'top' | 'bottom';
      isExpanded?: boolean;
      handleExpand?: () => void;
      isHeadRow?: boolean;
  }
  export interface TableCellProps {
      children?: number | string | ReactNode;
      isCurrency?: boolean;
      isHeaderCell?: boolean;
      primary?: boolean;
      withExpandIcon?: boolean;
  }

}
declare module '@layerfi/components/types/tasks' {
  export interface TaskTypes {
      id: string;
      question: string;
      status: TasksStatusType;
      title: string;
      transaction_id: string | null;
      type: string;
      user_marked_completed_at: string;
      user_response: string;
      user_response_type: TasksResponseType;
      archived_at: string | null;
      completed_at: string;
      created_at: string;
      updated_at: string;
  }
  export type TasksStatusType = 'COMPLETED' | 'TODO' | 'USER_MARKED_COMPLETED';
  export type TasksResponseType = 'FREE_RESPONSE';
  export function isComplete(taskType: TasksStatusType): boolean;

}
declare module '@layerfi/components/types' {
  export { OAuthResponse } from '@layerfi/components/types/authentication';
  export { LayerContextValues, LayerContextActionName, LayerContextAction, LayerContextHelpers, } from '@layerfi/components/types/layer_context';
  export { Metadata } from '@layerfi/components/types/api';
  export { ProfitAndLoss } from '@layerfi/components/types/profit_and_loss';
  export { LineItem } from '@layerfi/components/types/line_item';
  export { BalanceSheet } from '@layerfi/components/types/balance_sheet';
  export { StatementOfCashFlow } from '@layerfi/components/types/statement_of_cash_flow';
  export { Direction, BankTransaction, DisplayState } from '@layerfi/components/types/bank_transactions';
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
  export type ReportingBasis = 'CASH' | 'ACCRUAL';

}
declare module '@layerfi/components/utils/bankTransactions' {
  import { CategoryOption } from '@layerfi/components/components/CategorySelect/CategorySelect';
  import { BankTransaction, DateRange } from '@layerfi/components/types';
  export const hasMatch: (bankTransaction?: BankTransaction) => boolean;
  export const isCredit: ({ direction }: Pick<BankTransaction, 'direction'>) => boolean;
  export const isAlreadyMatched: (bankTransaction?: BankTransaction) => string | undefined;
  export const countTransactionsToReview: ({ transactions, dateRange, }: {
      transactions?: BankTransaction[] | undefined;
      dateRange?: DateRange | undefined;
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
  export const convertCurrencyToNumber: (amount: string) => number;
  export const CURRENCY_INPUT_PATTERN = "[0-9]+(.[0-9]+)?";

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
  import { AccountIdentifierPayloadObject } from '@layerfi/components/types/categories';
  import { JournalEntryLineItem } from '@layerfi/components/types/journal';
  export const getAccountIdentifierPayload: (journalLineItem: JournalEntryLineItem) => AccountIdentifierPayloadObject;

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
declare module '@layerfi/components/views/AccountingOverview/AccountingOverview' {
  import React, { ReactNode } from 'react';
  export interface AccountingOverviewProps {
      title?: string;
      enableOnboarding?: boolean;
      onTransactionsToReviewClick?: () => void;
      middleBanner?: ReactNode;
  }
  export const AccountingOverview: ({ title, enableOnboarding, onTransactionsToReviewClick, middleBanner, }: AccountingOverviewProps) => React.JSX.Element;

}
declare module '@layerfi/components/views/AccountingOverview/index' {
  export { AccountingOverview } from '@layerfi/components/views/AccountingOverview/AccountingOverview';

}
declare module '@layerfi/components/views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts' {
  import React from 'react';
  import { MobileComponentType } from "@layerfi/components/components/BankTransactions/constants";
  export interface BankTransactionsWithLinkedAccountsProps {
      title?: string;
      elevatedLinkedAccounts?: boolean;
      showLedgerBalance?: boolean;
      showUnlinkItem?: boolean;
      showBreakConnection?: boolean;
      showDescriptions?: boolean;
      showReceiptUploads?: boolean;
      mobileComponent?: MobileComponentType;
  }
  export const BankTransactionsWithLinkedAccounts: ({ title, elevatedLinkedAccounts, showLedgerBalance, showUnlinkItem, showBreakConnection, showDescriptions, showReceiptUploads, mobileComponent, }: BankTransactionsWithLinkedAccountsProps) => React.JSX.Element;

}
declare module '@layerfi/components/views/BankTransactionsWithLinkedAccounts/index' {
  export { BankTransactionsWithLinkedAccounts } from '@layerfi/components/views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts';

}
declare module '@layerfi/components/views/BookkeepingOverview/BookkeepingOverview' {
  import React from 'react';
  export interface BookkeepingOverviewProps {
      title?: string;
  }
  export const BookkeepingOverview: ({ title, }: BookkeepingOverviewProps) => React.JSX.Element;

}
declare module '@layerfi/components/views/BookkeepingOverview/index' {
  export { BookkeepingOverview } from '@layerfi/components/views/BookkeepingOverview/BookkeepingOverview';

}
declare module '@layerfi/components/views/GeneralLedger/GeneralLedger' {
  import React from 'react';
  export interface GeneralLedgerProps {
      title?: string;
  }
  export const GeneralLedgerView: ({ title, }: GeneralLedgerProps) => React.JSX.Element;

}
declare module '@layerfi/components/views/GeneralLedger/index' {
  export { GeneralLedgerView } from '@layerfi/components/views/GeneralLedger/GeneralLedger';

}
declare module '@layerfi/components/views/Reports/Reports' {
  import React, { RefObject } from 'react';
  export interface ReportsProps {
      title?: string;
  }
  type ReportType = 'profitAndLoss' | 'balanceSheet' | 'statementOfCashFlow';
  export interface ReportsPanelProps {
      containerRef: RefObject<HTMLDivElement>;
      openReport: ReportType;
  }
  export const Reports: ({ title }: ReportsProps) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/views/Reports/index' {
  export { Reports } from '@layerfi/components/views/Reports/Reports';

}
declare module '@layerfi/components' {
  import main = require('@layerfi/components/index');
  export = main;
}