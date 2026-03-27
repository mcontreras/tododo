import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, User, Lock, Trash2, AlertTriangle, Check, Sun, Moon, Monitor } from 'lucide-react'
import { usersApi } from '../api/users'
import { useAuthStore } from '../store/authStore'
import { useI18n } from '../store/i18nStore'
import { useThemeStore, applyTheme, ThemeMode } from '../store/themeStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { cn } from '../components/ui/cn'

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

const profileSchema = z.object({ name: z.string().min(2, 'Minimum 2 characters') })
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
})
const deleteSchema = z.object({ password: z.string().min(1, 'Required') })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type DeleteForm  = z.infer<typeof deleteSchema>

function Section({ title, icon: Icon, children, danger }: {
  title: string; icon: React.ElementType; children: React.ReactNode; danger?: boolean
}) {
  return (
    <div className={cn('rounded-2xl border overflow-hidden', danger ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-dark-border')}>
      <div className={cn('flex items-center gap-2.5 px-6 py-4 border-b', danger
        ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40'
        : 'bg-gray-50 dark:bg-dark-tertiary border-gray-100 dark:border-dark-border')}>
        <Icon size={16} className={danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} />
        <h2 className={cn('text-sm font-semibold', danger ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-200')}>{title}</h2>
      </div>
      <div className="px-6 py-5 bg-white dark:bg-dark-secondary transition-colors">{children}</div>
    </div>
  )
}

const THEMES: { mode: ThemeMode; Icon: React.ElementType; labelKey: string }[] = [
  { mode: 'light',  Icon: Sun,     labelKey: 'theme_light' },
  { mode: 'dark',   Icon: Moon,    labelKey: 'theme_dark' },
  { mode: 'system', Icon: Monitor, labelKey: 'theme_system' },
]

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, setAuth, logout } = useAuthStore()
  const { t } = useI18n()
  const { mode, setMode } = useThemeStore()
  const qc = useQueryClient()
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const profileForm  = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || '' } })
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })
  const deleteForm   = useForm<DeleteForm>({ resolver: zodResolver(deleteSchema) })

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) => usersApi.updateMe(data),
    onSuccess: (updated) => {
      if (user) setAuth(useAuthStore.getState().token!, updated)
      qc.invalidateQueries({ queryKey: ['me'] })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    },
  })

  const changePassword = useMutation({
    mutationFn: (data: PasswordForm) => usersApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => { passwordForm.reset(); setPasswordSaved(true); setTimeout(() => setPasswordSaved(false), 2500) },
  })

  const deleteAccount = useMutation({
    mutationFn: (data: DeleteForm) => usersApi.deleteMe(data.password),
    onSuccess: () => { logout(); navigate('/login') },
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-dark-surface dark:to-dark-secondary transition-colors">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-dark-surface/90 backdrop-blur-sm border-b border-gray-100 dark:border-dark-border transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('profile_title')}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4 px-2">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Profile details */}
        <Section title={t('profile_details')} icon={User}>
          <form onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
            <Input label={t('name')} error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
            <div>
              <p className="label">{t('email')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-tertiary border border-gray-200 dark:border-dark-border rounded-xl px-3.5 py-2.5">
                {user.email}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('email_readonly')}</p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" variant="primary" loading={updateProfile.isPending}>{t('save_changes')}</Button>
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 animate-scale-in">
                  <Check size={14} /> {t('saved')}
                </span>
              )}
              {updateProfile.isError && <span className="text-sm text-red-500">{t('error_generic')}</span>}
            </div>
          </form>
        </Section>

        {/* Appearance / Theme */}
        <Section title={t('theme_section')} icon={Monitor}>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(({ mode: m, Icon, labelKey }) => (
              <button
                key={m}
                onClick={() => { setMode(m); applyTheme(m) }}
                className={cn(
                  'flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all',
                  mode === m
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-dark-tertiary hover:bg-gray-50 dark:hover:bg-dark-tertiary'
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-semibold">{t(labelKey as any)}</span>
                {mode === m && <Check size={12} className="text-blue-500 dark:text-blue-400" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{t('theme_hint')}</p>
        </Section>

        {/* Change password */}
        <Section title={t('change_password')} icon={Lock}>
          <form onSubmit={passwordForm.handleSubmit((d) => changePassword.mutate(d))} className="space-y-4">
            <Input label={t('current_password')} type="password" placeholder="••••••••" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
            <Input label={t('new_password')} type="password" placeholder={t('password_hint')} error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
            <Input label={t('confirm_password')} type="password" placeholder="••••••••" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
            {changePassword.isError && <p className="text-sm text-red-500">{t('wrong_current_password')}</p>}
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" variant="primary" loading={changePassword.isPending}>{t('change_password')}</Button>
              {passwordSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 animate-scale-in">
                  <Check size={14} /> {t('password_changed')}
                </span>
              )}
            </div>
          </form>
        </Section>

        {/* Danger zone */}
        <Section title={t('danger_zone')} icon={Trash2} danger>
          {!showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('delete_account_desc')}</p>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 pl-4 list-disc">
                <li>{t('delete_account_warn1')}</li>
                <li>{t('delete_account_warn2')}</li>
                <li>{t('delete_account_warn3')}</li>
              </ul>
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="mt-2">
                <Trash2 size={14} /> {t('delete_account')}
              </Button>
            </div>
          ) : (
            <form onSubmit={deleteForm.handleSubmit((d) => deleteAccount.mutate(d))} className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{t('delete_account_final_warn')}</p>
              </div>
              <Input label={t('confirm_with_password')} type="password" placeholder="••••••••" error={deleteForm.formState.errors.password?.message} {...deleteForm.register('password')} />
              {deleteAccount.isError && <p className="text-sm text-red-500">{t('wrong_current_password')}</p>}
              <div className="flex gap-2">
                <Button type="submit" variant="danger" loading={deleteAccount.isPending}>{t('delete_account_confirm')}</Button>
                <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); deleteForm.reset() }}>{t('cancel')}</Button>
              </div>
            </form>
          )}
        </Section>

        {/* Sign out */}
        <div className="flex justify-center pb-4">
          <button onClick={logout} className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            {t('sign_out')}
          </button>
        </div>
      </div>
    </div>
  )
}
