import { Injectable } from '@angular/core';
import { db } from './firebase.config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';

export interface Question {
  id?: string;
  authorId: string;
  authorEmail: string;
  title: string;
  content: string;
  approved: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface BlogPost {
  id?: string;
  authorId: string;
  authorEmail: string;
  title: string;
  content: string;
  excerpt?: string;
  approved: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Comment {
  id?: string;
  postId: string;
  authorId: string;
  authorEmail: string;
  content: string;
  approved: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor() {}

  async addQuestion(question: Omit<Question, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'questions'), question);
      return docRef.id;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  async getApprovedQuestions(): Promise<Question[]> {
    try {
      const q = query(collection(db, 'questions'), where('approved', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  async getUserQuestions(userId: string): Promise<Question[]> {
    try {
      const q = query(collection(db, 'questions'), where('authorId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    } catch (error) {
      console.error('Error fetching user questions:', error);
      throw error;
    }
  }

  async getPendingQuestions(): Promise<Question[]> {
    try {
      const q = query(collection(db, 'questions'), where('approved', '==', false));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    } catch (error) {
      console.error('Error fetching pending questions:', error);
      throw error;
    }
  }

  async updateQuestion(id: string, data: Partial<Question>): Promise<void> {
    try {
      await updateDoc(doc(db, 'questions', id), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  async approveQuestion(id: string): Promise<void> {
    await this.updateQuestion(id, { approved: true });
  }

  async deleteQuestion(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'questions', id));
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  async addBlogPost(post: Omit<BlogPost, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'blogPosts'), post);
      return docRef.id;
    } catch (error) {
      console.error('Error adding blog post:', error);
      throw error;
    }
  }

  async getApprovedBlogPosts(): Promise<BlogPost[]> {
    try {
      const q = query(collection(db, 'blogPosts'), where('approved', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)).sort((a, b) =>
        b.createdAt.toMillis() - a.createdAt.toMillis()
      );
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  }

  async getBlogPost(id: string): Promise<BlogPost | null> {
    try {
      const docSnap = await getDoc(doc(db, 'blogPosts', id));
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as BlogPost) : null;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  }

  async updateBlogPost(id: string, data: Partial<BlogPost>): Promise<void> {
    try {
      await updateDoc(doc(db, 'blogPosts', id), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  async approveBlogPost(id: string): Promise<void> {
    await this.updateBlogPost(id, { approved: true });
  }

  async deleteBlogPost(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'blogPosts', id));
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  async addComment(comment: Omit<Comment, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'comments'), comment);
      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getApprovedComments(postId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        where('approved', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)).sort((a, b) =>
        a.createdAt.toMillis() - b.createdAt.toMillis()
      );
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async getPendingComments(): Promise<Comment[]> {
    try {
      const q = query(collection(db, 'comments'), where('approved', '==', false));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    } catch (error) {
      console.error('Error fetching pending comments:', error);
      throw error;
    }
  }

  async updateComment(id: string, data: Partial<Comment>): Promise<void> {
    try {
      await updateDoc(doc(db, 'comments', id), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  async approveComment(id: string): Promise<void> {
    await this.updateComment(id, { approved: true });
  }

  async deleteComment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}
