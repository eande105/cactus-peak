# Cactus Peak Athletic

GIT 480 senior project. Cactus Peak Athletic is a fictional gym brand. This monorepo holds the marketing site, the member web app, the iOS app, and the shared Supabase backend.

| Folder | Contents |
| --- | --- |
| `marketing-site/` | Public marketing site (Next.js) |
| `web-app/` | Member web app (Next.js) |
| `ios/` | iOS app and widgets (SwiftUI, XcodeGen `project.yml`) |
| `supabase/` | Migrations, seed data, demo login scripts, config |
| `brand-graphics/` | Brand SVG objects |
| `specs/` | Full product specs and research |
| `DESIGN-DIRECTION.md`, `VISUAL-IDENTITY.md` | Design direction and visual identity |

All three apps use one Supabase project. See `supabase/README.md` for setup and the demo logins.

## Setup

1. Copy your Supabase keys into `.env.local` in the repo root, `marketing-site/`, and `web-app/`.
2. For iOS, copy `ios/Config/Secrets.example.xcconfig` to `ios/Config/Secrets.xcconfig` and fill in the values.
3. Run `pnpm install` in `marketing-site/` and in `web-app/`.
4. Start a dev server with `pnpm dev` in the app folder.

Do not commit `.env*` files or `Secrets.xcconfig`. The `.gitignore` blocks them.
