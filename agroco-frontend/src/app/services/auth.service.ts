import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

type User = {
  id: number;
  nombre_completo: string;
  email?: string | null;
  documento_mascara?: string;
  avatar_url?: string | null;
  telefono?: string | null;
  ocupacion?: string | null;
  tipo_documento?: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(localStorage.getItem('agroco_token'));
  private _user = signal<User | null>(null);
  loading = signal<boolean>(false);

  constructor(private api: ApiService) {
    if (this._token()) this.me();
  }

  token() { return this._token(); }
  user() { return this._user(); }

  async login(data: { nombre_completo: string; documento_identidad: string }) {
    this.loading.set(true);
    try {
      const res = await this.api.post<{ token: string } & any>('/api/v1/login', data, false);
      this._token.set(res!.token);
      localStorage.setItem('agroco_token', res!.token);
      await this.me();
    } finally { this.loading.set(false); }
  }

  async register(data: { nombre_completo: string; documento_identidad: string; ocupacion: string; email?: string }) {
    this.loading.set(true);
    try {
      await this.api.post('/api/v1/register', data, false);
      await this.login({ nombre_completo: data.nombre_completo, documento_identidad: data.documento_identidad });
    } finally { this.loading.set(false); }
  }

  async logout() {
    try { if (this._token()) await this.api.post('/api/v1/logout', {}, true); } catch {}
    this._token.set(null); this._user.set(null); localStorage.removeItem('agroco_token');
  }

  async changePassword(current_password: string, new_password: string) {
    return this.api.post('/api/v1/password/change', { current_password, new_password }, true);
  }

  async updateEmail(email: string | null | undefined) {
    const res = await this.api.put<Partial<User>>('/api/v1/profile', { email: email ?? null }, true);
    // refrescar usuario para mantener consistencia
    await this.me();
    return res;
  }

  async updateProfile(data: { email?: string | null; nombre_completo?: string; ocupacion?: string | null; telefono?: string | null }) {
    const res = await this.api.put<Partial<User>>('/api/v1/profile', data, true);
    await this.me();
    return res;
  }

  async updatePhoto(file: File) {
    const form = new FormData();
    form.append('photo', file);
    await this.api.post('/api/v1/profile/photo', form as any, true);
    await this.me();
  }

  private async me() {
    try { const me = await this.api.get<User>('/api/v1/me', true); this._user.set(me!); } catch { this._token.set(null); localStorage.removeItem('agroco_token'); }
  }
}
