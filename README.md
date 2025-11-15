# Riccardo Reho - Personal Portfolio

A modern, responsive personal portfolio website built with **Angular** and **Angular Material**, featuring interactive Q&A and Blog sections powered by **Firebase**.

## 🌟 Features

- **Modern Responsive Design** - Built with Angular Material for a professional look
- **Q&A Section** - Ask questions about my research (with authentication & approval workflow)
- **Blog & Thoughts** - Read my reflections on physics and science (with comments)
- **Contact Information** - Easy access to email, GitHub, LinkedIn, ORCID, and Google Scholar
- **Project Showcase** - Highlights of my active research projects
- **Dark/Light Theme Support** - Comfortable viewing experience

## 🏗️ Tech Stack

- **Frontend**: Angular 20, Angular Material, RxJS, SCSS
- **Backend**: Firebase (Firestore, Authentication)
- **Deployment**: GitHub Pages
- **Build Tool**: Angular CLI

## 📋 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── header/          # Header with profile info
│   │   ├── navigation/       # Main navigation bar
│   │   ├── home/            # Home page (about, projects, experience)
│   │   ├── talks/           # Talks & presentations
│   │   ├── publications/    # Publications
│   │   ├── about/           # About me
│   │   ├── outreach/        # Outreach activities
│   │   ├── qa/              # Q&A section
│   │   └── blog/            # Blog & comments
│   ├── services/
│   │   ├── auth.ts          # Firebase authentication
│   │   ├── firestore.ts     # Firestore data management
│   │   └── firebase.config.ts # Firebase initialization
│   ├── app.routes.ts        # Routing configuration
│   ├── app.config.ts        # Application configuration
│   └── app.ts               # Root component
├── environments/
│   ├── environment.ts       # Development config
│   └── environment.prod.ts  # Production config
├── styles.scss              # Global styles
└── main.ts                  # Application bootstrap
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project (free tier available)
- GitHub account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/rreho/rreho.github.io.git
cd rreho.github.io

# Install dependencies
npm install

# Update Firebase configuration
# Edit src/environments/environment.ts with your Firebase credentials
```

### Development Server

```bash
# Start the dev server
npm start

# Navigate to http://localhost:4200/
# The app will automatically reload when you modify files
```

### Build for Production

```bash
# Build for production
npm run build:prod

# Output is in dist/rreho-portfolio/browser/
```

## 🔐 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Create a **Firestore Database** (production mode)

### 2. Configure Environment Variables

Update your Firebase credentials in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

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

### 3. Apply Firestore Security Rules

In Firebase Console → Firestore → Rules, apply the rules from `FIREBASE_SECURITY_RULES.md`

## 📝 Database Collections

### Questions Collection
- `id` (auto-generated)
- `authorId` (user ID)
- `authorEmail` (user email)
- `title` (string)
- `content` (string)
- `approved` (boolean)
- `createdAt` (timestamp)

### Blog Posts Collection
- `id` (auto-generated)
- `authorId` (user ID)
- `authorEmail` (user email)
- `title` (string)
- `excerpt` (string)
- `content` (string)
- `approved` (boolean)
- `createdAt` (timestamp)

### Comments Collection
- `id` (auto-generated)
- `postId` (blog post ID)
- `authorId` (user ID)
- `authorEmail` (user email)
- `content` (string)
- `approved` (boolean)
- `createdAt` (timestamp)

## 🌐 Deployment

### GitHub Pages Deployment

```bash
# Install angular-cli-ghpages if not already installed
npm install -g angular-cli-ghpages

# Build and deploy
npm run build:prod
ngh --dir=dist/rreho-portfolio/browser
```

### Manual Deployment

1. Build the project: `npm run build:prod`
2. Copy contents of `dist/rreho-portfolio/browser/` to your GitHub Pages branch
3. Push to `gh-pages` branch or commit to `main` (depending on your GitHub Pages settings)

## 🔒 Security Considerations

- **API Keys**: Never commit Firebase credentials to version control. Use environment variables.
- **Data Validation**: All inputs are validated on client AND server side (via Firestore rules)
- **Authentication**: Required for submitting questions, posts, and comments
- **Approval Workflow**: All user-generated content requires admin approval before public display

### Best Practices

1. Use environment-specific builds
2. Never expose secrets in source code
3. Keep Firestore security rules up-to-date
4. Implement rate limiting via Cloud Functions (optional)
5. Monitor Firestore usage and costs

## 🛠️ Development

### Adding New Components

```bash
ng generate component components/my-component
```

### Adding New Services

```bash
ng generate service services/my-service
```

### Running Tests

```bash
npm test
```

### Linting (if configured)

```bash
ng lint
```

## 📚 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup and configuration guide
- [FIREBASE_SECURITY_RULES.md](./FIREBASE_SECURITY_RULES.md) - Firestore security rules

## 🤝 Contributing

This is a personal portfolio, but feel free to fork and customize for your own use!

## 📄 License

This project is open source and available for personal use.

## 📧 Contact

- Email: r.reho@uu.nl
- GitHub: [rreho](https://github.com/rreho)
- LinkedIn: [Riccardo Reho](https://www.linkedin.com/in/riccardo-reho-997888245/)
- ORCID: [0009-0002-3703-1292](https://orcid.org/0009-0002-3703-1292)

## 🙏 Acknowledgments

- Built with [Angular](https://angular.io/)
- Styled with [Angular Material](https://material.angular.io/)
- Powered by [Firebase](https://firebase.google.com/)
- Deployed on [GitHub Pages](https://pages.github.com/)

---

Last updated: November 2025
