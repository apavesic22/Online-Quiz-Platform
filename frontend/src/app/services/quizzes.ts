import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz } from '../models/quiz';

interface QuizResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Quiz[];
}

@Injectable({ providedIn: 'root' })
export class QuizzesService {
  private apiUrl = '/api/quizzes';

  constructor(private http: HttpClient) {}

  getQuizzes(page = 1, limit = 10): Observable<QuizResponse> {
    return this.http.get<QuizResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }
}
