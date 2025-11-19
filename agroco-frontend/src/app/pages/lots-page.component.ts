import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

type LotLocation = { dept?: string; muni?: string; vereda?: string; lat?: number; lng?: number };
type Lot = {
  id: number;
  nombre: string;
  area_ha: number;
  cultivo: string;
  fecha_siembra?: string | null;
  analisis_suelo_total?: number;
  ubicacion?: LotLocation | null;
};

type ColombiaDept = { id: number; departamento: string; ciudades: string[] };

@Component({
  standalone: true,
  selector: 'app-lots-page',
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .lots-bg { background: transparent; min-height: 100%; }
    .container { width: 100%; max-width: none; margin-inline: 0; padding-inline: 10px; }
    .lots-hero > .container { padding-left: 0; padding-right: 0; margin: 0; width: 100%; max-width: none; }
    .lots-hero .hero-card { width: 100%; margin-inline: 0; }
    .lots-hero { padding: 6px 0 4px; }
    .lots-hero__content { display: grid; grid-template-columns: 1fr; gap: 16px; align-items: start; }
    .lots-copy .tagline { color: #335f47; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .6px; }
    .lots-copy .hero-title { margin: 6px 0 8px; font-size: 28px; line-height: 1.15; color: #153e29; font-weight: 900; }
    .lots-copy .hero-subtitle { color:#274736; margin: 0 0 10px; }
    .hero-stats { display:flex; gap: 10px; }
    .metric-card { background:#fff; border:1px solid rgba(21,62,41,0.12); border-radius: 12px; padding: 10px 12px; box-shadow: 0 8px 20px rgba(21,62,41,0.08); }
    .metric-label { display:block; font-size: 12px; color:#335f47 }
    .metric-value { font-weight: 900; color:#153e29; font-size:18px }

    .hero-card{
      position:relative;
      background: url('/assets/7867978.jpg') center / cover no-repeat;
      border:1px solid rgba(21,62,41,0.12);
      border-radius:22px;
      overflow:hidden;
      box-shadow:0 18px 44px rgba(21,62,41,0.22);
      min-height: 460px;
      display:flex;
      align-items:center;
      justify-content:center;
      width:100%;
    }
    .hero-card::before{
      content:'';
      position:absolute;
      inset:0;
      background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45));
    }
    .hero-left{
      position:relative;
      z-index:1;
      text-align:center;
      padding:18px;
      color:#ffffff;
      max-width: 720px;
    }
    .greeting-pill{
      display:inline-block;
      background: rgba(255,255,255,0.88);
      color:#153e29;
      border-radius:999px;
      padding:8px 14px;
      font-weight:800;
      margin-bottom:12px;
      font-size:14px;
    }
    .hero-title{
      font-size: 32px;
      line-height:1.18;
      font-weight: 900;
      margin: 10px 0 16px;
      color:#ffffff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.35);
    }
    .stat-group{
      display:flex;
      gap:12px;
      justify-content:center;
      margin-top: 8px;
    }
    .stat{
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(3px);
      border-radius:16px;
      padding:12px 16px;
      min-width: 160px;
      box-shadow: 0 12px 24px rgba(0,0,0,0.22);
    }
    .stat .label{
      color:#153e29;
      font-weight:800;
      font-size:14px;
    }
    .stat .value{
      color:#153e29;
      font-weight:900;
      font-size:24px;
    }
    .hero-actions{
      display:flex;
      gap:16px;
      justify-content:center;
      margin-top:18px;
      flex-wrap: nowrap;
    }
    .btn-hero{
      border:none;
      border-radius:20px;
      padding:16px 24px;
      min-width:180px;
      font-weight:800;
      cursor:pointer;
      font-size:16px;
      font-family: 'Outfit', system-ui, sans-serif;
      letter-spacing: .24px;
    }
    .btn-orange{ background: linear-gradient(135deg, #f59e0b, #d97706); color:#ffffff; }
    .btn-green{ background: linear-gradient(135deg, #2f8f3d, #1f5f3a); color:#fff; }
    @media(max-width:720px){
      .hero-card{ min-height: 360px; }
      .hero-title{ font-size:26px }
      .stat{ min-width: 140px }
    }

    .lots-panel.card {
      background:#fff;
      border:1px solid rgba(21,62,41,0.12);
      border-radius:16px;
      box-shadow: 0 14px 32px rgba(21,62,41,0.10);
      padding:6px;
    }
    .form-title { font-weight: 800; color:#153e29; margin-bottom: 4px; }
    .form-sub { color:#335f47; margin-bottom: 8px; }
    .row { display:grid; grid-template-columns: 1fr; gap:8px; margin-bottom: 6px; }
    @media(min-width:720px){
      .lots-hero__content{ grid-template-columns: 1.1fr .9fr }
      .row{ grid-template-columns: 1fr 1fr }
    }
    .col { display:flex; flex-direction:column; gap:6px; }
    label { font-size: 12px; color:#274736; font-weight:700 }
    .input-group {
      position:relative;
      display:flex;
      align-items:center;
      gap:6px;
      border:1px solid rgba(21,62,41,0.18);
      border-radius: 10px;
      padding: 6px 8px;
      background:#fff;
    }
    .input-group .input-icon { color:#1f5f3a; display:inline-flex; align-items:center; justify-content:center; }
    .input-group .input-icon svg { width: 18px; height: 18px; display:block; }
    .input-group .input-inner { border:none; outline: none; width:100%; font-size: 14px; color:#153e29; background: transparent; }
    .input-group .select { appearance: none; -webkit-appearance: none; -moz-appearance: none; }
    .input-suffix { color:#335f47; font-weight: 700; font-size: 12px; margin-left:6px }

    .lot-form .input,
    .lot-form .input-inner,
    .lot-form select.input {
      padding: 6px 10px !important;
      height: 36px;
      border-radius: 10px;
    }
    @media(max-width:420px){
      .lot-form .input,
      .lot-form .input-inner,
      .lot-form select.input { height: 34px; }
    }
    .lot-form .row{ gap:8px; margin-bottom:6px; }

    .lot-form label{
      font-weight:900;
      color:#153e29;
      font-size:13.5px;
      letter-spacing:.2px;
      margin-bottom:4px;
    }
    .lot-form .input,
    .lot-form .input-inner,
    .lot-form select.input{
      border:1px solid rgba(21,62,41,0.22);
      background:#f8fbf9;
      color:#153e29;
      font-size:15px;
    }
    .lot-form .input::placeholder,
    .lot-form .input-inner::placeholder{
      color:rgba(21,62,41,0.55);
    }
    .lot-form .input:focus,
    .lot-form .input-inner:focus,
    .lot-form select.input:focus{
      outline:none;
      border-color: rgba(47,143,61,0.55);
      box-shadow: 0 0 0 2px rgba(47,143,61,0.25);
    }
    .lot-form .btn{
      background: linear-gradient(135deg, #2f8f3d, #1f5f3a);
      color:#fff;
      border:none;
      border-radius:14px;
      padding:14px 18px;
      font-weight:900;
      letter-spacing:.2px;
      box-shadow: 0 12px 26px rgba(21,62,41,0.20);
      transition: transform .08s ease, filter .15s ease;
    }
    .lot-form .btn:hover{ filter: brightness(1.02); transform: translateY(-1px); }
    .lot-form .btn:disabled{ opacity:.7; cursor:not-allowed; }
    .lot-form .btn.btn-secondary{ background: linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; }

    .lots-grid { display:grid; grid-template-columns: 1fr; gap: 12px; }
    @media(min-width:640px){ .lots-grid{ grid-template-columns: repeat(2, 1fr) } }
    .lot-card { background:#fff; border:1px solid rgba(21,62,41,0.12); border-radius: 14px; padding: 12px; box-shadow: 0 8px 22px rgba(21,62,41,0.08); }
    .lot-card__header { display:flex; align-items:center; justify-content: space-between; gap:10px }
    .lot-card__title { font-weight: 900; color:#153e29; }
    .lot-card__meta { color:#274736; font-size: 13px; }
    .lot-card__actions { display:flex; gap:6px }
    .icon-btn { background:#fff; border:1px solid rgba(21,62,41,0.18); border-radius: 14px; width:42px; height:42px; display:inline-flex; align-items:center; justify-content:center; color:#153e29; box-shadow: 0 4px 10px rgba(0,0,0,0.06); transition: filter .15s ease, transform .08s ease }
    .icon-btn:hover { filter: brightness(1.03); transform: translateY(-1px); }
    .icon-btn svg { width:22px; height:22px }
    .icon-btn.danger{ color:#8a2a2a; border-color: rgba(138,42,42,0.2) }
    .lot-card__footer { margin-top:8px }
    .pill-tag {
      background: rgba(47,143,61,0.14);
      color:#153e29;
      border:1px solid rgba(47,143,61,0.22);
      border-radius: 999px;
      padding: 8px 12px;
      font-weight:800;
      font-size: 13.5px;
      display:inline-block;
    }

    .empty-state {
      color:#274736;
      background: rgba(21,62,41,0.05);
      border:1px dashed rgba(21,62,41,0.20);
      border-radius: 12px;
      padding: 16px;
      margin: 18px auto;
      text-align:center;
    }

    .acc-card{
      background:#fff;
      border:1px solid rgba(21,62,41,0.12);
      border-radius:16px;
      box-shadow: 0 14px 32px rgba(21,62,41,0.10);
      overflow:hidden;
      margin: 12px 0 18px;
    }
    .acc-card>summary{
      list-style:none;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      padding:10px 12px;
      cursor:pointer;
    }
    .acc-card>summary::-webkit-details-marker{ display:none }
    .acc-title{ font-weight:900; color:#153e29; }
    .acc-sub{ color:#335f47; font-size:13px; }
    .acc-head{ display:flex; flex-direction:column; gap:4px }
    .acc-thumb{
      flex:0 0 140px;
      height:84px;
      border-radius:12px;
      background:url('/assets/40Z_2105.w026.n002.443B.p0.443.jpg') center/cover no-repeat;
    }
    .acc-content{ padding:14px 16px }

    .acc-card > summary.acc-hero{
      position: relative;
      padding:0;
      min-height: 200px;
      background: url('/assets/40Z_2105.w026.n002.443B.p0.443.jpg') center/cover no-repeat;
      border-bottom: 1px solid rgba(21,62,41,0.12);
    }
    .acc-card > summary.acc-hero::before{
      content:'';
      position:absolute;
      inset:0;
      background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45));
    }
    .acc-hero-center{
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      text-align:center;
      padding: 12px;
    }
    .acc-hero-title{
      color:#fff;
      font-weight:900;
      font-size: 28px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    .acc-card > summary.acc-hero-lot{
      position: relative;
      padding:0;
      min-height: 180px;
      background: url('/assets/40Z_2105.w026.n002.443B.p0.443.jpg') center/cover no-repeat !important;
      border-bottom: 1px solid rgba(21,62,41,0.12);
    }
    .acc-card > summary.acc-hero-lot::before{
      content:'';
      position:absolute;
      inset:0;
      background: linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0.45));
    }

    .acc-card > summary.acc-hero-lot-list{
      position: relative;
      padding:0;
      min-height: 180px;
      background: url('/assets/3425929.jpg') center/cover no-repeat !important;
      border-bottom: 1px solid rgba(21,62,41,0.12);
    }
    .acc-card > summary.acc-hero-lot-list::before{
      content:'';
      position:absolute;
      inset:0;
      background: linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0.45));
    }

    .lot-list{ display:flex; flex-direction:column; gap:12px; }
    .lot-item{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      background:#fff;
      border:1px solid rgba(21,62,41,0.12);
      border-radius:18px;
      padding:16px 18px;
      box-shadow: 0 10px 22px rgba(21,62,41,0.10);
      transition: transform .08s ease, box-shadow .2s ease;
      border-left: 4px solid #2f8f3d;
    }
    .lot-item:hover{ transform: translateY(-1px); box-shadow: 0 14px 30px rgba(21,62,41,0.18); }
    .lot-info{ display:flex; flex-direction:column; gap:6px; }
    .lot-name{ font-weight:900; color:#153e29; letter-spacing:.2px; font-size:18px }
    .lot-meta{ color:#335f47; font-size:14.5px }
    .lot-location{ color:#4b6a59; font-size:13px }
    .lot-sowing{ color:#4b6a59; font-size:13px }
    .lot-actions{ display:flex; gap:8px }
    .lot-actions .icon-btn{
      width:44px;
      height:44px;
      border-radius:14px;
      border:1px solid rgba(21,62,41,0.18);
      background:#f8fbf9;
      color:#1f5f3a;
      box-shadow: 0 4px 10px rgba(0,0,0,0.06);
      transition: filter .15s ease;
    }
    .lot-actions .icon-btn:hover{ filter: brightness(1.03) }
    .lot-actions .icon-btn.danger{
      border-color: rgba(185,28,28,0.35);
      color:#b91c1c;
      background:#fff5f5;
    }
    .lot-actions .icon-btn.danger:hover{ filter: brightness(1.02) }
    .lot-info .pill-tag{
      background: #e6f4ea;
      border-color: rgba(47,143,61,0.35);
      color:#153e29;
      font-weight: 800;
    }

    .form-error {
      color:#d16969;
      font-weight:600;
      margin:4px 0 0;
    }
  `],
  template: `
    <div class="lots-bg">
      <section class="lots-hero">
        <div class="container">
          <div class="hero-card">
            <div class="hero-left">
              <div class="greeting-pill">Hola {{ firstName() }}, listo para sembrar</div>
              <h1 class="hero-title">Planifica tu campo de arroz con una vista serena.</h1>
              <div class="stat-group">
                <div class="stat">
                  <div class="label">Lotes activos</div>
                  <div class="value">{{ lots().length }}</div>
                </div>
                <div class="stat">
                  <div class="label">Analisis</div>
                  <div class="value">{{ totalAnalyses() }}</div>
                </div>
              </div>
              <div class="hero-actions">
                <button class="btn-hero btn-orange" type="button" (click)="scrollToForm()">Crear nuevo lote</button>
                <a class="btn-hero btn-green" [routerLink]="['/analyses']">Crear Analisis</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <details class="acc-card" id="create-lot-accordion">
        <summary class="acc-hero-lot">
          <div class="acc-hero-center">
            <h3 class="acc-hero-title">Crea tu lote</h3>
          </div>
        </summary>
        <div class="acc-content">
          <form class="form-shell lot-form" (ngSubmit)="onSave()">
            <div class="row">
              <div class="col">
                <label>Nombre</label>
                <input
                  class="input input-inner"
                  [(ngModel)]="form.name"
                  name="name"
                  placeholder="Ej: Lote La Esperanza"
                  required
                />
              </div>
              <div class="col">
                <label>Área</label>
                <div class="input-group">
                  <input
                    class="input-inner"
                    type="number"
                    step="0.01"
                    [(ngModel)]="form.area_ha"
                    name="area"
                    [placeholder]="form.area_unit === 'm2' ? 'Ej: 2500' : 'Ej: 12.5'"
                    required
                  />
                  <select
                    class="input-inner select"
                    [(ngModel)]="form.area_unit"
                    name="area_unit"
                  >
                    <option value="ha">ha</option>
                    <option value="m2">m²</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <label>Departamento</label>
                <select
                  class="input input-inner"
                  name="dept"
                  [(ngModel)]="form.dept"
                  (ngModelChange)="onDeptChange($event)"
                >
                  <option value="">Selecciona un departamento</option>
                  <option *ngFor="let d of departments" [value]="d">
                    {{ d }}
                  </option>
                </select>
              </div>
              <div class="col">
                <label>Municipio</label>
                <select
                  class="input input-inner"
                  name="muni"
                  [disabled]="!form.dept"
                  [(ngModel)]="form.muni"
                  (ngModelChange)="onMuniChange($event)"
                >
                  <option value="">Selecciona un municipio</option>
                  <option *ngFor="let m of municipalities" [value]="m">
                    {{ m }}
                  </option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <label>Vereda (opcional)</label>
                <input
                  class="input input-inner"
                  [(ngModel)]="form.vereda"
                  name="vereda"
                  placeholder="Ej: La Esperanza"
                />
              </div>
              <div class="col">
                <label>Fecha de siembra (opcional)</label>
                <input
                  class="input input-inner"
                  type="date"
                  [(ngModel)]="form.sowing_date"
                  name="sowing"
                  [max]="todayDate"
                />
              </div>
            </div>

            <div *ngIf="error()" class="form-error">{{ error() }}</div>

            <div class="row" style="justify-content:flex-start">
              <button class="btn" [disabled]="loading()" type="submit">Guardar lote</button>
              <button *ngIf="editing()" class="btn btn-secondary" type="button" (click)="cancel()">Cancelar</button>
            </div>
          </form>
        </div>
      </details>

      <details class="acc-card" id="lots-list-accordion">
        <summary class="acc-hero-lot-list">
          <div class="acc-hero-center">
            <h3 class="acc-hero-title">Lotes creados</h3>
          </div>
        </summary>
        <div class="acc-content">
          <ng-container *ngIf="lots().length; else empty">
            <div class="lot-list">
              <div class="lot-item" *ngFor="let l of lots()">
                <div class="lot-info">
                  <div class="lot-name">{{ l.nombre | titlecase }}</div>
                  <div class="lot-meta">{{ l.area_ha }} ha - {{ l.cultivo | titlecase }}</div>
                  <div class="lot-location" *ngIf="l.ubicacion as loc">
                    {{ loc.dept }}<span *ngIf="loc.muni">, {{ loc.muni }}</span
                    ><span *ngIf="loc.vereda"> - {{ loc.vereda }}</span>
                  </div>
                  <div class="lot-sowing" *ngIf="l.fecha_siembra">
                    Siembra: {{ l.fecha_siembra }}
                  </div>
                  <span class="pill-tag">Análisis vinculados: {{ l.analisis_suelo_total || 0 }}</span>
                </div>
                <div class="lot-actions">
                  <button class="icon-btn" type="button" title="Editar" (click)="onEdit(l)">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <button class="icon-btn danger" type="button" title="Eliminar" (click)="onDelete(l)">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M6 7h12M9 7V5h6v2m-8 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </ng-container>
        </div>
      </details>
    </div>

    <ng-template #empty>
      <div class="empty-state container">
        Aun no tienes lotes. Registra el primero para comenzar a gestionar tu campo.
      </div>
    </ng-template>
  `
})
export class LotsPageComponent implements OnInit {
  lots = signal<Lot[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  editing = signal<Lot | null>(null);
  form = {
    name: '',
    area_ha: '',
    area_unit: 'ha',
    dept: '',
    muni: '',
    vereda: '',
    crop: 'arroz',
    sowing_date: ''
  } as any;
  todayDate = new Date().toISOString().slice(0, 10);
  totalAnalyses = computed(() =>
    this.lots().reduce((acc, lot) => acc + (lot.analisis_suelo_total || 0), 0)
  );
  colombia: ColombiaDept[] = [];
  departments: string[] = [];
  municipalities: string[] = [];

  constructor(private api: ApiService, public auth: AuthService) {}

  async ngOnInit() {
    await this.loadColombiaData();
    await this.load();
  }

  private async loadColombiaData() {
    try {
      const res = await fetch('/assets/colombia.json');
      if (!res.ok) return;
      const data = (await res.json()) as ColombiaDept[];
      this.colombia = data;
      this.departments = data
        .map((d) => d.departamento)
        .sort((a, b) => a.localeCompare(b));
    } catch {
      // si falla, dejamos los campos como texto libre
    }
  }

  private updateMunicipalitiesFor(dept: string | undefined | null) {
    if (!dept) {
      this.municipalities = [];
      return;
    }
    const found = this.colombia.find((d) => d.departamento === dept);
    this.municipalities = found
      ? [...found.ciudades].sort((a, b) => a.localeCompare(b))
      : [];
  }

  onDeptChange(value: string) {
    this.form.dept = value;
    this.form.muni = '';
    this.updateMunicipalitiesFor(value);
  }

  onMuniChange(value: string) {
    this.form.muni = value;
  }

  async load() {
    if (!this.auth.token()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.api.get<{ data: Lot[] }>(
        `/api/v1/lots?include=analyses`,
        true
      );
      this.lots.set(res?.data || []);
    } catch (e: any) {
      this.error.set(e?.message || 'No se pudieron cargar los lotes');
    }
    this.loading.set(false);
  }

  async onSave() {
    if (!this.auth.token()) return;
    if (!this.form.name?.toString().trim()) {
      this.error.set('Ingresa el nombre del lote');
      return;
    }
    const area = Number(this.form.area_ha);
    if (!this.form.area_ha?.toString().trim() || isNaN(area) || area <= 0) {
      this.error.set('Ingresa un área válida (en hectáreas)');
      return;
    }
    if (this.form.sowing_date) {
      const selected = new Date(this.form.sowing_date);
      const today = new Date();
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selected.getTime() > today.getTime()) {
        this.error.set(
          'La fecha de siembra no puede ser mayor a la fecha actual.'
        );
        return;
      }
    }

    this.loading.set(true);
    this.error.set(null);
    let created = false;
    try {
      const payload: any = {
        name: this.form.name,
        area_ha: Number(this.form.area_ha),
        crop: this.form.crop
      };
      const location: LotLocation = {};
      if (this.form.dept?.trim()) location.dept = this.form.dept.trim();
      if (this.form.muni?.trim()) location.muni = this.form.muni.trim();
      if (this.form.vereda?.trim()) location.vereda = this.form.vereda.trim();
      if (Object.keys(location).length) payload.location = location;
      if (this.form.sowing_date) payload.sowing_date = this.form.sowing_date;
      if (this.editing()) {
        await this.api.put(`/api/v1/lots/${this.editing()!.id}`, payload, true);
      } else {
        await this.api.post(`/api/v1/lots`, payload, true);
        created = true;
      }
      this.form = {
        name: '',
        area_ha: '',
        area_unit: 'ha',
        dept: '',
        muni: '',
        vereda: '',
        crop: 'arroz',
        sowing_date: ''
      };
      this.editing.set(null);
      await this.load();
      if (created) {
        setTimeout(() => {
          const list = document.getElementById(
            'lots-list-accordion'
          ) as HTMLDetailsElement | null;
          if (list) {
            list.open = true;
            list.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const firstItem = list.querySelector(
              '.lot-item'
            ) as HTMLElement | null;
            firstItem?.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
          const createAcc = document.getElementById(
            'create-lot-accordion'
          ) as HTMLDetailsElement | null;
          if (createAcc) createAcc.open = false;
        }, 0);
      }
    } catch (e: any) {
      const backendMsg =
        e?.error?.errors?.sowing_date?.[0] ||
        e?.error?.errors?.area_ha?.[0] ||
        e?.error?.errors?.name?.[0] ||
        e?.error?.message ||
        e?.message;
      this.error.set(
        backendMsg ||
          'No se pudo guardar el lote. Revisa los datos e intenta de nuevo.'
      );
    }
    this.loading.set(false);
  }

  onEdit(lot: Lot) {
    this.editing.set(lot);
    const loc: LotLocation | null | undefined = (lot as any).ubicacion;
    this.form = {
      name: lot.nombre,
      area_ha: String(lot.area_ha),
      area_unit: 'ha',
      dept: loc?.dept ?? '',
      muni: loc?.muni ?? '',
      vereda: loc?.vereda ?? '',
      crop: lot.cultivo || 'arroz',
      sowing_date: lot.fecha_siembra || ''
    };
    if (this.form.dept) {
      this.updateMunicipalitiesFor(this.form.dept);
    }
    this.scrollToForm();
  }

  async onDelete(lot: Lot) {
    if (!this.auth.token()) return;
    if (!confirm(`¿Eliminar el lote "${lot.nombre}"?`)) return;
    try {
      await this.api.delete(`/api/v1/lots/${lot.id}`, true);
      await this.load();
    } catch (e: any) {
      this.error.set(e?.message || 'No se pudo eliminar el lote');
    }
  }

  cancel() {
    this.editing.set(null);
    this.form = {
      name: '',
      area_ha: '',
      area_unit: 'ha',
      dept: '',
      muni: '',
      vereda: '',
      crop: 'arroz',
      sowing_date: ''
    };
    this.municipalities = [];
  }

  scrollToForm() {
    try {
      const details = document.getElementById(
        'create-lot-accordion'
      ) as HTMLDetailsElement | null;
      if (details && !details.open) details.open = true;
      const form = details?.querySelector('.lot-form') as HTMLElement | null;
      (form ?? details)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const firstInput = details?.querySelector(
        '.lot-form input'
      ) as HTMLInputElement | null;
      firstInput?.focus();
    } catch {
      // ignore
    }
  }

  firstName(): string {
    try {
      const u: any = this.auth.user?.() ? this.auth.user() : null;
      const full = u?.nombre_completo;
      if (typeof full === 'string' && full.trim().length) {
        return full.trim().split(' ')[0];
      }
    } catch {
      // ignore
    }
    return 'agricultor';
  }
}

