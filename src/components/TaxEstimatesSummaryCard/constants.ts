import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'
import { DEFAULT_CHART_COLORS } from '@utils/chartColors'

export const resolveCategoryColor = ({ key }: Pick<TaxOverviewCategory, 'key'>) => ({ federal: DEFAULT_CHART_COLORS[0], state: DEFAULT_CHART_COLORS[1] }[key] ?? DEFAULT_CHART_COLORS[0])
