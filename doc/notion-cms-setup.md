# Notion CMS Setup

Guía de setup para la integración de Notion como headless CMS del blog de Vitau.

---

## 1. Crear la página en Notion

1. Ir al workspace de Vitau en Notion
2. Crear una nueva página **top-level** en el teamspace **General**
3. Nombre: `✍️ Contenido Vitau`
4. Dentro, crear dos bases de datos:

---

## 2. DB: Blog Posts (`📝 Blog Posts`)

Propiedades:

| Propiedad | Tipo | Notas |
|---|---|---|
| `Name` | Title | Título del post |
| `Slug` | Text | URL-safe, único — define la URL del post |
| `Status` | Status | Draft / In Progress / **Published** |
| `PublishedAt` | Date | Fecha visible al lector |
| `Tags` | Multi-select | Salud, Nutrición, Diabetes, Dermatología… |
| `Excerpt` | Text | 150–200 chars — fallback de meta description |
| `FeaturedImage` | Files & Media | Subir imagen aquí — el build la mueve a S3 |
| `SEOTitle` | Text | Override del `<title>` y og:title |
| `SEODescription` | Text | Override del meta description |
| `ReadingTime` | Number | Minutos estimados (llenar manualmente) |
| `Featured` | Checkbox | Para destacar en homepage |

**Tags canónicos recomendados:** Salud, Nutrición, Diabetes, Dermatología, Bienestar Mental, Pediatría, Ejercicio, Cuidado Personal, Prevención, Suplementos

---

## 3. DB: Artículos de Ayuda (`📚 Artículos de Ayuda`)

Propiedades:

| Propiedad | Tipo | Notas |
|---|---|---|
| `Name` | Title | Título del artículo |
| `Slug` | Text | URL-safe, único |
| `Status` | Status | Draft / In Progress / **Published** |
| `Category` | Select | `preguntas-frecuentes` / `compras-recurrentes` / `promociones-y-descuentos` / `pagos-y-facturas` |
| `CategoryName` | Text | Nombre display (e.g. "Promociones y Descuentos") |

---

## 4. Crear Integración Interna

1. Ir a https://www.notion.com/my-integrations
2. Crear nueva integración:
   - Nombre: `vitau-blog-cms`
   - Workspace: Vitau
   - Tipo: Interna
3. Permisos:
   - ✅ **Read content** — requerido
   - ❌ Update content — desactivado
   - ❌ Insert content — desactivado
4. Guardar y copiar el **Integration Secret** (`secret_...`)
5. En la página `✍️ Contenido Vitau` en Notion → `···` → **Connect to** → seleccionar `vitau-blog-cms`

---

## 5. Configurar Variables de Entorno

### Desarrollo local

Crear `.env` en la raíz del proyecto:
```
NOTION_TOKEN=secret_xxxxx
NOTION_BLOG_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_AYUDA_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Los IDs de las DBs se obtienen abriendo cada base de datos en el browser — el UUID aparece en la URL.

### AWS CodeBuild

En la consola de AWS → CodeBuild → proyecto `vitau-blog-pipeline` → Edit → Environment:

Agregar como **Environment variables** (Plaintext):
- `NOTION_TOKEN` = `secret_xxxxx`
- `NOTION_BLOG_DB_ID` = UUID de Blog Posts
- `NOTION_AYUDA_DB_ID` = UUID de Artículos de Ayuda

---

## 6. Workflow Editorial

### Publicar un nuevo post de blog

1. Abrir `📝 Blog Posts` en `✍️ Contenido Vitau`
2. Crear nueva página
3. Llenar todas las propiedades (Name, Slug, PublishedAt, Tags, Excerpt, FeaturedImage)
4. Escribir el contenido en el body de la página
5. Cambiar `Status` → **Published**
6. Disparar el build (ver abajo)

> ⚠️ El `Slug` define la URL. Una vez publicado, **no cambiarlo** — rompería links externos e indexación en Google.

### Publicar un artículo de ayuda

1. Abrir `📚 Artículos de Ayuda` en `✍️ Contenido Vitau`
2. Crear nueva página
3. Llenar: Name, Slug, Category, CategoryName, Status = Published
4. Escribir el contenido en el body
5. Disparar el build

### Imágenes

- **FeaturedImage**: subir directamente en el campo (Files & Media) — Notion la guarda y el build la descarga y sube a S3 automáticamente.
- **Imágenes en el body**: pegar la imagen en el editor de Notion (drag & drop o pegar desde clipboard) — el build también las descarga automáticamente.
- **No usar** URLs externas no permanentes (e.g. Google Drive, iCloud).

### Disparar un build manual

```bash
# Desde terminal con AWS CLI configurado:
aws codepipeline start-pipeline-execution --name vitau-blog-pipeline

# O desde la consola AWS:
# CodePipeline → vitau-blog-pipeline → Release change
```

El sitio se actualiza ~3–5 minutos después del build.

---

## 7. Migración de contenido Ghost

Para importar los 83 posts del Ghost export a Notion, correr el script de migración **una sola vez**:

```bash
# 1. Asegurarse que .env tiene las variables de Notion
# 2. Correr el script
pnpm tsx scripts/ghost-to-notion.ts

# El script es idempotente — corre de nuevo si falla a mitad
```

El script:
- Lee `vitau-blog.ghost.2026-04-29-20-09-38.json`
- Crea una página en Notion por cada post publicado
- Respeta el rate limit de la API (350ms entre requests)
- Salta posts que ya existen (por slug)

Para los 15 artículos de ayuda: migrarlos manualmente desde `💟 Centro de Ayuda` en Notion a la nueva DB `📚 Artículos de Ayuda`.
