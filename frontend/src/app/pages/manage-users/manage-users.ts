import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.scss'],
})
export class ManageUsersPage implements OnInit {
  users: any[] = [];
  displayedColumns: string[] = [
    'username',
    'email',
    'role',
    'status',
    'actions',
  ];
  loading = false;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    // Your backend uses pagination by default
    this.http.get<any>('/api/users?limit=100').subscribe({
      next: (res) => {
        this.users = res.data; // Backend returns { data: users[] }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

toggleVerification(user: any) {
  // Determine current state: 1 is verified (true), 0 is unverified (false)
  const isCurrentlyVerified = user.verified === 1; 
  
  // Set the text for the dialog based on what we WANT to do
  const actionText = isCurrentlyVerified ? 'unverify' : 'verify';
  const buttonColor = isCurrentlyVerified ? 'warn' : 'primary';
  const buttonLabel = isCurrentlyVerified ? 'Unverify' : 'Verify';

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: { 
      message: `Are you sure you want to ${actionText} ${user.username}?`,
      buttonText: buttonLabel, // Pass a custom label to avoid "Delete" showing up
      color: buttonColor
    }
  });

  dialogRef.afterClosed().subscribe(confirmed => {
    if (confirmed) {
      // If they were verified (1), set to 0. If they were 0, set to 1.
      const newStatus = isCurrentlyVerified ? 0 : 1;

      this.http.put(`/api/users/${user.username}`, { verified: newStatus }).subscribe({
        next: () => {
          user.verified = newStatus;
          this.snackBar.open(`User ${user.username} is now ${newStatus === 1 ? 'verified' : 'unverified'}.`, 'OK', { duration: 2000 });
        },
        error: (err) => this.snackBar.open(err.error.error || 'Update failed', 'Close')
      });
    }
  });
}}
