import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-topbar-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="auth.token(); else guest">
      <div class="topbar-chip topbar-chip--icon-only" aria-label="Perfil de usuario">
        <span class="topbar-chip__icon">
          <img *ngIf="auth.user()?.avatar_url && !imgError" [src]="auth.user()!.avatar_url!" alt="" (error)="imgError=true" />
          <span *ngIf="!auth.user()?.avatar_url || imgError" class="avatar-initials">{{ initials(auth.user()?.nombre_completo) }}</span>
        </span>
        
      </div>
    </ng-container>
    <ng-template #guest>
      <div class="topbar-chip" aria-label="Estado del campo">
        <span class="topbar-chip__icon">
          <img src="assets/3425929.jpg" alt="" />
        </span>
        <div class="topbar-chip__text">
          <strong>Listo para sembrar</strong>
          <small>Datos al día para decidir</small>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .topbar-chip {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      border-radius: 999px;
      background: #ffffff;               /* blanco con sombra marcada */
      border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 12px 26px rgba(0,0,0,0.14);
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
    }
    .topbar-chip__icon {
      width: 32px;
      height: 32px;
      border-radius: 999px;
      background: rgba(255,255,255,0.9);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 0 1px rgba(33,76,49,0.1);
      overflow: hidden;
    }
    .topbar-chip__icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
    .avatar-initials { width: 100%; height: 100%; display: grid; place-items: center; font-weight: 800; color: #154027; background: #eaf3ee; border-radius: 50%; }
    .topbar-chip__text { line-height: 1.1; }
    .topbar-chip__text strong { font-size: 14px; color: var(--text-900); display: block; text-align: left; }
    .topbar-chip__text small { font-size: 11px; color: var(--text-600); text-align: left; }
    .topbar-chip.topbar-chip--icon-only { padding: 4px; }
    .topbar-chip.topbar-chip--icon-only .topbar-chip__icon { width: 40px; height: 40px; }
  `]
})
export class TopbarChipComponent {
  imgError = false;
  constructor(public auth: AuthService) {}
  initials(name: string | null | undefined) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'A';
    const second = parts[1]?.[0] ?? 'G';
    return (first + second).toUpperCase();
  }
}
