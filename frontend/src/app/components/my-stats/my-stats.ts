import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';

export interface PersonalStats {
  quiz_name: string;
  your_score: number;
  total_questions: number;
  category_name: string;
  finished_at: string;
}

@Component({
  selector: 'app-my-stats',
  standalone: true,
  imports: [MatTableModule, MatCardModule, DatePipe],
  templateUrl: './my-stats.html',
})

export class MyStatsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'category', 'score', 'date'];
  dataSource: PersonalStats[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<[]>('/api/quizzes/my-stats').subscribe((data) => {
      this.dataSource = data;
    });
  }
}
