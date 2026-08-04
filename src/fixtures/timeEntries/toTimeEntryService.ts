import { type CatalogService } from '@schemas/timeTracking/catalogService'
import { type TimeEntryService } from '@schemas/timeTracking/timeTracking'

export const toTimeEntryService = (service: CatalogService): TimeEntryService => ({
  id: service.id,
  name: service.name,
  billableRatePerHourAmount: service.billableRatePerHourAmount,
})
