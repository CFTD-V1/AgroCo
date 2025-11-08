import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="auth.user(); else guest">
      <section class="hero-shell" style="grid-template-columns: repeat(auto-fit,minmax(320px,1fr));">
        <div class="hero-copy">
          <span class="tagline">Perfil</span>
          <h1 class="hero-title">Tu información personal y acceso seguro.</h1>
          <p class="hero-subtitle">Actualiza tu contraseña para mantener protegida tu cuenta.</p>
          <div class="section-card profile-summary" style="display:flex; align-items:center; gap:14px; width:100%; max-width:640px; position:relative;">
            <div class="avatar-circle avatar-sm">
              <img *ngIf="(photoPreview || auth.user()?.avatar_url) && !imgErrorTop" [src]="photoPreview || auth.user()?.avatar_url!" alt="" (error)="imgErrorTop=true" (load)="imgErrorTop=false" />
              <span *ngIf="!(photoPreview || auth.user()?.avatar_url) || imgErrorTop">{{ initials(auth.user()!.nombre_completo) }}</span>
            </div>
            <div>
              <div class="section-heading">{{ auth.user()!.nombre_completo }}</div>
              <div class="section-sub">{{ auth.user()!.email || 'Sin correo registrado' }}</div>
              <div class="profile-details">
                <div class="detail">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM4 9h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
                  </span>
                  <span class="label">Documento</span>
                  <span class="value">{{ auth.user()?.documento_mascara || '—' }}</span>
                </div>
                <div class="detail">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.88.33 1.74.62 2.56a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.52-1.14a2 2 0 0 1 2.11-.45c.82.29 1.68.5 2.56.62A2 2 0 0 1 22 16.92z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
                  </span>
                  <span class="label">Teléfono</span>
                  <span class="value">{{ auth.user()?.telefono || '—' }}</span>
                </div>
                <div class="detail">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 8h16" stroke="currentColor" stroke-width="1.6"/></svg>
                  </span>
                  <span class="label">Ocupación</span>
                  <span class="value">{{ auth.user()?.ocupacion || '—' }}</span>
                </div>
                <div class="detail">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 8l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
                  </span>
                  <span class="label">Correo</span>
                  <span class="value">{{ auth.user()?.email || '—' }}</span>
                </div>
              </div>
            </div>
            <div class="profile-art" aria-hidden="true"></div>
          </div>
        </div>

        <div class="floating-layers">
          <form class="form-shell" (ngSubmit)="onSave()">
            <div class="form-title">Editar perfil</div>
            <div class="form-sub">Actualiza tu foto y correo electrónico.</div>

            <div class="row" style="align-items:center; gap:12px">
              <div class="avatar-circle avatar-lg">
                <img *ngIf="(photoPreview || auth.user()?.avatar_url) && !imgErrorForm" [src]="photoPreview || auth.user()?.avatar_url!" alt="" (error)="imgErrorForm=true" (load)="imgErrorForm=false" />
                <span *ngIf="!(photoPreview || auth.user()?.avatar_url) || imgErrorForm">{{ initials(auth.user()!.nombre_completo) }}</span>
              </div>
              <div>
                <label>Foto de usuario</label>
                <input type="file" accept="image/*" (change)="onPhotoChange($event)" />
              </div>
            </div>

            <div class="row" style="gap:12px">
              <div class="col" style="min-width:220px">
                <label>Ocupación</label>
                <input class="input" type="text" [(ngModel)]="ocupacion" name="ocupacion" placeholder="Ej.: Agricultor" />
              </div>
              <div class="col" style="min-width:180px">
                <label>Teléfono</label>
                <input class="input" type="tel" [(ngModel)]="telefono" name="telefono" placeholder="Ej.: 300 123 4567" />
              </div>
            </div>
            <div>
              <label>Actualiza tu correo</label>
              <input class="input" type="email" [(ngModel)]="email" name="email" placeholder="Ingresa tu correo" />
            </div>

            <div class="row" style="justify-content:flex-start">
              <button class="btn" [disabled]="busy">Guardar cambios</button>
            </div>
            <div *ngIf="msg" style="color:var(--mint-700)">{{ msg }}</div>
            <div *ngIf="error" style="color:#d16969">{{ error }}</div>
          </form>
        </div>
      </section>
    </ng-container>

    <ng-template #guest>
      <div class="empty-state">Debes iniciar sesión para consultar tu perfil.</div>
    </ng-template>
  `
})
export class ProfilePageComponent {
  ocupacion: string | null = null;
  telefono: string | null = null;
  email: string | null = null;
  imgErrorTop = false;
  imgErrorForm = false;
  photoFile: File | null = null;
  photoPreview: string | null = null;
  busy = false;
  msg: string | null = null;
  error: string | null = null;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    const u = this.auth.user();
    this.ocupacion = (u as any)?.ocupacion ?? null;
    this.telefono = (u as any)?.telefono ?? null;
    this.email = u?.email ?? null;
  }

  onPhotoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) {
      this.photoFile = file;
      const reader = new FileReader();
      reader.onload = () => this.photoPreview = String(reader.result || '');
      reader.readAsDataURL(file);
    }
  }

  async onSave() {
    if (!this.auth.token()) return;
    this.busy = true; this.msg = null; this.error = null;
    try {
      await this.auth.updateProfile({
        ocupacion: this.ocupacion ?? undefined,
        telefono: this.telefono ?? undefined,
        email: this.email ?? undefined,
      });
      if (this.photoFile) {
        await this.auth.updatePhoto(this.photoFile);
        this.photoFile = null; this.photoPreview = null;
      }
      this.msg = 'Perfil actualizado';
    } catch (e: any) {
      this.error = e?.error?.message || e?.message || 'No se pudo actualizar el perfil';
    } finally {
      this.busy = false;
    }
  }
  initials(name: string | null | undefined) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'A';
    const second = parts[1]?.[0] ?? 'G';
    return (first + second).toUpperCase();
  }
}
