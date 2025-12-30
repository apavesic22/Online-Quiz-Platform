import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { interval, Subscription } from 'rxjs';

import { QuizzesService } from '../../services/quizzes';
import { QuizQuestion, QuizAnswer } from '../../models/quiz-question';

@Component({
  selector: 'play-quiz-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './play-quiz.html',
  styleUrls: ['./play-quiz.scss']
})
export class PlayQuizPage implements OnInit, OnDestroy {
  quizId!: number;

  questions: QuizQuestion[] = [];
  currentIndex = 0;
  currentQuestion!: QuizQuestion;

  loading = true;

  // ---- game state ----
  timeLeft = 15;
  timerSub?: Subscription;
  answered = false;
  selectedAnswerId?: number;

  correctCount = 0;
  wrongCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizzesService: QuizzesService
  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));

    this.quizzesService.getQuizQuestions(this.quizId).subscribe({
      next: questions => {
        this.questions = questions;
        this.currentQuestion = this.questions[0];
        this.loading = false;
        this.startTimer();
      },
      error: () => {
        alert('Failed to load quiz');
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // ---------------- TIMER ----------------

  startTimer() {
    this.stopTimer();
    this.timeLeft = this.currentQuestion.time_limit ?? 15;

    this.timerSub = interval(1000).subscribe(() => {
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        this.handleTimeout();
      }
    });
  }

  stopTimer() {
    this.timerSub?.unsubscribe();
  }

  // ---------------- ANSWERS ----------------

  selectAnswer(answer: QuizAnswer) {
    if (this.answered) return;

    this.answered = true;
    this.selectedAnswerId = answer.answer_id;
    this.stopTimer();

    if (answer.is_correct === 1) {
      this.correctCount++;
    } else {
      this.wrongCount++;
    }

    setTimeout(() => this.nextQuestion(), 1200);
  }

  handleTimeout() {
    if (this.answered) return;

    this.answered = true;
    this.wrongCount++;
    this.stopTimer();

    setTimeout(() => this.nextQuestion(), 1200);
  }

  // ---------------- NAVIGATION ----------------

  nextQuestion() {
    this.answered = false;
    this.selectedAnswerId = undefined;

    this.currentIndex++;

    if (this.currentIndex >= this.questions.length) {
      this.finishQuiz();
      return;
    }

    this.currentQuestion = this.questions[this.currentIndex];
    this.startTimer();
  }

  finishQuiz() {
    alert(
      `Quiz finished!\n\nCorrect: ${this.correctCount}\nIncorrect: ${this.wrongCount}`
    );
    this.router.navigate(['/']);
  }

  // ---------------- HELPERS ----------------

  isCorrect(answer: QuizAnswer): boolean {
    return answer.is_correct === 1;
  }

  isSelected(answer: QuizAnswer): boolean {
    return this.selectedAnswerId === answer.answer_id;
  }
}
