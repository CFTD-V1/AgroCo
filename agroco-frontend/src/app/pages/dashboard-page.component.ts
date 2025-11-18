
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
      <div class="dash-stack guest-safe">
        <section class="guest-restore">
          <a class="guest-card" routerLink="/login">
            <div class="guest-card__content">
              <h3 class="guest-card__title">Mapea tus lotes</h3>
              <p class="guest-card__text">Registra &aacute;reas y cultivos en minutos.</p>
            </div>
            <div class="guest-card__art art-lotes" aria-hidden="true"></div>
          </a>

          <a class="guest-card" routerLink="/login">
            <div class="guest-card__content">
              <h3 class="guest-card__title">Analiza el suelo</h3>
              <p class="guest-card__text">Carga resultados y obt&eacute;n diagn&oacute;sticos claros.</p>
            </div>
            <div class="guest-card__art art-analisis" aria-hidden="true"></div>
          </a>

          <a class="guest-card" routerLink="/login">
            <div class="guest-card__content">
              <h3 class="guest-card__title">Recibe recomendaciones</h3>
              <p class="guest-card__text">Planifica la nutrici&oacute;n y fertiliza con confianza.</p>
            </div>
            <div class="guest-card__art art-reco" aria-hidden="true"></div>
          </a>

          <section class="guest-hero-cta">
            <div class="guest-hero__overlay"></div>
            <div class="guest-hero__copy">
              <div class="brand">AgroCo</div>
              <h2 class="guest-hero__title">Administra tus lotes con la calidez del campo.</h2>
              <div class="guest-hero__actions">
                <a class="btn-hero btn-green" routerLink="/login">Entrar</a>
                <a class="btn-hero btn-orange" routerLink="/register">Registrarme</a>
              </div>
            </div>
          </section>
        </section>
      </div>
    </ng-template>
  `,
  styles: [`
      .hero-shell{ position:relative; background-size:cover; background-position:center; border-radius:0; overflow:hidden; box-shadow:0 18px 44px rgba(21,62,41,0.22); padding:28px 24px; min-height:460px; margin:-44px -22px 20px; display:flex; align-items:center; justify-content:center }
    .hero-shell::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45)); }
    .hero-shell > *{ position:relative; z-index:1 }
    .hero-copy{ color:#fff; max-width:720px; text-align:center; margin: 0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center }
    .greeting-pill{ display:inline-block; background: rgba(255,255,255,0.94); color:#153e29; border-radius:999px; padding:12px 22px; font-weight:900; margin-bottom:18px; font-size:17px }
    .hero-title{ font-size:36px; line-height:1.14; font-weight:900; margin:14px 0 18px; text-shadow: 0 3px 16px rgba(0,0,0,0.65) }
    .hero-stat-row{ display:flex; gap:16px; justify-content:center; align-items:center; margin: 14px 0 12px }
    .hero-stat{ background:#fff; border:1px solid rgba(21,62,41,0.12); border-radius:20px; padding:16px 22px; box-shadow: 0 12px 30px rgba(21,62,41,0.2); width:190px }
    .hero-stat__label{ color:#335f47; font-weight:800; font-size:15px }
    .hero-stat__value{ color:#153e29; font-weight:900; font-size:28px; text-align:center }
    .hero-actions{ display:flex; gap:14px; justify-content:center; align-items:center; margin-top:16px }
    .btn-hero{ border:none; border-radius:18px; padding:13px 20px; font-weight:800; cursor:pointer; font-size:15px; letter-spacing:.25px; text-decoration:none }
    .btn-orange{ background: linear-gradient(135deg, #f59e0b, #d97706); color:#ffffff }
    .btn-green{ background: linear-gradient(135deg, #2f8f3d, #1f5f3a); color:#fff }

    /* Funciones - Desplegable */
    .qa-section{ margin:12px 0 }
    .qa-strip{ position:relative; height:52px; border-radius:999px; overflow:hidden; cursor:pointer; box-shadow:0 12px 28px rgba(21,62,41,0.18); display:flex; align-items:center; justify-content:center }
    .qa-bg{ position:absolute; inset:0; display:flex }
    .qa-bg .bg{ flex:1 1 33.333%; background-size:cover; background-position:center }
    .qa-bg .bg-1{ background-image:url('/assets/global-warming-illustration.jpg') }
    .qa-bg .bg-2{ background-image:url('/assets/farm-lifestyle-digital-art.jpg') }
    .qa-bg .bg-3{ background-image:url('/assets/9305850.jpg') }
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
    .qa-bg-reco{ background-image:url('/assets/4072378.jpg') }
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
    /* Guest landing cards + hero (scoped) */
    .guest-restore{ display:grid; gap:16px; margin-left:-20px; margin-right:-20px; width: calc(100% + 40px); padding-left: max(env(safe-area-inset-left,0px), 0px); padding-right: max(env(safe-area-inset-right,0px), 0px); }
    .guest-card{ position:relative; display:grid; grid-template-columns: 1fr; gap:10px; align-items:center; text-decoration:none; color:inherit; background:#fff; border:1px solid rgba(21,62,41,0.12); border-radius:24px; padding:14px 20px; min-height: 120px; margin:0; box-shadow: 0 18px 30px rgba(21,62,41,0.14); overflow:hidden; transition: transform .18s ease, box-shadow .18s ease; opacity:0; transform: translateY(12px); animation: guestCardRise .7s ease-out forwards }
    .guest-card__title{ margin:0 0 8px; font-weight:900; font-size:19px; color: var(--green-900) }
    /* Títulos con color distinto por card */
    .guest-restore > .guest-card:nth-of-type(1) .guest-card__title{ color: var(--primary-600); }
    .guest-restore > .guest-card:nth-of-type(2) .guest-card__title{ color: #facc15; }
    .guest-restore > .guest-card:nth-of-type(3) .guest-card__title{ color: var(--green-700); }
    .guest-card__text{ margin:0; font-size:14px; color: var(--text-600); line-height:1.35 }
    .guest-card__content{ position:relative; z-index:2 }
    /* Imagen integrada solo al lado derecho */
    .guest-card__art{ position:absolute; top:0; right:0; bottom:0; left:auto; width:clamp(120px, 42%, 240px); border-radius:inherit; background-size:cover; background-position:right center; background-repeat:no-repeat; opacity:1; filter:none; z-index:0 }
    .guest-card::after{ content:''; position:absolute; inset:0; border-radius:inherit; z-index:1; background: linear-gradient(90deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.85) 48%, rgba(255,255,255,0.70) 65%, rgba(255,255,255,0.35) 85%, rgba(255,255,255,0.08) 100%); pointer-events:none }
    .guest-card:active{ transform: translateY(1px); box-shadow: 0 12px 28px rgba(21,62,41,0.14) }
    .guest-restore > .guest-card:nth-of-type(1){ animation-delay: .0s }
    .guest-restore > .guest-card:nth-of-type(2){ animation-delay: .08s }
    .guest-restore > .guest-card:nth-of-type(3){ animation-delay: .16s }
    .art-lotes{ background-image:url('/assets/image 20.png') }
    /* Intercambio de imágenes entre Analiza y Recomendaciones */
    .art-analisis{ background-image:url('/assets/4072378.jpg') }
    .art-reco{ background-image:url('/assets/image 19.png') }

    .guest-hero-cta{ position:relative; border-radius:24px; overflow:hidden; min-height:430px; margin:8px 6px 0; background: #c0d5cb; background-image:url('/assets/image 22.png'); background-size:cover; background-position:center center; background-repeat:no-repeat; box-shadow: 0 24px 52px rgba(21,62,41,0.25); animation: heroDrift 22s ease-in-out infinite alternate }
    .guest-hero__overlay{ position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.14), rgba(0,0,0,0.40)) }
    .guest-hero__copy{ position:absolute; inset:0; z-index:1; padding:40px 24px 28px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#fff; transform: translateY(20px); }
    .guest-hero__title{ margin: 16px 0 18px; font-size:29px; line-height:1.22; font-weight:900; letter-spacing:.015em; text-shadow: 0 3px 14px rgba(0,0,0,0.7); animation: heroTitleFloat 4.5s ease-in-out infinite alternate }
    .brand{ font-weight:900; letter-spacing:.3px; background: rgba(255,255,255,0.97); color:#1f5f3a; border-radius:999px; padding:8px 16px; font-size:14px }
    .guest-hero__actions{ display:flex; justify-content:center; align-items:center; gap:14px; margin-top:6px }
    .guest-hero__actions .btn-hero{ padding: 14px 22px; font-size:15px; min-width:140px; text-align:center; border-radius:999px }

    @keyframes guestCardRise{
      0%{ opacity:0; transform: translateY(16px); }
      100%{ opacity:1; transform: translateY(0); }
    }

    @keyframes heroDrift{
      0%{ background-position:center 18%; }
      50%{ background-position:center 26%; }
      100%{ background-position:center 20%; }
    }

    @keyframes heroTitleFloat{
      0%{ transform: translateY(0); }
      100%{ transform: translateY(2px); }
    }

    /* Safe area for notches (top) */
    .guest-safe{ padding-top: calc(env(safe-area-inset-top, 0px) + 12px); padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 4px); }
    /* Legacy iOS support */
    @supports (padding-top: constant(safe-area-inset-top)){
      .guest-safe{ padding-top: calc(constant(safe-area-inset-top) + 12px); padding-bottom: calc(constant(safe-area-inset-bottom) + 12px); }
    }

    /* === Restaurar vista inicial (landing invitado) === */
    .guest-restore.feature-grid.feature-grid--stack{ display:block; margin-top: 12px; }
    .guest-restore.feature-grid.feature-grid--stack .feature-card{
      display:flex !important;
      flex-direction:column !important;
      align-items:flex-start !important;
      justify-content:center !important;
      background:#ffffff !important;
      border:1px solid rgba(21,62,41,0.12) !important;
      border-radius: 999px !important;
      padding: 16px 22px !important;
      box-shadow: 0 14px 30px rgba(21,62,41,0.14) !important;
      width: min(560px, calc(100% - 40px)) !important;
      margin: 0 auto !important;
      min-height: auto !important;
      grid-template-columns: initial !important;
      grid-template-rows: initial !important;
    }
    .guest-restore.feature-grid.feature-grid--stack .feature-card__title{
      margin: 0 0 4px !important;
      font-weight: 900 !important;
      font-size: 18px !important;
      color: var(--green-900) !important;
    }
    .guest-restore.feature-grid.feature-grid--stack .feature-card__text{
      margin: 0 !important;
      font-size: 13px !important;
      color: var(--text-600) !important;
      line-height: 1.28 !important;
    }
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
    // Desactivado en local: evitamos llamar a /market/rice para no generar errores en consola
    // return;
    // 1) Refrescar ancla desde backend aprox. cada hora
    if (Date.now() - this.lastFetch > 60*60*1000) {
      try {
        const r = await this.api.get<{ price: number }>(`/api/v1/market/rice?period=day`, true).catch(() => null);
        const price = r?.price;
        if (typeof price === 'number') {
          this.anchor.set(price as number);
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












