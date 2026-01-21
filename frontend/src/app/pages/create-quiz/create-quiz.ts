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
  difficulties = [
    { id: 1, difficulty: 'Easy' },
    { id: 2, difficulty: 'Medium' },
    { id: 3, difficulty: 'Hard' },
  ];
  isVerifiedOrStaff: boolean = false;

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private quizService: QuizzesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.quizForm = this.fb.group({
      quiz_name: ['', Validators.required],
      category_id: [null, Validators.required],
      difficulty_id: [null, Validators.required],
      duration: [15, [Validators.required, Validators.min(5), Validators.max(60)]],
      questions: this.fb.array([]),
    });

    this.authService.whoami().subscribe((user) => {
      this.isVerifiedOrStaff = !!(
        user && 
        ((user.role_id && user.role_id >= 1 && user.role_id <= 3) || user.verified)
      );

      if (!this.isVerifiedOrStaff) {
        this.quizForm.get('duration')?.setValue(15);
        this.quizForm.get('duration')?.disable();
      }
    });

    this.categoriesService.getCategories().subscribe((data) => (this.categories = data));
    this.addQuestion();
  }

  get questions() {
    return this.quizForm.get('questions') as FormArray;
  }

  addQuestion() {
    if (!this.isVerifiedOrStaff && this.questions.length >= 5) return;

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

    // CRITICAL FIX: Handle switching between Multiple Choice and True/False
    q.get('type')?.valueChanges.subscribe((type) => {
      const optionsArray = q.get('options') as FormArray;
      
      if (type === 'boolean') {
        // 1. Boolean logic
        q.get('boolean_correct')?.setValidators([Validators.required]);
        
        // 2. Clear Multiple Choice logic
        q.get('correct_answer_index')?.clearValidators();
        q.get('correct_answer_index')?.setValue(null);
        
        // 3. REMOVE Validators from the 4 input fields
        optionsArray.controls.forEach(control => {
          control.clearValidators();
          control.updateValueAndValidity();
        });
      } else {
        // 1. Multiple Choice logic
        q.get('correct_answer_index')?.setValidators([Validators.required]);
        
        // 2. Clear Boolean logic
        q.get('boolean_correct')?.clearValidators();
        q.get('boolean_correct')?.setValue(null);
        
        // 3. RESTORE Validators to the 4 input fields
        optionsArray.controls.forEach(control => {
          control.setValidators([Validators.required]);
          control.updateValueAndValidity();
        });
      }
      q.get('boolean_correct')?.updateValueAndValidity();
      q.get('correct_answer_index')?.updateValueAndValidity();
    });

    this.questions.push(q);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  getOptions(qIndex: number) {
    return (this.questions.at(qIndex).get('options') as FormArray).controls;
  }

  cancel() {
    this.router.navigate(['/']);
  }

  submitQuiz() {
    if (this.quizForm.invalid) {
       alert('Please fill out all fields correctly.');
       return;
    }

    const rawData = this.quizForm.getRawValue();
    const finalData = {
      ...rawData,
      duration: Number(rawData.duration),
      questions: rawData.questions.map((q: any) => {
        const actualAnswer = q.type === 'multiple' 
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
        alert('Quiz created successfully!');
        this.router.navigate(['/']);
      },
      error: (err) => console.error(err)
    });
  }
}