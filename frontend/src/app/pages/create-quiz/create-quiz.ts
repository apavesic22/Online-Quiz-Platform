import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';

import { CategoriesService } from '../../services/categories';
import { QuizzesService } from '../../services/quizzesService';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'create-quiz-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatRadioModule,
    MatIconModule,
  ],
  templateUrl: './create-quiz.html',
  styleUrls: ['./create-quiz.scss'],
})
export class CreateQuizPage implements OnInit {
  quizForm!: FormGroup;
  categories: any[] = [];
  difficulties: any[] = [];
  isVerifiedOrStaff = false;

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private quizService: QuizzesService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.quizForm = this.fb.group({
      quiz_name: ['', [Validators.required, Validators.minLength(3)]],
      category_id: [null, Validators.required],
      difficulty_id: [null, Validators.required],
      questions: this.fb.array([]),
    });
    this.authService.currentUser$.subscribe((user) => {
      this.isVerifiedOrStaff = !!user?.roles?.some((r) =>
        [1, 2, 3].includes(r)
      );
    });
    this.categoriesService
      .getCategories()
      .subscribe((res) => (this.categories = res));
    this.quizService
      .getDifficulties()
      .subscribe((res) => (this.difficulties = res));

    this.addQuestion();
  }

  get questions() {
    return this.quizForm.get('questions') as FormArray;
  }
  getOptions(qIdx: number) {
    return this.questions.at(qIdx).get('options') as FormArray;
  }

  addQuestion() {
    const user = (this.authService as any).currentUserSubject?.value;
    const isVerifiedOrStaff = user?.roles?.some((r: number) =>
      [1, 2, 3].includes(r)
    );

    if (!this.isVerifiedOrStaff && this.questions.length >= 5) {
      alert(
        'Unverified users and guests are limited to 5 questions. Please verify your account to add more!'
      );
      return;
    }
    const q = this.fb.group({
      text: ['', Validators.required],
      type: ['multiple', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
      ]),
      correct_answer_index: [null, Validators.required],
      boolean_correct: [null],
    });

    q.get('type')?.valueChanges.subscribe((type) => {
      const optionsArray = q.get('options') as FormArray;

      if (type === 'multiple') {
        // 1. Enable Multiple Choice Validators
        q.get('correct_answer_index')?.setValidators(Validators.required);

        // 2. RE-ADD validators to the 4 text options
        optionsArray.controls.forEach((control) => {
          control.setValidators(Validators.required);
          control.updateValueAndValidity();
        });

        // 3. Clear True/False
        q.get('boolean_correct')?.clearValidators();
        q.get('boolean_correct')?.setValue(null);
      } else {
        // 1. Enable True/False Validator
        q.get('boolean_correct')?.setValidators(Validators.required);

        // 2. REMOVE validators from the 4 text options
        optionsArray.controls.forEach((control) => {
          control.clearValidators();
          control.updateValueAndValidity();
        });

        // 3. Clear Multiple Choice index
        q.get('correct_answer_index')?.clearValidators();
        q.get('correct_answer_index')?.setValue(null);
      }

      q.get('boolean_correct')?.updateValueAndValidity();
      q.get('correct_answer_index')?.updateValueAndValidity();
    });

    this.questions.push(q);
  }
  submitQuiz() {
    if (this.quizForm.invalid) {
      alert(
        'Please fill out all fields and select the correct answer for every question.'
      );
      return;
    }

    const rawData = this.quizForm.value;
    const finalData = {
      ...rawData,
      questions: rawData.questions.map((q: any) => {
        const actualAnswer =
          q.type === 'multiple'
            ? q.options[q.correct_answer_index]
            : q.boolean_correct;
        return {
          text: q.text,
          type: q.type,
          correct_answer: actualAnswer,
          options: q.type === 'multiple' ? q.options : ['True', 'False'],
        };
      }),
    };

    this.quizService.createQuiz(finalData).subscribe({
      next: () => {
        alert(
          this.authService.isLoggedIn()
            ? 'Quiz created!'
            : 'Quiz created as Guest!'
        );
        this.router.navigate(['/']);
      },
      error: (err) => alert('Error: ' + (err.error?.error || 'Server error')),
    });
  }

  cancel(): void {
    this.router.navigate(['/']); // Redirects to the home page
  }
}
