import { PointerSensor, TouchSensor } from '@dnd-kit/core'
import type { PointerEvent, TouchEvent } from 'react'

const isDragDisabledElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.closest('[data-dnd-handle]')) {
    return false
  }

  return Boolean(
    target.closest(
      `
        button,
        a,
        input,
        textarea,
        select,
        option,
        label,
        [contenteditable="true"],
        [data-no-dnd]
      `,
    ),
  )
}

export class CustomPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent }: PointerEvent) => {
        return !isDragDisabledElement(nativeEvent.target)
      },
    },
  ]
}

export class CustomTouchSensor extends TouchSensor {
  static activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: ({ nativeEvent }: TouchEvent) => {
        return !isDragDisabledElement(nativeEvent.target)
      },
    },
  ]
}
