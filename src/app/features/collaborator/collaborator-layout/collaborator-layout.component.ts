import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-collaborator-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './collaborator-layout.component.html',
  styleUrls: ['./collaborator-layout.component.css'],
})
export class CollaboratorLayoutComponent {
  constructor(private auth: Auth) {}

  get userInitials(): string {
    return this.auth.getUserInitials() || 'C';
  }

  get displayName(): string {
    return this.auth.getFullName() || 'Collaborateur';
  }

  logout(): void {
    this.auth.logout();
  }
}
