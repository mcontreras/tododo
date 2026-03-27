import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Locale, translations, TranslationKey } from '../i18n/translations'

interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      t: (key) => translations[get().locale][key] ?? translations.en[key] ?? key,
    }),
    { name: 'tododo-locale', partialize: (s) => ({ locale: s.locale }) }
  )
)
