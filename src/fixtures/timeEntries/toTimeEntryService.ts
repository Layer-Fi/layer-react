import { type CatalogService } from '@schemas/catalogService'
import { type TimeEntryService } from '@schemas/timeTracking'

export const toTimeEntryService = (service: CatalogService): TimeEntryService => ({
  id: service.id,
  name: service.name,
  billableRatePerHourAmount: service.billableRatePerHourAmount,
})
