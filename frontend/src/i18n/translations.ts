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
  },
} as const

export type TranslationKey = keyof typeof translations.en
