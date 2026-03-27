import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Languages } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useI18n } from '../store/i18nStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { t, locale, setLocale } = useI18n()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, user }) => { setAuth(token, user); navigate('/') },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-surface dark:via-dark-surface dark:to-dark-secondary flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-dark-secondary rounded-2xl mb-4 shadow-lg shadow-blue-100 dark:shadow-none border border-gray-100 dark:border-dark-border">
            <img src="/logo.png" alt="Tododo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tododo</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('sign_in_subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 transition-colors">
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <Input label={t('email')} type="email" placeholder={t('email_placeholder')} error={errors.email?.message} {...register('email')} />
            <Input label={t('password')} type="password" placeholder={t('password_placeholder')} error={errors.password?.message} {...register('password')} />
            {mutation.isError && <p className="text-sm text-red-500 text-center">{t('invalid_credentials')}</p>}
            <Button type="submit" variant="primary" className="w-full mt-2" loading={mutation.isPending}>
              {t('sign_in')}
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('no_account')}{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium">{t('create_one')}</Link>
          </p>
          <button
            onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Languages size={13} />
            <span className="uppercase font-medium">{locale}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
