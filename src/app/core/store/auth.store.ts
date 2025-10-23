import { Injectable, computed, signal } from '@angular/core';
import { SessionUser } from '../models/auth/SessionUser';


@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _user = signal<SessionUser | null>(null);

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());
  roles = computed(() => this._user()?.roles ?? []);

  setUser(u: SessionUser | null) { this._user.set(u); }
}