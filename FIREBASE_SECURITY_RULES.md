# Firebase Security Rules for rreho-portfolio

## Firestore Rules

Copy and paste these rules into your Firestore Security Rules console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own user data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Questions collection
    match /questions/{questionId} {
      // Anyone can read approved questions
      allow read: if resource.data.approved == true;
      
      // Authenticated users can create new questions
      allow create: if request.auth != null 
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.approved == false
        && request.resource.data.createdAt == request.time;
      
      // Users can only update/delete their own unapproved questions
      allow update, delete: if request.auth.uid == resource.data.authorId 
        && resource.data.approved == false;
    }

    // Blog posts collection
    match /blogPosts/{postId} {
      // Anyone can read approved blog posts
      allow read: if resource.data.approved == true;
      
      // Authenticated users can create new blog posts
      allow create: if request.auth != null 
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.approved == false
        && request.resource.data.createdAt == request.time;
      
      // Users can only update/delete their own unapproved posts
      allow update, delete: if request.auth.uid == resource.data.authorId 
        && resource.data.approved == false;
    }

    // Comments collection
    match /comments/{commentId} {
      // Anyone can read approved comments
      allow read: if resource.data.approved == true;
      
      // Authenticated users can create new comments
      allow create: if request.auth != null 
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.approved == false
        && request.resource.data.createdAt == request.time;
      
      // Users can only update/delete their own unapproved comments
      allow update, delete: if request.auth.uid == resource.data.authorId 
        && resource.data.approved == false;
    }

    // Admin collection (protect with custom claims in your backend)
    match /admin/{document=**} {
      allow read, write: if false; // Disabled for now - implement via Cloud Functions
    }
  }
}
```

## Important Security Notes

1. **API Key Protection**: Never commit your Firebase API key or config to version control. Use environment variables.

2. **Authentication**: Implement Firebase Authentication in your Angular app with:
   - Email/Password authentication
   - Optional: Google Sign-In
   - Optional: GitHub Sign-In

3. **Approval Workflow**: Since admin operations are disabled at the Firestore level for security, implement a Cloud Function:
   - Create Cloud Function to approve/reject questions, posts, and comments
   - Call it from a secure admin panel (protected by custom claims)
   - Verify user claims on the backend before allowing approvals

4. **Rate Limiting**: Consider adding Cloud Function rate limiting to prevent spam submissions

5. **Data Validation**: All submissions are validated on the client side AND should be validated again in Cloud Functions

6. **User Email Privacy**: Only show first part of email or username to other users when displaying comments/posts

Before pushing to GitHub:
Push these:

src/app/ (all components & services)
src/environments/ (with YOUR_API_KEY placeholders)
public/ (images, PDFs, etc.)
package.json, package-lock.json
angular.json, tsconfig.json
_backup/ (old HTML)
DO NOT push:

node_modules/ (already in .gitignore)
dist/ (already in .gitignore)
Environment files with actual Firebase credentials