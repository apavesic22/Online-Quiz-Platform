import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';

import { CategoriesService } from '../../services/categories';
import { QuizzesService } from '../../services/quizzes';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'create-quiz-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, 
    MatSelectModule, MatButtonModule, MatFormFieldModule, MatRadioModule, MatIconModule,
  ],
  templateUrl: './create-quiz.html',
  styleUrls: ['./create-quiz.scss'],
})
export class CreateQuizPage implements OnInit {
  quizForm!: FormGroup;
  categories: any[] = [];
  difficulties: any[] = [];

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

    this.categoriesService.getCategories().subscribe(res => this.categories = res);
    this.quizService.getDifficulties().subscribe(res => this.difficulties = res);
    
    this.addQuestion(); 
  }

  get questions() { return this.quizForm.get('questions') as FormArray; }
  getOptions(qIdx: number) { return this.questions.at(qIdx).get('options') as FormArray; }

  addQuestion() {
    const q = this.fb.group({
      text: ['', Validators.required],
      type: ['multiple', Validators.required],
      correct_answer_index: [null, Validators.required], // Store index 0-3
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
      ]),
      boolean_correct: [null]
    });

    q.get('type')?.valueChanges.subscribe(type => {
      if (type === 'boolean') {
        q.get('boolean_correct')?.setValidators(Validators.required);
        q.get('correct_answer_index')?.clearValidators();
      } else {
        q.get('correct_answer_index')?.setValidators(Validators.required);
        q.get('boolean_correct')?.clearValidators();
      }
      q.get('boolean_correct')?.updateValueAndValidity();
      q.get('correct_answer_index')?.updateValueAndValidity();
    });

    this.questions.push(q);
  }

  submitQuiz() {
    if (this.quizForm.invalid) {
      alert('Please fill out all fields and select the correct answer for every question.');
      return;
    }

    const rawData = this.quizForm.value;
    const finalData = {
      ...rawData,
      questions: rawData.questions.map((q: any) => {
        const actualAnswer = q.type === 'multiple' ? q.options[q.correct_answer_index] : q.boolean_correct;
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
        alert(this.authService.isLoggedIn() ? 'Quiz created!' : 'Quiz created as Guest!');
        this.router.navigate(['/']);
      },
      error: (err) => alert('Error: ' + (err.error?.error || 'Server error'))
    });
  }
}