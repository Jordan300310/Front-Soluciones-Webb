import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { CartStore } from './../../core/store/cart.store';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public cartStore = inject(CartStore);

  private auth = inject(AuthService);
  private router = inject(Router);

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get roles(): string[] {
    return this.auth.getRoles();
  }

  get username(): string | null {
    return localStorage.getItem('username');
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/']);
  }
}
