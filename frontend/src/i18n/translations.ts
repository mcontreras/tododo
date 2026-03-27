export type Locale = 'en' | 'es'

export const translations = {
  en: {
    // Auth
    sign_in: 'Sign in',
    sign_in_subtitle: 'Sign in to your account',
    sign_up: 'Create account',
    sign_up_subtitle: 'Create your account',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    no_account: "Don't have an account?",
    have_account: 'Already have an account?',
    create_one: 'Create one',
    sign_in_link: 'Sign in',
    invalid_credentials: 'Invalid email or password',
    email_placeholder: 'you@example.com',
    password_placeholder: '••••••••',
    name_placeholder: 'Your name',
    password_hint: 'At least 8 characters',

    // Sidebar
    all_tasks: 'All Tasks',
    my_lists: 'My Lists',
    sign_out: 'Sign out',

    // Header
    completed: 'Completed',
    list_view: 'List view',
    kanban_view: 'Kanban view',

    // Task list
    add_task: 'Add task',
    all_clear: 'All clear!',
    all_clear_subtitle: 'Add a task to get started',
    loading: 'Loading tasks...',
    completed_label: 'Completed',

    // Task form
    new_task: 'New Task',
    title: 'Title',
    title_placeholder: 'Task title...',
    list: 'List',
    no_list: 'No list',
    due_date: 'Due Date',
    priority: 'Priority',
    categories: 'Categories',
    url: 'URL',
    create_task: 'Create Task',
    cancel: 'Cancel',
    priority_none: 'None',
    priority_low: 'Low',
    priority_medium: 'Medium',
    priority_high: 'High',

    // Task detail
    mark_complete: 'Mark complete',
    description: 'Description',
    description_placeholder: 'Add a description...',
    url_placeholder: 'https://...',
    attachments: 'Attachments',
    no_attachments: 'No attachments',
    add_file: '+ Add file',
    uploading: 'Uploading...',
    no_categories: 'No categories yet',
    created: 'Created',
    updated: 'Updated',
    delete: 'Delete',
    delete_confirm: "Can't be recovered.",

    // Task item
    today: 'Today',

    // Kanban
    drop_here: 'Drop tasks here',
    add_column: 'Add column',
    column_name_placeholder: 'Column name...',
    edit_column: 'Rename column',
    delete_column: 'Delete column',

    // List modal
    new_list: 'New List',
    list_name: 'List name',
    color: 'Color',
    icon: 'Icon',
    create: 'Create',

    // Language
    language: 'Language',

    // Profile
    profile_title: 'My Account',
    profile_details: 'Profile',
    email_readonly: 'Email cannot be changed.',
    save_changes: 'Save changes',
    saved: 'Saved',
    error_generic: 'Something went wrong.',
    change_password: 'Change password',
    current_password: 'Current password',
    new_password: 'New password',
    confirm_password: 'Confirm new password',
    wrong_current_password: 'Current password is incorrect.',
    password_changed: 'Password changed',
    danger_zone: 'Danger zone',
    delete_account: 'Delete account',
    delete_account_desc: 'Deleting your account is permanent and cannot be undone.',
    delete_account_warn1: 'All your tasks and lists will be deleted.',
    delete_account_warn2: 'All your files and attachments will be deleted.',
    delete_account_warn3: 'Your account cannot be recovered.',
    delete_account_final_warn: 'This action is irreversible. All your data will be permanently deleted.',
    confirm_with_password: 'Enter your password to confirm',
    delete_account_confirm: 'Yes, delete my account',
    profile_settings: 'Settings',

    // Notifications
    notifications: 'Notifications',
    notif_enable: 'Enable notifications',
    notif_denied: 'Notifications blocked in browser settings',
    notif_60min: 'Due in 1 hour',
    notif_30min: 'Due in 30 minutes',
    notif_15min: 'Due in 15 minutes',
    notif_5min: 'Due in 5 minutes',
    notif_due: 'Task is due now',
    notif_overdue: 'Task is overdue',
  },
  es: {
    // Auth
    sign_in: 'Iniciar sesión',
    sign_in_subtitle: 'Accede a tu cuenta',
    sign_up: 'Crear cuenta',
    sign_up_subtitle: 'Crea tu cuenta',
    email: 'Correo electrónico',
    password: 'Contraseña',
    name: 'Nombre',
    no_account: '¿No tienes cuenta?',
    have_account: '¿Ya tienes cuenta?',
    create_one: 'Crear una',
    sign_in_link: 'Iniciar sesión',
    invalid_credentials: 'Correo o contraseña incorrectos',
    email_placeholder: 'tu@ejemplo.com',
    password_placeholder: '••••••••',
    name_placeholder: 'Tu nombre',
    password_hint: 'Al menos 8 caracteres',

    // Sidebar
    all_tasks: 'Todas las tareas',
    my_lists: 'Mis listas',
    sign_out: 'Cerrar sesión',

    // Header
    completed: 'Completadas',
    list_view: 'Vista lista',
    kanban_view: 'Vista kanban',

    // Task list
    add_task: 'Añadir tarea',
    all_clear: '¡Todo listo!',
    all_clear_subtitle: 'Añade una tarea para empezar',
    loading: 'Cargando tareas...',
    completed_label: 'Completadas',

    // Task form
    new_task: 'Nueva tarea',
    title: 'Título',
    title_placeholder: 'Título de la tarea...',
    list: 'Lista',
    no_list: 'Sin lista',
    due_date: 'Fecha límite',
    priority: 'Prioridad',
    categories: 'Categorías',
    url: 'URL',
    create_task: 'Crear tarea',
    cancel: 'Cancelar',
    priority_none: 'Ninguna',
    priority_low: 'Baja',
    priority_medium: 'Media',
    priority_high: 'Alta',

    // Task detail
    mark_complete: 'Marcar completada',
    description: 'Descripción',
    description_placeholder: 'Añade una descripción...',
    url_placeholder: 'https://...',
    attachments: 'Adjuntos',
    no_attachments: 'Sin adjuntos',
    add_file: '+ Añadir archivo',
    uploading: 'Subiendo...',
    no_categories: 'Sin categorías',
    created: 'Creada',
    updated: 'Actualizada',
    delete: 'Eliminar',
    delete_confirm: 'No se podrá recuperar.',

    // Task item
    today: 'Hoy',

    // Kanban
    drop_here: 'Suelta tareas aquí',
    add_column: 'Añadir columna',
    column_name_placeholder: 'Nombre de columna...',
    edit_column: 'Renombrar columna',
    delete_column: 'Eliminar columna',

    // List modal
    new_list: 'Nueva lista',
    list_name: 'Nombre de la lista',
    color: 'Color',
    icon: 'Icono',
    create: 'Crear',

    // Language
    language: 'Idioma',

    // Profile
    profile_title: 'Mi cuenta',
    profile_details: 'Perfil',
    email_readonly: 'El email no se puede cambiar.',
    save_changes: 'Guardar cambios',
    saved: 'Guardado',
    error_generic: 'Algo ha salido mal.',
    change_password: 'Cambiar contraseña',
    current_password: 'Contraseña actual',
    new_password: 'Nueva contraseña',
    confirm_password: 'Confirmar nueva contraseña',
    wrong_current_password: 'La contraseña actual es incorrecta.',
    password_changed: 'Contraseña cambiada',
    danger_zone: 'Zona de peligro',
    delete_account: 'Eliminar cuenta',
    delete_account_desc: 'Eliminar tu cuenta es permanente y no se puede deshacer.',
    delete_account_warn1: 'Se eliminarán todas tus tareas y listas.',
    delete_account_warn2: 'Se eliminarán todos tus archivos adjuntos.',
    delete_account_warn3: 'Tu cuenta no podrá recuperarse.',
    delete_account_final_warn: 'Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.',
    confirm_with_password: 'Introduce tu contraseña para confirmar',
    delete_account_confirm: 'Sí, eliminar mi cuenta',
    profile_settings: 'Ajustes',

    // Notifications
    notifications: 'Notificaciones',
    notif_enable: 'Activar notificaciones',
    notif_denied: 'Notificaciones bloqueadas en el navegador',
    notif_60min: 'Vence en 1 hora',
    notif_30min: 'Vence en 30 minutos',
    notif_15min: 'Vence en 15 minutos',
    notif_5min: 'Vence en 5 minutos',
    notif_due: 'La tarea vence ahora',
    notif_overdue: 'La tarea está vencida',
  },
} as const

export type TranslationKey = keyof typeof translations.en
