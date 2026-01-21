import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonalStats } from '../models/personal-stats';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private apiUrl = '/api/statistics';

  constructor(private http: HttpClient) {}

  getPersonalStats(): Observable<PersonalStats[]> {
    return this.http.get<PersonalStats[]>(`${this.apiUrl}/my-stats`);
  }

  getDifficultyStats(): Observable<{ label: string; count: number }[]> {
    return this.http.get<{ label: string; count: number }[]>(
      `${this.apiUrl}/difficulty-stats`,
    );
  }
}
