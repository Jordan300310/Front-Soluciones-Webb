import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest } from '../../models/auth/LoginRequest';
import { LoginResponse } from '../../models/auth/LoginResponse';
import { RegisterRequest } from '../../models/auth/RegisterRequest';
import { RegisterResponse } from '../../models/auth/RegisterResponse';
import { MeResponse } from '../../models/auth/MeResponse';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.api}/auth`;

  private tokenKey  = 'token';
  private rolesKey  = 'roles';
  private userKey   = 'username';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRoles(): string[] {
    const raw = localStorage.getItem(this.rolesKey);
    return raw ? JSON.parse(raw) : [];
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  async me(): Promise<MeResponse | null> {
    try {
      const me = await firstValueFrom(
        this.http.get<MeResponse>(`${this.base}/me`)
      );
      localStorage.setItem(this.userKey, me.username);
      localStorage.setItem(this.rolesKey, JSON.stringify(me.roles ?? []));
      return me;
    } catch {
      return null;
    }
  }

  async login(body: LoginRequest): Promise<LoginResponse> {
    const resp = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.base}/login`, body)
    );

    localStorage.setItem(this.tokenKey, resp.token);
    localStorage.setItem(this.rolesKey, JSON.stringify(resp.roles ?? []));
    await this.me();

    return resp;
  }

  async register(body: RegisterRequest): Promise<RegisterResponse> {
    return await firstValueFrom(
      this.http.post<RegisterResponse>(`${this.base}/register`, body)
    );
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>(`${this.base}/logout`, {}));
    } catch {}
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolesKey);
    localStorage.removeItem(this.userKey);
  }
}
