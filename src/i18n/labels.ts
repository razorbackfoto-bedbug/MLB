/**
 * Spanish translations for the raw English strings used as badge/filter labels
 * throughout the catalog (medicalTopics, audienceTags, bookType, audience).
 * Only strings that actually appear on a Spanish-eligible book need an entry —
 * translateLabel() falls back to the original English string when one is
 * missing, so adding a new Spanish book never breaks the build; it just means
 * that book's untranslated tags show in English until this map is extended.
 */
const LABEL_ES: Record<string, string> = {
  // audienceTags
  Children: 'Niños',
  Families: 'Familias',
  Parents: 'Padres',
  // bookType
  Storybooks: 'Cuentos Ilustrados',
  Keepsakes: 'Recuerdos',
  'Guides & Resources': 'Guías y Recursos',
  // medicalTopics (extend as more Spanish-edition books are added)
  'Grief/Loss': 'Duelo/Pérdida',
  'Anxiety & Coping': 'Ansiedad y Afrontamiento',
  NICU: 'UCIN',
  Prematurity: 'Prematuridad',
  Respiratory: 'Respiratorio',
  'Sibling Education': 'Educación para Hermanos',
  Surgery: 'Cirugía',
  Cardiac: 'Cardíaco',
  Oncology: 'Oncología',
  Cancer: 'Cáncer',
  Genetics: 'Genética',
  'Rare Disease': 'Enfermedad Rara',
  'Feeding/G-tube': 'Alimentación/Sonda',
  Hospitalization: 'Hospitalización',
  Inclusion: 'Inclusión',
  'Courage & Resilience': 'Valentía y Resiliencia',
  'Death & Dying': 'Muerte y Duelo',
  'Pregnancy Loss': 'Pérdida Gestacional',
  Chemotherapy: 'Quimioterapia',
  'Hair Loss': 'Pérdida de Cabello',
  'Surgery Preparation': 'Preparación para Cirugía',
  'Medical Equipment': 'Equipo Médico',
  'Heart Surgery': 'Cirugía de Corazón',
  'Open-Heart Surgery': 'Cirugía a Corazón Abierto',
  'Congenital Heart Defect': 'Defecto Cardíaco Congénito',
  Recovery: 'Recuperación',
  // format
  Storybook: 'Cuento Ilustrado',
  'Keepsake Book': 'Libro de Recuerdos',
  'Guide / Memoir': 'Guía / Memoria',
};

export function translateLabel(label: string, lang: 'en' | 'es'): string {
  if (lang === 'en') return label;
  return LABEL_ES[label] ?? label;
}

export function translateAudience(audience: string, lang: 'en' | 'es'): string {
  if (lang === 'en') return audience;
  return audience
    .split(' & ')
    .map((part) => LABEL_ES[part] ?? part)
    .join(' y ');
}
