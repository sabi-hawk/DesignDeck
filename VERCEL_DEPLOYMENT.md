# Vercel Deployment Guide for DesignDeck

This guide will help you deploy the DesignDeck frontend application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed (optional, for CLI deployment)
3. Your backend API URL ready

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel will auto-detect the settings

3. **Configure Project Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: Leave as default (root)
   - **Build Command**: `pnpm run build` (or leave empty - vercel.json will handle it)
   - **Output Directory**: `dist/apps/editor`
   - **Install Command**: `pnpm install --frozen-lockfile` (or leave empty - vercel.json will handle it)
   
   **Note**: The project uses `pnpm` (detected by `pnpm-lock.yaml`). Vercel will auto-detect this, but you can also manually set it.

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_API_URL=https://editor-api.lidojs.com
   ```
   
   Optional (for Sentry source maps):
   ```
   SENTRY_AUTH_TOKEN=your-sentry-auth-token
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   For production deployment:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables via CLI**
   ```bash
   vercel env add VITE_API_URL production
   # Enter: https://editor-api.lidojs.com
   ```

## Environment Variables

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://editor-api.lidojs.com` | Backend API URL for production |

### Optional Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `SENTRY_AUTH_TOKEN` | Your Sentry token | Required for Sentry source maps upload |

## Build Configuration

The project uses the following build settings (configured in `vercel.json`):

- **Package Manager**: `pnpm` (auto-detected from `pnpm-lock.yaml`)
- **Install Command**: `pnpm install --frozen-lockfile`
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist/apps/editor`
- **Framework**: Vite
- **Node Version**: Auto-detected (recommended: 18.x or higher)

**Note**: If you prefer to use npm instead, you can set the install command to `npm install --legacy-peer-deps` to resolve peer dependency conflicts.

## Post-Deployment

After deployment:

1. **Update Backend CORS Settings**
   - Make sure your backend server allows requests from your Vercel domain
   - Update `FRONTEND_URL` in your backend `.env` to include your Vercel URL

2. **Test the Application**
   - Visit your Vercel deployment URL
   - Test authentication, project saving, and media uploads
   - Check browser console for any errors

3. **Custom Domain (Optional)**
   - Go to your project settings in Vercel
   - Navigate to "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

## Troubleshooting

### Build Fails

- **Peer Dependency Conflicts**: If you see `ERESOLVE` errors, the project uses `pnpm` which handles peer dependencies better. Make sure `vercel.json` uses `pnpm install --frozen-lockfile`. If you must use npm, add `--legacy-peer-deps` flag.
- Check Node.js version (should be 18.x or higher)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard
- Verify `pnpm-lock.yaml` is committed to your repository

### Environment Variables Not Working

- Make sure variables are prefixed with `VITE_` for Vite to expose them
- Redeploy after adding new environment variables
- Check that variables are set for the correct environment (Production/Preview/Development)

### API Connection Issues

- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings
- Ensure backend is accessible from Vercel's servers

### 404 Errors on Routes

- The `vercel.json` includes a rewrite rule for SPA routing
- If issues persist, check that `index.html` is in the output directory

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or pull requests

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
