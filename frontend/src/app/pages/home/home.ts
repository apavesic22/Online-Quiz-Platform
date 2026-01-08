import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { QuizzesService } from '../../services/quizzesService';
import { Quiz } from '../../models/quiz';
import { HttpClient } from '@angular/common/http';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'home-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule, MatIcon],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomePage implements OnInit {
  quizzes: Quiz[] = [];
  loading = true;
  
  // Pagination variables
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  constructor(private quizzesService: QuizzesService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;
    
    // Pass the page to your service (Ensure your service accepts page as an argument)
    this.quizzesService.getQuizzes(this.currentPage).subscribe({
      next: res => {
        this.quizzes = res.data;
        this.totalPages = res.totalPages;
        this.generatePageNumbers();
        this.loading = false;
        window.scrollTo(0, 0); // Scroll to top when changing page
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  generatePageNumbers(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  toggleLike(quiz: any) {
  this.http.post<any>(`/api/quizzes/${quiz.quiz_id}/like`, {})
    .subscribe(res => {
      quiz.user_has_liked = res.liked ? 1 : 0;
      quiz.likes = res.liked ? quiz.likes + 1 : quiz.likes - 1;
    });
}
}