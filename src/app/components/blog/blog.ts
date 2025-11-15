import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from '../../services/auth';
import { FirestoreService, BlogPost, Comment } from '../../services/firestore';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule
  ],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class BlogComponent implements OnInit {
  blogForm: FormGroup;
  commentForm: FormGroup;
  blogPosts: BlogPost[] = [];
  postComments: { [key: string]: Comment[] } = {};
  loading = false;
  isAuthenticated = false;
  isAdmin = false;
  currentUserEmail: string | null = null;
  adminEmail = 'riccardoreho95@gmail.com';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private snackBar: MatSnackBar
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      excerpt: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(20)]]
    });

    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.loadBlogPosts();
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUserEmail = user?.email || null;
      this.isAdmin = this.currentUserEmail === this.adminEmail;
    });
  }

  async loadBlogPosts(): Promise<void> {
    this.loading = true;
    try {
      this.blogPosts = await this.firestoreService.getApprovedBlogPosts();
      for (const post of this.blogPosts) {
        if (post.id) {
          this.postComments[post.id] = await this.firestoreService.getApprovedComments(post.id);
        }
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      this.snackBar.open('Error loading blog posts', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async submitBlogPost(): Promise<void> {
    if (this.blogForm.invalid || !this.isAdmin) return;

    const currentUser = (await this.authService.getCurrentUser().toPromise()) as any;
    if (!currentUser || currentUser.email !== this.adminEmail) {
      this.snackBar.open('Only the admin can post blog articles', 'Close', { duration: 3000 });
      return;
    }

    try {
      const post: Omit<BlogPost, 'id'> = {
        ...this.blogForm.value,
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        approved: true,
        createdAt: Timestamp.now()
      };

      await this.firestoreService.addBlogPost(post);
      this.blogForm.reset();
      this.snackBar.open('Blog post published!', 'Close', { duration: 3000 });
      this.loadBlogPosts();
    } catch (error) {
      console.error('Error submitting blog post:', error);
      this.snackBar.open('Error submitting blog post', 'Close', { duration: 3000 });
    }
  }

  async submitComment(postId: string): Promise<void> {
    if (this.commentForm.invalid || !this.isAuthenticated) return;

    const currentUser = (await this.authService.getCurrentUser().toPromise()) as any;
    if (!currentUser) {
      this.snackBar.open('Please log in first', 'Close', { duration: 3000 });
      return;
    }

    try {
      const comment: Omit<Comment, 'id'> = {
        postId,
        content: this.commentForm.get('content')!.value,
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        approved: false,
        createdAt: Timestamp.now()
      };

      await this.firestoreService.addComment(comment);
      this.commentForm.reset();
      this.snackBar.open('Comment submitted! Awaiting approval.', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error submitting comment:', error);
      this.snackBar.open('Error submitting comment', 'Close', { duration: 3000 });
    }
  }

  getComments(postId: string): Comment[] {
    return this.postComments[postId] || [];
  }

  formatDate(date: Timestamp): string {
    return date.toDate().toLocaleDateString();
  }
}
