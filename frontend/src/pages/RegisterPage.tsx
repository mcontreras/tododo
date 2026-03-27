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
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { t, locale, setLocale } = useI18n()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ token, user }) => { setAuth(token, user); navigate('/') },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl mb-4 shadow-lg shadow-blue-100 border border-gray-100">
            <img src="/logo.svg" alt="Tododo" className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tododo</h1>
          <p className="text-sm text-gray-500 mt-1">{t('sign_up_subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <Input label={t('name')} placeholder={t('name_placeholder')} error={errors.name?.message} {...register('name')} />
            <Input label={t('email')} type="email" placeholder={t('email_placeholder')} error={errors.email?.message} {...register('email')} />
            <Input label={t('password')} type="password" placeholder={t('password_hint')} error={errors.password?.message} {...register('password')} />
            {mutation.isError && (
              <p className="text-sm text-red-500 text-center">
                {(mutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed'}
              </p>
            )}
            <Button type="submit" variant="primary" className="w-full mt-2" loading={mutation.isPending}>
              {t('sign_up')}
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-gray-500">
            {t('have_account')}{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">{t('sign_in_link')}</Link>
          </p>
          <button
            onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Languages size={13} />
            <span className="uppercase font-medium">{locale}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
