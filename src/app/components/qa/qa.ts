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
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../services/auth';
import { FirestoreService, Question } from '../../services/firestore';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-qa',
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
    MatTabsModule
  ],
  templateUrl: './qa.html',
  styleUrl: './qa.scss'
})
export class QaComponent implements OnInit {
  questionForm: FormGroup;
  approvedQuestions: Question[] = [];
  loading = false;
  isAuthenticated = false;
  currentUserEmail: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private snackBar: MatSnackBar
  ) {
    this.questionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadQuestions();
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUserEmail = user?.email || null;
    });
  }

  async loadQuestions(): Promise<void> {
    this.loading = true;
    try {
      this.approvedQuestions = await this.firestoreService.getApprovedQuestions();
    } catch (error) {
      console.error('Error loading questions:', error);
      this.snackBar.open('Error loading questions', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async submitQuestion(): Promise<void> {
    if (this.questionForm.invalid || !this.isAuthenticated) return;

    const currentUser = (await this.authService.getCurrentUser().toPromise()) as any;
    if (!currentUser) {
      this.snackBar.open('Please log in first', 'Close', { duration: 3000 });
      return;
    }

    try {
      const question: Omit<Question, 'id'> = {
        ...this.questionForm.value,
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        approved: false,
        createdAt: Timestamp.now()
      };

      await this.firestoreService.addQuestion(question);
      this.questionForm.reset();
      this.snackBar.open('Question submitted! Awaiting approval.', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error submitting question:', error);
      this.snackBar.open('Error submitting question', 'Close', { duration: 3000 });
    }
  }

  formatDate(date: Timestamp): string {
    return date.toDate().toLocaleDateString();
  }
}
