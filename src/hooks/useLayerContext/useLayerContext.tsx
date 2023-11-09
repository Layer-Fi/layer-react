import { useContext } from 'react'
import { LayerContext } from '../../contexts/LayerContext'

export const useLayerContext = () => useContext(LayerContext)
