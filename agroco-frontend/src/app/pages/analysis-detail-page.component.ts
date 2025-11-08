import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

type NutrientMap = Record<string, number>;
type PhaseMap = Record<string, NutrientMap>;
type PlanResource = {
  objetivos?: { por_hectarea?: NutrientMap; para_tu_lote?: NutrientMap };
  productos?: { etiquetas?: Record<string, string>; por_hectarea?: NutrientMap; para_tu_lote?: NutrientMap };
  fases?: { por_hectarea?: PhaseMap; para_tu_lote?: PhaseMap };
  resumen_totales_lote?: { nombre: string; kg_totales: number }[];
};
type Analysis = { id: number; meta_rendimiento_t_ha: number | null; fertilizer_plan?: { id: number; pdf_download?: string | null; data?: PlanResource } };

@Component({
  standalone: true,
  selector: 'app-analysis-detail-page',
  imports: [CommonModule],
  template: `
    <section class="hero-shell" style="grid-template-columns: repeat(auto-fit,minmax(320px,1fr)); margin:6px 0 16px 0; background: url('/assets/223907-P1OHRX-813.jpg') center/cover no-repeat; border-radius:22px; overflow:hidden;">
      <div class="hero-copy">
        <span class="tagline alt">Análisis #{{ seq() ?? id }}</span>
        <span class="tagline">Análisis #{{ id }}</span>
        <h1 class="hero-title">Resultados listos para tomar decisiones.</h1>
        <p class="hero-subtitle">Consulta objetivos nutricionales, Distribución por fases y descarga el PDF del plan.</p>
      </div>
    </section>

    <div *ngIf="error()" class="empty-state" style="margin-bottom:16px">{{ error() }}</div>

    <ng-container *ngIf="plan() as p; else noPlan">
      <div class="floating-layers" style="display:grid; gap:24px">
        <div class="metrics">
          <div class="metric-card objective">
            <div class="metric-big">{{ analysis()?.meta_rendimiento_t_ha ?? '?' }} t/ha</div>
            <div class="metric-sub">Objetivo de rendimiento</div>
          </div>
          <div class="metric-card download">
            <ng-container *ngIf="download(); else noPdf">
              <a class="btn btn-green" [href]="download()!" target="_blank" rel="noopener">Descargar PDF</a>
            </ng-container>
            <ng-template #noPdf>
              <span class="muted">No disponible</span>
            </ng-template>
          </div>
        </div>

        <!-- Desplegables con imagen (fuera de métricas) -->
        <details class="acc-card">
          <summary class="acc-hero acc-obj">
            <div class="acc-hero__title">Objetivos nutricionales</div>
            <div class="acc-hero__sub">Comparativo entre kg/ha y totales del lote.</div>
          </summary>
          <div class="acc-panel">
            <table class="data-table">
              <thead><tr><th>Nutriente</th><th>kg/ha</th><th>Para tu lote</th></tr></thead>
              <tbody>
                <tr *ngFor="let entry of entries(plan()?.objetivos?.por_hectarea)">
                  <td>{{ label(entry[0]) }}</td>
                  <td>{{ entry[1] | number:'1.0-2' }}</td>
                  <td>{{ plan()?.objetivos?.para_tu_lote?.[entry[0]] | number:'1.0-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

        <details class="acc-card">
          <summary class="acc-hero acc-prod">
            <div class="acc-hero__title">Productos recomendados</div>
          </summary>
          <div class="acc-panel">
            <table class="data-table">
              <thead><tr><th>Fuente</th><th>kg/ha</th><th>Para tu lote</th></tr></thead>
              <tbody>
                <tr *ngFor="let entry of entries(plan()?.productos?.por_hectarea)">
                  <td>{{ productLabel(entry[0], plan()!) }}</td>
                  <td>{{ entry[1] | number:'1.0-2' }}</td>
                  <td>{{ plan()?.productos?.para_tu_lote?.[entry[0]] | number:'1.0-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

        <details class="acc-card">
          <summary class="acc-hero acc-phase">
            <div class="acc-hero__title">Distribución por fase</div>
            <div class="acc-hero__sub">Desglose de aplicaciones en siembra, macollamiento y embuche.</div>
          </summary>
          <div class="acc-panel">
            <div class="phase-grid">
              <div *ngFor="let phase of phaseEntries(plan()?.fases?.por_hectarea)" class="phase-card">
                <div class="section-heading" style="font-size:16px">{{ phaseLabel(phase[0]) }}</div>
                <table class="data-table">
                  <thead><tr><th>Producto</th><th>kg/ha</th><th>Para tu lote</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let prod of entries(phase[1])">
                      <td>{{ productLabel(prod[0], plan()!) }}</td>
                      <td>{{ prod[1] | number:'1.0-2' }}</td>
                      <td>{{ plan()?.fases?.para_tu_lote?.[phase[0]]?.[prod[0]] | number:'1.0-2' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </details>

      </div>
    </ng-container>

    <ng-template #noPlan>
      <div class="empty-state">Aún no hay plan. Genera uno desde la sección de Análisis de suelo.</div>
    </ng-template>
  `,
  styles: [`
    /* Metrics cards */
    .metrics{ display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-bottom:18px }
    .metric-card{ background:#fff; border:1px solid rgba(21,62,41,0.12); border-radius:14px; padding:14px 16px; box-shadow: 0 10px 24px rgba(21,62,41,0.08); min-width:220px; display:flex; flex-direction:column; align-items:center; justify-content:center }
    .metric-big{ font-size:24px; font-weight:900; color:#153e29 }
    .metric-sub{ font-size:12px; font-weight:800; color:#335f47; margin-top:4px }
    .muted{ color:#64748b; font-weight:700 }
    .btn{ border:none; border-radius:14px; padding:12px 16px; font-weight:900; cursor:pointer; text-decoration:none }
    .btn-green{ background: linear-gradient(135deg, #2f8f3d, #1f5f3a); color:#fff }
    .hero-copy > .tagline:not(.alt){ display:none }
    .hero-full-bleed{ margin-left:-16px; margin-right:-16px; width: calc(100% + 32px) }
    /* Hero full-bleed and text legibility */
    .hero-shell{ position:relative; display:flex; align-items:center; justify-content:center }
    .hero-shell::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.45)) }
    .hero-shell > *{ position:relative; z-index:1 }
    .hero-copy{ color:#fff; padding:16px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; max-width: 780px }
    .tagline{ display:inline-block; background: rgba(255,255,255,0.92); color:#153e29; border-radius:999px; padding:6px 12px; font-weight:900; font-size:12px; margin-bottom:8px }
    .hero-title{ color:#ffffff; font-size:28px; line-height:1.18; font-weight:900; margin:6px 0; text-shadow: 0 2px 12px rgba(0,0,0,0.6) }
    .hero-subtitle{ color:#f0fdf4; text-shadow: 0 2px 10px rgba(0,0,0,0.5); max-width:60ch }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    .data-table th, .data-table td { padding: 6px 8px; border-bottom: 1px solid rgba(31,53,38,0.08); text-align: left; }
    .data-table th { font-weight: 700; color: var(--text-600); }
    .phase-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); margin-top: 16px; }
    .phase-card { border: 1px solid rgba(31,95,58,0.12); border-radius: 16px; padding: 12px; background: rgba(255,255,255,0.9); }
    /* Accordions with image headers */
    /* Uniform cards and tighter layout */
    .floating-layers{ padding:0; margin-left:-20px; margin-right:-20px; width: calc(100% + 40px) }
    @media(min-width: 720px){ .floating-layers{ margin-left:-24px; margin-right:-24px; width: calc(100% + 48px) } }
    .acc-card{ background:#fff; border:none; border-radius:16px; box-shadow: 0 14px 32px rgba(21,62,41,0.10); overflow:hidden; margin: 0 0 12px; width:100%; box-sizing:border-box }
    .acc-card>summary{ list-style:none; display:block; cursor:pointer; padding:0; position:relative; width:100%; box-sizing:border-box }
    .acc-card>summary::-webkit-details-marker{ display:none }
    .acc-hero{ position: relative; min-height: 180px; display:grid; place-items:center; padding:0 12px; color:#fff; border-radius:18px; width:100%; box-sizing:border-box; text-align:center }
    .acc-hero__title{ font-weight:900; font-size:28px; line-height:1.1; text-align:center; letter-spacing:.3px; text-shadow: 0 3px 14px rgba(0,0,0,0.65); font-family: 'Poppins','Montserrat','Segoe UI',system-ui,-apple-system,Roboto,'Helvetica Neue',Arial,sans-serif }
    .acc-hero__sub{ display:none }
    .acc-hero::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.45)) }
    .acc-hero>*{ position:relative; z-index:1 }
    /* Fondos solicitados */
    .acc-obj{ background: url('/assets/9a3b3f68-f2c5-4258-8cc2-f6d83836ac33.jpg') center/cover no-repeat }
    .acc-prod{ background: url('/assets/11Z_2104.w026.n002.315B.p1.315.jpg') center/cover no-repeat }
    .acc-phase{ background: url('/assets/12Z_2102.w015.n001.337B.p15.337.jpg') center/cover no-repeat }
    .acc-panel{ padding: 0 12px 14px; background:#fff }
  `]
})
export class AnalysisDetailPageComponent implements OnInit {
  id!: string | null;
  analysis = signal<Analysis | null>(null);
  error = signal<string | null>(null);
  plan = signal<PlanResource | null>(null);
  download = signal<string | null>(null);
  seq = signal<number | null>(null);

