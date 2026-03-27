import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, User, Lock, Trash2, AlertTriangle, Check } from 'lucide-react'
import { usersApi } from '../api/users'
import { useAuthStore } from '../store/authStore'
import { useI18n } from '../store/i18nStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { cn } from '../components/ui/cn'

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Schemas ─────────────────────────────────────────────────────────────────
const profileSchema = z.object({ name: z.string().min(2, 'Minimum 2 characters') })
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
const deleteSchema = z.object({ password: z.string().min(1, 'Required') })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type DeleteForm = z.infer<typeof deleteSchema>

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, danger }: {
  title: string; icon: React.ElementType; children: React.ReactNode; danger?: boolean
}) {
  return (
    <div className={cn(
      'bg-white rounded-2xl border overflow-hidden',
      danger ? 'border-red-200' : 'border-gray-100'
    )}>
      <div className={cn(
        'flex items-center gap-2.5 px-6 py-4 border-b',
        danger ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
      )}>
        <Icon size={16} className={danger ? 'text-red-500' : 'text-gray-500'} />
        <h2 className={cn('text-sm font-semibold', danger ? 'text-red-700' : 'text-gray-700')}>{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const navigate = useNavigate()
  const { user, setAuth, logout } = useAuthStore()
  const { t } = useI18n()
  const qc = useQueryClient()
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  })

  // Password form
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  // Delete form
  const deleteForm = useForm<DeleteForm>({ resolver: zodResolver(deleteSchema) })

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
    mutationFn: (data: PasswordForm) =>
      usersApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      passwordForm.reset()
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 2500)
    },
  })

  const deleteAccount = useMutation({
    mutationFn: (data: DeleteForm) => usersApi.deleteMe(data.password),
    onSuccess: () => { logout(); navigate('/login') },
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-semibold text-gray-900">{t('profile_title')}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4 px-2">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Profile details */}
        <Section title={t('profile_details')} icon={User}>
          <form onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
            <Input
              label={t('name')}
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />
            <div>
              <p className="label">{t('email')}</p>
              <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
                {user.email}
              </p>
              <p className="text-xs text-gray-400 mt-1">{t('email_readonly')}</p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" variant="primary" loading={updateProfile.isPending}>
                {t('save_changes')}
              </Button>
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 animate-scale-in">
                  <Check size={14} /> {t('saved')}
                </span>
              )}
              {updateProfile.isError && (
                <span className="text-sm text-red-500">{t('error_generic')}</span>
              )}
            </div>
          </form>
        </Section>

        {/* Change password */}
        <Section title={t('change_password')} icon={Lock}>
          <form onSubmit={passwordForm.handleSubmit((d) => changePassword.mutate(d))} className="space-y-4">
            <Input
              label={t('current_password')}
              type="password"
              placeholder="••••••••"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <Input
              label={t('new_password')}
              type="password"
              placeholder={t('password_hint')}
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Input
              label={t('confirm_password')}
              type="password"
              placeholder="••••••••"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
            {changePassword.isError && (
              <p className="text-sm text-red-500">{t('wrong_current_password')}</p>
            )}
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" variant="primary" loading={changePassword.isPending}>
                {t('change_password')}
              </Button>
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
              <p className="text-sm text-gray-600">{t('delete_account_desc')}</p>
              <ul className="text-sm text-red-600 space-y-1 pl-4 list-disc">
                <li>{t('delete_account_warn1')}</li>
                <li>{t('delete_account_warn2')}</li>
                <li>{t('delete_account_warn3')}</li>
              </ul>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-2"
              >
                <Trash2 size={14} />
                {t('delete_account')}
              </Button>
            </div>
          ) : (
            <form onSubmit={deleteForm.handleSubmit((d) => deleteAccount.mutate(d))} className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{t('delete_account_final_warn')}</p>
              </div>
              <Input
                label={t('confirm_with_password')}
                type="password"
                placeholder="••••••••"
                error={deleteForm.formState.errors.password?.message}
                {...deleteForm.register('password')}
              />
              {deleteAccount.isError && (
                <p className="text-sm text-red-500">{t('wrong_current_password')}</p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="danger"
                  loading={deleteAccount.isPending}
                >
                  {t('delete_account_confirm')}
                </Button>
                <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); deleteForm.reset() }}>
                  {t('cancel')}
                </Button>
              </div>
            </form>
          )}
        </Section>
      </div>
    </div>
  )
}
