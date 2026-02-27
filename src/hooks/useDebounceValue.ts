/**
 * Retourne la valeur après un délai (debounce). Utilisé pour recherche au typing.
 */
import { useEffect, useState } from 'react'

export function useDebounceValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])

  return debouncedValue
}
