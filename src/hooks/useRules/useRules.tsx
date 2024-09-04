import useSWR from "swr"

import { useLayerContext } from "../../contexts/LayerContext"
import { useState } from "react"
import { Layer } from "../../api/layer"
import { Rules } from "../../types/rules"

type UseRules = () => {
    data?: Rules
    isLoading?: boolean
    error?: unknown
    refetch: () => void
    selectedRuleId?: string
    setSelectedRuleId: (id?: string) => void
    addRule: () => void
}

export const useRules: UseRules = () => {
    const {
      auth,
      businessId,
      apiUrl,
    } = useLayerContext()  
    
    const [apiError, setApiError] = useState<string | undefined>(undefined)
    const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>()
    const addRule = () => {
      setSelectedRuleId('new')
    }
  
    const queryKey =
      businessId && auth?.access_token && `rules-${businessId}`
  
    const { data, isLoading, error, mutate } = useSWR(
      queryKey,
      Layer.getRules(apiUrl, auth?.access_token, {
        params: { businessId },
      }),
    )

    const refetch = () => mutate()  

    return {
        data: data?.data,
        isLoading,
        error,
        refetch,        
        apiError,
        selectedRuleId,
        setSelectedRuleId,
        addRule
      }
}
