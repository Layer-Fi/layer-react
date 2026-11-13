import { describe, expect, it } from 'vitest'

import {
  getBankAccountNeedingReconnection,
  getBankAccountRefreshConnectionInfo,
  getBankAccountRefreshConnections,
  getBankAccountsReadyForRefresh,
  getDisconnectedBankAccountsSummary,
  isBankAccountReadyForRefresh,
} from '@utils/features/bankAccounts/refresh'

import {
  makeBankAccount,
  makeBankAccountWithMirroredExternalAccount,
} from '@fixtures/bankAccounts/mocks'
import { setupFakeSystemTime } from '@testUtils/dates/fakeSystemTime'
import { MS_PER_HOUR, NOW } from '@testUtils/dates/fixedDates'

setupFakeSystemTime(NOW)

describe('refresh', () => {
  it('treats user-present-required accounts as ready for refresh', () => {
    const updateType = 'USER_PRESENT_REQUIRED'
    const account = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000201',
      externalAccountId: '00000000-0000-4000-8000-000000000202',
      name: 'Chase Business Complete Checking',
      institution: 'Chase',
      mask: '4821',
      balance: 1284500,
      externalAccountOverrides: {
        connectionExternalId: 'plaid_connection_123',
        updateType,
      },
    })

    expect(isBankAccountReadyForRefresh(account)).toBe(true)
    expect(getBankAccountsReadyForRefresh([account])).toEqual([account])
    expect(getBankAccountRefreshConnectionInfo(account)).toEqual({
      connectionExternalId: 'plaid_connection_123',
      source: 'PLAID',
      reconnectWithNewCredentials: false,
      updateType,
      lastSyncedAt: null,
    })
  })

  it.each([null, 'BACKGROUND'] as const)('ignores accounts with %s update type', (updateType) => {
    const account = makeBankAccount({
      externalAccounts: [{
        ...makeBankAccount().externalAccounts[0]!,
        updateType,
      }],
    })

    expect(isBankAccountReadyForRefresh(account)).toBe(false)
    expect(getBankAccountsReadyForRefresh([account])).toEqual([])
    expect(getBankAccountRefreshConnections([account])).toEqual([])
    expect(getBankAccountRefreshConnectionInfo(account)).toBeNull()
  })

  it('groups only the accounts requiring user presence on each connection', () => {
    const chaseChecking = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000301',
      externalAccountId: '00000000-0000-4000-8000-000000000302',
      name: 'Chase Checking',
      institution: 'Chase',
      mask: '1234',
      balance: 100,
      externalAccountOverrides: {
        connectionExternalId: 'plaid_chase_1',
        updateType: 'USER_PRESENT_REQUIRED',
      },
    })
    const chaseSavings = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000303',
      externalAccountId: '00000000-0000-4000-8000-000000000304',
      name: 'Chase Savings',
      institution: 'Chase',
      mask: '5678',
      balance: 100,
      externalAccountOverrides: {
        connectionExternalId: 'plaid_chase_1',
      },
    })
    const rbcChecking = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000305',
      externalAccountId: '00000000-0000-4000-8000-000000000306',
      name: 'RBC Checking',
      institution: 'RBC',
      mask: '9876',
      balance: 100,
      externalAccountOverrides: {
        connectionExternalId: 'plaid_rbc_1',
        updateType: 'USER_PRESENT_REQUIRED',
      },
    })
    const chaseBusinessCard = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000307',
      externalAccountId: '00000000-0000-4000-8000-000000000308',
      name: 'Chase Business Card',
      institution: 'Chase',
      mask: '2468',
      balance: 100,
      externalAccountOverrides: {
        connectionExternalId: 'plaid_chase_2',
        updateType: 'USER_PRESENT_REQUIRED',
      },
    })

    expect(getBankAccountRefreshConnections([chaseChecking, chaseSavings, rbcChecking, chaseBusinessCard])).toEqual([
      {
        connectionExternalId: 'plaid_chase_1',
        source: 'PLAID',
        reconnectWithNewCredentials: false,
        institutionName: 'Chase',
        accounts: [{ accountName: 'Chase Checking', mask: '1234' }],
        needsRepair: false,
      },
      {
        connectionExternalId: 'plaid_rbc_1',
        source: 'PLAID',
        reconnectWithNewCredentials: false,
        institutionName: 'RBC',
        accounts: [{ accountName: 'RBC Checking', mask: '9876' }],
        needsRepair: false,
      },
      {
        connectionExternalId: 'plaid_chase_2',
        source: 'PLAID',
        reconnectWithNewCredentials: false,
        institutionName: 'Chase',
        accounts: [{ accountName: 'Chase Business Card', mask: '2468' }],
        needsRepair: false,
      },
    ])
  })

  it('excludes recently synced connections from the refresh alert', () => {
    const account = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000401',
      externalAccountId: '00000000-0000-4000-8000-000000000402',
      name: 'Chase Checking',
      institution: 'Chase',
      mask: '1234',
      balance: 100,
      externalAccountOverrides: {
        connectionExternalId: 'plaid_chase_1',
        lastSyncedAt: new Date(NOW.getTime() - 23 * MS_PER_HOUR),
        updateType: 'USER_PRESENT_REQUIRED',
      },
    })

    expect(getBankAccountRefreshConnections([account], NOW)).toEqual([])
  })

  it('includes Plaid connections needing repair regardless of sync age', () => {
    const brokenChecking = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000601',
      externalAccountId: '00000000-0000-4000-8000-000000000602',
      name: 'Chase Checking',
      institution: 'Chase',
      mask: '1234',
      balance: 100,
      externalAccountOverrides: {
        connectionExternalId: 'plaid_chase_1',
        updateType: 'BACKGROUND',
        lastSyncedAt: NOW,
        connectionNeedsRepairAsOf: NOW,
      },
    })
    const brokenSavings = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000603',
      externalAccountId: '00000000-0000-4000-8000-000000000604',
      name: 'Chase Savings',
      institution: 'Chase',
      mask: '5678',
      balance: 100,
      externalAccountOverrides: {
        connectionExternalId: 'plaid_chase_1',
        updateType: 'USER_PRESENT_REQUIRED',
        connectionNeedsRepairAsOf: NOW,
      },
    })
    const brokenCustom = makeBankAccount({
      id: '00000000-0000-4000-8000-000000000605',
      externalAccounts: [{
        ...makeBankAccount().externalAccounts[0]!,
        externalAccountSource: 'CUSTOM',
        connectionExternalId: 'custom',
        connectionNeedsRepairAsOf: NOW,
      }],
    })
    const brokenWithoutConnection = makeBankAccount({
      id: '00000000-0000-4000-8000-000000000606',
      externalAccounts: [{
        ...makeBankAccount().externalAccounts[0]!,
        connectionExternalId: null,
        connectionNeedsRepairAsOf: NOW,
      }],
    })

    expect(getBankAccountRefreshConnections([brokenChecking, brokenSavings, brokenCustom, brokenWithoutConnection])).toEqual([
      {
        connectionExternalId: 'plaid_chase_1',
        source: 'PLAID',
        reconnectWithNewCredentials: false,
        institutionName: 'Chase',
        accounts: [
          { accountName: 'Chase Checking', mask: '1234' },
          { accountName: 'Chase Savings', mask: '5678' },
        ],
        needsRepair: true,
      },
    ])
    expect(getBankAccountNeedingReconnection([brokenChecking])).toBeNull()
  })

  it('finds the first account needing reconnection, for a single-account surface', () => {
    const healthyAccount = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000501',
      externalAccountId: '00000000-0000-4000-8000-000000000502',
      name: 'Wealthsimple',
      institution: 'Wealthsimple',
      mask: '7890',
      balance: 100,
    })
    const staleAccount = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000503',
      externalAccountId: '00000000-0000-4000-8000-000000000504',
      name: 'RBC Checking',
      institution: 'RBC',
      mask: '4048',
      balance: 100,
      externalAccountOverrides: {
        connectionExternalId: 'plaid_rbc_4048',
        lastSyncedAt: new Date(NOW.getTime() - 3 * 24 * MS_PER_HOUR),
        updateType: 'USER_PRESENT_REQUIRED',
      },
    })

    expect(getBankAccountNeedingReconnection([healthyAccount, staleAccount], NOW)).toEqual({
      account: { accountName: 'RBC Checking', mask: '4048' },
      lastSyncedAt: new Date(NOW.getTime() - 3 * 24 * MS_PER_HOUR),
      source: 'PLAID',
      connectionExternalId: 'plaid_rbc_4048',
      reconnectWithNewCredentials: false,
    })
  })

  it('returns null when no account needs reconnection', () => {
    const healthyAccount = makeBankAccountWithMirroredExternalAccount({
      id: '00000000-0000-4000-8000-000000000505',
      externalAccountId: '00000000-0000-4000-8000-000000000506',
      name: 'Wealthsimple',
      institution: 'Wealthsimple',
      mask: '7890',
      balance: 100,
    })

    expect(getBankAccountNeedingReconnection([healthyAccount], NOW)).toBeNull()
  })

  it('summarizes disconnected background accounts by bank', () => {
    const makeBroken = (index: number, institution: string, overrides = {}) => makeBankAccountWithMirroredExternalAccount({
      id: `00000000-0000-4000-8000-00000000070${index}`,
      externalAccountId: `00000000-0000-4000-8000-00000000080${index}`,
      name: `${institution} Checking`,
      institution,
      mask: `000${index}`,
      balance: 100,
      externalAccountOverrides: {
        connectionExternalId: `plaid_${institution}`,
        updateType: 'BACKGROUND',
        connectionNeedsRepairAsOf: NOW,
        ...overrides,
      },
    })
    const chase = makeBroken(1, 'Chase')
    const rbc = makeBroken(2, 'RBC')
    const userPresentRequired = makeBroken(3, 'Wells Fargo', { updateType: 'USER_PRESENT_REQUIRED' })
    const awaitingConfirmation = makeBroken(4, 'Capital One', { notifications: [{ type: 'CONFIRM_UNIQUE' }] })

    expect(getDisconnectedBankAccountsSummary([userPresentRequired, awaitingConfirmation])).toBeNull()
    expect(getDisconnectedBankAccountsSummary([chase, userPresentRequired])).toEqual({
      count: 1,
      bankCount: 1,
      institutionName: 'Chase',
      soleAccount: { accountName: 'Chase Checking', mask: '0001' },
    })
    expect(getDisconnectedBankAccountsSummary([chase, rbc, awaitingConfirmation])).toEqual({
      count: 2,
      bankCount: 2,
      institutionName: null,
      soleAccount: null,
    })
  })
})
