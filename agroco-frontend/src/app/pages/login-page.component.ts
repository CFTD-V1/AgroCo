﻿import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-background">
      <header class="auth-header" style="background-image:url('assets/farm-lifestyle-digital-art.jpg'); background-size:cover; background-position:center;">
        <div class="auth-header__inner">
          <div class="auth-brand">AgroCo</div>
        </div>
      </header>

      <div class="auth-card auth-panel">
        <h2 class="panel-title">Inicio de sesi&oacute;n</h2>
        <form class="auth-form" (ngSubmit)="onSubmit()" novalidate>
          <label>Nombre completo
            <div class="auth-input-row">
              <span class="ico" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c0-4.2 3.8-7 8-7s8 2.8 8 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
              <input class="auth-input" [(ngModel)]="nombre" name="nombre" #nameCtrl="ngModel"
                     placeholder="Ej: Juan Carlos Perez Gomez" required autocomplete="name" autofocus
                     spellcheck="false" autocapitalize="words"
                     [attr.aria-invalid]="nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched)" />
            </div>
            <small class="field-error" *ngIf="nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched)">Ingresa tu nombre completo.</small>
          </label>

          <label>Documento de identidad
            <div class="auth-input-row">
              <span class="ico" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M6 12h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
              <input class="auth-input" [(ngModel)]="documento" name="documento" #docCtrl="ngModel"
                     placeholder="Ej: 1234567890" required inputmode="numeric" pattern="^[0-9]{6,12}$" maxlength="12" autocomplete="off"
                     [attr.aria-invalid]="docCtrl.invalid && (docCtrl.dirty || docCtrl.touched)" />
            </div>
            <small class="field-error" *ngIf="docCtrl.invalid && (docCtrl.dirty || docCtrl.touched)">Documento invalido: usa entre 6 y 12 digitos.</small>
          </label>

          <div *ngIf="error" class="auth-error" aria-live="polite">{{ error }}</div>
          <button class="auth-big-cta" type="submit" [disabled]="auth.loading() || nameCtrl.invalid || docCtrl.invalid">Entrar</button>
          <div class="auth-footer">
            &iquest;No tienes cuenta?
            <a routerLink="/register">Reg&iacute;strate</a>
          </div>
        </form>
      </div>
      <section class="auth-foot" aria-label="Beneficios">
        <div class="hl-wrap">
          <div class="hl-chip">
            <span class="hl-ico" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 7L10 17 5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="hl-text">Mapea tus lotes</span>
          </div>
          <div class="hl-chip">
            <span class="hl-ico" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-3.2-3.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </span>
            <span class="hl-text">Analiza el suelo</span>
          </div>
          <div class="hl-chip">
            <span class="hl-ico" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12h9M13 12l-3-3m3 3-3 3M16 7h4v10h-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="hl-text">Recibe recomendaciones</span>
          </div>
        </div>
        <p class="hl-tagline">Planea, analiza y optimiza tus cultivos.</p>
      </section>
    </section>
  `,
  styles: [`
    /* Centra y hace grande la marca en el header */
    .auth-header{ display:grid; place-items:center; }
    .auth-header .auth-header__inner{ width:100%; max-width:none; padding:28px; text-align:center; color:#fff; }
    .auth-header .auth-brand{ font-family:'Outfit',system-ui,-apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight:900; letter-spacing:-0.02em; font-size:clamp(48px,8vw,72px); line-height:1.05; text-shadow:0 3px 12px rgba(0,0,0,0.35); }

    .auth-panel {
      background: rgba(255,255,255,0.92);
      backdrop-filter: saturate(120%) blur(2px);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.14);
      max-width: 560px;
      margin: 16px auto 48px; /* coloca el card m�s alto y reduce el hueco medio */
      padding: 40px 28px !important; /* más cuerpo para ocupar espacio */
    }
    @media (max-width: 480px){ .auth-panel { margin: 0 auto 48px; padding: 32px 16px !important; } }
    .panel-title {
      margin: 0 0 12px;
      font-family: 'Outfit', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      font-weight: 900;
      letter-spacing: -0.02em;
      text-align: center;
      font-size: clamp(28px, 6vw, 36px);
    }
    .auth-form { display: grid; gap: 16px; }
    .auth-form label { font-weight: 650; color: #1f3526; }
    .auth-input-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 16px; background: #fff;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
      transition: box-shadow .15s ease, background .15s ease;
    }
    .auth-input-row:focus-within {
      box-shadow: inset 0 0 0 2px rgba(47,143,61,0.55), 0 2px 12px rgba(47,143,61,0.12);
      background: #ffffff;
    }
    .auth-input-row .ico { color: #2f8f3d; display:inline-flex; width: 28px; justify-content: center; }
    .auth-input {
      appearance: none; border: 0 !important; background: transparent !important; outline: none;
      width: 100%; min-height: 54px; font-size: 16px; color: #1f3526;
    }
    .auth-input::placeholder { color: #9ab0a3; }
    .field-error { color: #b64040; font-weight: 600; }
    .auth-error { margin-top: 6px; color: #b64040; font-weight: 600; }
    .auth-big-cta {
      width: 100%; border: 0; border-radius: 999px; padding: 14px 20px;
      font-weight: 800; font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif; letter-spacing: 0.2px;
      color: #fff; background: linear-gradient(135deg, #2f8f3d 0%, #1f5f3a 100%);
      box-shadow: 0 16px 28px rgba(21,62,41,0.22); cursor: pointer;
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .auth-big-cta:hover { transform: translateY(-2px); box-shadow: 0 20px 34px rgba(21,62,41,0.26); }
    .auth-big-cta:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: 0 8px 16px rgba(21,62,41,0.18); }
    .auth-footer { margin-top: 6px; color: #355d3f; text-align: center; }
    .auth-footer a { color: #1f5f3a; font-weight: 800; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }

    /* ---------- Login highlights (pie) ---------- */
    .auth-foot {
      position: relative;
      z-index: 1;
      width: min(740px, calc(100% - 24px));
      margin: 0 auto calc(12px + env(safe-area-inset-bottom, 0));
      padding: 14px 14px 16px;
      border-radius: 18px;
      background: linear-gradient(140deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.54) 45%, rgba(255,255,255,0.44) 100%),
                  radial-gradient(120% 120% at 0% 100%, rgba(61,141,64,0.10), transparent 60%),
                  radial-gradient(120% 120% at 100% 0%, rgba(245,139,43,0.08), transparent 60%);
      box-shadow: var(--shadow-soft, 0 16px 40px rgba(21,62,41,0.16));
      border: 1px solid rgba(31,95,58,0.10);
      backdrop-filter: saturate(120%) blur(2px);
    }
    .hl-wrap{ display:flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
    .hl-chip{
      display:inline-flex; align-items:center; gap:8px;
      padding:10px 14px; border-radius:999px;
      background: rgba(255,255,255,0.92);
      color: var(--text-900, #1f3526);
      border: 1px solid rgba(31,95,58,0.12);
      box-shadow: 0 6px 16px rgba(21,62,41,0.10);
      font-weight: 700; letter-spacing: .1px;
    }
    .hl-ico{ color: #2f8f3d; display:inline-flex; }
    .hl-text{ white-space: nowrap; font-size: 14px; }
    .hl-tagline{
      margin: 10px 6px 0; text-align:center;
      color: var(--text-600, #355d3f); font-weight: 600; letter-spacing: -0.01em;
    }
    /* Ajuste de espaciado: acercar el pie al card */
    .auth-panel{ margin-bottom: 16px !important; }
    @media (max-width: 480px){ .auth-panel{ margin-bottom: 14px !important; } }

    /* Imagen decorativa solo en login (parte inferior) */
    :host { display: block; position: relative; }
    .auth-background{ position: relative; display:flex; flex-direction: column; min-height: 100vh; justify-content: flex-start; gap: 16px; }
    .auth-panel{ position: relative; z-index: 2; }
    .auth-header{ position: relative; z-index: 1; }

    /* (removido) segunda ilustración */
  `]
})
export class LoginPageComponent {
  nombre = '';
  documento = '';
  error: string | null = null;

  constructor(public auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.error = null;
    try {
      await this.auth.login({ nombre_completo: this.nombre, documento_identidad: this.documento });
      const user = this.auth.user();
      this.router.navigateByUrl(user?.is_admin ? '/admin' : '/');
    } catch (e: any) {
      const apiMsg = e?.error?.message;
      const apiErrors = e?.error?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const joined = (Object.values(apiErrors) as any[]).flat().join(' ');
        this.error = joined || apiMsg || 'Error al iniciar sesion';
      } else if (apiMsg) {
        this.error = apiMsg;
      } else if (e?.status === 0) {
        this.error = 'No se pudo conectar con el servidor. Verifica que el backend esta en http://localhost:8000.';
      } else {
        this.error = 'Error al iniciar sesion';
      }
    }
  }
}




