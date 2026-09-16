import { Badge, BadgeSize } from '@ui/Badge/Badge'
import { type InvoiceStatusDisplay } from '@features/invoices/utils'

type InvoiceStatusBadgeProps = {
  status: InvoiceStatusDisplay
  inline?: boolean
}

export const InvoiceStatusBadge = ({ status: { variant, Icon }, inline = false }: InvoiceStatusBadgeProps) => {
  if (!Icon) return null

  return (
    <Badge
      variant={variant}
      size={inline ? BadgeSize.EXTRA_SMALL : BadgeSize.SMALL}
      icon={<Icon size={inline ? 10 : 12} />}
      iconOnly
    />
  )
}
