import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'

export type MockBill = {
  id: string
  vendorName: string
  billNumber: string
  dueAt: Date
  outstandingBalanceCents: number
}

// Due dates straddle the pinned clock (Dec 31 of FIXTURE_YEAR) so every AP aging bucket is populated.
export const bills = {
  initechHosting: {
    id: '0000000f-0000-4000-8000-000000000001',
    vendorName: 'Initech',
    billNumber: 'BILL-1001',
    dueAt: new Date(FIXTURE_YEAR, 8, 15),
    outstandingBalanceCents: 412_500,
  },
  initechSupport: {
    id: '0000000f-0000-4000-8000-000000000002',
    vendorName: 'Initech',
    billNumber: 'BILL-1002',
    dueAt: new Date(FIXTURE_YEAR, 11, 10),
    outstandingBalanceCents: 187_000,
  },
  soylentIngredients: {
    id: '0000000f-0000-4000-8000-000000000003',
    vendorName: 'Soylent Corp',
    billNumber: 'BILL-1003',
    dueAt: new Date(FIXTURE_YEAR, 9, 20),
    outstandingBalanceCents: 964_100,
  },
  soylentFreight: {
    id: '0000000f-0000-4000-8000-000000000004',
    vendorName: 'Soylent Corp',
    billNumber: 'BILL-1004',
    dueAt: new Date(FIXTURE_YEAR + 1, 0, 18),
    outstandingBalanceCents: 233_800,
  },
  vandelayImports: {
    id: '0000000f-0000-4000-8000-000000000005',
    vendorName: 'Vandelay Industries',
    billNumber: 'BILL-1005',
    dueAt: new Date(FIXTURE_YEAR, 10, 20),
    outstandingBalanceCents: 541_250,
  },
  vandelayStorage: {
    id: '0000000f-0000-4000-8000-000000000006',
    vendorName: 'Vandelay Industries',
    billNumber: 'BILL-1006',
    dueAt: new Date(FIXTURE_YEAR + 1, 1, 5),
    outstandingBalanceCents: 76_400,
  },
  janeDoeConsulting: {
    id: '0000000f-0000-4000-8000-000000000007',
    vendorName: 'Jane Doe',
    billNumber: 'BILL-1007',
    dueAt: new Date(FIXTURE_YEAR, 11, 22),
    outstandingBalanceCents: 150_000,
  },
  janeDoeRetainer: {
    id: '0000000f-0000-4000-8000-000000000008',
    vendorName: 'Jane Doe',
    billNumber: 'BILL-1008',
    dueAt: new Date(FIXTURE_YEAR, 10, 2),
    outstandingBalanceCents: 98_600,
  },
} as const satisfies Record<string, MockBill>

export const allBills: readonly MockBill[] = Object.values(bills)
