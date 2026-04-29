# Estrategia de Deploy — vitau-blog en AWS

_Última actualización: 2026-04-28_

---

## 1. Hallazgos de infraestructura actual

### Route53 — vitau.mx (Hosted Zone: Z2IOAZFWPLPQ9N)

| Subdominio | Tipo | Destino actual |
|---|---|---|
| `vitau.mx` | A | 76.76.21.21 (Vercel/CDN externo) |
| `blog.vitau.mx` | CNAME | `blog-vitau.netlify.app` ← **actualmente en Netlify** |
| `ayuda.vitau.mx` | CNAME | `magicpatterns.dev` ← apunta a otro lado |
| `blog-admin.vitau.mx` | A | 18.233.67.234 (Ghost CMS admin) |

### CloudFront — distribuciones activas

| Dominio | CF ID | Origen S3 |
|---|---|---|
| `vitau.mx` | E2UVOB18PP0Q47 | `prod-vitau.s3.amazonaws.com` |
| `beta.vitau.mx` | E4C5FXDV00E65 | `beta-vitau.s3.amazonaws.com` |
| `develop.vitau.mx` | E24K7R7IVF8LH0 | `develop-vitau.s3.amazonaws.com` |
| `panel.vitau.mx` | E6L0NF94XLT80 | `prod-panel.s3.amazonaws.com` |

**Config del CF vitau.mx (E2UVOB18PP0Q47):**
- `ViewerProtocolPolicy`: redirect-to-https
- `Compress`: true
- `DefaultTTL`: 86400s (1 día)
- Cache behaviors adicionales: **ninguno** (solo default)
- Error responses: 403 y 404 → `/index.html` con status 200 (modo SPA)

### S3 — buckets relevantes

| Bucket | Región | Website hosting |
|---|---|---|
| `blog-vitau` | us-east-1 | ✅ index: `index.html`, error: `error.html` |
| `prod-vitau` | us-east-1 | SPA (sirve la app principal) |
| `www.vitau.mx` | us-east-1 | Redirect → vitau.mx |

El bucket `blog-vitau` ya existe y tiene static website hosting configurado. Actualmente vacío.

### CodePipeline — patrones existentes

Los 3 pipelines actuales (django-prod, django-beta, django-test) siguen el mismo patrón:

```
Source (GitHub via CodeStar) → Build (CodeBuild) → Deploy (Elastic Beanstalk)
```

**CodeStar connection disponible:**
`arn:aws:codeconnections:us-east-1:406115630084:connection/35b151bd-b003-4d04-830e-ee087df78e87`
→ Conecta con la organización `VitauMX` en GitHub. **Reutilizable.**

---

## 2. Contexto del proyecto

- **Repo:** `VitauMX/vitau-blog` (branch: `master`)
- **Framework:** Astro 5.x, output estático (`dist/`)
- **URLs canónicas:** `vitau.mx/blog/*` y `vitau.mx/ayuda/*`
- **Build:** `pnpm install && pnpm build` → genera `dist/`
- **Runtime:** ninguno — archivos HTML/CSS/JS/assets estáticos

---

## 3. Estrategia recomendada

### Arquitectura objetivo

```
GitHub (master push)
    │
    ▼
CodePipeline
    ├── Stage 1: Source  → VitauMX/vitau-blog (CodeStar connection)
    ├── Stage 2: Build   → CodeBuild (Node 22, pnpm build)
    └── Stage 3: Deploy  → S3 sync blog-vitau + CF invalidation
                                │
                                ▼
                    CloudFront E2UVOB18PP0Q47 (vitau.mx)
                    ├── Behavior /blog/*  → origin: blog-vitau
                    ├── Behavior /ayuda/* → origin: blog-vitau
                    └── Default           → origin: prod-vitau (SPA)
```

### Por qué esta arquitectura

1. **Un solo dominio (`vitau.mx`)** — las URLs ya están construidas así, el blog vive en `/blog/` y no en un subdominio. Mejor para SEO y para el usuario.
2. **Bucket dedicado (`blog-vitau`)** — aísla el contenido estático del blog del bucket del SPA principal. Rollbacks y deploys independientes.
3. **CF existente** — no se crea una nueva distribución. Se agregan dos cache behaviors con path `/blog/*` y `/ayuda/*` apuntando al nuevo origen. Cero cambios de DNS.
4. **Pipeline propio** — independiente de los pipelines Django. Trigger en push a `master` del repo de blog.

---

## 4. Pasos de implementación

### 4.1 Configurar bucket blog-vitau

