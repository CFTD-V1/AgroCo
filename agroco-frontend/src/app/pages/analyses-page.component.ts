import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

type Lot = { id: number; nombre: string };
type Analysis = { id: number; lote_id: number; meta_rendimiento_t_ha: number | null; fertilizer_plan?: { id: number; pdf_download?: string | null } };

@Component({
  standalone: true,
  selector: 'app-analyses-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="hero-shell">
      <div class="hero-copy">
        <span class="tagline">Laboratorio del campo</span>
        <h1 class="hero-title">Convierte resultados de suelo en acciones concretas.</h1>
        <p class="hero-subtitle">Registra tus análisis, genera planes de fertilización y descarga documentos listos para compartir.</p>
      </div>
    </section>

    <section class="ana-section">
      <details class="ana-acc-card">
        <summary class="ana-acc-hero"><div class="acc-hero-center"><h3 class="acc-hero-title">Crea tu análisis</h3></div></summary>
        <div class="acc-content">
          <div class="floating-layers">
        <form class="form-shell" (ngSubmit)="onCreate()">
          <div class="form-title">Nuevo análisis</div>
          <div class="form-sub">Selecciona el lote y define el objetivo de rendimiento.</div>
          <div class="row">
            <div class="col step">
              <label>Lote</label>
              <select class="input" required [(ngModel)]="form.lotId" name="lotId">
                <option value="">Selecciona</option>
                <option *ngFor="let l of lots()" [value]="l.id">{{ l.nombre }}</option>
              </select>
            </div>
            <div class="col step" *ngIf="form.lotId">
              <label>Fecha muestreo</label>
              <input class="input" type="date" [(ngModel)]="form.sampled_at" name="sampled_at" />
            </div>
            <div class="col step" *ngIf="form.sampled_at">
              <label>Objetivo (t/ha)</label>
              <input class="input" type="number" step="0.1" min="4" max="12" [(ngModel)]="form.yield_target_t_ha" name="yield" required />
            </div>
          </div>
          <div class="row" *ngIf="form.lotId && form.sampled_at">
            <div class="col"><label>P (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.p_mgkg" name="p" /></div>
            <div class="col"><label>K (cmol/kg)</label><input class="input" type="number" [(ngModel)]="form.k_cmol" name="k" /></div>
            <div class="col"><label>Ca (cmol/kg)</label><input class="input" type="number" [(ngModel)]="form.ca_cmol" name="ca" /></div>
            <div class="col"><label>Mg (cmol/kg)</label><input class="input" type="number" [(ngModel)]="form.mg_cmol" name="mg" /></div>
            <div class="col"><label>S (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.s_mgkg" name="s" /></div>
          </div>
          <div class="row" *ngIf="form.lotId && form.sampled_at">
            <div class="col"><label>B (mg/kg)</label><input class="input" type="number" step="0.01" [(ngModel)]="form.b_mgkg" name="b_mgkg" /></div>
            <div class="col"><label>Fe (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.fe_mgkg" name="fe_mgkg" /></div>
            <div class="col"><label>Mn (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.mn_mgkg" name="mn_mgkg" /></div>
          </div>
          <div class="row" *ngIf="form.lotId && form.sampled_at">
            <div class="col"><label>Zn (mg/kg)</label><input class="input" type="number" step="0.01" [(ngModel)]="form.zn_mgkg" name="zn_mgkg" /></div>
            <div class="col"><label>Cu (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.cu_mgkg" name="cu_mgkg" /></div>
          </div>
          <div *ngIf="error()" style="color:#d16969">{{ error() }}</div>
          <div class="row" style="justify-content:flex-start">
            <button class="btn" [disabled]="loading()" type="submit">Crear análisis</button>
          </div>
        </form>
          </div>
        </div>
      </details>
    </section>

    <!-- Descargas (desplegable) -->
    <section class="section-grid" style="margin-top:16px">
      <details class="download-acc">
        <summary class="download-hero">
            <div class="download-hero__img">
            <div class="download-hero__label">Descargar análisis</div>
          </div>
        </summary>
        <div class="download-panel">
          <div class="download-grid">
            <div class="download-item" *ngFor="let a of analyses(); let i = index" [class.ready]="a.fertilizer_plan?.pdf_download" [class.pending]="!a.fertilizer_plan?.pdf_download">
              <div class="download-info">
                <div class="download-title">Análisis #{{ i + 1 }}</div>
                <div class="download-sub">Objetivo: {{ a.meta_rendimiento_t_ha ?? '?' }} t/ha</div>
                <div class="download-status" [class.ready]="a.fertilizer_plan?.pdf_download" [class.pending]="!a.fertilizer_plan?.pdf_download">
                  {{ a.fertilizer_plan?.pdf_download ? 'PDF listo' : 'Pendiente' }}
                </div>
              </div>
              <div class="download-actions">
                <a class="btn btn-icon" [routerLink]="['/analyses', a.id]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" fill="currentColor"/></svg>
                  <span>Ver detalles</span>
                </a>
                <a *ngIf="a.fertilizer_plan?.pdf_download" class="btn btn-secondary btn-icon" [href]="a.fertilizer_plan?.pdf_download" target="_blank" rel="noopener">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Descargar PDF</span>
                </a>
                <button *ngIf="!a.fertilizer_plan?.pdf_download"
                        class="btn btn-secondary btn-icon" type="button"
                        (click)="onGeneratePlan(a)" [disabled]="planInProgress() === a.id">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <ng-container *ngIf="planInProgress() === a.id; else genLabel">Generando...</ng-container>
                  <ng-template #genLabel><span>Generar plan</span></ng-template>
                </button>
              </div>
            </div>
          </div>
        </div>
      </details>
    </section>

    <!-- Descargas rápidas: planes listos -->
    <section class="section-grid" style="margin-top:16px" *ngIf="false">
      <div class="section-card">
        <div class="section-heading">Planes listos para descargar</div>
        <div class="section-sub">Accede directamente a los PDF generados.</div>
        <div class="row" style="grid-template-columns: 1fr; gap:10px; margin-top:10px">
          <div class="download-item" *ngFor="let a of readyAnalyses(); let i = index">
            <div class="download-info">
              <div class="download-title">Análisis #{{ i + 1 }}</div>
              <div class="download-sub">Objetivo: {{ a.meta_rendimiento_t_ha ?? '?' }} t/ha</div>
            </div>
            <div class="download-actions">
              <a class="btn" [routerLink]="['/analyses', a.id]">Ver detalles</a>
              <a class="btn btn-secondary" [href]="a.fertilizer_plan?.pdf_download || '#'" target="_blank" rel="noopener">Descargar PDF</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-grid" style="margin-top:24px" *ngIf="showLegacyList">
      <ng-container *ngIf="analyses().length; else empty">
        <div *ngFor="let a of analyses(); let i = index" class="section-card">
          <div class="section-heading">Análisis #{{ a.id }}</div>
          <div class="section-sub">Objetivo: {{ a.meta_rendimiento_t_ha ?? '?' }} t/ha</div>
          <div class="row" style="gap:12px; margin-top:8px">
            <a class="btn" [routerLink]="['/analyses', a.id]">Ver detalles</a>
            <button
              class="btn btn-secondary"
              type="button"
              (click)="onGeneratePlan(a)"
              [disabled]="planInProgress() === a.id"
            >
              <ng-container *ngIf="planInProgress() === a.id; else label">Generando...</ng-container>
              <ng-template #label>Generar plan</ng-template>
            </button>
          </div>
        </div>
      </ng-container>
    </section>

    <ng-template #empty>
      <div class="empty-state">Registra tu primer análisis para desbloquear planes de fertilización personalizados.</div>
    </ng-template>
  `,
  styles: [`
    /* Hero card container with background image */
    .hero-shell{ position:relative; background: url('/assets/4072378.jpg') center/cover no-repeat; border:none; border-radius:22px; overflow:hidden; box-shadow:0 18px 44px rgba(21,62,41,0.22); padding:24px; min-height: 400px; display:flex; align-items:center; justify-content:center; width: 100%; margin: 6px 0 0 0 }
    .hero-shell::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.32), rgba(0,0,0,0.62)); backdrop-filter: blur(1.5px); }
    .hero-shell > *{ position: relative; z-index: 1; }
    .hero-copy{ color:#fff; max-width: 760px; text-align:center; display:flex; flex-direction:column; align-items:center }
    .hero-copy .tagline{ display:inline-block; background: rgba(255,255,255,0.96); color:#153e29; border-radius:999px; padding:7px 14px; font-weight:900; margin:0 auto 12px; font-size:13px; box-shadow:0 6px 18px rgba(0,0,0,0.18) }
    .hero-copy .hero-title{ color:#ffffff; text-shadow: 0 2px 14px rgba(0,0,0,0.55); margin: 10px 0 10px; font-size: 36px; line-height: 1.18; font-weight: 900; letter-spacing:.2px }
    .hero-copy .hero-subtitle{ color:#f1fffa; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.5); max-width: 52ch; font-weight:700; font-size:18px; line-height:1.45 }
    @media (max-width: 720px){ .hero-shell{ min-height: 340px; padding:18px } .hero-copy .hero-title{ font-size: 30px } .hero-copy .hero-subtitle{ font-size:16px } }

    /* Inner form card */
    .floating-layers{ background: rgba(255,255,255,0.98); border:none; border-radius: 0 0 16px 16px; box-shadow: none; padding:12px 14px 16px; margin-top: 0; }
    .form-title { font-weight: 800; color:#153e29; margin-bottom: 4px; text-align:center }
    .form-sub { color:#335f47; margin-bottom: 8px; }
    .row { display:grid; grid-template-columns: 1fr; gap:12px; margin-bottom: 10px; }
    @media(min-width:720px){ .row{ grid-template-columns: repeat(2, 1fr) } }
    .col{ display:flex; flex-direction:column; gap:8px }
    label{ font-size:14px; color:#274736; font-weight:800 }
    .input{ height: 56px; border-radius: 16px; border:1px solid rgba(21,62,41,0.20); padding: 12px 14px; font-size:16px; background:#ffffff }
    .input:focus{ outline:none; border-color:#2f8f3d; box-shadow:0 0 0 4px rgba(47,143,61,0.12) }
    .input:hover{ border-color:#1f5f3a }
    /* Oculta flechas de number para un look más limpio */
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button{ -webkit-appearance: none; margin: 0 }
    input[type=number]{ -moz-appearance:textfield }
    .btn{ background: linear-gradient(135deg, #2f8f3d, #1f5f3a); color:#fff; border:none; border-radius:14px; padding:12px 16px; font-weight:900; letter-spacing:.2px; box-shadow: 0 12px 26px rgba(21,62,41,0.20); }
    .btn.btn-secondary{ background: #e8f2ec; color:#1f5f3a }

    /* Step-by-step reveal */
    .step-form .step{ animation: fadeSlideIn .18s ease; }
    .actions{ margin-top:8px }
    .form-error{ color:#d16969 }
    @keyframes fadeSlideIn{ from{ opacity:0; transform: translateY(-6px) } to{ opacity:1; transform: translateY(0) } }

    /* Accordion card for the analysis form */
    .ana-acc-card{ background:#fff; border:none; border-radius:16px; box-shadow: 0 14px 32px rgba(21,62,41,0.10); overflow:hidden; margin: 12px 0 18px; }
    .ana-acc-card>summary{ list-style:none; display:block; cursor:pointer; padding:0; position:relative }
    .ana-acc-card>summary::-webkit-details-marker{ display:none }
    .ana-acc-hero{ position: relative; padding:0; min-height: 220px; background: url('/assets/7867974.jpg') center/cover no-repeat !important; border-bottom: none; }
    .ana-acc-hero::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0.45)); }
    .acc-hero-center{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; text-align:center; padding: 12px }
    .acc-hero-title{ color:#fff; font-weight:900; font-size: 30px; letter-spacing:.2px; text-shadow: 0 2px 12px rgba(0,0,0,0.6) }
    .acc-content{ padding:0 16px 16px }
    .ana-form .input{ height: 54px; border-radius: 14px; font-size: 16px }
    .ana-form label{ font-size: 13px; font-weight: 800; color:#153e29 }

    /* Use container gutters again (no full-bleed) */
    .ana-section{ width: 100%; margin-left: 0; margin-right: 0; }
    .download-item{ display:flex; align-items:center; justify-content:space-between; gap:12px; background: linear-gradient(180deg, #ffffff, #f7faf8); border:none; border-radius:16px; padding:14px 16px; overflow:hidden; flex-wrap:wrap; box-shadow:0 10px 24px rgba(21,62,41,0.08) }
    .download-item.ready{ box-shadow: 0 10px 24px rgba(16,185,129,0.12) }
    .download-item.pending{ box-shadow: 0 10px 24px rgba(245,158,11,0.10) }
    .download-info{ display:flex; flex-direction:column }
    .download-title{ font-weight:900; color:#153e29; font-size:16px; letter-spacing:.2px }
    .download-sub{ color:#466e59; font-size:12px }
    .download-actions{ display:flex; gap:8px; flex-wrap:nowrap; align-items:center; justify-content:flex-start; white-space:nowrap }
    .download-actions .btn{ flex:0 0 auto }
    .btn-icon{ display:inline-flex; align-items:center; gap:8px }
    .download-status{ margin-top:4px; font-weight:800; font-size:11px; padding:4px 8px; border-radius:999px; width:max-content }
    .download-status.ready{ background: rgba(16,185,129,0.12); color:#047857 }
    .download-status.pending{ background: rgba(245,158,11,0.12); color:#92400e }
    .download-actions .btn{ padding:10px 14px; border-radius:16px }
    .download-actions .btn:hover{ transform: translateY(-1px); transition: transform .12s ease }
    .download-actions .btn.btn-secondary{ background:#eaf5ef; color:#1f5f3a }
    /* Descargar análisis - acordeón */
    .download-acc{ background:#fff; border:none; border-radius:16px; box-shadow: 0 14px 32px rgba(21,62,41,0.10); overflow:hidden; margin: 12px 0 18px; }
    .download-acc>summary{ list-style:none; display:block; cursor:pointer; padding:0; position:relative }
    .download-acc>summary::-webkit-details-marker{ display:none }
    .download-hero__img{ position: relative; height:200px; background: url('/assets/2110.w023.n001.1202B.p1.1202.jpg') center/cover no-repeat }
    .download-hero__img::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.35)) }
    .download-hero__label{
      position:absolute; left:50%; top:50%; transform: translate(-50%, -50%);
      background: transparent; border:none; box-shadow:none; backdrop-filter:none;
      color:#ffffff; font-weight:900; font-size:24px; letter-spacing:.3px; line-height:1; white-space:nowrap; text-align:center;
      padding:0; margin:0;
      text-shadow: 0 2px 10px rgba(0,0,0,0.65), 0 4px 14px rgba(0,0,0,0.45);
      z-index:1;
    }
    .download-panel{ padding: 12px 14px 16px }
    .download-grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:12px }
  `]
})
export class AnalysesPageComponent implements OnInit {
  analyses = signal<Analysis[]>([]);
  lots = signal<Lot[]>([]);
  error = signal<string | null>(null);
  loading = signal(false);
  planInProgress = signal<number | null>(null);
  showLegacyList = false;
  form: any = { lotId: '', sampled_at: '', yield_target_t_ha: '7', p_mgkg: '', k_cmol: '', ca_cmol: '', mg_cmol: '', s_mgkg: '', b_mgkg: '', fe_mgkg: '', mn_mgkg: '', zn_mgkg: '', cu_mgkg: '' };

  constructor(private api: ApiService, public auth: AuthService, private toast: ToastService) {}

  async ngOnInit() { await this.load(); }

  async load() {
    if (!this.auth.token()) return;
    this.loading.set(true); this.error.set(null);
    try {
      const resA = await this.api.get<{ data: Analysis[] }>(`/api/v1/soil-analyses?include=plan`, true);
      const resL = await this.api.get<{ data: Lot[] }>(`/api/v1/lots`, true);
      this.analyses.set(resA?.data || []);
      this.lots.set(resL?.data || []);
    } catch (e: any) {
      const message = e?.message || 'No se pudieron cargar los análisis';
      this.error.set(message);
      this.toast.show(message, 'error');
    }
    this.loading.set(false);
  }

  async onCreate() {
    if (!this.auth.token()) return;
    // Validaciones rápidas en cliente
    if (!this.form.lotId) { this.error.set('Selecciona un lote'); return; }
    const goal = Number(this.form.yield_target_t_ha);
    if (isNaN(goal) || goal <= 0) { this.error.set('Ingresa un objetivo de rendimiento válido (t/ha)'); return; }
    this.loading.set(true); this.error.set(null);
    try {
      const payload: any = { sampled_at: this.form.sampled_at || undefined, yield_target_t_ha: Number(this.form.yield_target_t_ha) };
      for (const k of ['p_mgkg','k_cmol','ca_cmol','mg_cmol','s_mgkg','b_mgkg','fe_mgkg','mn_mgkg','zn_mgkg','cu_mgkg']) if (this.form[k] !== '' && this.form[k] !== null && this.form[k] !== undefined) payload[k] = Number(this.form[k]);
      await this.api.post(`/api/v1/lots/${this.form.lotId}/soil-analyses`, payload, true);
      this.form = { lotId: '', sampled_at: '', yield_target_t_ha: '7', p_mgkg: '', k_cmol: '', ca_cmol: '', mg_cmol: '', s_mgkg: '', b_mgkg: '', fe_mgkg: '', mn_mgkg: '', zn_mgkg: '', cu_mgkg: '' };
      await this.load();
      this.toast.show('Análisis creado correctamente', 'success');
    } catch (e: any) {
      const message = e?.message || 'No se pudo crear el análisis';
      this.error.set(message);
      this.toast.show(message, 'error');
    }
    this.loading.set(false);
  }

  async onGeneratePlan(a: Analysis) {
    if (!this.auth.token()) return;
    this.planInProgress.set(a.id);
    try {
      await this.api.post(`/api/v1/soil-analyses/${a.id}/plan/generate`, {}, true);
      await this.load();
      this.toast.show('Plan generado. Revisa el detalle para descargar el PDF.', 'success');
    } catch (e: any) {
      const message = e?.message || 'No se pudo generar el plan';
      this.toast.show(message, 'error');
    } finally {
      this.planInProgress.set(null);
    }
  }

  // Filtra análisis con plan y enlace disponible
  readyAnalyses(){
    return this.analyses().filter(a => !!a.fertilizer_plan?.pdf_download);
  }
}




