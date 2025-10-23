import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from './core/store/auth.store';
import { AuthService } from './core/services/auth/auth.service';
import { Router } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
})
export class App {
  private router = inject(Router);
  store = inject(AuthStore);
  private auth = inject(AuthService);
  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
