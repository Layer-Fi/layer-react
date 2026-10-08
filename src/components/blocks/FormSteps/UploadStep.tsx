import { type FormFileUploadFieldProps, type UploadedFile } from '@blocks/Form/FormFileUploadField'
import { withFieldGroup } from '@blocks/Form/useForm'
import { FormStepShell } from '@blocks/FormSteps/FormStepShell'

export type UploadStepValues = { files: UploadedFile[] }

type UploadStepProps = Pick<FormFileUploadFieldProps, 'accept' | 'multiple' | 'maxFiles' | 'upload' | 'isDisabled'> & {
  /** The accessible name; shown only when there is no prompt. */
  label: string
  prompt?: string | null
}

const DEFAULT_VALUES: UploadStepValues = { files: [] }

const DEFAULT_PROPS: UploadStepProps = { label: '', accept: [], upload: () => Promise.resolve([]) }

export const UploadStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, label, prompt, accept, multiple, maxFiles, upload, isDisabled }) {
    return (
      <FormStepShell prompt={prompt}>
        <group.AppField name='files'>
          {field => (
            <field.FormFileUploadField
              label={prompt ?? label}
              showLabel={false}
              accept={accept}
              multiple={multiple}
              maxFiles={maxFiles}
              upload={upload}
              isDisabled={isDisabled}
            />
          )}
        </group.AppField>
      </FormStepShell>
    )
  },
})
