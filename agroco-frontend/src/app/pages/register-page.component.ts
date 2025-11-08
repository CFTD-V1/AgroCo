import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-background">
      <header class="auth-header" style="background-image:url('assets/farm-lifestyle-digital-art.jpg'); background-size:cover; background-position:center;">
        <div class="auth-header__inner">
          <div class="auth-brand">AgroCo</div>
        </div>
      </header>

      <div class="auth-card auth-panel">
        <h2 class="panel-title">Crear cuenta</h2>
        <form class="auth-form" (ngSubmit)="onSubmit()" novalidate>
          <label>Nombre completo
            <div class="auth-input-row">
              <span class="ico" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c0-4.2 3.8-7 8-7s8 2.8 8 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
              <input class="auth-input" [(ngModel)]="nombre" name="nombre" #nameCtrl="ngModel"
                     placeholder="Ej: Ana Maria Torres" required autocomplete="name" spellcheck="false" autocapitalize="words"
                     [attr.aria-invalid]="nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched)" />
            </div>
            <small class="field-error" *ngIf="nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched)">Ingresa tu nombre completo.</small>
          </label>

          <label>Ocupacion
            <div class="auth-input-row">
              <span class="ico" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12c4-6 8-6 12 0-4 6-8 6-12 0Z" stroke="currentColor" stroke-width="1.8"/></svg>
              </span>
              <input class="auth-input" [(ngModel)]="ocupacion" name="ocupacion" #occCtrl="ngModel" placeholder="Ej: Agricultor" />
            </div>
          </label>

          <label>Documento de identidad
            <div class="auth-input-row">
              <span class="ico" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M6 12h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
              <input class="auth-input" [(ngModel)]="documento" name="documento" #docCtrl="ngModel"
                     type="tel"
                     placeholder="Ej: 987654321" required inputmode="numeric" enterkeyhint="done"
                     minlength="6" maxlength="15" autocomplete="off"
                     (input)="onDocumentoInput($event)"
                     [attr.aria-invalid]="(!docValid) && (docCtrl.dirty || docCtrl.touched)" />
            </div>
            <small class="field-error" *ngIf="(!docValid) && (docCtrl.dirty || docCtrl.touched)">Documento inv&aacute;lido: usa entre 6 y 15 d&iacute;gitos (solo n&uacute;meros).</small>
          </label>

          <label>Email (opcional)
            <div class="auth-input-row">
              <span class="ico" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8l8 6 8-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/></svg>
              </span>
              <input class="auth-input" [(ngModel)]="email" name="email" #emailCtrl="ngModel" type="email" autocomplete="email" placeholder="Para enviarte el plan en PDF" />
            </div>
            <small class="field-error" *ngIf="emailCtrl.invalid && (emailCtrl.dirty || emailCtrl.touched)">Ingresa un correo valido.</small>
          </label>

          <div *ngIf="error" class="auth-error" aria-live="polite">{{ error }}</div>
          <button class="auth-big-cta" type="submit" [disabled]="auth.loading() || nameCtrl.invalid || !docValid || emailCtrl.invalid">Crear cuenta</button>
          <div class="auth-footer">
            &iquest;Ya tienes cuenta?
            <a routerLink="/login">Inicia sesi&oacute;n</a>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .auth-header{ display:grid; place-items:center; }
    .auth-header .auth-header__inner{ width:100%; max-width:none; padding:28px; text-align:center; color:#fff; }
    .auth-header .auth-brand{ font-family:'Outfit',system-ui,-apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight:900; letter-spacing:-0.02em; font-size:clamp(48px,8vw,72px); line-height:1.05; text-shadow:0 3px 12px rgba(0,0,0,0.35); }

    .auth-panel { background: rgba(255,255,255,0.92); backdrop-filter: saturate(120%) blur(2px); border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.14); max-width: 560px; margin: 96px auto 24px; padding: 32px 24px !important; }
    @media (max-width: 480px){ .auth-panel { margin: 72px auto 16px; padding: 28px 16px !important; } }

    .panel-title { margin: 0 0 12px; font-family: 'Outfit', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight: 900; letter-spacing: -0.02em; text-align: center; }
    .auth-form { display: grid; gap: 14px; }
    .auth-form label { font-weight: 650; color: #1f3526; }
    .auth-input-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 16px; background: #fff; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08); transition: box-shadow .15s ease, background .15s ease; }
    .auth-input-row:focus-within { box-shadow: inset 0 0 0 2px rgba(47,143,61,0.55), 0 2px 12px rgba(47,143,61,0.12); background: #ffffff; }
    .auth-input-row .ico { color: #2f8f3d; display:inline-flex; width: 28px; justify-content: center; }
    .auth-input { appearance: none; border: 0 !important; background: transparent !important; outline: none; width: 100%; min-height: 48px; font-size: 15px; color: #1f3526; }
    .auth-input::placeholder { color: #9ab0a3; }
    .field-error { color: #b64040; font-weight: 600; }
    .auth-big-cta { width: 100%; border: 0; border-radius: 999px; padding: 14px 20px; font-weight: 800; font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif; letter-spacing: 0.2px; color: #fff; background: linear-gradient(135deg, #2f8f3d 0%, #1f5f3a 100%); box-shadow: 0 16px 28px rgba(21,62,41,0.22); cursor: pointer; transition: transform .15s ease, box-shadow .15s ease; }
    .auth-big-cta:hover { transform: translateY(-2px); box-shadow: 0 20px 34px rgba(21,62,41,0.26); }
    .auth-big-cta:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: 0 8px 16px rgba(21,62,41,0.18); }
    .auth-footer { margin-top: 6px; color: #355d3f; text-align: center; }
    .auth-footer a { color: #1f5f3a; font-weight: 800; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class RegisterPageComponent {
  nombre = '';
  documento = '';
  ocupacion = 'agricultor';
  email = '';
  error: string | null = null;

  constructor(public auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.error = null;
    try {
      await this.auth.register({ nombre_completo: this.nombre, documento_identidad: this.documento, ocupacion: this.ocupacion, email: this.email || undefined });
      this.router.navigateByUrl('/');
    } catch (e: any) {
      const apiMsg = e?.error?.message;
      const apiErrors = e?.error?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const joined = (Object.values(apiErrors) as any[]).flat().join(' ');
        this.error = joined || apiMsg || 'No se pudo registrar';
      } else if (apiMsg) {
        this.error = apiMsg;
      } else if (e?.status === 0) {
        this.error = 'No se pudo conectar con el servidor. Verifica que el backend esta en http://localhost:8000.';
      } else {
        this.error = 'No se pudo registrar';
      }
    }
  }

  get docValid(): boolean {
    const s = (this.documento || '').toString().replace(/\D+/g, '');
    return s.length >= 6 && s.length <= 15;
  }

  onDocumentoInput(ev: Event) {
    const el = ev.target as HTMLInputElement;
    const cleaned = (el.value || '').toString().replace(/\D+/g, '').slice(0, 15);
    this.documento = cleaned;
    if (el.value !== cleaned) el.value = cleaned;
  }
}

