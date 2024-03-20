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

}
declare module '@layerfi/components/api/layer/balance_sheet' {
  import { BalanceSheet } from '@layerfi/components/types';
  export interface GetBalanceSheetParams {
      businessId: string;
      date: string;
  }
  export const getBalanceSheet: (_token: string, _params: {
      params: GetBalanceSheetParams;
  }) => () => BalanceSheet;

}
declare module '@layerfi/components/api/layer/bankTransactions' {
  import { CategoryUpdate, BankTransaction, Metadata } from '@layerfi/components/types';
  export type GetBankTransactionsReturn = {
      data?: BankTransaction[];
      meta?: Metadata;
      error?: unknown;
  };
  export interface GetBankTransactionsParams extends Record<string, string | undefined> {
      businessId: string;
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
  import { AccountAlternate, ChartOfAccounts, NewAccount } from '@layerfi/components/types';
  export const getChartOfAccounts: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data: ChartOfAccounts;
  }>;
  export const createAccount: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
      body?: NewAccount | undefined;
  } | undefined) => Promise<{
      data: AccountAlternate;
  }>;

}
declare module '@layerfi/components/api/layer/profit_and_loss' {
  import { ProfitAndLoss } from '@layerfi/components/types';
  export const getProfitAndLoss: (baseUrl: string, accessToken: string | undefined, options?: {
      params?: Record<string, string | undefined> | undefined;
  } | undefined) => () => Promise<{
      data?: ProfitAndLoss | undefined;
      error?: unknown;
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
      categorizeBankTransaction: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types").CategoryUpdate | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types").BankTransaction;
          errors: unknown;
      }>;
      createAccount: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
          body?: import("@layerfi/components/types").NewAccount | undefined;
      } | undefined) => Promise<{
          data: import("@layerfi/components/types").AccountAlternate;
      }>;
      getBalanceSheet: (_token: string, _params: {
          params: import("@layerfi/components/api/layer/balance_sheet").GetBalanceSheetParams;
      }) => () => import("@layerfi/components/types").BalanceSheet;
      getBankTransactions: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: import("@layerfi/components/api/layer/bankTransactions").GetBankTransactionsParams | undefined;
      } | undefined) => () => Promise<import("@layerfi/components/api/layer/bankTransactions").GetBankTransactionsReturn>;
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
      getProfitAndLoss: (baseUrl: string, accessToken: string | undefined, options?: {
          params?: Record<string, string | undefined> | undefined;
      } | undefined) => () => Promise<{
          data?: import("@layerfi/components/types").ProfitAndLoss | undefined;
          error?: unknown;
      }>;
  };

}
declare module '@layerfi/components/api/util' {
  export const formStringFromObject: (object: Record<string, string | number | boolean>) => string;

}
declare module '@layerfi/components/components/BalanceSheet/BalanceSheet' {
  import React from 'react';
  export const BalanceSheet: () => React.JSX.Element;

}
declare module '@layerfi/components/components/BalanceSheet/index' {
  export { BalanceSheet } from '@layerfi/components/components/BalanceSheet/BalanceSheet';

}
declare module '@layerfi/components/components/BalanceSheetDatePicker/BalanceSheetDatePicker' {
  import React from 'react';
  type Props = {
      value: Date;
      onChange: React.ChangeEventHandler<HTMLInputElement>;
  };
  export const BalanceSheetDatePicker: ({ value, onChange }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/BalanceSheetDatePicker/index' {
  export { BalanceSheetDatePicker } from '@layerfi/components/components/BalanceSheetDatePicker/BalanceSheetDatePicker';

}
declare module '@layerfi/components/components/BalanceSheetRow/BalanceSheetRow' {
  import React from 'react';
  import { LineItem } from '@layerfi/components/types';
  type Props = {
      depth?: number;
      maxDepth?: number;
      lineItem?: LineItem | null;
      variant?: string;
      summarize?: boolean;
  };
  export const BalanceSheetRow: ({ lineItem, depth, maxDepth, variant, summarize, }: Props) => React.JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/BalanceSheetRow/index' {
  export { BalanceSheetRow } from '@layerfi/components/components/BalanceSheetRow/BalanceSheetRow';

}
declare module '@layerfi/components/components/BankTransactionListItem/BankTransactionListItem' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  type Props = {
      dateFormat: string;
      bankTransaction: BankTransaction;
      isOpen: boolean;
      toggleOpen: (id: string) => void;
      editable: boolean;
  };
  export const BankTransactionListItem: ({ dateFormat, bankTransaction, isOpen, toggleOpen, editable, }: Props) => React.JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/BankTransactionListItem/index' {
  export { BankTransactionListItem } from '@layerfi/components/components/BankTransactionListItem/BankTransactionListItem';

}
declare module '@layerfi/components/components/BankTransactionRow/BankTransactionRow' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  type Props = {
      dateFormat: string;
      bankTransaction: BankTransaction;
      isOpen: boolean;
      toggleOpen: (id: string) => void;
      editable: boolean;
  };
  export const BankTransactionRow: ({ dateFormat, bankTransaction, isOpen, toggleOpen, editable, }: Props) => React.JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/BankTransactionRow/index' {
  export { BankTransactionRow } from '@layerfi/components/components/BankTransactionRow/BankTransactionRow';

}
declare module '@layerfi/components/components/BankTransactions/BankTransactions' {
  import React from 'react';
  export const BankTransactions: () => React.JSX.Element;

}
declare module '@layerfi/components/components/BankTransactions/index' {
  export { BankTransactions } from '@layerfi/components/components/BankTransactions/BankTransactions';

}
declare module '@layerfi/components/components/Button/Button' {
  import React, { ButtonHTMLAttributes, ReactNode } from 'react';
  export enum ButtonVariant {
      primary = "primary",
      secondary = "secondary"
  }
  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: ButtonVariant;
      leftIcon?: ReactNode;
      rightIcon?: ReactNode;
      iconOnly?: ReactNode;
  }
  export const Button: ({ className, children, variant, leftIcon, rightIcon, iconOnly, ...props }: ButtonProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/SubmitButton' {
  import React, { ButtonHTMLAttributes } from 'react';
  export interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      processing?: boolean;
      disabled?: boolean;
      error?: boolean | string;
      active?: boolean;
      iconOnly?: boolean;
  }
  export const SubmitButton: ({ active, className, processing, disabled, error, children, ...props }: SubmitButtonProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Button/index' {
  export { Button, ButtonVariant } from '@layerfi/components/components/Button/Button';
  export { SubmitButton } from '@layerfi/components/components/Button/SubmitButton';

}
declare module '@layerfi/components/components/CategoryMenu/CategoryMenu' {
  import React from 'react';
  import { BankTransaction, Category } from '@layerfi/components/types';
  type Props = {
      name?: string;
      bankTransaction: BankTransaction;
      value: Category | undefined;
      onChange: (newValue: Category) => void;
      disabled?: boolean;
      className?: string;
  };
  export const CategoryMenu: ({ bankTransaction, name, value, onChange, disabled, className, }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/CategoryMenu/index' {
  export { CategoryMenu } from '@layerfi/components/components/CategoryMenu/CategoryMenu';

}
declare module '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts' {
  import React from 'react';
  export const ChartOfAccounts: () => React.JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccounts/index' {
  export { ChartOfAccounts } from '@layerfi/components/components/ChartOfAccounts/ChartOfAccounts';

}
declare module '@layerfi/components/components/ChartOfAccountsNewForm/ChartOfAccountsNewForm' {
  import React from 'react';
  export const ChartOfAccountsNewForm: () => React.JSX.Element;

}
declare module '@layerfi/components/components/ChartOfAccountsNewForm/index' {
  export { ChartOfAccountsNewForm } from '@layerfi/components/components/ChartOfAccountsNewForm/ChartOfAccountsNewForm';

}
declare module '@layerfi/components/components/ChartOfAccountsRow/ChartOfAccountsRow' {
  import React from 'react';
  import { Account } from '@layerfi/components/types';
  type Props = {
      account: Account;
      depth?: number;
  };
  export const ChartOfAccountsRow: ({ account, depth }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/ChartOfAccountsRow/index' {
  export { ChartOfAccountsRow } from '@layerfi/components/components/ChartOfAccountsRow/ChartOfAccountsRow';

}
declare module '@layerfi/components/components/Container/Container' {
  import React, { ReactNode } from 'react';
  export interface ContainerProps {
      name: string;
      className?: string;
      children: ReactNode;
  }
  export const Container: ({ name, className, children }: ContainerProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Container/Header' {
  import React, { CSSProperties, ReactNode } from 'react';
  export interface HeaderProps {
      className?: string;
      style?: CSSProperties;
      children: ReactNode;
  }
  export const Header: React.ForwardRefExoticComponent<HeaderProps & React.RefAttributes<HTMLElement>>;

}
declare module '@layerfi/components/components/Container/index' {
  export { Container } from '@layerfi/components/components/Container/Container';
  export { Header } from '@layerfi/components/components/Container/Header';

}
declare module '@layerfi/components/components/ExpandedBankTransactionRow/ExpandedBankTransactionRow' {
  import React from 'react';
  import { BankTransaction } from '@layerfi/components/types';
  type Props = {
      bankTransaction: BankTransaction;
      close?: () => void;
      isOpen?: boolean;
      asListItem?: boolean;
      showSubmitButton?: boolean;
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
declare module '@layerfi/components/components/Hello/Hello' {
  import React from 'react';
  type Props = {
      user?: string | undefined;
  };
  export const Hello: ({ user }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/Hello/index' {
  export { Hello } from '@layerfi/components/components/Hello/Hello';

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
  export const Input: ({ className, ...props }: HTMLProps<HTMLInputElement>) => React.JSX.Element;

}
declare module '@layerfi/components/components/Input/InputGroup' {
  import React, { ReactNode } from 'react';
  export interface InputGroupProps {
      label?: string;
      name?: string;
      className?: string;
      children?: ReactNode;
  }
  export const InputGroup: ({ label, name, className, children, }: InputGroupProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Input/index' {
  export { Input } from '@layerfi/components/components/Input/Input';
  export { InputGroup } from '@layerfi/components/components/Input/InputGroup';
  export { FileInput } from '@layerfi/components/components/Input/FileInput';

}
declare module '@layerfi/components/components/Loader/Loader' {
  import React, { ReactNode } from 'react';
  export interface LoaderProps {
      children?: ReactNode;
  }
  export const Loader: ({ children }: LoaderProps) => React.JSX.Element;

}
declare module '@layerfi/components/components/Loader/index' {
  export { Loader } from '@layerfi/components/components/Loader/Loader';

}
declare module '@layerfi/components/components/Pill/Pill' {
  import React, { PropsWithChildren } from 'react';
  export const Pill: ({ children }: PropsWithChildren) => React.JSX.Element;

}
declare module '@layerfi/components/components/Pill/index' {
  export { Pill } from '@layerfi/components/components/Pill/Pill';

}
declare module '@layerfi/components/components/ProfitAndLoss/ProfitAndLoss' {
  import React, { PropsWithChildren } from 'react';
  const ProfitAndLoss: {
      ({ children }: PropsWithChildren): React.JSX.Element;
      Chart: () => React.JSX.Element;
      Context: React.Context<{
          data: import("@layerfi/components/types").ProfitAndLoss | undefined;
          isLoading: boolean;
          error: unknown;
          dateRange: import("@layerfi/components/types").DateRange;
          changeDateRange: (dateRange: Partial<import("@layerfi/components/types").DateRange>) => void;
      }>;
      DatePicker: () => React.JSX.Element;
      Summaries: () => React.JSX.Element;
      Table: () => React.JSX.Element;
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
  };
  export const Indicator: ({ viewBox, className, animateFrom, setAnimateFrom, }: Props) => React.JSX.Element | null;
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
declare module '@layerfi/components/components/ProfitAndLossRow/ProfitAndLossRow' {
  import React from 'react';
  import { Direction, LineItem } from '@layerfi/components/types';
  type Props = {
      variant?: string;
      depth?: number;
      maxDepth?: number;
      lineItem?: LineItem | null;
      direction?: Direction;
      summarize?: boolean;
  };
  export const ProfitAndLossRow: ({ variant, lineItem, depth, maxDepth, direction, summarize, }: Props) => React.JSX.Element | null;
  export {};

}
declare module '@layerfi/components/components/ProfitAndLossRow/index' {
  export { ProfitAndLossRow } from '@layerfi/components/components/ProfitAndLossRow/ProfitAndLossRow';

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries' {
  import React from 'react';
  export const ProfitAndLossSummaries: () => React.JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossSummaries/index' {
  export { ProfitAndLossSummaries } from '@layerfi/components/components/ProfitAndLossSummaries/ProfitAndLossSummaries';

}
declare module '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTable' {
  import React from 'react';
  export const ProfitAndLossTable: () => React.JSX.Element;

}
declare module '@layerfi/components/components/ProfitAndLossTable/empty_profit_and_loss_report' {
  import { ProfitAndLoss } from '@layerfi/components/types';
  const _default: ProfitAndLoss;
  export default _default;

}
declare module '@layerfi/components/components/ProfitAndLossTable/index' {
  export { ProfitAndLossTable } from '@layerfi/components/components/ProfitAndLossTable/ProfitAndLossTable';

}
declare module '@layerfi/components/components/SkeletonBalanceSheetRow/SkeletonBalanceSheetRow' {
  import React, { PropsWithChildren } from 'react';
  type Props = PropsWithChildren;
  export const SkeletonBalanceSheetRow: ({ children }: Props) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/components/SkeletonBalanceSheetRow/index' {
  export { SkeletonBalanceSheetRow } from '@layerfi/components/components/SkeletonBalanceSheetRow/SkeletonBalanceSheetRow';

}
declare module '@layerfi/components/components/Textarea/Textarea' {
  import React, { HTMLProps } from 'react';
  export const Textarea: ({ className, ...props }: HTMLProps<HTMLTextAreaElement>) => React.JSX.Element;

}
declare module '@layerfi/components/components/Textarea/index' {
  export { Textarea } from '@layerfi/components/components/Textarea/Textarea';

}
declare module '@layerfi/components/components/Toggle/Toggle' {
  import React, { ChangeEvent, ReactNode } from 'react';
  export interface Option {
      label: string;
      value: string;
      disabled?: boolean;
      leftIcon?: ReactNode;
  }
  export enum ToggleSize {
      medium = "medium",
      small = "small"
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
          x: number;
          y: number;
          placement: import("@floating-ui/utils").Placement;
          strategy: import("@floating-ui/utils").Strategy;
          middlewareData: import("@floating-ui/core").MiddlewareData;
          isPositioned: boolean;
          update: () => void;
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
          x: number;
          y: number;
          placement: import("@floating-ui/utils").Placement;
          strategy: import("@floating-ui/utils").Strategy;
          middlewareData: import("@floating-ui/core").MiddlewareData;
          isPositioned: boolean;
          update: () => void;
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
  export { Text, TextSize, TextWeight } from '@layerfi/components/components/Typography/Text';
  export { Heading, HeadingSize } from '@layerfi/components/components/Typography/Heading';

}
declare module '@layerfi/components/contexts/LayerContext/LayerContext' {
  /// <reference types="react" />
  import { LayerContextValues } from '@layerfi/components/types';
  import { LayerThemeConfig } from '@layerfi/components/types/layer_context';
  export const LayerContext: import("react").Context<LayerContextValues & {
      setTheme: (theme: LayerThemeConfig) => void;
  }>;

}
declare module '@layerfi/components/contexts/LayerContext/index' {
  export { LayerContext } from '@layerfi/components/contexts/LayerContext/LayerContext';

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
  };
  export const useBalanceSheet: UseBalanceSheet;
  export {};

}
declare module '@layerfi/components/hooks/useBankTransactions/index' {
  export { useBankTransactions } from '@layerfi/components/hooks/useBankTransactions/useBankTransactions';

}
declare module '@layerfi/components/hooks/useBankTransactions/useBankTransactions' {
  import { BankTransaction, CategoryUpdate, Metadata } from '@layerfi/components/types';
  type UseBankTransactions = () => {
      data: BankTransaction[];
      metadata: Metadata;
      isLoading: boolean;
      error: unknown;
      categorize: (id: BankTransaction['id'], newCategory: CategoryUpdate) => Promise<void>;
      updateOneLocal: (bankTransaction: BankTransaction) => void;
  };
  export const useBankTransactions: UseBankTransactions;
  export {};

}
declare module '@layerfi/components/hooks/useChartOfAccounts/index' {
  export { useChartOfAccounts } from '@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts';

}
declare module '@layerfi/components/hooks/useChartOfAccounts/useChartOfAccounts' {
  import { AccountAlternate, ChartOfAccounts, NewAccount } from '@layerfi/components/types';
  type UseChartOfAccounts = () => {
      data: ChartOfAccounts | undefined;
      isLoading: boolean;
      error: unknown;
      create: (newAccount: NewAccount) => Promise<AccountAlternate>;
  };
  export const useChartOfAccounts: UseChartOfAccounts;
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
  }) => void) => import("react").RefObject<T>;

}
declare module '@layerfi/components/hooks/useLayerContext/index' {
  export { useLayerContext } from '@layerfi/components/hooks/useLayerContext/useLayerContext';

}
declare module '@layerfi/components/hooks/useLayerContext/useLayerContext' {
  export const useLayerContext: () => import("@layerfi/components/types").LayerContextValues & {
      setTheme: (theme: import("@layerfi/components/types/layer_context").LayerThemeConfig) => void;
  };

}
declare module '@layerfi/components/hooks/useProfitAndLoss/index' {
  export { useProfitAndLoss } from '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss';

}
declare module '@layerfi/components/hooks/useProfitAndLoss/useProfitAndLoss' {
  import { ProfitAndLoss, DateRange } from '@layerfi/components/types';
  type Props = DateRange;
  type UseProfitAndLoss = (props?: Props) => {
      data: ProfitAndLoss | undefined;
      isLoading: boolean;
      error: unknown;
      dateRange: DateRange;
      changeDateRange: (dateRange: Partial<DateRange>) => void;
  };
  export const useProfitAndLoss: UseProfitAndLoss;
  export {};

}
declare module '@layerfi/components/icons/AlertCircle' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const AlertCircle: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default AlertCircle;

}
declare module '@layerfi/components/icons/Calendar' {
  import * as React from 'react';
  import { SVGProps } from 'react';
  const Calendar: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  export default Calendar;

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
declare module '@layerfi/components/icons/ChevronLeft' {
  import * as React from 'react';
  import { SVGProps } from 'react';
  type Props = {
      strokeColor?: string;
      size?: number;
  };
  const ChevronLeft: ({ strokeColor, size, ...props }: Props & SVGProps<SVGSVGElement>) => React.JSX.Element;
  export default ChevronLeft;

}
declare module '@layerfi/components/icons/ChevronRight' {
  import * as React from 'react';
  import { SVGProps } from 'react';
  type Props = SVGProps<SVGSVGElement> & {
      size: SVGProps<SVGSVGElement>['width'];
  };
  const ChavronRight: ({ size, ...props }: Props) => React.JSX.Element;
  export default ChavronRight;

}
declare module '@layerfi/components/icons/DownloadCloud' {
  import * as React from 'react';
  import { SVGProps } from 'react';
  const DownloadCloud: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  export default DownloadCloud;

}
declare module '@layerfi/components/icons/FolderPlus' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const FolderPlus: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default FolderPlus;

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
declare module '@layerfi/components/icons/RefreshCcw' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const RefreshCcw: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default RefreshCcw;

}
declare module '@layerfi/components/icons/ScissorsFullOpen' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const ScissorsFullOpen: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default ScissorsFullOpen;

}
declare module '@layerfi/components/icons/UploadCloud' {
  import * as React from 'react';
  import { IconSvgProps } from '@layerfi/components/icons/types';
  const UploadCloud: ({ size, ...props }: IconSvgProps) => React.JSX.Element;
  export default UploadCloud;

}
declare module '@layerfi/components/icons/types' {
  import { SVGProps } from 'react';
  export type IconSvgProps = SVGProps<SVGSVGElement> & {
      size?: SVGProps<SVGSVGElement>['width'];
  };

}
declare module '@layerfi/components/index' {
  export { BalanceSheet } from '@layerfi/components/components/BalanceSheet/index';
  export { BankTransactions } from '@layerfi/components/components/BankTransactions/index';
  export { Hello } from '@layerfi/components/components/Hello/index';
  export { ProfitAndLoss } from '@layerfi/components/components/ProfitAndLoss/index';
  export { LayerProvider } from '@layerfi/components/providers/LayerProvider/index';
  export { ChartOfAccounts } from '@layerfi/components/components/ChartOfAccounts/index';

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
declare module '@layerfi/components/models/Money' {
  export const centsToDollars: (cents?: number) => string;
  export const dollarsToCents: (dollars?: string) => number;
  const _default: {
      centsToDollars: (cents?: number) => string;
      dollarsToCents: (dollars?: string) => number;
  };
  export default _default;

}
declare module '@layerfi/components/providers/LayerProvider/LayerProvider' {
  import React, { PropsWithChildren } from 'react';
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
  };
  export const LayerProvider: ({ appId, appSecret, businessId, children, businessAccessToken, environment, theme, }: PropsWithChildren<Props>) => React.JSX.Element;
  export {};

}
declare module '@layerfi/components/providers/LayerProvider/index' {
  export { LayerProvider } from '@layerfi/components/providers/LayerProvider/LayerProvider';

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
      start_date: string;
      end_date: string;
      assets: LineItem[];
      liabilities_and_equity: LineItem[];
      fully_categorized: boolean;
  }

}
declare module '@layerfi/components/types/bank_transactions' {
  import { Categorization, CategorizationStatus, Category } from '@layerfi/components/types/categories';
  export enum Direction {
      CREDIT = "CREDIT",
      DEBIT = "DEBIT"
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
  }

}
declare module '@layerfi/components/types/categories' {
  export enum CategorizationStatus {
      PENDING = "PENDING",
      READY_FOR_INPUT = "READY_FOR_INPUT",
      LAYER_REVIEW = "LAYER_REVIEW",
      CATEGORIZED = "CATEGORIZED",
      SPLIT = "SPLIT",
      JOURNALING = "JOURNALING"
  }
  export interface Category {
      id: string;
      type: string;
      display_name: string;
      category: string;
      stable_name?: string;
      subCategories?: Category[];
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
  export type SingleCategoryUpdate = {
      type: 'Category';
      category: {
          type: 'StableName';
          stable_name: string;
      };
  };
  export type SplitCategoryUpdate = {
      type: 'Split';
      entries: {
          category: string;
          amount: number;
      }[];
  };
  export type CategoryUpdate = SingleCategoryUpdate | SplitCategoryUpdate;

}
declare module '@layerfi/components/types/chart_of_accounts' {
  import { Direction } from '@layerfi/components/types/bank_transactions';
  import { Category } from '@layerfi/components/types/categories';
  export interface ChartOfAccounts {
      name: string;
      accounts: Account[];
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
      subAccounts?: Account[];
      hidePnl: boolean;
      showInPnlIfEmpty: boolean;
      normality: Direction;
      balance: number;
      selfOnlyBalance: number;
  }
  export interface AccountAlternate {
      type: 'Ledger_Account';
      id: string;
      name: string;
      stable_name: string | null;
      normality: Direction;
      pnl_category: string | null;
  }
  export type NewAccount = {
      name: string;
      normality: Direction;
      parent_id: {
          type: 'AccountId';
          id: string;
      };
      description: string;
  };

}
declare module '@layerfi/components/types/layer_context' {
  import { Category } from '@layerfi/components/types';
  import { ExpiringOAuthResponse } from '@layerfi/components/types/authentication';
  export type LayerContextValues = {
      auth: ExpiringOAuthResponse;
      businessId: string;
      categories: Category[];
      apiUrl: string;
      theme?: LayerThemeConfig;
  };
  export interface ColorHSLConfig {
      h: string;
      s: string;
      l: string;
  }
  export interface ColorRGBConfig {
      r: string;
      g: string;
      b: string;
  }
  export interface ColorHexConfig {
      hex: string;
  }
  export type ColorConfig = ColorHSLConfig | ColorRGBConfig | ColorHexConfig;
  export interface LayerThemeConfig {
      colors?: {
          dark?: ColorConfig;
          light?: ColorConfig;
      };
  }
  export enum LayerContextActionName {
      setAuth = "LayerContext.setAuth",
      setCategories = "LayerContext.setCategories",
      setTheme = "LayerContext.setTheme"
  }
  export type LayerContextAction = {
      type: LayerContextActionName.setAuth;
      payload: {
          auth: LayerContextValues['auth'];
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
  };

}
declare module '@layerfi/components/types/line_item' {
  export interface LineItem {
      name?: string;
      display_name: string;
      value: number | undefined;
      line_items?: LineItem[] | null;
  }

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

}
declare module '@layerfi/components/types' {
  export { OAuthResponse } from '@layerfi/components/types/authentication';
  export { LayerContextValues, LayerContextActionName, LayerContextAction, } from '@layerfi/components/types/layer_context';
  export { Metadata } from '@layerfi/components/types/api';
  export { ProfitAndLoss } from '@layerfi/components/types/profit_and_loss';
  export { LineItem } from '@layerfi/components/types/line_item';
  export { BalanceSheet } from '@layerfi/components/types/balance_sheet';
  export { Direction, BankTransaction } from '@layerfi/components/types/bank_transactions';
  export { CategorizationStatus, Category, CategorizationType, AutoCategorization, SuggestedCategorization, SingleCategoryUpdate, SplitCategoryUpdate, CategoryUpdate, } from '@layerfi/components/types/categories';
  export { AccountAlternate, ChartOfAccounts, Account, NewAccount, } from '@layerfi/components/types/chart_of_accounts';
  export type DateRange<T = Date> = {
      startDate: T;
      endDate: T;
  };

}
declare module '@layerfi/components/utils/colors' {
  import { LayerThemeConfig } from '@layerfi/components/types/layer_context';
  /**
   * Convert `theme` config set in Provider into component styles.
   *
   * @param {LayerThemeConfig} theme - the theme set with provider
   */
  export const parseStylesFromThemeConfig: (theme?: LayerThemeConfig) => {};

}
declare module '@layerfi/components' {
  import main = require('@layerfi/components/index');
  export = main;
}