# Famiglia Recipes

A private recipe website for the family, available in English and French.

- Add and edit recipes with photos, ingredients, and steps.
- Search by title and filter by category or author.
- Save favorites and leave comments.
- Adjust ingredient quantities by changing the number of servings.
- Import recipes from images, documents, or text using OpenRouter.

## Stack

Bun, React, TanStack Start/Router/Query, SQLite with Drizzle ORM, Better Auth,
and Zod. The UI uses Tailwind CSS and shadcn/ui with Base UI and the Nova preset.
Translations use General Translation with local, manually translated files.

## Local setup

Install Bun, then clone the repository and install dependencies:

```bash
git clone https://github.com/Crossoufire/Famiglia-Recipes.git
cd Famiglia-Recipes
bun install
cp .env.example .env
```

Fill in `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file path, for example `./instance/site.db` |
| `VITE_BASE_URL` | App URL, for example `http://localhost:3000` |
| `UPLOADS_DIR_NAME` | Upload URL directory, usually `static` |
| `BASE_UPLOADS_LOCATION` | Recipe image directory, usually `./public/static/recipe-images` |
| `BETTER_AUTH_SECRET` | Session secret, at least 20 characters |
| `REGISTER_KEY` | Invitation key required to create an account |
| `REGISTER_KEY_SALT`, `REGISTER_KEY_HASH` | Generated from the invitation key |
| `ADMIN_MAIL_USERNAME`, `ADMIN_MAIL_PASSWORD` | Email credentials for account emails and error notifications |
| `OPEN_ROUTER_API_KEY`, `OPEN_ROUTER_MODEL_ID` | API key and model used for recipe imports |

Generate the salt and hash using the same invitation key as `REGISTER_KEY`,
then copy the output into `.env`:

```bash
bun run key:generate "your-invitation-key"
```

Create the local directories, apply the database migrations, and start the app:

```bash
mkdir -p instance public/static/recipe-images
bun run dk migrate
bun run dev
```

The app runs at `http://localhost:3000`. Registration requires the invitation
key and email verification.

## Development commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run lint` | Run lint checks |
| `bunx tsc --noEmit` | Check TypeScript |
| `bun test` | Run tests |
| `bun run knip` | Check for unused code and dependencies |
| `bun run email` | Preview email templates |
| `bun run i18n:generate` | Extract UI text and update local translation files |
| `bun run i18n:validate` | Validate translation extraction |

## Translations

Write UI text in English using ordinary JSX:

```tsx
<h1>Hello, {name}.</h1>
<p>Recently added recipes.</p>
```

General Translation's automatic JSX injection adds the translation wrappers
during compilation. Use `Plural` for counts and `useGT()` where a string is
required, such as placeholders, accessibility labels, page titles, and toasts:

```tsx
const gt = useGT();
<input placeholder={gt("Recipe title")} />
```

After changing text:

1. Run `bun run i18n:generate`.
2. Translate new entries in `src/lib/client/i18n/translations/fr.json`.
3. Run `bun run i18n:validate` and check the result in both languages.
4. Commit the code and both translation files.

Generation preserves existing French translations. New entries initially
contain English. Keep the generated keys, variable metadata, and placeholders
unchanged when translating. Changes to text or JSX structure can create new
keys. Restart the dev server after editing the catalogs.

Extraction validation checks the source, not the quality or completeness of
French translations. Review new entries before committing.

Translations are local: no GT account, API key, or translation service is used.
Use `gt generate`, not `gt translate`. The OpenRouter recipe importer is separate.
Email templates are excluded from UI translation extraction.

The Vite integration handles TanStack's split route modules and runs the GT
compiler before React Compiler to keep extraction and runtime hashes consistent.

## Releases

Release Please runs on pushes to `main`. It creates release pull requests and
updates the changelog from conventional commits, including `refactor` commits.
