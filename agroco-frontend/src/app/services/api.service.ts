import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiUrl;
  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('agroco_api');
    if (stored) {
      this.base = stored as string;
    }
    try {
      const cap = (window as any).Capacitor;
      const platform = cap?.getPlatform?.() || cap?.platform;
      if (platform === 'android' && typeof this.base === 'string' && this.base.includes('localhost')) {
        this.base = this.base.replace('localhost', '10.0.2.2');
      }
    } catch {}
  }

  get<T>(path: string, auth = false) {
    return firstValueFrom(this.http.get<T>(this.buildUrl(path), { headers: this.headers(auth) }));
  }
  post<T>(path: string, body: any, auth = false) {
    return firstValueFrom(this.http.post<T>(this.buildUrl(path), body, { headers: this.headers(auth) }));
  }
  put<T>(path: string, body: any, auth = false) {
    return firstValueFrom(this.http.put<T>(this.buildUrl(path), body, { headers: this.headers(auth) }));
  }
  delete<T>(path: string, auth = false) {
    return firstValueFrom(this.http.delete<T>(this.buildUrl(path), { headers: this.headers(auth) }));
  }

  private headers(auth: boolean): HttpHeaders {
    let h = new HttpHeaders().set('Accept', 'application/json');
    if (auth) {
      const token = localStorage.getItem('agroco_token');
      if (token) h = h.set('Authorization', `Bearer ${token}`);
    }
    return h;
  }

  private buildUrl(path: string): string {
    // Normaliza evitando dobles / y dobles prefijos /api
    const base = (this.base || '').replace(/\/+$/, '');
    let p = (path || '').trim();
    if (!p.startsWith('/')) p = '/' + p;
    // Evita /api + /api/... cuando el base ya termina en /api
    if (base.endsWith('/api') && p.startsWith('/api/')) {
      p = p.replace(/^\/api/, '');
    }
    return base + p;
  }
}

