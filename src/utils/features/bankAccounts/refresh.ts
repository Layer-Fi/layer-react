import type { BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { type ExternalAccountConnection, ExternalAccountUpdateType } from '@schemas/features/bankAccounts/externalAccountConnection'
import {
  type BankAccountLabelParts,
  getBankAccountInstitution,
  getBankAccountLabelParts,
} from '@utils/features/bankAccounts/bankAccount'

const REFRESH_ALERT_MINIMUM_SYNC_AGE_MS = 24 * 60 * 60 * 1000

export type BankAccountRefreshConnection = {
  connectionExternalId: string
  source: ExternalAccountConnection['externalAccountSource']
  reconnectWithNewCredentials: boolean
  institutionName: string | null
  accounts: BankAccountLabelParts[]
}

export type BankAccountNeedingReconnection = {
  account: BankAccountLabelParts
  lastSyncedAt: Date | null
  source: ExternalAccountConnection['externalAccountSource']
  connectionExternalId: string
  reconnectWithNewCredentials: boolean
}

type RepairableExternalAccount = ExternalAccountConnection & { connectionExternalId: string }

type RefreshableAccount = {
  bankAccount: BankAccount
  externalAccount: RepairableExternalAccount
}

function isExternalAccountUserPresentRequired(externalAccount: ExternalAccountConnection): boolean {
  return externalAccount.updateType === ExternalAccountUpdateType.UserPresentRequired
}

function isExternalAccountRefreshStale(externalAccount: ExternalAccountConnection, now: Date): boolean {
  return externalAccount.lastSyncedAt == null
    || now.getTime() - externalAccount.lastSyncedAt.getTime() > REFRESH_ALERT_MINIMUM_SYNC_AGE_MS
}

function isExternalAccountRepairable(externalAccount: ExternalAccountConnection): externalAccount is RepairableExternalAccount {
  return externalAccount.connectionExternalId != null
}

function isExternalAccountDueForRefresh(
  externalAccount: ExternalAccountConnection,
  now: Date,
): externalAccount is RepairableExternalAccount {
  return isExternalAccountUserPresentRequired(externalAccount)
    && isExternalAccountRefreshStale(externalAccount, now)
    && isExternalAccountRepairable(externalAccount)
}

function getRefreshableAccounts(
  bankAccounts: ReadonlyArray<BankAccount> | undefined,
  now: Date,
): RefreshableAccount[] {
  return (bankAccounts ?? []).flatMap(bankAccount =>
    bankAccount.externalAccounts
      .filter((ea): ea is RepairableExternalAccount => isExternalAccountDueForRefresh(ea, now))
      .map(externalAccount => ({ bankAccount, externalAccount })),
  )
}

function getRefreshInstitutionName({ bankAccount, externalAccount }: RefreshableAccount): string | null {
  return getBankAccountInstitution(bankAccount)?.name ?? externalAccount.institution?.name ?? null
}

export function isBankAccountReadyForRefresh(bankAccount: BankAccount, now = new Date()): boolean {
  return bankAccount.externalAccounts.some(ea => isExternalAccountDueForRefresh(ea, now))
}

export function getBankAccountsReadyForRefresh(
  bankAccounts: ReadonlyArray<BankAccount> | undefined,
  now = new Date(),
): BankAccount[] {
  return (bankAccounts ?? []).filter(ba => isBankAccountReadyForRefresh(ba, now))
}

export function getBankAccountRefreshConnections(
  bankAccounts: ReadonlyArray<BankAccount> | undefined,
  now = new Date(),
): BankAccountRefreshConnection[] {
  const connections = new Map<string, {
    connectionExternalId: string
    source: ExternalAccountConnection['externalAccountSource']
    reconnectWithNewCredentials: boolean
    institutionNames: Set<string>
    accounts: Map<string, BankAccountLabelParts>
  }>()

  for (const { bankAccount, externalAccount } of getRefreshableAccounts(bankAccounts, now)) {
    const key = JSON.stringify([externalAccount.externalAccountSource, externalAccount.connectionExternalId])
    const connection = connections.get(key) ?? {
      connectionExternalId: externalAccount.connectionExternalId,
      source: externalAccount.externalAccountSource,
      reconnectWithNewCredentials: false,
      institutionNames: new Set<string>(),
      accounts: new Map<string, BankAccountLabelParts>(),
    }

    const institutionName = getRefreshInstitutionName({ bankAccount, externalAccount })
    if (institutionName) connection.institutionNames.add(institutionName)
    connection.accounts.set(bankAccount.id, getBankAccountLabelParts(bankAccount))
    connection.reconnectWithNewCredentials ||= externalAccount.reconnectWithNewCredentials ?? false
    connections.set(key, connection)
  }

  return [...connections.values()].map(connection => ({
    connectionExternalId: connection.connectionExternalId,
    source: connection.source,
    reconnectWithNewCredentials: connection.reconnectWithNewCredentials,
    institutionName: connection.institutionNames.size === 1
      ? [...connection.institutionNames][0] ?? null
      : null,
    accounts: [...connection.accounts.values()],
  }))
}

export function getBankAccountRefreshConnectionInfo(bankAccount: BankAccount, now = new Date()) {
  const refreshAccount = bankAccount.externalAccounts.find(ea => isExternalAccountDueForRefresh(ea, now))
  if (!refreshAccount) return null

  return {
    connectionExternalId: refreshAccount.connectionExternalId,
    source: refreshAccount.externalAccountSource,
    reconnectWithNewCredentials: refreshAccount.reconnectWithNewCredentials ?? false,
    updateType: refreshAccount.updateType,
    lastSyncedAt: refreshAccount.lastSyncedAt,
  }
}

export function getBankAccountNeedingReconnection(
  bankAccounts: ReadonlyArray<BankAccount> | undefined,
  now = new Date(),
): BankAccountNeedingReconnection | null {
  for (const bankAccount of bankAccounts ?? []) {
    const refreshInfo = getBankAccountRefreshConnectionInfo(bankAccount, now)
    if (refreshInfo) {
      return {
        account: getBankAccountLabelParts(bankAccount),
        lastSyncedAt: refreshInfo.lastSyncedAt ?? null,
        source: refreshInfo.source,
        connectionExternalId: refreshInfo.connectionExternalId,
        reconnectWithNewCredentials: refreshInfo.reconnectWithNewCredentials,
      }
    }
  }

  return null
}
