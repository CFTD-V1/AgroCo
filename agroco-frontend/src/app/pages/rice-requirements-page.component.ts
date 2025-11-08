import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

type Req = { targets: { rice: { N: number; P2O5: number; K2O: number; S: number; sat: Record<string, number>; criticals: Record<string, number>; micros_dose_kg_ha: Record<string, number> } } };

@Component({
  standalone: true,
  selector: 'app-rice-requirements-page',
  imports: [CommonModule],
  template: `
    <section class="hero-shell">
      <div class="hero-copy">
        <span class="tagline">Guía nutricional</span>
        <h1 class="hero-title">Requerimientos del arroz para una cosecha armoniosa.</h1>
        <p class="hero-subtitle">Consulta los valores de referencia para macronutrientes, saturación de bases y dosis sugeridas de micronutrientes.</p>
      </div>
      <div class="hero-illustration">
        <img src="assets/organic-hero.svg" alt="Guía nutricional" />
      </div>
    </section>

    <div *ngIf="error()" class="empty-state" style="margin-top:20px">{{ error() }}</div>

    <ng-container *ngIf="rice() as r">
      <section class="section-grid nutri-guide" style="margin-top:24px">
        <!-- Macronutrientes -->
        <div class="section-card">
          <div class="section-heading">Macronutrientes</div>
          <div class="section-sub">Valores objetivo por hectárea (kg/ha).</div>
          <div class="nutri-list" style="margin-top:12px">
            <div class="nutri-item is-n">
              <div class="nutri-icon" aria-hidden="true">N</div>
              <div class="nutri-content">
                <div class="nutri-label">Nitrógeno (N)</div>
                <div class="nutri-value">{{ r.N }}<span class="nutri-unit">kg/ha</span></div>
              </div>
            </div>
            <div class="nutri-item is-p">
              <div class="nutri-icon" aria-hidden="true">P</div>
              <div class="nutri-content">
                <div class="nutri-label">Fósforo (P₂O₅)</div>
                <div class="nutri-value">{{ r.P2O5 }}<span class="nutri-unit">kg/ha</span></div>
              </div>
            </div>
            <div class="nutri-item is-k">
              <div class="nutri-icon" aria-hidden="true">K</div>
              <div class="nutri-content">
                <div class="nutri-label">Potasio (K₂O)</div>
                <div class="nutri-value">{{ r.K2O }}<span class="nutri-unit">kg/ha</span></div>
              </div>
            </div>
            <div class="nutri-item is-s">
              <div class="nutri-icon" aria-hidden="true">S</div>
              <div class="nutri-content">
                <div class="nutri-label">Azufre (S)</div>
                <div class="nutri-value">{{ r.S }}<span class="nutri-unit">kg/ha</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Saturación de bases -->
        <div class="section-card">
          <div class="section-heading">Saturación de bases objetivo</div>
          <div class="section-sub">Mantén el equilibrio del suelo (%).</div>
          <div class="nutri-list nutri-list--compact" style="margin-top:12px">
            <div *ngFor="let k of keys(r.sat)" class="nutri-item mini">
              <div class="nutri-icon" aria-hidden="true">{{ k }}</div>
              <div class="nutri-content">
                <div class="nutri-label">{{ k }}</div>
                <div class="nutri-value">{{ r.sat[k] }}<span class="nutri-unit">%</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Micronutrientes: niveles críticos -->
        <div class="section-card">
          <div class="section-heading">Niveles críticos de micronutrientes</div>
          <div class="section-sub">Valores de referencia en suelo (mg/kg).</div>
          <div class="nutri-list" style="margin-top:12px">
            <div *ngFor="let k of keys(r.criticals)" class="nutri-item micro">
              <div class="nutri-icon" aria-hidden="true">{{ k }}</div>
              <div class="nutri-content">
                <div class="nutri-label">{{ k }}</div>
                <div class="nutri-value">{{ r.criticals[k] }}<span class="nutri-unit">mg/kg</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dosis sugeridas -->
        <div class="section-card" style="grid-column: 1 / -1">
          <div class="section-heading">Dosis sugeridas cuando está por debajo del crítico</div>
          <div class="section-sub">Aplicación recomendada (kg/ha).</div>
          <div class="nutri-list" style="margin-top:12px">
            <div *ngFor="let k of keys(r.micros_dose_kg_ha)" class="nutri-item micro">
              <div class="nutri-icon" aria-hidden="true">{{ short(k) }}</div>
              <div class="nutri-content">
                <div class="nutri-label">{{ formatLabel(k) }}</div>
                <div class="nutri-value">{{ r.micros_dose_kg_ha[k] }}<span class="nutri-unit">kg/ha</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ng-container>
  `
})
export class RiceRequirementsPageComponent implements OnInit {
  data = signal<Req | null>(null);
  error = signal<string | null>(null);
  rice = signal<any | null>(null);

  constructor(private api: ApiService) {}

  keys = (o: Record<string, any>) => Object.keys(o || {});
  formatLabel(label: string) {
    return label.replace(/_/g, ' ').replace(/\b(\w)/g, (_, c) => c.toUpperCase());
  }
  short(label: string) {
    const m = label.match(/^[A-Za-z]{1,2}/);
    return (m?.[0] || label).toUpperCase();
  }

  async ngOnInit() {
    try {
      const res = await this.api.get<Req>('/api/v1/rice/requirements');
      this.data.set(res!);
      this.rice.set(res?.targets?.rice || null);
    } catch (e: any) {
      this.error.set(e?.message || 'No se pudo cargar');
    }
  }
}
