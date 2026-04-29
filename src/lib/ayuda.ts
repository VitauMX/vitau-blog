import { getCollection, type CollectionEntry } from 'astro:content'

export type AyudaArticle = CollectionEntry<'ayuda'>

export const ayudaCategories = [
  {
    slug: 'preguntas-frecuentes',
    name: 'Preguntas Frecuentes',
    description: 'Respuestas rápidas a las dudas más comunes sobre pedidos, envíos y servicios.',
    icon: 'fa-question-circle',
  },
  {
    slug: 'compras-recurrentes',
    name: 'Compras Recurrentes',
    description: 'Todo sobre suscripciones, recordatorios y cómo automatizar tus medicamentos.',
    icon: 'fa-sync-alt',
  },
  {
    slug: 'promociones-y-descuentos',
    name: 'Promociones y Descuentos',
    description: 'Aprende a usar cupones, programas de lealtad y aprovecha nuestras ofertas.',
    icon: 'fa-tag',
  },
  {
    slug: 'pagos-y-facturas',
    name: 'Pagos y Facturas',
    description: 'Métodos de pago aceptados, proceso de facturación y solución de problemas.',
    icon: 'fa-credit-card',
  },
]

export async function getAllAyudaArticles(): Promise<AyudaArticle[]> {
  return getCollection('ayuda')
}

export function getAyudaSlug(article: AyudaArticle): string {
  return article.id.replace(/\.(md|mdx)$/, '')
}
