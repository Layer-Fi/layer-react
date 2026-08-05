import { type CatalogService } from '@schemas/features/timeTracking/catalogService'
import { type TimeEntryService } from '@schemas/features/timeTracking/timeEntryService'

export const toTimeEntryService = (service: CatalogService): TimeEntryService => ({
  id: service.id,
  name: service.name,
  billableRatePerHourAmount: service.billableRatePerHourAmount,
})
