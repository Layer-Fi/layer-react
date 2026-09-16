import type { BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { type ExternalAccountConnection, ExternalAccountUpdateType } from '@schemas/features/bankAccounts/externalAccountConnection'

const REFRESH_ALERT_MINIMUM_SYNC_AGE_MS = 24 * 60 * 60 * 1000

export type BankAccountRefreshConnection = {
  connectionExternalId: string
  source: ExternalAccountConnection['externalAccountSource']
  reconnectWithNewCredentials: boolean
  institutionName: string | null
  accountNames: string[]
}

export function getAccountsNeedingConfirmation(bankAccounts: ReadonlyArray<BankAccount>): ExternalAccountConnection[] {
  return bankAccounts.flatMap(ba =>
    ba.externalAccounts.filter(
      ({ notifications }) => notifications.some(({ type }) => type === 'CONFIRM_RELEVANT'),
    ),
  )
}

export function getBankAccountDisplayName(bankAccount: BankAccount): string {
  return bankAccount.accountName
    ?? bankAccount.externalAccounts[0]?.externalAccountName
    ?? 'Unknown Account'
}

export function getBankAccountInstitution(bankAccount: BankAccount): { name: string, logo: string | null | undefined } | null {
  return bankAccount.institution
    ?? bankAccount.externalAccounts[0]?.institution
    ?? null
}

export function isBankAccountSyncing(bankAccount: BankAccount): boolean {
  return bankAccount.externalAccounts.some(ea => ea.isSyncing)
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
    accountNames: Set<string>
  }>()

  for (const bankAccount of bankAccounts ?? []) {
    for (const externalAccount of bankAccount.externalAccounts) {
      if (!externalAccount.connectionExternalId || !isExternalAccountDueForRefresh(externalAccount, now)) continue

      const key = JSON.stringify([externalAccount.externalAccountSource, externalAccount.connectionExternalId])
      const connection = connections.get(key) ?? {
        connectionExternalId: externalAccount.connectionExternalId,
        source: externalAccount.externalAccountSource,
        reconnectWithNewCredentials: false,
        institutionNames: new Set<string>(),
        accountNames: new Set<string>(),
      }

      const institutionName = externalAccount.institution?.name ?? bankAccount.institution?.name
      if (institutionName) connection.institutionNames.add(institutionName)
      connection.accountNames.add(formatBankAccountWithMask(bankAccount))
      connection.reconnectWithNewCredentials ||= externalAccount.reconnectWithNewCredentials
      connections.set(key, connection)
    }
  }

  return [...connections.values()].map(connection => ({
    connectionExternalId: connection.connectionExternalId,
    source: connection.source,
    reconnectWithNewCredentials: connection.reconnectWithNewCredentials,
    institutionName: connection.institutionNames.size === 1
      ? [...connection.institutionNames][0] ?? null
      : null,
    accountNames: [...connection.accountNames],
  }))
}

export function getBankAccountRefreshConnectionInfo(bankAccount: BankAccount, now = new Date()) {
  const refreshAccount = bankAccount.externalAccounts.find(ea => isExternalAccountDueForRefresh(ea, now))
  if (!refreshAccount) return null

  return {
    connectionExternalId: refreshAccount.connectionExternalId,
    source: refreshAccount.externalAccountSource,
    reconnectWithNewCredentials: refreshAccount.reconnectWithNewCredentials,
    updateType: refreshAccount.updateType,
    lastSyncedAt: refreshAccount.lastSyncedAt,
  }
}

export type BankAccountNeedingReconnection = {
  accountLabel: string
  lastSyncedAt: Date | null
  source: ExternalAccountConnection['externalAccountSource']
  connectionExternalId: string | null
  reconnectWithNewCredentials: boolean
}

/** The first account needing reconnection, for a single-account surface like AccountReconnectionBanner. */
export function getBankAccountNeedingReconnection(
  bankAccounts: ReadonlyArray<BankAccount> | undefined,
  now = new Date(),
): BankAccountNeedingReconnection | null {
  for (const bankAccount of bankAccounts ?? []) {
    const refreshInfo = getBankAccountRefreshConnectionInfo(bankAccount, now)
    if (refreshInfo) {
      return {
        accountLabel: formatBankAccountWithMask(bankAccount),
        lastSyncedAt: refreshInfo.lastSyncedAt ?? null,
        source: refreshInfo.source,
        connectionExternalId: refreshInfo.connectionExternalId ?? null,
        reconnectWithNewCredentials: refreshInfo.reconnectWithNewCredentials,
      }
    }
  }

  return null
}

function isExternalAccountReadyForRefresh(externalAccount: ExternalAccountConnection): boolean {
  return externalAccount.updateType === ExternalAccountUpdateType.UserPresentRequired
}

function isExternalAccountRefreshStale(externalAccount: ExternalAccountConnection, now: Date): boolean {
  return externalAccount.lastSyncedAt == null
    || now.getTime() - externalAccount.lastSyncedAt.getTime() > REFRESH_ALERT_MINIMUM_SYNC_AGE_MS
}

function isExternalAccountDueForRefresh(externalAccount: ExternalAccountConnection, now: Date): boolean {
  return isExternalAccountReadyForRefresh(externalAccount) && isExternalAccountRefreshStale(externalAccount, now)
}

export function formatBankAccountWithMask(bankAccount: BankAccount): string {
  const accountName = getBankAccountDisplayName(bankAccount)
  const mask = bankAccount.mask ?? bankAccount.externalAccounts[0]?.mask

  return mask ? `${accountName} (${mask})` : accountName
}

export function isAnyBankAccountSyncing(bankAccounts: ReadonlyArray<BankAccount>): boolean {
  return bankAccounts.some(isBankAccountSyncing)
}

export function getSyncingExternalAccountIds(bankAccounts: ReadonlyArray<BankAccount> | undefined): Set<string> {
  const ids = new Set<string>()

  for (const account of bankAccounts ?? []) {
    for (const external of account.externalAccounts) {
      if (external.isSyncing) ids.add(external.id)
    }
  }

  return ids
}

export function hasNewSyncingAccounts(
  prevAccounts: ReadonlyArray<BankAccount> | undefined,
  newAccounts: ReadonlyArray<BankAccount> | undefined,
): boolean {
  const prevIds = getSyncingExternalAccountIds(prevAccounts)
  const newIds = getSyncingExternalAccountIds(newAccounts)

  for (const id of newIds) {
    if (!prevIds.has(id)) return true
  }

  return false
}

export function isAllExternalAccountsUserCreatedCustom(bankAccount: BankAccount): boolean {
  return bankAccount.externalAccounts.length > 0
    && bankAccount.externalAccounts.every(ea => ea.externalAccountSource === 'CUSTOM' && ea.userCreated)
}
