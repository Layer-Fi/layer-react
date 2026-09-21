import type { BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { type ExternalAccountConnection, ExternalAccountUpdateType } from '@schemas/features/bankAccounts/externalAccountConnection'
import {
  type BankAccountLabelParts,
  getBankAccountInstitution,
  getBankAccountLabelParts,
} from '@utils/features/bankAccounts/bankAccount'

const REFRESH_ALERT_MINIMUM_SYNC_AGE_MS = 24 * 60 * 60 * 1000

export type RefreshConnectionIdentity = {
  connectionExternalId: string
  source: ExternalAccountConnection['externalAccountSource']
  reconnectWithNewCredentials: boolean
}

export type BankAccountRefreshConnection = RefreshConnectionIdentity & {
  institutionName: string | null
  accounts: BankAccountLabelParts[]
}

export type BankAccountNeedingReconnection = RefreshConnectionIdentity & {
  account: BankAccountLabelParts
  lastSyncedAt: Date | null
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

function getRefreshConnectionIdentity(externalAccount: RepairableExternalAccount): RefreshConnectionIdentity {
  return {
    connectionExternalId: externalAccount.connectionExternalId,
    source: externalAccount.externalAccountSource,
    reconnectWithNewCredentials: externalAccount.reconnectWithNewCredentials ?? false,
  }
}

export function getRefreshConnectionKey({ source, connectionExternalId }: RefreshConnectionIdentity): string {
  return JSON.stringify([source, connectionExternalId])
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
  const groups = new Map<string, { identity: RefreshConnectionIdentity, members: RefreshableAccount[] }>()

  for (const refreshable of getRefreshableAccounts(bankAccounts, now)) {
    const identity = getRefreshConnectionIdentity(refreshable.externalAccount)
    const key = getRefreshConnectionKey(identity)
    const group = groups.get(key) ?? { identity, members: [] }

    group.members.push(refreshable)
    groups.set(key, group)
  }

  return [...groups.values()].map(({ identity, members }) => {
    const institutionNames = new Set(members.flatMap(member => getRefreshInstitutionName(member) ?? []))
    const accounts = new Map(members.map(({ bankAccount }) => [bankAccount.id, getBankAccountLabelParts(bankAccount)]))

    return {
      ...identity,
      reconnectWithNewCredentials: members.some(({ externalAccount }) => externalAccount.reconnectWithNewCredentials ?? false),
      institutionName: institutionNames.size === 1 ? [...institutionNames][0] ?? null : null,
      accounts: [...accounts.values()],
    }
  })
}

export function getBankAccountRefreshConnectionInfo(bankAccount: BankAccount, now = new Date()) {
  const refreshAccount = bankAccount.externalAccounts.find(ea => isExternalAccountDueForRefresh(ea, now))
  if (!refreshAccount) return null

  return {
    ...getRefreshConnectionIdentity(refreshAccount),
    updateType: refreshAccount.updateType,
    lastSyncedAt: refreshAccount.lastSyncedAt,
  }
}

export function getBankAccountNeedingReconnection(
  bankAccounts: ReadonlyArray<BankAccount> | undefined,
  now = new Date(),
): BankAccountNeedingReconnection | null {
  const [refreshable] = getRefreshableAccounts(bankAccounts, now)
  if (!refreshable) return null

  const { bankAccount, externalAccount } = refreshable

  return {
    ...getRefreshConnectionIdentity(externalAccount),
    account: getBankAccountLabelParts(bankAccount),
    lastSyncedAt: externalAccount.lastSyncedAt ?? null,
  }
}
