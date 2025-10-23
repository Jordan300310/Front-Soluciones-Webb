import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthStore } from '../../core/store/auth.store';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(public store: AuthStore, private router: Router) {}

  logout() {
    this.store.setUser(null);
    this.router.navigate(['/']);
  }
}
