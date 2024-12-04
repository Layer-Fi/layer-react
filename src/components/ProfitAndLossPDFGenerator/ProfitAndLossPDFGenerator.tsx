import React, { ChangeEvent, useEffect, useState } from 'react'
import { Month, ProfitAndLoss } from '../../types'
import { MONTH_NAMES, generatePDF } from './util'
import { useLayerContext } from '../../contexts/LayerContext'
import { Layer } from '../../api/layer'
import { useAuth } from '../../hooks/useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import Form from './components/Form'
import PDF from './components/PDF'

export type PDFGenerationFormData = {
  year: string | null;
  month: Month | null;
  businessId: string | null;
  showPreviousMonth: boolean;

  // TODO: I'm not sure why we have two of these instead of
  // a single value
  structure1: string | null;
  structure2: string | null;
}

const ProfitAndLossPDFGenerator = () => {
  const DEFAULT_STRUCTURE = 'DEFAULT'
  const { businessId, business } = useLayerContext()
  const [formData, setFormData] = useState<PDFGenerationFormData>({
    year: null,
    month: null,
    businessId,
    showPreviousMonth: true,
    structure1: DEFAULT_STRUCTURE,
    structure2: DEFAULT_STRUCTURE,
  })
  const [showPreview, setShowPreview] = useState(false)


  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setShowPreview(false)
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  useEffect(() => {
    if (business && formData.businessId !== business.id) {
      setFormData({
        ...formData,
        businessId: business.id,
        structure1: business?.industry || DEFAULT_STRUCTURE,
        structure2: business?.industry || DEFAULT_STRUCTURE,
      })
    }
  }, [business, formData])

  const isButtonDisabled =
    !formData.year || !formData.month || !formData.businessId

  const [selectedMonthData, setSelectedMonthData] =
    useState<ProfitAndLoss | null>(null)
  const [selectedMonthDataPc, setSelectedMonthDataPc] =
    useState<ProfitAndLoss | null>(null)
  const [selectedMonthDataMso, setSelectedMonthDataMso] =
    useState<ProfitAndLoss | null>(null)
  const [priorMonthData, setPriorMonthData] = useState<ProfitAndLoss | null>(
    null
  )
  const [showPreviousMonth, setShowPreviousMonth] = useState<boolean>(true)
  const [priorMonthDataPc, setPriorMonthDataPc] =
    useState<ProfitAndLoss | null>(null)
  const [priorMonthDataMso, setPriorMonthDataMso] =
    useState<ProfitAndLoss | null>(null)
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()

  const fetchPNLData = async (
    props: {
      month: string;
      year: string;
      businessId: string;
      structure?: string;
    },
    tagFilter?: { key: string; value: string }
  ) => {
    const res = await Layer.getProfitAndLoss(apiUrl, auth?.access_token, {
      params: {
        month: props.month,
        year: props.year,
        businessId: props.businessId,
        structure: props.structure,
        tagKey: tagFilter?.key,
        tagValues: tagFilter?.value,
      },
    })()
    return res
  }

  const priorMonth = formData.month
    ? Number(formData.month) === 1 // wraparound to december
      ? (12 as Month)
      : ((Number(formData.month) - 1) as Month)
    : 1

  useEffect(() => {
    if ([
      selectedMonthData, selectedMonthDataMso, selectedMonthDataPc,
      priorMonthData, priorMonthDataMso, priorMonthDataPc
    ].every(item => !!item)) {
      setShowPreview(true)
    }
  }, [
      selectedMonthData, selectedMonthDataMso, selectedMonthDataPc,
      priorMonthData, priorMonthDataMso, priorMonthDataPc
  ])

  const fetchData = async () => {
    setShowPreview(false)

    fetchPNLData(
      {
        businessId: formData.businessId || '',
        year: formData.year || '',
        month: formData.month ? String(formData.month) : '',
        structure: formData.structure1 || undefined,
      },
    ).then(({data}) => data && setSelectedMonthData(data))

    fetchPNLData(
      {
        businessId: formData.businessId || '',
        year: formData.year || '',
        month: formData.month ? String(formData.month) : '',
        structure: formData.structure2 || undefined,
      },
      { key: 'entity', value: 'pc' }
    ).then(({data}) => data && setSelectedMonthDataPc(data))

    fetchPNLData(
      {
        businessId: formData.businessId || '',
        year: formData.year || '',
        month: formData.month ? String(formData.month) : '',
        structure: formData.structure2 || undefined,
      },
      { key: 'entity', value: 'mso' }
    ).then(({data}) => data && setSelectedMonthDataMso(data))

    fetchPNLData({
      businessId: formData.businessId || '',
      year: formData.year || '',
      month: String(priorMonth),
      structure: formData.structure1 || undefined,
    })
      .then(({data}) => data && setPriorMonthData(data))

    fetchPNLData(
      {
        businessId: formData.businessId || '',
        year: formData.year || '',
        month: String(priorMonth),
        structure: formData.structure2 || undefined,
      },
      { key: 'entity', value: 'pc' }
    )
      .then(({data}) => data && setPriorMonthDataPc(data))

    fetchPNLData(
      {
        businessId: formData.businessId || '',
        year: formData.year || '',
        month: String(priorMonth),
        structure: formData.structure2 || undefined,
      },
      { key: 'entity', value: 'mso' }
    )
      .then(({data }) => data && setPriorMonthDataMso(data))
  }
  return (<main className={'Layer__component'}>
    <Form
      handleChange={handleChange}
      fetchData={fetchData}
      showPreviousMonth={showPreviousMonth}
      setShowPreviousMonth={setShowPreviousMonth}
      showPreview={showPreview}
      setShowPreview={setShowPreview}
      formData={formData}
      isButtonDisabled={isButtonDisabled}
    />
    <div className='Layer__pdf-pages-separator'/>
    {showPreview && (
      <button
        className='Layer__pdf-form-button'
        onClick={async () => {
          const page1 = document.getElementById('pdf-page-1')
          const page2 = document.getElementById('pdf-page-2')
          generatePDF(
            [page1!, page2!],
            business?.legal_name || '',
            formData.month ? MONTH_NAMES[formData.month] : '',
            formData.year || ''
          )
        }}
      >
        Download PDF
      </button>
    )}
    <div className='Layer__pdf-pages-separator' />
    {showPreview && (
      <PDF
        priorMonth={priorMonth}
        business={business}
        formData={formData}
        selectedMonthData={selectedMonthData}
        selectedMonthDataMso={selectedMonthDataMso}
        selectedMonthDataPc={selectedMonthDataPc}
        priorMonthData={priorMonthData}
        priorMonthDataMso={priorMonthDataMso}
        priorMonthDataPc={priorMonthDataPc}
        showPreviousMonth={showPreviousMonth}
      />
    )}
  </main>)
}

export { ProfitAndLossPDFGenerator }
