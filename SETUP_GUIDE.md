# Angular Portfolio Setup Guide

## Overview
Your personal webpage has been migrated from HTML/CSS to Angular with modern design using Angular Material. The application includes:

- **Modern responsive design** with Angular Material
- **Q&A section** with authentication and approval workflow
- **Blog section** with comments and approval workflow
- **Contact information** and professional details
- **Projects showcase**

## Prerequisites
- Node.js 18+ and npm
- Firebase project (free tier available at firebase.google.com)
- GitHub account for GitHub Pages deployment

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable the following services:
   - **Authentication**: Enable Email/Password authentication
   - **Firestore Database**: Create a Firestore database in production mode

### Firebase Configuration

1. Go to Project Settings → General
2. Find your web app credentials
3. Copy the Firebase config object
4. Update `/src/environments/environment.ts` and `/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
  }
};
```

## Step 2: Firebase Security Rules

1. In Firebase Console, go to Firestore Database → Rules
2. Copy and paste the rules from `FIREBASE_SECURITY_RULES.md`
3. Click "Publish"

## Step 3: Create Admin Panel (Optional but Recommended)

For managing question/post approvals, create a Cloud Function or admin component:

```typescript
// Example: Call from secure backend
async approveQuestion(questionId: string) {
  // This should be done via Cloud Function authenticated with custom claims
  await this.firestoreService.approveQuestion(questionId);
}
```

## Step 4: Authentication UI Setup

The application requires an authentication component. Add the following to your Navigation component or create a new AuthComponent:

```typescript
// In your auth-dialog or header component
async login(): Promise<void> {
  const email = prompt('Enter email:');
  const password = prompt('Enter password:');
  if (email && password) {
    try {
      await this.authService.login(email, password);
      this.snackBar.open('Logged in successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Login failed', 'Close', { duration: 3000 });
    }
  }
}

async register(): Promise<void> {
  const email = prompt('Enter email:');
  const password = prompt('Enter password:');
  if (email && password) {
    try {
      await this.authService.register(email, password);
      this.snackBar.open('Account created!', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Registration failed', 'Close', { duration: 3000 });
    }
  }
}
```

## Step 5: Build and Test Locally

```bash
# Install dependencies
npm install

# Run development server
ng serve

# Navigate to http://localhost:4200/
```

## Step 6: GitHub Pages Deployment

### Configure Angular for GitHub Pages

Edit `angular.json`:
- Set `outputPath` to `dist/rreho.github.io`
- Set `baseHref` to `/` (for username.github.io) or `/repo-name/` (for project repo)

```json
{
  "projects": {
    "rreho-portfolio": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/rreho.github.io",
            "baseHref": "/"
          }
        }
      }
    }
  }
}
```

### Build and Deploy

```bash
# Build for production
ng build --configuration production

# The output will be in dist/rreho.github.io/
# Push to GitHub Pages:

# 1. Make sure your GitHub repo settings have GitHub Pages enabled
# 2. Set the source to "deploy from a branch" → "gh-pages" branch
# 3. Or use angular-cli-ghpages tool:

npm install -g angular-cli-ghpages

ngh --dir=dist/rreho.github.io
```

## Step 7: Environment Variables (Security)

**IMPORTANT**: Never commit Firebase credentials to version control!

For production deployments:
1. Use environment-specific builds
2. Consider using Firebase Hosting instead of GitHub Pages for easier secret management
3. Or use GitHub Secrets with CI/CD pipeline

```bash
# Example GitHub Actions workflow (if using GitHub Hosting)
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: ng build --prod
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: 'YOUR_PROJECT_ID'
```

## Step 8: Post-Deployment Testing

1. Test Q&A functionality:
   - Sign in
   - Submit a question
   - Verify it appears in pending (not visible until approved)

2. Test Blog functionality:
   - Create a blog post
   - Add comments
   - Verify approval workflow

## Common Issues

### Issue: Firebase config not working
**Solution**: Make sure environment.ts is properly configured and imported

### Issue: CORS errors
**Solution**: Check Firebase Security Rules are properly configured

### Issue: Authentication not persisting
**Solution**: Add `localStorage` persistence in AuthService constructor:
```typescript
setPersistence(auth, browserLocalPersistence);
```

### Issue: Images not loading
**Solution**: Ensure images are in `/public/images` directory and use `/images/` paths

## Next Steps

1. Customize styling and colors in `src/styles.scss`
2. Add more content to Talks, Publications, About sections
3. Implement Cloud Functions for admin approval operations
4. Add email notifications for new submissions (via Cloud Functions)
5. Consider adding a contact form with email functionality

## Support & Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
