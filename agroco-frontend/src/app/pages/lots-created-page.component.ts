import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

type LotLocation = { dept?: string; muni?: string; vereda?: string; lat?: number; lng?: number };
type Lot = { id: number; nombre: string; area_ha: number; cultivo: string; fecha_siembra?: string | null; analisis_suelo_total?: number; ubicacion?: LotLocation | null };

@Component({
  standalone: true,
  selector: 'app-lots-created-page',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="lots-created-shell">
      <header class="lots-created-header">
        <button class="back-btn" type="button" routerLink="/analyses">
          ← Volver a análisis
        </button>
        <h1 class="title">Lotes creados</h1>
        <p class="subtitle">Revisa la información de cada lote y si ya tiene análisis vinculados.</p>
      </header>

      <section class="lots-created-list" *ngIf="lots().length; else empty">
        <details class="lot-acc" *ngFor="let l of lots()" [open]="lots().length === 1">
          <summary class="lot-acc-summary">
            <div class="lot-main">
              <div class="lot-name">{{ l.nombre | titlecase }}</div>
              <div class="lot-meta">
                <span>{{ l.area_ha }} ha</span>
                <span class="dot">•</span>
                <span>{{ l.cultivo | titlecase }}</span>
              </div>
            </div>
            <span class="lot-pill" [class.lot-pill--has]="(l.analisis_suelo_total || 0) > 0">
              <ng-container *ngIf="(l.analisis_suelo_total || 0) > 0; else noAna">
                Con análisis ({{ l.analisis_suelo_total || 0 }})
              </ng-container>
              <ng-template #noAna>Sin análisis</ng-template>
            </span>
          </summary>
          <div class="lot-acc-body">
            <div class="field-row">
              <span class="label">Nombre</span>
              <span class="value">{{ l.nombre }}</span>
            </div>
            <div class="field-row">
              <span class="label">Área</span>
              <span class="value">{{ l.area_ha }} ha</span>
            </div>
            <div class="field-row">
              <span class="label">Cultivo</span>
              <span class="value">{{ l.cultivo | titlecase }}</span>
            </div>
            <div class="field-row" *ngIf="l.ubicacion as loc">
              <span class="label">Ubicación</span>
              <span class="value">
                {{ loc.dept }}
                <span *ngIf="loc.muni">, {{ loc.muni }}</span>
                <span *ngIf="loc.vereda"> - {{ loc.vereda }}</span>
              </span>
            </div>
            <div class="field-row" *ngIf="l.fecha_siembra">
              <span class="label">Fecha de siembra</span>
              <span class="value">{{ l.fecha_siembra }}</span>
            </div>
          </div>
        </details>
      </section>

      <ng-template #empty>
        <div class="empty">
          <p>Aún no tienes lotes creados.</p>
          <button class="btn-primary" type="button" routerLink="/lots">
            Crear mi primer lote
          </button>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .lots-created-shell{
      padding: 12px 16px 24px;
    }
    .lots-created-header{
      margin-bottom: 14px;
    }
    .back-btn{
      border: none;
      background: transparent;
      color: #1f5f3a;
      font-size: 13px;
      font-weight: 700;
      padding: 0;
      margin-bottom: 6px;
      cursor: pointer;
    }
    .title{
      margin: 0 0 4px;
      font-size: 24px;
      font-weight: 900;
      color: #153e29;
    }
    .subtitle{
      margin: 0;
      font-size: 13px;
      color: #335f47;
    }
    .lots-created-list{
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }
    .lot-acc{
      border-radius: 18px;
      border: 1px solid rgba(21,62,41,0.12);
      background: #ffffff;
      box-shadow: 0 10px 24px rgba(21,62,41,0.08);
      overflow: hidden;
    }
    .lot-acc-summary{
      list-style: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      cursor: pointer;
    }
    .lot-acc-summary::-webkit-details-marker{
      display: none;
    }
    .lot-main{
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .lot-name{
      font-weight: 800;
      font-size: 15px;
      color: #153e29;
    }
    .lot-meta{
      font-size: 12px;
      color: #466e59;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .dot{ opacity: .6; }
    .lot-pill{
      font-size: 11px;
      font-weight: 800;
      border-radius: 999px;
      padding: 6px 10px;
      background: rgba(148,163,184,0.12);
      color: #475569;
      white-space: nowrap;
    }
    .lot-pill--has{
      background: rgba(16,185,129,0.12);
      color: #047857;
    }
    .lot-acc-body{
      border-top: 1px solid rgba(21,62,41,0.08);
      padding: 10px 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #f8fbf9;
    }
    .field-row{
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 13px;
    }
    .label{
      color: #64748b;
      font-weight: 700;
    }
    .value{
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .empty{
      margin-top: 24px;
      text-align: center;
      color: #335f47;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }
    .btn-primary{
      border: none;
      border-radius: 999px;
      padding: 12px 22px;
      font-weight: 800;
      font-size: 14px;
      color: #ffffff;
      background: linear-gradient(135deg,#2f8f3d,#1f5f3a);
      box-shadow: 0 14px 32px rgba(21,62,41,0.28);
      cursor: pointer;
    }
  `]
})
export class LotsCreatedPageComponent implements OnInit {
  lots = signal<Lot[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private api: ApiService, private auth: AuthService, private toast: ToastService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    if (!this.auth.token()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.api.get<{ data: Lot[] }>(`/api/v1/lots?include=analyses`, true);
      this.lots.set(res?.data || []);
    } catch (e: any) {
      const message = e?.message || 'No se pudieron cargar los lotes';
      this.error.set(message);
      this.toast.show(message, 'error');
    }
    this.loading.set(false);
  }
}

