
import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

type Lot = { id: number; nombre: string; area_ha: number; analisis_suelo_total?: number };

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink],
  template: `
    <ng-container *ngIf="auth.user(); else guest">
      <div class="dash-stack">
        <!-- Hero principal -->
        <section class="hero-shell hero-dashboard-art" [style.background-image]="'url(assets/223074-P1OEKE-223.jpg)'">
          <div class="hero-copy">
            <span class="greeting-pill">Hola {{ firstName() }}, listo para sembrar</span>
            <h1 class="hero-title">Planifica tu campo de arroz con una vista serena.</h1>

            <div class="hero-stat-row" *ngIf="!loading(); else statsSkeleton">
              <div class="hero-stat">
                <div class="hero-stat__label">Lotes activos</div>
                <div class="hero-stat__value">{{ lots().length }}</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat__label">Análisis</div>
                <div class="hero-stat__value">{{ totalAnalyses() }}</div>
              </div>
            </div>
            <ng-template #statsSkeleton>
              <div class="hero-stat-row">
                <div class="hero-stat skeleton" style="width:140px;height:88px"></div>
                <div class="hero-stat skeleton" style="width:140px;height:88px"></div>
              </div>
            </ng-template>
            <div class="hero-actions">
              <a class="btn-hero btn-orange" routerLink="/lots">Crear nuevo lote</a>
              <a class="btn-hero btn-green" routerLink="/analyses">Registrar análisis</a>
            </div>
          </div>
        </section>

        <!-- Desplegable: Funciones -->
        <section class="qa-section">
          <div class="qa-strip" (click)="toggleFunciones()" (keydown.enter)="toggleFunciones()" tabindex="0" role="button" [attr.aria-expanded]="funcionesOpen()">
            <div class="qa-bg">
              <span class="bg bg-1"></span>
              <span class="bg bg-2"></span>
              <span class="bg bg-3"></span>
              <div class="qa-overlay"></div>
            </div>
            <div class="qa-title">Funciones</div>
            <div class="qa-arrow" [class.open]="funcionesOpen()"></div>
          </div>
          <div class="qa-panel" *ngIf="funcionesOpen()">
            <div class="qa-grid">
              <a class="qa-item qa-bg-lotes" routerLink="/lots">
                <div class="qa-item__title">Mapea lotes</div>
              </a>
              <a class="qa-item qa-bg-analisis" routerLink="/analyses">
                <div class="qa-item__title">Analiza el suelo</div>
              </a>
              <a class="qa-item qa-bg-reco" routerLink="/rice">
                <div class="qa-item__title">Recibe recomendaciones</div>
              </a>
            </div>
          </div>
        </section>

        <!-- Card con precio del arroz -->
        <section class="rice-section">
          <div class="rice-card" [class.up]="priceChange() >= 0" [class.down]="priceChange() < 0">
            <div class="rice-header">
              <div class="rice-title">Precio del arroz</div>
              <div class="rice-meta">COP / tonelada</div>
            </div>
            <div class="rice-ticker">
              <div class="rice-price" [class.up]="priceChange() >= 0" [class.down]="priceChange() < 0">
                {{ price() | number:'1.0-0' }} <span class="unit">COP</span>
              </div>
              <div class="rice-delta" [class.up]="priceChange() >= 0" [class.down]="priceChange() < 0">
                <svg width="14" height="14" viewBox="0 0 24 24"><path [attr.d]="priceChange()>=0 ? 'M12 5l6 6h-4v8H10v-8H6z' : 'M12 19l-6-6h4V5h4v8h4z'" fill="currentColor"/></svg>
                {{ priceChange() | number:'1.0-0' }}
              </div>
            </div>
            <div class="rice-chart">
              <svg viewBox="0 0 600 200" preserveAspectRatio="none" class="chart-svg">
                <defs>
                  <linearGradient id="riceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#34d399" stop-opacity="0.8" />
                    <stop offset="100%" stop-color="#34d399" stop-opacity="0.05" />
                  </linearGradient>
                  <linearGradient id="riceStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#10b981" />
                    <stop offset="100%" stop-color="#059669" />
                  </linearGradient>
                </defs>
                <!-- grid lines -->
                <g class="grid">
                  <path d="M0 180 H600"/>
                  <path d="M0 120 H600"/>
                  <path d="M0 60 H600"/>
                </g>
                <!-- area and line -->
                <path class="area" [attr.d]="areaPath()" fill="url(#riceGradient)" />
                <path class="line" [attr.d]="linePath()" stroke="url(#riceStroke)" fill="none" />
              </svg>
            </div>
          </div>
        </section>
      </div>
    </ng-container>

    <ng-template #guest>
      <div class="dash-stack">
        <section class="feature-grid feature-grid--stack">
          <a class="section-card feature-card" routerLink="/login">
            <div class="feature-card__content">
              <h3 class="feature-card__title">Mapea tus lotes</h3>
              <p class="feature-card__text">Registra áreas y cultivos en minutos.</p>
            </div>
          </a>
        </section>
      </div>
    </ng-template>
  `,
  styles: [`
    .hero-shell{ position:relative; background-size:cover; background-position:center; border-radius:22px; overflow:hidden; box-shadow:0 18px 44px rgba(21,62,41,0.22); padding:20px; min-height:360px; margin:6px 0; display:flex; align-items:center; justify-content:center }
    .hero-shell::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45)); }
    .hero-shell > *{ position:relative; z-index:1 }
    .hero-copy{ color:#fff; max-width:720px; text-align:center; margin: 0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center }
    .greeting-pill{ display:inline-block; background: rgba(255,255,255,0.9); color:#153e29; border-radius:999px; padding:8px 14px; font-weight:900; margin-bottom:12px; font-size:14px }
    .hero-title{ font-size:30px; line-height:1.18; font-weight:900; margin:8px 0 12px; text-shadow: 0 2px 12px rgba(0,0,0,0.5) }
    .hero-stat-row{ display:flex; gap:14px; justify-content:center; align-items:center; margin: 10px 0 }
    .hero-stat{ background:#fff; border:1px solid rgba(21,62,41,0.12); border-radius:16px; padding:12px 16px; box-shadow: 0 10px 24px rgba(21,62,41,0.14); width:160px }
    .hero-stat__label{ color:#335f47; font-weight:800; font-size:12px }
    .hero-stat__value{ color:#153e29; font-weight:900; font-size:22px; text-align:center }
    .hero-actions{ display:flex; gap:12px; justify-content:center; align-items:center; margin-top:14px }
    .btn-hero{ border:none; border-radius:14px; padding:12px 16px; font-weight:800; cursor:pointer; font-size:14px; letter-spacing:.2px; text-decoration:none }
    .btn-orange{ background: linear-gradient(135deg, #f59e0b, #d97706); color:#ffffff }
    .btn-green{ background: linear-gradient(135deg, #2f8f3d, #1f5f3a); color:#fff }

    /* Funciones - Desplegable */
    .qa-section{ margin:12px 0 }
    .qa-strip{ position:relative; height:52px; border-radius:999px; overflow:hidden; cursor:pointer; box-shadow:0 12px 28px rgba(21,62,41,0.18); display:flex; align-items:center; justify-content:center }
    .qa-bg{ position:absolute; inset:0; display:flex }
    .qa-bg .bg{ flex:1 1 33.333%; background-size:cover; background-position:center }
    .qa-bg .bg-1{ background-image:url('/assets/3425929.jpg') }
    .qa-bg .bg-2{ background-image:url('/assets/223074-P1OEKE-223.jpg') }
    .qa-bg .bg-3{ background-image:url('/assets/7867978.jpg') }
    .qa-overlay{ position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45)) }
    .qa-title{ position:relative; z-index:1; color:#fff; font-weight:900; letter-spacing:.2px }
    .qa-arrow{ position:absolute; right:12px; top:50%; width:10px; height:10px; transform:translateY(-50%) rotate(45deg); border-right:2px solid rgba(255,255,255,0.95); border-bottom:2px solid rgba(255,255,255,0.95); transition: transform .2s ease }
    .qa-arrow.open{ transform:translateY(-50%) rotate(-135deg) }
    .qa-panel{ margin-top:10px; background:transparent; padding:0 }
    .qa-grid{ display:grid; grid-template-columns: 1fr; gap:10px }
    .qa-item{ position:relative; display:flex; align-items:center; justify-content:center; text-decoration:none; color:inherit; border:1px solid rgba(21,62,41,0.12); border-radius:14px; overflow:hidden; background:#fff; box-shadow:0 10px 24px rgba(21,62,41,0.10); min-height:110px;
      background-repeat:no-repeat; background-position:right center; background-size:auto 100%; padding:8px 10px; padding-right:42% }
    .qa-item__title{ flex:1; display:flex; align-items:center; justify-content:center; text-align:center; font-weight:900; color:#1f5f3a; font-size:15px }
    .qa-bg-lotes{ background-image:url('/assets/image 20.png') }
    .qa-bg-analisis{ background-image:url('/assets/image 19.png') }
    .qa-bg-reco{ background-image:url('/assets/5115294.jpg') }
    /* quicklist removida */
    @media (min-width: 720px){ .qa-grid{ grid-template-columns: repeat(3, 1fr) } }

    .rice-section{ margin-top: 12px }
    .rice-card{ background:#fff; border:1px solid rgba(21,62,41,0.12); border-radius:16px; box-shadow:0 10px 24px rgba(21,62,41,0.10); padding:12px 14px }
    .rice-header{ display:flex; align-items:baseline; gap:10px }
    .rice-title{ font-weight:900; color:#153e29 }
    .rice-meta{ color:#335f47; font-size:12px }
    .rice-ticker{ display:flex; align-items:center; gap:10px; margin-top:6px }
    .rice-price{ font-size:22px; font-weight:900; color:#153e29 }
    .rice-price .unit{ font-size:12px; color:#335f47; margin-left:4px }
    .rice-delta{ display:flex; align-items:center; gap:6px; font-weight:800; padding:4px 8px; border-radius:999px; font-size:12px; background:rgba(16,185,129,.10); color:#047857 }
    .rice-card.down .rice-delta{ background:rgba(239,68,68,.10); color:#b91c1c }
    .rice-chart{ margin-top:6px; height:180px }
    .chart-svg{ width:100%; height:100% }
    .chart-svg .grid path{ stroke: rgba(21,62,41,0.10); stroke-width:1 }
    .chart-svg .line{ stroke-width:2.5 }
    /* chips de rango eliminados */
  `]
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  funcionesOpen = signal<boolean>(false);
  lots = signal<Lot[]>([]);
  totalAnalyses = signal<number>(0);
  loading = signal<boolean>(true);

  // Precio del arroz
  price = signal<number>(0);
  priceChange = signal<number>(0);
  private series = signal<number[]>([]);
  private priceTimer: any;
  windowSize = signal<number>(60);
  private lastFetch = 0;
  private tickCount = 0;
  anchor = signal<number>(0);

  firstName = computed(() => {
    const raw = this.auth.user()?.nombre_completo ?? '';
    const name = raw.trim().split(/\s+/)[0];
    return name || 'AGROCO';
  });

  constructor(public auth: AuthService, private api: ApiService) {}

  async ngOnInit() {
    if (!this.auth.token()) return;
    const res = await this.api.get<{ data: Lot[] }>(`/api/v1/lots?include=analyses`, true).catch(() => null);
    const data = res?.data || [];
    this.lots.set(data);
    const total = data.reduce((acc, l) => acc + (l.analisis_suelo_total || 0), 0);
    this.totalAnalyses.set(total);
    this.loading.set(false);
    this.initPrice();
  }

  ngOnDestroy() { if (this.priceTimer) clearInterval(this.priceTimer); }

  private initPrice() {
    // Semilla inicial + carga desde backend
    const base = 1600000;
    const seed: number[] = Array.from({ length: 30 }, (_, i) => base + (i-15) * 1000);
    this.series.set(seed);
    this.price.set(seed[seed.length-1]);
    this.priceChange.set(0);
    this.anchor.set(this.price());
    this.tickPrice();
    // mover gráfico más rápido: cada 5s
    this.priceTimer = setInterval(() => this.tickPrice(), 5000);
  }

  private async tickPrice() {
    // 1) Refrescar ancla desde backend aprox. cada hora
    if (Date.now() - this.lastFetch > 60*60*1000) {
      try {
        const r = await this.api.get<{ price: number }>(`/api/v1/market/rice?period=day`, true).catch(() => null);
        if (r?.price) {
          this.anchor.set(r.price);
          this.lastFetch = Date.now();
        }
      } catch {}
    }

    // 2) Simulación de movimiento con picos visibles cada 5s
    const last = this.price();
    const base = this.anchor() || last || 1600000;
    const variance = 0.015; // ±1.5% base
    let delta = base * ((Math.random() * 2 - 1) * variance);
    // Picos más notorios periódicos
    this.tickCount++;
    if (this.tickCount % 3 === 0) {
      const spike = base * (0.02 + Math.random() * 0.03); // 2%–5%
      delta += (Math.random() < 0.5 ? -1 : 1) * spike;
    }
    let next = Math.round(last + delta);
    // límites razonables
    next = Math.max(1200000, Math.min(2400000, next));

    const prev = this.price();
    this.price.set(next);
    this.priceChange.set(next - prev);
    const arr = [...this.series(), next];
    if (arr.length > 90) arr.shift();
    this.series.set(arr);
  }

  // Paths del gráfico (área + línea)
  areaPath(): string { return this.computePath(true); }
  linePath(): string { return this.computePath(false); }
  private computePath(fill: boolean): string {
    const points = this.series().slice(-this.windowSize());
    if (!points.length) return '';
    const w = 600, h = 200, pad = 8;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = Math.max(1, max - min);
    const stepX = points.length > 1 ? (w - pad*2) / (points.length - 1) : (w - pad*2);
    const mapY = (v: number) => h - pad - ((v - min) / range) * (h - pad*2);
    let pts = points.map((v, i) => ({ x: pad + i * stepX, y: mapY(v) }));
    if (pts.length === 1) pts = [pts[0], { x: w - pad, y: pts[0].y }];
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
    if (!fill) return d;
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `M${first.x},${h-pad} L${first.x},${first.y} ${pts.slice(1).map(p=>`L${p.x},${p.y}`).join(' ')} L${last.x},${h-pad} Z`;
  }

  setWindow(n: number){ this.windowSize.set(n); }

  toggleFunciones(){ this.funcionesOpen.update(v => !v); }
}
