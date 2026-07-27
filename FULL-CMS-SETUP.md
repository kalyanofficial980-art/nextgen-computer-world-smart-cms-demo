# Full Supabase CMS Setup

The upgrade script performs these steps interactively:

1. Backs up the current project.
2. Installs the CMS source upgrade.
3. Prompts locally for Supabase project details.
4. Writes public keys to `.env.local`.
5. Uses the Supabase CLI to link the project and push the database migration.
6. Creates the verified owner Auth account using the secret key only in memory.
7. Adds public Supabase variables to Vercel.
8. Runs TypeScript checks, production build, Git commit, GitHub push and Vercel deployment.
9. Opens `/admin/login`.

Never paste the Supabase secret key, database password or personal access token into chat.
