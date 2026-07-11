import { useState, type FocusEvent } from 'react'

export type InlineEditSubmitResult = { success: true } | { success: false; error?: string }

interface UseInlineEditParams {
  value: string
  onSubmit: (value: string) => Promise<InlineEditSubmitResult>
}

export const useInlineEdit = ({ value: currentValue, onSubmit }: UseInlineEditParams) => {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(currentValue)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const cancel = () => {
    setValue(currentValue)
    setError(null)
    setIsEditing(false)
  }

  const open = () => {
    setValue(currentValue)
    setError(null)
    setIsEditing(true)
  }

  const changeValue = (nextValue: string) => {
    setValue(nextValue)
    setError(null)
  }

  const submit = async () => {
    if (isSaving) return

    setIsSaving(true)

    try {
      const result = await onSubmit(value)

      if (result.success) {
        setError(null)
        setIsEditing(false)
        return
      }

      setError(result.error ?? null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextFocusedElement = event.relatedTarget

    if (nextFocusedElement instanceof Node && event.currentTarget.contains(nextFocusedElement)) {
      return
    }

    cancel()
  }

  return {
    isEditing,
    value,
    error,
    isSaving,
    open,
    cancel,
    setValue: changeValue,
    submit,
    handleBlur,
  }
}
