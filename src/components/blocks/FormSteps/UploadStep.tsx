import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { type FormFileUploadFieldProps, type UploadedFile } from '@blocks/Form/FormFileUploadField'
import { withFieldGroup } from '@blocks/Form/useForm'

export type UploadStepValues = { files: UploadedFile[] }

type UploadStepProps = Pick<FormFileUploadFieldProps, 'accept' | 'multiple' | 'upload' | 'isDisabled'> & {
  /** The accessible name; shown only when there is no prompt. */
  label: string
  prompt?: string | null
}

const DEFAULT_VALUES: UploadStepValues = { files: [] }

const DEFAULT_PROPS: UploadStepProps = { label: '', accept: [], upload: () => Promise.resolve([]) }

export const UploadStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, label, prompt, accept, multiple, upload, isDisabled }) {
    return (
      <VStack gap='xs'>
        {prompt ? <P size='sm'>{prompt}</P> : null}
        <group.AppField name='files'>
          {field => (
            <field.FormFileUploadField
              label={prompt ?? label}
              showLabel={false}
              accept={accept}
              multiple={multiple}
              upload={upload}
              isDisabled={isDisabled}
            />
          )}
        </group.AppField>
      </VStack>
    )
  },
})
