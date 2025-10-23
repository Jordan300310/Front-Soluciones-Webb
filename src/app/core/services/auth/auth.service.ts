import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SessionUser } from '../../models/auth/SessionUser';
import { LoginRequest } from '../../models/auth/LoginRequest';
import { LoginResponse } from '../../models/auth/LoginResponse';
import { RegisterRequest } from '../../models/auth/RegisterRequest';
import { RegisterResponse } from '../../models/auth/RegisterResponse';

import { AuthStore } from '../../store/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(AuthStore);
  private base = `${environment.api}/auth`;

  async me(): Promise<SessionUser | null> {
    try {
      const me = await firstValueFrom(this.http.get<SessionUser>(`${this.base}/me`));
      this.store.setUser(me);
      return me;
    } catch {
      this.store.setUser(null);
      return null;
    }
  }

  async login(body: LoginRequest): Promise<LoginResponse> {
    const resp = await firstValueFrom(this.http.post<LoginResponse>(`${this.base}/login`, body));
    await this.me();     // hidrata el store con la cookie de sesión
    return resp;
  }

  async register(body: RegisterRequest): Promise<RegisterResponse> {
    return await firstValueFrom(this.http.post<RegisterResponse>(`${this.base}/register`, body));
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${this.base}/logout`, {}));
    this.store.setUser(null);
  }
}
