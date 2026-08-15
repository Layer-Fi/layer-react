import './filterToken.scss'
import { Group } from 'react-aria-components';
import { X } from 'lucide-react';
import { type FormEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@ui/Button/Button';
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu';
import { Form, TextField } from '@ui/Form/Form';
import { Input } from '@ui/Input/Input';
import { InputGroup } from '@ui/Input/InputGroup';
import { Modal } from '@ui/Modal/Modal';
import { ModalActions, ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots';
import { Label } from '@ui/Typography/Text';
import { HStack } from '@ui/Stack/Stack';

type FilterTokenBaseProps = {
  field: string;
  operator: string;
  operatorOptions: {
    label: string;
    value: string;
  }[]
  value: string;
  onRemove: () => void;
  onOperatorChange: (operatorValue: string) => void;
  onValueChange: (newValue: string) => void;
}

export type FilterTokenProps = FilterTokenBaseProps & (
  | { valueType: 'string' }
  | {
    valueType: 'enum';
    valueOptions: {
      label: string;
      value: string;
    }[]
  }
)

export function FilterToken(props: FilterTokenProps) {
  const { field, operator, operatorOptions, onOperatorChange, onValueChange, value, onRemove } = props
  const { t } = useTranslation()

  const [isValueModalOpen, setIsValueModalOpen] = useState(false)
  const [draftValue, setDraftValue] = useState(value)

  const openValueModal = useCallback(() => {
    setDraftValue(value)
    setIsValueModalOpen(true)
  }, [value])

  const handleValueSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onValueChange(draftValue)
    setIsValueModalOpen(false)
  }, [draftValue, onValueChange])

  const operatorLabel = operatorOptions.find(operatorOption => operatorOption.value === operator)?.label ?? operator

  const valueLabel = props.valueType === 'enum'
    ? (props.valueOptions.find(valueOption => valueOption.value === value)?.label ?? value)
    : value

  const OperatorButton = useCallback(() => (
    <Button
      variant='ghost'
      aria-label={t('blocks:FilterToken.action.change_operator', 'Change {{field}} operator', { field })}
    >
      {operatorLabel}
    </Button>
  ), [field, operatorLabel, t])

  const ValueButton = useCallback(() => (
    <Button
      variant='ghost'
      onPress={props.valueType === 'string' ? openValueModal : undefined}
      aria-label={t('blocks:FilterToken.action.change_value', 'Change {{field}} value', { field })}
    >
      {valueLabel}
    </Button>
  ), [field, valueLabel, props.valueType, openValueModal, t])

  return (
    <Group className='Layer__FilterToken'>
      <div className='Layer__FilterToken__Content'>
        <div className='Layer__FilterToken__Content__Field'>
          {field}
        </div>
        <DropdownMenu ariaLabel={field} slots={{ Trigger: OperatorButton }} variant='compact'>
          <MenuList>
            {operatorOptions.map(operatorOption => (
              <MenuItem key={operatorOption.value} onClick={() => onOperatorChange(operatorOption.value)}>
                {operatorOption.label}
              </MenuItem>
            ))}
          </MenuList>
        </DropdownMenu>
        {props.valueType === 'enum'
          ? (
            <DropdownMenu ariaLabel={field} slots={{ Trigger: ValueButton }} variant='compact'>
              <MenuList>
                {props.valueOptions.map(valueOption => (
                  <MenuItem key={valueOption.value} onClick={() => onValueChange(valueOption.value)}>
                    {valueOption.label}
                  </MenuItem>
                ))}
              </MenuList>
            </DropdownMenu>
          )
          : <ValueButton />}
      </div>
      <Button
        variant="ghost"
        icon
        onPress={onRemove}
        aria-label={t('blocks:FilterToken.action.remove_filter', 'Remove {{field}} filter', { field })}
      >
        <X size={14} />
      </Button>
      {props.valueType === 'string' && (
        <Modal
          isOpen={isValueModalOpen}
          onOpenChange={setIsValueModalOpen}
          aria-label={t('blocks:FilterToken.title.change_value', 'Change {{field}} value', { field })}
        >
          <ModalTitleWithClose
            heading={<ModalHeading>{t('blocks:FilterToken.title.change_value', 'Change {{field}}', { field })}</ModalHeading>}
            onClose={() => setIsValueModalOpen(false)}
          />
          <Form onSubmit={handleValueSubmit}>
            <ModalContent>
              <TextField>
                <Label slot='label' size='sm' pbe='3xs'>{field}</Label>
                <InputGroup slot='input'>
                  <Input
                    value={draftValue}
                    onChange={e => setDraftValue(e.target.value)}
                    inset
                    autoFocus
                  />
                </InputGroup>
              </TextField>
            </ModalContent>
            <ModalActions>
              <HStack gap='md'>
                <Button variant='outlined' onPress={() => setIsValueModalOpen(false)}>
                  {t('common:action.cancel', 'Cancel')}
                </Button>
                <Button type='submit'>
                  {t('common:action.apply', 'Apply')}
                </Button>
              </HStack>
            </ModalActions>
          </Form>
        </Modal>
      )}
    </Group>
  )
}
