export type Locale = 'en' | 'es'

export const translations = {
  en: {
    nav: {
      brand: 'track',
      language: 'Language',
      theme_light: 'Switch to Light Mode',
      theme_dark: 'Switch to Dark Mode',
    },
    dashboard: {
      filter_placeholder: 'Filter tracks...',
      new_tracker: 'New Track',
      no_trackers_title: 'No Tracks Found',
      no_trackers_desc: 'Start tracking your habits, routines, or metrics today.',
      create_first_tracker: 'Create Your First Track',
    },
    cards: {
      check_in: 'Check in',
      log: 'Log',
      value_placeholder: 'Value...',
      note_placeholder: 'Add note...',
      log_entry_tooltip: 'Log entry',
      checked_in: 'Logged!',
    },
    detail: {
      all_trackers: 'All Tracks',
      check_in_today: 'Check in Today',
      log_value: 'Log Value',
      log_entry: 'Log Entry',
      add_note: '+ Note',
      delete_tracker: 'Delete Track',
      event_history: 'Entry History',
      entries_count: '{count} entries',
      entry_count_singular: '1 entry',
      no_events_title: 'No entries recorded yet',
      no_events_desc: 'Logged entries will appear here chronologically.',
      delete_entry: 'Delete entry',
      not_found_title: 'Track Not Found',
      not_found_desc: 'The track with ID "{id}" does not exist or has been deleted.',
      back_to_trackers: 'Back to All Tracks',
    },
    log_view: {
      back_to_tracker: 'Back to {name}',
      back_to_trackers: 'Back to Tracks',
      log_entry_title: 'Log Entry: {name}',
      value_label: 'Value',
      value_placeholder: 'e.g. 72.5, 5000',
      note_label: 'Note',
      optional: '(optional)',
      note_placeholder: 'e.g. Completed morning walk, Great session',
      date_time_label: 'Date & Time',
      cancel: 'Cancel',
      save_entry: 'Save Entry',
    },
    modal: {
      create_title: 'Create New Track',
      name_label: 'Track Name',
      name_placeholder: 'e.g. Daily Meditation, Water Intake, Running',
      type_label: 'Track Type',
      type_hint: "Choose the format that best fits what you're tracking.",
      type_habit: 'Habit (Yes/No completion)',
      type_numeric: 'Numeric Metric (Units, weight, distance)',
      type_text: 'General / Note Log',
      desc_label: 'Description',
      desc_placeholder: 'e.g. Track daily water intake in glasses, Morning meditation streak',
      id_label: 'Custom ID / Slug',
      id_placeholder: 'e.g. daily-meditation',
      id_hint: 'Leave blank to auto-generate a clean slug from the name.',
      cancel: 'Cancel',
      create_btn: 'Create Track',
    },
    types: {
      habit: 'Habit (Yes/No completion)',
      numeric: 'Numeric Metric',
      text: 'General / Note Log',
    },
    prompts: {
      delete_tracker_confirm: 'Are you sure you want to delete this track? This action cannot be undone.',
      delete_entry_confirm: 'Are you sure you want to delete this entry?',
    },
  },
  es: {
    nav: {
      brand: 'track',
      language: 'Idioma',
      theme_light: 'Cambiar a modo claro',
      theme_dark: 'Cambiar a modo oscuro',
    },
    dashboard: {
      filter_placeholder: 'Filtrar tracks...',
      new_tracker: 'Nuevo track',
      no_trackers_title: 'No se encontraron tracks',
      no_trackers_desc: 'Empezá a registrar tus hábitos, rutinas o métricas hoy.',
      create_first_tracker: 'Creá tu primer track',
    },
    cards: {
      check_in: 'Completar',
      log: 'Registrar',
      value_placeholder: 'Valor...',
      note_placeholder: 'Añadir nota...',
      log_entry_tooltip: 'Registrar entrada',
      checked_in: '¡Registrado!',
    },
    detail: {
      all_trackers: 'Todos los tracks',
      check_in_today: 'Completar hoy',
      log_value: 'Registrar valor',
      log_entry: 'Registrar entrada',
      add_note: '+ Nota',
      delete_tracker: 'Eliminar track',
      event_history: 'Historial de entradas',
      entries_count: '{count} entradas',
      entry_count_singular: '1 entrada',
      no_events_title: 'Todavía no hay entradas registradas',
      no_events_desc: 'Tus entradas registradas van a aparecer acá cronológicamente.',
      delete_entry: 'Eliminar entrada',
      not_found_title: 'Track no encontrado',
      not_found_desc: 'El track con ID "{id}" no existe o fue eliminado.',
      back_to_trackers: 'Volver a todos los tracks',
    },
    log_view: {
      back_to_tracker: 'Volver a {name}',
      back_to_trackers: 'Volver a los tracks',
      log_entry_title: 'Registrar entrada: {name}',
      value_label: 'Valor',
      value_placeholder: 'ej. 72.5, 5000',
      note_label: 'Nota',
      optional: '(opcional)',
      note_placeholder: 'ej. Completado después de caminar, Gran sesión',
      date_time_label: 'Fecha y hora',
      cancel: 'Cancelar',
      save_entry: 'Guardar entrada',
    },
    modal: {
      create_title: 'Crear nuevo track',
      name_label: 'Nombre del track',
      name_placeholder: 'ej. Meditación diaria, Consumo de agua, Correr',
      type_label: 'Tipo de track',
      type_hint: 'Elegí el formato que mejor se adapte a lo que vas a registrar.',
      type_habit: 'Hábito (Completado Sí/No)',
      type_numeric: 'Métrica numérica (Unidades, peso, distancia)',
      type_text: 'General / Registro de notas',
      desc_label: 'Descripción',
      desc_placeholder: 'ej. Registrar vasos de agua al día, Racha de meditación matutina',
      id_label: 'ID / Slug personalizado',
      id_placeholder: 'ej. meditacion-diaria',
      id_hint: 'Dejá en blanco para generar automáticamente un slug limpio desde el nombre.',
      cancel: 'Cancelar',
      create_btn: 'Crear track',
    },
    types: {
      habit: 'Hábito (Completado Sí/No)',
      numeric: 'Métrica numérica',
      text: 'General / Registro de notas',
    },
    prompts: {
      delete_tracker_confirm: '¿Seguro que querés eliminar este track? Esta acción no se puede deshacer.',
      delete_entry_confirm: '¿Seguro que querés eliminar esta entrada?',
    },
  },
} as const

export function t(
  keyPath: string,
  locale: Locale = 'en',
  params?: Record<string, string | number>
): string {
  const dict = translations[locale] || translations.en
  const keys = keyPath.split('.')
  let current: any = dict

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      current = keyPath
      break
    }
  }

  let text = typeof current === 'string' ? current : keyPath
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return text
}
