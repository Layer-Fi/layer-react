import { Button } from '@ui/Button/Button';
import { FilterToken, FilterTokenProps } from './FilterToken/FilterToken'
import './tableControls.scss'
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

export type TableControlsProps = {
  filterTokens: {
    id: string;
    props: FilterTokenProps;
  }[];
  onAddFilter: () => void;
  onClear: () => void;
}

export function TableControls({filterTokens, onAddFilter, onClear}: TableControlsProps) {
  const { t } = useTranslation()

  return (
    <div className='Layer__TableControls'>
      <div className='Layer__TableControls__FilterTokens'>
        {filterTokens.map((filterToken) => (
          <FilterToken
            key={filterToken.id}
            {...filterToken.props}
          />
        ))}
        <Button
          icon
          variant='ghost'
          onPress={onAddFilter}
          aria-label={t('blocks:FilterToken.action.remove_filter', 'Clear all filters')}
        >
          <Plus size={14} />
        </Button>
      </div>
      <Button
        variant='outlined'
        onPress={onClear}
        aria-label={t('blocks:FilterToken.action.remove_filter', 'Clear all filters')}
      >
        {t('blocks:FilterControls.action.clear', 'Clear')}
      </Button>
    </div>
  )
}
