# Welcome to your Lovable project

## 🔐 Secure Authentication System

This project implements a comprehensive secure authentication system using Supabase Auth with the following features:

### Security Features
- ✅ Email/password authentication with strong password requirements
- ✅ Email verification flow
- ✅ Password reset functionality
- ✅ Rate limiting on all auth endpoints
- ✅ Row Level Security (RLS) policies
- ✅ JWT token verification on server-side
- ✅ Security event logging and monitoring
- ✅ Account lockout protection
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ SQL injection protection
- ✅ Automated security scanning in CI/CD

### Environment Variables Setup

**Required GitHub Secrets:**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=your_deployed_app_url
SLACK_WEBHOOK_URL=your_slack_webhook_for_alerts
```

**Local Development:**
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. Never commit the `.env` file

### Supabase Setup

1. **Create a new Supabase project**
2. **Configure Authentication:**
   - Enable email/password auth
   - Set redirect URLs to your domain
   - Configure email templates
3. **Run the migration:**
   ```sql
   -- Copy and run the SQL from supabase/migrations/001_auth_setup.sql
   ```
4. **Set up RLS policies** (included in migration)

### Security Monitoring

The system includes comprehensive security monitoring:
- Failed login attempt tracking
- Suspicious activity detection
- Rate limiting on all endpoints
- Real-time security alerts via Slack
- Audit logging for all security events

### CI/CD Security Pipeline

Every push/PR runs:
- Dependency vulnerability scanning
- Secret detection (prevents service role key exposure)
- Code security analysis
- Authentication smoke tests
- Build security verification

### API Endpoints

**Public:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

**Protected:**
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/sessions` - Get user sessions

**Admin Only:**
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/role` - Update user role
- `POST /api/admin/users/:id/lock` - Lock/unlock account
- `GET /api/admin/security-logs` - View security logs

## Project info

**URL**: https://lovable.dev/projects/47587fe7-be7d-420d-b401-31b4eb966f6d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/47587fe7-be7d-420d-b401-31b4eb966f6d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/47587fe7-be7d-420d-b401-31b4eb966f6d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
