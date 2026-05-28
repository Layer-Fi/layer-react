import type { TFunction } from 'i18next'
import { ArrowRight, HandCoins, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Awaitable } from '@internal-types/utility/promises'
import { InvoiceStatus } from '@schemas/invoices/invoice'
import { translationKey } from '@utils/i18n/translationKey'
import { UpsertInvoiceMode } from '@hooks/api/businesses/[business-id]/invoices/useUpsertInvoice'
import { type InvoiceDetailRouteState, InvoiceDetailStep, useInvoiceDetail, useInvoiceNavigation } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { InvoiceDetailHeaderMenu } from '@components/Invoices/InvoiceDetail/InvoiceDetailHeaderMenu'
import type { InvoiceFormState } from '@components/Invoices/InvoiceForm/formUtils'
import { InvoicePdfDownloadButton } from '@components/Invoices/InvoicePreview/InvoicePdfDownloadButton'

import './invoiceDetailHeader.scss'

enum HeaderMode {
  View = 'View',
  Edit = 'Edit',
  Preview = 'Preview',
}

const getHeaderMode = (viewState: InvoiceDetailRouteState): HeaderMode => {
  if (viewState.step === InvoiceDetailStep.Preview) {
    return HeaderMode.Preview
  }
  if (viewState.isReadOnly) {
    return HeaderMode.View
  }
  return HeaderMode.Edit
}

const HEADING_I18N: Record<HeaderMode, { withNumber: ReturnType<typeof translationKey>, noNumber: ReturnType<typeof translationKey> }> = {
  [HeaderMode.Preview]: {
    withNumber: translationKey('invoices:label.invoice_number', 'Invoice #{{invoiceNumber}}'),
    noNumber: translationKey('invoices:action.view_invoice', 'View Invoice'),
  },
  [HeaderMode.View]: {
    withNumber: translationKey('invoices:label.invoice_number', 'Invoice #{{invoiceNumber}}'),
    noNumber: translationKey('invoices:action.view_invoice', 'View Invoice'),
  },
  [HeaderMode.Edit]: {
    withNumber: translationKey('invoices:label.editing_invoice_number', 'Editing Invoice #{{invoiceNumber}}'),
    noNumber: translationKey('invoices:label.editing_invoice', 'Editing Invoice'),
  },
}

const getHeadingContent = (headerMode: HeaderMode, invoiceNumber: string | null, t: TFunction) => {
  const { i18nKey, defaultValue } = invoiceNumber
    ? HEADING_I18N[headerMode].withNumber
    : HEADING_I18N[headerMode].noNumber
  return t(i18nKey, defaultValue, invoiceNumber ? { invoiceNumber } : {})
}

export type InvoiceDetailHeaderProps = {
  onSubmitInvoiceForm: () => Awaitable<void>
  formState: InvoiceFormState
  openInvoicePaymentDrawer: () => void
}

export const InvoiceDetailHeader = ({
  onSubmitInvoiceForm,
  formState,
  openInvoicePaymentDrawer,
}: InvoiceDetailHeaderProps) => {
  const { t } = useTranslation()
  const { accountingConfiguration } = useLayerContext()
  const viewState = useInvoiceDetail()
  const { toEditInvoice } = useInvoiceNavigation()
  const enablePaymentMethodsOnFinalize = !!accountingConfiguration?.enableStripeOnboarding

  const buttonContent = enablePaymentMethodsOnFinalize
    ? (
      {
        label: t('common:label.next', 'Next'),
        icon: <ArrowRight size={14} />,
      }
    )
    : (
      {
        label: t('common:action.save_label', 'Save'),
        icon: <Save size={14} />,
      }
    )

  const formStepButton = (
    <Button isDisabled={formState.isSubmitting} onPress={() => { void onSubmitInvoiceForm() }}>
      {buttonContent.label}
      {buttonContent.icon}
    </Button>
  )

  if (viewState.mode === UpsertInvoiceMode.Create) {
    return (
      <HStack justify='space-between' align='center' fluid pie='md'>
        <Heading>{t('invoices:action.create_invoice', 'Create Invoice')}</Heading>
        {formStepButton}
      </HStack>
    )
  }

  const headerMode = getHeaderMode(viewState)
  const headingContent = getHeadingContent(headerMode, viewState.invoice.invoiceNumber, t)

  const canMarkAsPaid = viewState.invoice.status === InvoiceStatus.Sent
    || viewState.invoice.status === InvoiceStatus.PartiallyPaid

  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading className='Layer__InvoiceDetail__Heading' ellipsis>{headingContent}</Heading>
      {headerMode === HeaderMode.Edit && formStepButton}
      {headerMode === HeaderMode.Preview && (
        <InvoicePdfDownloadButton invoiceId={viewState.invoice.id} />
      )}
      {headerMode === HeaderMode.View && (
        <HStack gap='xs'>
          {canMarkAsPaid && (
            <Button onPress={openInvoicePaymentDrawer}>
              {t('invoices:action.mark_paid', 'Mark as paid')}
              <HandCoins size={14} />
            </Button>
          )}
          <InvoiceDetailHeaderMenu onEditInvoice={() => toEditInvoice(viewState.invoice)} />
        </HStack>
      )}
    </HStack>
  )
}
