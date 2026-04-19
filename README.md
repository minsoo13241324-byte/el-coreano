# 🇰🇷 El Coreano

Comunidad Reddit-style para hispanohablantes que aprenden coreano (Hangul), inspirada en K-POP y K-Dramas.

**Stack:** Next.js 15 · Supabase (Auth + PostgreSQL) · Tailwind CSS · Vercel

---

## Requisitos previos

- Node.js 18+
- Una cuenta en [Supabase](https://supabase.com) (gratis)
- Una cuenta en [Vercel](https://vercel.com) (gratis, para deployment)

---

## 1. Configurar Supabase

1. Crea un nuevo proyecto en [app.supabase.com](https://app.supabase.com).
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`.
   - Crea todas las tablas, políticas RLS, triggers y las 10 categorías.
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. (Opcional) Ve a **Authentication → Email** y desactiva "Confirm email" para desarrollo rápido.

---

## 2. Instalar y ejecutar localmente

```bash
# Clona / copia el proyecto y entra al directorio
cd "El Coreano"

# Instala dependencias
npm install

# Crea el archivo de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# Inicia el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 3. Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio (http://localhost:3000 en dev) |

---

## 4. Hacer a un usuario administrador

Después de registrarte, ejecuta en el SQL Editor de Supabase:

```sql
UPDATE profiles
SET is_admin = true
WHERE username = 'tu_username';
```

El panel de administración estará disponible en `/admin`.

---

## 5. Deployment en Vercel

```bash
# Instala Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configura las variables de entorno en el dashboard de Vercel
# o con: vercel env add NEXT_PUBLIC_SUPABASE_URL
```

En Supabase, ve a **Authentication → URL Configuration** y agrega:
- Site URL: `https://tu-dominio.vercel.app`
- Redirect URLs: `https://tu-dominio.vercel.app/auth/callback`

---

## Estructura del proyecto

```
├── app/
│   ├── page.tsx                  # Feed principal
│   ├── login/                    # Inicio de sesión
│   ├── signup/                   # Registro
│   ├── auth/callback/            # Callback de Supabase Auth
│   ├── c/[slug]/                 # Feed por categoría
│   ├── c/[slug]/submit/          # Crear publicación
│   ├── post/[id]/                # Detalle de publicación + comentarios
│   ├── post/[id]/edit/           # Editar publicación
│   ├── search/                   # Búsqueda
│   ├── admin/                    # Panel de administración
│   └── profile/                  # Perfil del usuario
├── components/
│   ├── layout/                   # Header, Sidebar
│   ├── posts/                    # PostCard, PostForm, VoteButton
│   ├── comments/                 # CommentList, CommentItem, CommentForm
│   └── ui/                       # Button, Avatar
├── actions/                      # Server Actions (auth, posts, comments)
├── lib/supabase/                 # Cliente Supabase (browser + server)
├── types/                        # Tipos TypeScript
└── supabase/schema.sql           # Schema completo de la base de datos
```

---

## Categorías incluidas

| Categoría | Slug |
|---|---|
| 🔤 Alfabeto Coreano | `alfabeto-coreano` |
| 🗣️ Pronunciación | `pronunciacion` |
| 📖 Vocabulario | `vocabulario` |
| ✍️ Oraciones | `oraciones` |
| 📚 Recursos de Aprendizaje | `recursos-de-aprendizaje` |
| ❓ Preguntas y Respuestas | `preguntas-y-respuestas` |
| 🎵 Aprende con K-POP | `aprende-con-k-pop` |
| 🎬 Aprende con K-Dramas | `aprende-con-k-dramas` |
| 😄 Memes y Tendencias | `memes-y-tendencias` |
| 🌍 Comunidad General | `comunidad-general` |

---

## Funcionalidades del MVP

- **Autenticación** por email/contraseña (Supabase Auth)
- **Feed** con ordenación por reciente o popular
- **Categorías** con páginas propias
- **Publicaciones** — crear, editar, eliminar
- **Comentarios** — hilos anidados, editar, eliminar
- **Votos** — upvoting con actualización optimista
- **Búsqueda** por título de publicación
- **Perfil** de usuario con historial de publicaciones
- **Administración** — stats, moderar posts y usuarios
- **Diseño responsivo** para móvil y escritorio
