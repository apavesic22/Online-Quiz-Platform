import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  title = 'Quizify';

  // TEMPORARY (will be replaced by AuthService later)
  isLoggedIn = false;

  onLogin() {
    // later: open login dialog
    console.log('Login clicked');
  }

  onLogout() {
    // later: logout via AuthService
    console.log('Logout clicked');
  }
}