- Habilitar Block Public Access OFF (ya configurado para website hosting)
- Agregar bucket policy para lectura pública:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::blog-vitau/*"
  }]
}
```
- Verificar CORS si es necesario (generalmente no para assets estáticos)

### 4.2 Agregar origen y cache behaviors en CF (E2UVOB18PP0Q47)

**Nuevo origen:**
- ID: `S3-blog-vitau`
- Domain: `blog-vitau.s3-website-us-east-1.amazonaws.com` (endpoint de website)
- Tipo: Custom Origin (HTTP 80) — el website endpoint no soporta OAC
- Origin Protocol: HTTP only

**Nuevos cache behaviors (en orden, antes del default):**

| Path | Origen | TTL | Compress |
|---|---|---|---|
| `/blog/*` | S3-blog-vitau | 86400s | true |
| `/ayuda/*` | S3-blog-vitau | 86400s | true |

**Importante:** los behaviors se evalúan en orden. `/blog/*` y `/ayuda/*` deben estar antes del `Default (*)`.

**Error pages para el blog:** A diferencia del SPA, el blog genera páginas reales. Se puede quitar el override de 404→index.html para las rutas del blog usando behaviors específicos con su propio error handling, o simplemente confiar en que Astro genera todos los paths como `index.html` dentro de carpetas.

### 4.3 CodeBuild — nuevo proyecto

**Proyecto:** `blog-build`

`buildspec.yml` (en la raíz del repo):
```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 22
    commands:
      - npm install -g pnpm
      - pnpm install --frozen-lockfile
  build:
    commands:
      - pnpm build
  post_build:
    commands:
      - aws s3 sync dist/ s3://blog-vitau/ --delete --cache-control "public,max-age=86400"
      - aws s3 cp dist/index.html s3://blog-vitau/index.html --cache-control "public,max-age=0,must-revalidate"
      - aws cloudfront create-invalidation --distribution-id E2UVOB18PP0Q47 --paths "/blog/*" "/ayuda/*"

artifacts:
  files:
    - '**/*'
  base-directory: dist
```

**IAM Role para CodeBuild** necesita:
- `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` en `blog-vitau`
- `cloudfront:CreateInvalidation` en distribución `E2UVOB18PP0Q47`

### 4.4 CodePipeline — nuevo pipeline

**Nombre:** `blog-vitau-pipeline`

| Stage | Provider | Config |
|---|---|---|
| Source | CodeStarSourceConnection | Repo: `VitauMX/vitau-blog`, Branch: `master` |
| Build | CodeBuild | Project: `blog-build` |

No se necesita stage de Deploy separado — el `post_build` del buildspec hace el sync y la invalidación.

---

## 5. Ambientes (opcional, futuro)

Para tener preview antes de producción:

| Ambiente | Branch | Bucket | Dominio |
|---|---|---|---|
| Producción | `master` | `blog-vitau` | `vitau.mx/blog/` |
| Staging | `staging` | `blog-vitau-staging` | `blog-staging.vitau.mx` |

Por ahora solo se implementa producción.

---

## 6. DNS — cambios necesarios

Una vez que el CF esté sirviendo `/blog/*` correctamente:

- **Ningún cambio de DNS necesario** — `vitau.mx` ya apunta al CF E2UVOB18PP0Q47
- El subdominio `blog.vitau.mx` puede quedar como está (Netlify) o eliminarse cuando el contenido esté live en vitau.mx/blog

---

## 7. Recursos creados (2026-04-28)

| Recurso | ID / ARN |
|---|---|
| IAM Role CodeBuild | `arn:aws:iam::406115630084:role/blog-build-role` |
| IAM Role CodePipeline | `arn:aws:iam::406115630084:role/blog-pipeline-role` |
| CodeBuild project | `arn:aws:codebuild:us-east-1:406115630084:project/blog-build` |
| CodePipeline | `blog-vitau-pipeline` (us-east-1, V2) |
| CF ETag post-update | `E3SHYBHKMQRP7H` |

## 8. Orden de ejecución

```
[x] 1. Configurar bucket blog-vitau (public policy)
[x] 2. Agregar origen blog-vitau al CF E2UVOB18PP0Q47
[x] 3. Agregar cache behaviors /blog/* y /ayuda/* en CF
[x] 4. Crear buildspec.yml en repo
[x] 5. Crear CodeBuild project blog-build con IAM role adecuado
[x] 6. Crear CodePipeline blog-vitau-pipeline (V2, CodeStar)
[ ] 7. Trigger primer build — verificar dist/ en S3
[ ] 8. Verificar vitau.mx/blog/ en browser
[ ] 9. Push a master → verificar pipeline end-to-end
```

---

## 8. Notas y decisiones pendientes

- **Cache-control de HTML:** Los archivos `.html` deben tener `max-age=0, must-revalidate` para que las invalidaciones de CF sean efectivas. Los assets (JS/CSS con hash en nombre) pueden tener `max-age` largo.
- **S3 website endpoint vs OAC:** Se usa el website endpoint (HTTP) como custom origin porque el bucket ya tiene website hosting y necesita servir `index.html` por directorio. Si se migra a OAC (HTTPS, más seguro), se requiere un CF Function para reescribir rutas de directorio.
- **Error handling del SPA:** La regla actual de 403/404 → `/index.html` en el CF default behavior NO afecta los behaviors específicos de `/blog/*` y `/ayuda/*`. Astro genera todos los paths correctamente como directorios con `index.html`, así que los 404 reales (path inexistente) pueden manejarse con una página 404 custom en el bucket.