  private phaseLabels: Record<string, string> = {
    sowing: 'Siembra',
    tillering: 'Macollamiento',
    panicle: 'Embuche'
  };

  constructor(private route: ActivatedRoute, private api: ApiService, public auth: AuthService) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.auth.token() || !this.id) return;
    try {
      const res = await this.api.get<{ data: Analysis }>(`/api/v1/soil-analyses/${this.id}`, true);
      this.analysis.set(res?.data || null);
      const fp = res?.data?.fertilizer_plan;
      this.plan.set(fp?.data || null);
      this.download.set(fp?.pdf_download || null);
      // Calcular número secuencial del análisis para el usuario actual
      const listRes = await this.api.get<{ data: Analysis[] }>(`/api/v1/soil-analyses`, true).catch(() => null);
      const list = listRes?.data || [];
      const ordered = [...list].sort((a,b) => (a.id||0) - (b.id||0));
      const currentId = Number(this.id);
      const idx = ordered.findIndex(a => a.id === currentId);
      if (idx >= 0) this.seq.set(idx + 1);
    } catch (e: any) {
      this.error.set(e?.message || 'No se pudo cargar el Análisis');
    }
  }

  entries(record?: NutrientMap) {
    return Object.entries(record ?? {});
  }

  phaseEntries(record?: PhaseMap) {
    return Object.entries(record ?? {});
  }

  label(key: string) {
    return (key ?? '').toUpperCase();
  }

  productLabel(key: string, plan: PlanResource) {
    return plan.productos?.etiquetas?.[key] ?? key.replace(/_/g, ' ').toUpperCase();
  }

  phaseLabel(key: string) {
    return this.phaseLabels[key] ?? key;
  }
}

