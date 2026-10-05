import { useCallback, useEffect, useState } from 'react'
import type { SettingSection } from '@/types'
import { settingsService, DEFAULTS } from '@/services/settingsService'

export function useSetting<T>(section: SettingSection, fallback: T) {
  const [enabled, setEnabled] = useState(false)
  const [config, setConfig] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const setting = await settingsService.get(section)
    setEnabled(setting?.enabled ?? false)
    setConfig({ ...fallback, ...(setting?.config as Partial<T> ?? {}) })
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  useEffect(() => { load() }, [load])

  return { enabled, setEnabled, config, setConfig, loading, reload: load }
}

export { DEFAULTS }