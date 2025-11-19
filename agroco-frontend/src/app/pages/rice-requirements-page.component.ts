import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

type RiceTargets = {
  N: number;
  P2O5: number;
  K2O: number;
  S: number;
  sat: Record<string, number>;
  criticals: Record<string, number>;
  micros_dose_kg_ha: Record<string, number>;
};

type Req = { targets: { rice: RiceTargets } };

@Component({
  standalone: true,
  selector: 'app-rice-requirements-page',
  imports: [CommonModule],
  styles: [`
    .hero-shell{
      margin: -10px -18px 0;
      padding: 30px 22px 54px;
      border-radius: 28px;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.40), rgba(255,255,255,0.42)),
        url('/assets/Wavy_Agr-01_Single-04.jpg');
      background-size: cover;
      background-position: center;
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
      gap: 18px;
      align-items: center;
      box-shadow: 0 24px 56px rgba(21,62,41,0.26);
      min-height: 360px;
    }
    .hero-copy{
      text-align: left;
    }
    .hero-copy .tagline{
      display:inline-block;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: #0f172a;
      margin: 0 auto 10px;
      text-align: center;
      width: 100%;
    }
    .hero-copy .hero-title{
      margin: 4px 0 12px;
      font-size: 32px;
      line-height: 1.22;
      font-weight: 900;
      color: #0f172a;
    }
    .hero-copy .hero-subtitle{
      margin: 0;
      font-size: 16px;
      color: #111827;
      font-weight: 500;
    }
    .hero-illustration{
      display:none;
    }
    @media (max-width: 640px){
      .hero-shell{
        grid-template-columns: minmax(0,1fr);
        text-align:left;
      }
    }

    .nutri-accordion{
      margin-top: 26px;
      display: grid;
      gap: 18px;
    }
    .accordion-card{
      border-radius: 28px;
      background: rgba(255,255,255,0.88);
      box-shadow: 0 16px 34px rgba(21,62,41,0.18);
      overflow: hidden;
      min-height: 104px;
    }
    .nutri-accordion > .accordion-card:nth-of-type(1){
      background:
        linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.34)),
        url('/assets/2105.w026.n002.445B.p0.445.jpg');
      background-size: cover;
      background-position: center;
    }
    .nutri-accordion > .accordion-card:nth-of-type(2){
      background:
        linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.34)),
        url('/assets/21034604.jpg');
      background-size: cover;
      background-position: center;
    }
    .nutri-accordion > .accordion-card:nth-of-type(3){
      background:
        linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.34)),
        url('/assets/40Z_2105.w026.n002.444B.p0.444.jpg');
      background-size: cover;
      background-position: center;
    }
    .nutri-accordion > .accordion-card:nth-of-type(4){
      background:
        linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.34)),
        url('/assets/3727.jpg');
      background-size: cover;
      background-position: center;
    }
    .accordion-header{
      width: 100%;
      padding: 22px 22px;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }
    .accordion-title-block{
      text-align:left;
    }
    .accordion-title{
      font-weight: 900;
      font-size: 21px;
      color: #111827;
      font-family: 'Baloo 2', 'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
      letter-spacing: 0.01em;
    }
    .accordion-sub{
      font-size: 16px;
      color: #111827;
      font-family: 'Baloo 2', 'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    }
    .accordion-arrow{
      width: 18px;
      height: 18px;
      border-radius: 999px;
      border: 1px solid rgba(21,62,41,0.20);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#153e29;
      transition: transform .18s ease;
    }
    .accordion-card.open .accordion-arrow{
      transform: rotate(90deg);
    }
    .accordion-body{
      padding: 0 20px 18px;
      border-top: 1px solid rgba(21,62,41,0.06);
    }
    .nutri-list{
      margin-top:14px;
      display:flex;
      flex-direction:column;
      gap:8px;
    }
    .nutri-item{
      display:flex;
      align-items:center;
      gap:12px;
      padding:8px 12px;
      border-radius:14px;
      background: rgba(255,255,255,0.82);
    }
    .nutri-icon{
      width:30px;
      height:30px;
      border-radius:999px;
      background:#e5f0e8;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:900;
      font-size:15px;
      color:#111827;
      flex-shrink:0;
    }
    .nutri-content{
      display:flex;
      align-items:baseline;
      justify-content:space-between;
      gap:10px;
      width:100%;
    }
    .nutri-label{
      font-size:16px;
      font-weight:700;
      color:#111827;
    }
    .nutri-value{
      font-size:16px;
      font-weight:800;
      color:#111827;
    }
    .nutri-unit{
      margin-left:4px;
      font-size:12px;
      font-weight:600;
      color:#374151;
    }
  `],
  template: `
    <section class="hero-shell">
      <div class="hero-copy">
        <span class="tagline">Guía nutricional</span>
        <h1 class="hero-title">Requerimientos del arroz para una cosecha armoniosa.</h1>
        <p class="hero-subtitle">
          Consulta los valores de referencia para macronutrientes, saturación de bases
          y dosis sugeridas de micronutrientes.
        </p>
      </div>
      <div class="hero-illustration">
        <img src="assets/organic-hero.svg" alt="Guía nutricional" />
      </div>
    </section>

    <div *ngIf="error()" class="empty-state" style="margin-top:20px">{{ error() }}</div>

    <ng-container *ngIf="rice() as r">
      <section class="nutri-accordion">
        <!-- Macronutrientes -->
        <article class="accordion-card" [class.open]="openSection() === 'macro'">
          <button class="accordion-header" type="button" (click)="toggle('macro')">
            <div class="accordion-title-block">
              <div class="accordion-title">Macronutrientes</div>
              <div class="accordion-sub">Valores objetivo por hectárea (kg/ha).</div>
            </div>
            <div class="accordion-arrow" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </button>
          <div class="accordion-body" *ngIf="openSection() === 'macro'">
            <div class="nutri-list">
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
        </article>

        <!-- Saturación de bases -->
        <article class="accordion-card" [class.open]="openSection() === 'bases'">
          <button class="accordion-header" type="button" (click)="toggle('bases')">
            <div class="accordion-title-block">
              <div class="accordion-title">Saturación de bases objetivo</div>
              <div class="accordion-sub">Mantén el equilibrio del suelo (%).</div>
            </div>
            <div class="accordion-arrow" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </button>
          <div class="accordion-body" *ngIf="openSection() === 'bases'">
            <div class="nutri-list nutri-list--compact">
              <div *ngFor="let k of keys(r.sat)" class="nutri-item mini">
                <div class="nutri-icon" aria-hidden="true">{{ k }}</div>
                <div class="nutri-content">
                  <div class="nutri-label">{{ k }}</div>
                  <div class="nutri-value">{{ r.sat[k] }}<span class="nutri-unit">%</span></div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Micronutrientes: niveles críticos -->
        <article class="accordion-card" [class.open]="openSection() === 'criticos'">
          <button class="accordion-header" type="button" (click)="toggle('criticos')">
            <div class="accordion-title-block">
              <div class="accordion-title">Niveles críticos de micronutrientes</div>
              <div class="accordion-sub">Valores de referencia en suelo (mg/kg).</div>
            </div>
            <div class="accordion-arrow" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </button>
          <div class="accordion-body" *ngIf="openSection() === 'criticos'">
            <div class="nutri-list">
              <div *ngFor="let k of keys(r.criticals)" class="nutri-item micro">
                <div class="nutri-icon" aria-hidden="true">{{ k }}</div>
                <div class="nutri-content">
                  <div class="nutri-label">{{ k }}</div>
                  <div class="nutri-value">{{ r.criticals[k] }}<span class="nutri-unit">mg/kg</span></div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Dosis sugeridas -->
        <article class="accordion-card" [class.open]="openSection() === 'dosis'">
          <button class="accordion-header" type="button" (click)="toggle('dosis')">
            <div class="accordion-title-block">
              <div class="accordion-title">Dosis sugeridas cuando está por debajo del crítico</div>
              <div class="accordion-sub">Aplicación recomendada (kg/ha).</div>
            </div>
            <div class="accordion-arrow" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </button>
          <div class="accordion-body" *ngIf="openSection() === 'dosis'">
            <div class="nutri-list">
              <div *ngFor="let k of keys(r.micros_dose_kg_ha)" class="nutri-item micro">
                <div class="nutri-icon" aria-hidden="true">{{ short(k) }}</div>
                <div class="nutri-content">
                  <div class="nutri-label">{{ formatLabel(k) }}</div>
                  <div class="nutri-value">{{ r.micros_dose_kg_ha[k] }}<span class="nutri-unit">kg/ha</span></div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </ng-container>
  `
})
export class RiceRequirementsPageComponent implements OnInit {
  data = signal<Req | null>(null);
  error = signal<string | null>(null);
  rice = signal<RiceTargets | null>(null);
  openSection = signal<'macro' | 'bases' | 'criticos' | 'dosis' | null>(null);

  constructor(private api: ApiService) {}

  keys = (o: Record<string, any>) => Object.keys(o || {});

  formatLabel(label: string) {
    return label
      .replace(/_/g, ' ')
      .replace(/\b(\w)/g, (_, c) => c.toUpperCase());
  }

  short(label: string) {
    const m = label.match(/^[A-Za-z]{1,2}/);
    return (m?.[0] || label).toUpperCase();
  }

  toggle(section: 'macro' | 'bases' | 'criticos' | 'dosis') {
    this.openSection.update(current => current === section ? null : section);
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
