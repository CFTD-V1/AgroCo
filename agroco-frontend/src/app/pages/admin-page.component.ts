import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { BarHeightCapPipe } from '../pipes/bar-height-cap.pipe';

type Summary = {
  totals: { users: number; admins: number; soil_analyses: number; fertilizer_plans: number };
  recent: { users_week: number; soil_analyses_week: number; fertilizer_plans_week: number; soil_analyses_month: number; fertilizer_plans_month: number };
  series: {
    users_last_14_days: { date: string; count: number }[];
    analyses_last_14_days: { date: string; count: number }[];
    plans_last_14_days: { date: string; count: number }[];
  };
};

type PaginationMeta = { page: number; last_page: number; total: number };
type SeriesPoint = { date: string; count: number };

function defaultUserForm() {
  return {
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    ocupacion: 'Administrador',
    telefono: '',
    tipo_documento: 'CC',
    documento_identidad: '',
    email: '',
    username: '',
    password: '',
    is_admin: true,
    must_change_password: true,
  };
}

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule, BarHeightCapPipe],
  template: `
    <section class="hero-shell admin-hero">
      <div class="hero-copy">
        <span class="tagline">Panel administrador</span>
        <h1 class="hero-title">Administra usuarios y supervisa la operación en un solo lugar.</h1>
        <p class="hero-subtitle">Controla cuentas, revisa análisis y planes y obtén métricas rápidas del uso de AgroCo.</p>
      </div>
    </section>

    <section class="stat-section">
      <div class="stat-grid" *ngIf="summary(); else statSkeleton">
        <div class="stat-card">
          <div class="stat-label">Usuarios</div>
          <div class="stat-value">{{ summary()!.totals.users }}</div>
          <div class="stat-sub">+{{ summary()!.recent.users_week }} en 7 días</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Admins</div>
          <div class="stat-value">{{ summary()!.totals.admins }}</div>
          <div class="stat-sub">Accesos elevados activos</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Análisis de suelo</div>
          <div class="stat-value">{{ summary()!.totals.soil_analyses }}</div>
          <div class="stat-sub">{{ summary()!.recent.soil_analyses_week }} en los últimos 7 días</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Planes de fertilización</div>
          <div class="stat-value">{{ summary()!.totals.fertilizer_plans }}</div>
          <div class="stat-sub">{{ summary()!.recent.fertilizer_plans_week }} en los últimos 7 días</div>
        </div>
      </div>
      <ng-template #statSkeleton>
        <div class="stat-grid">
          <div class="stat-card skeleton" aria-hidden="true"></div>
          <div class="stat-card skeleton" aria-hidden="true"></div>
          <div class="stat-card skeleton" aria-hidden="true"></div>
          <div class="stat-card skeleton" aria-hidden="true"></div>
        </div>
      </ng-template>
    </section>

    <!-- Gráfico de crecimiento de usuarios -->
    <section class="chart-card" *ngIf="usersSeries().length">
      <div class="chart-header">
        <div>
          <div class="panel-title">Crecimiento de usuarios (14 días)</div>
          <div class="panel-sub">Usuarios nuevos por día</div>
        </div>
      </div>
      <div class="bar-chart">
        <div class="bar-row" [style.minWidth.px]="usersSeries().length * 28">
          <div
            *ngFor="let p of usersSeries(); let i = index"
            class="bar"
            [style.height.%]="(p.count === 0 ? 8 : 15 + ((p.count / maxUsersCount) * 65)) | barHeightCap"
            [attr.title]="(p.date | date:'dd/MM') + ': ' + p.count + ' usuarios'"
          >
            <span class="bar-tip">{{ p.count }}</span>
            <span class="bar-label" *ngIf="i === 0 || i === usersSeries().length - 1 || i % 4 === 0">{{ p.date | date:'dd/MM' }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel-grid">
      <div class="panel-card">
        <div class="panel-header">
          <div>
            <div class="panel-title">{{ editingUserId() ? 'Editar usuario' : 'Crear usuario' }}</div>
            <div class="panel-sub">Gestiona accesos con roles y obligar cambio de contraseña.</div>
          </div>
          <button class="link-btn" type="button" (click)="resetUserForm()">Limpiar</button>
        </div>
        <form class="form-shell admin-form" (ngSubmit)="saveUser()">
          <div class="row">
            <div class="col">
              <label>Primer nombre</label>
              <input class="input" type="text" required [(ngModel)]="userForm.primer_nombre" name="primer_nombre" />
            </div>
            <div class="col">
              <label>Segundo nombre</label>
              <input class="input" type="text" [(ngModel)]="userForm.segundo_nombre" name="segundo_nombre" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <label>Primer apellido</label>
              <input class="input" type="text" required [(ngModel)]="userForm.primer_apellido" name="primer_apellido" />
            </div>
            <div class="col">
              <label>Segundo apellido</label>
              <input class="input" type="text" [(ngModel)]="userForm.segundo_apellido" name="segundo_apellido" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <label>Ocupación</label>
              <input class="input" type="text" required [(ngModel)]="userForm.ocupacion" name="ocupacion" />
            </div>
            <div class="col">
              <label>Teléfono</label>
              <input class="input" type="text" required [(ngModel)]="userForm.telefono" name="telefono" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <label>Tipo documento</label>
              <select class="input" [(ngModel)]="userForm.tipo_documento" name="tipo_documento">
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="TI">TI</option>
                <option value="PAS">PAS</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
            <div class="col">
              <label>Documento</label>
              <input class="input" type="text" required [(ngModel)]="userForm.documento_identidad" name="documento_identidad" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <label>Email</label>
              <input class="input" type="email" [(ngModel)]="userForm.email" name="email" />
            </div>
            <div class="col">
              <label>Usuario</label>
              <input class="input" type="text" [(ngModel)]="userForm.username" name="username" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <label>Contraseña</label>
              <input class="input" type="password" [(ngModel)]="userForm.password" name="password" placeholder="Si se omite, se usa el documento" />
            </div>
            <div class="col toggles">
              <label class="toggle"><input type="checkbox" [(ngModel)]="userForm.is_admin" name="is_admin" /> <span>Administrador</span></label>
              <label class="toggle"><input type="checkbox" [(ngModel)]="userForm.must_change_password" name="must_change_password" /> <span>Forzar cambio inicial</span></label>
            </div>
          </div>
          <div class="actions">
            <button class="btn" type="submit" [disabled]="savingUser()">{{ savingUser() ? 'Guardando...' : (editingUserId() ? 'Actualizar' : 'Crear') }}</button>
            <button class="btn btn-secondary" type="button" (click)="resetUserForm()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="panel-card">
        <div class="panel-header">
          <div>
            <div class="panel-title">Usuarios registrados</div>
            <div class="panel-sub">Filtra, edita o asigna rol administrador.</div>
          </div>
          <input class="input search" type="search" placeholder="Buscar por nombre, usuario o email" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" />
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Actividad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users()">
                <td>{{ formatName(u) }}</td>
                <td>{{ u.tipo_documento }} {{ u.documento_identidad }}</td>
                <td>{{ u.email || '—' }}</td>
                <td>
                  <span class="pill" [class.pill-admin]="u.is_admin" [class.pill-user]="!u.is_admin">{{ u.is_admin ? 'Admin' : 'Usuario' }}</span>
                </td>
                <td>
                  <div class="mini-stat">{{ u.lots_count || 0 }} lotes</div>
                  <div class="mini-stat">{{ u.soil_analyses_count || 0 }} análisis</div>
                </td>
                <td class="actions-cell">
                  <button class="link-btn" type="button" [class.disabled]="u.is_admin" [disabled]="u.is_admin" (click)="editUser(u)">Editar</button>
                  <button class="link-btn danger" type="button" [class.disabled]="u.is_admin" [disabled]="u.is_admin" (click)="openConfirm(u)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-empty" *ngIf="!users().length && !loadingUsers()">No hay usuarios para mostrar.</div>
          <div class="skeleton-row" *ngIf="loadingUsers()"></div>
        </div>
        <div class="pager">
          <button class="btn btn-secondary" type="button" [disabled]="usersMeta().page <= 1 || loadingUsers()" (click)="loadUsers(usersMeta().page - 1)">Anterior</button>
          <span>Página {{ usersMeta().page }} de {{ usersMeta().last_page }}</span>
          <button class="btn btn-secondary" type="button" [disabled]="usersMeta().page >= usersMeta().last_page || loadingUsers()" (click)="loadUsers(usersMeta().page + 1)">Siguiente</button>
        </div>
      </div>
    </section>

    <section class="panel-grid">
      <div class="panel-card">
        <div class="panel-header">
          <div>
            <div class="panel-title">Análisis de suelo</div>
            <div class="panel-sub">Supervisa los informes registrados y sus planes asociados.</div>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Lote</th>
                <th>Usuario</th>
                <th>Fecha muestreo</th>
                <th>Plan</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of analyses()">
                <td>#{{ a.id }}</td>
                <td>{{ a.lot?.name || '—' }}</td>
                <td>{{ formatName(a.lot?.user) }}</td>
                <td>{{ formatDate(a.sampled_at) }}</td>
                <td>
                  <span class="pill" [class.pill-admin]="!!a.plan">{{ a.plan ? 'Con plan' : 'Pendiente' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-empty" *ngIf="!analyses().length && !loadingAnalyses()">Aún no hay registros.</div>
          <div class="skeleton-row" *ngIf="loadingAnalyses()"></div>
        </div>
        <div class="pager">
          <button class="btn btn-secondary" type="button" [disabled]="analysesMeta().page <= 1 || loadingAnalyses()" (click)="loadAnalyses(analysesMeta().page - 1)">Anterior</button>
          <span>Página {{ analysesMeta().page }} de {{ analysesMeta().last_page }}</span>
          <button class="btn btn-secondary" type="button" [disabled]="analysesMeta().page >= analysesMeta().last_page || loadingAnalyses()" (click)="loadAnalyses(analysesMeta().page + 1)">Siguiente</button>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-header">
          <div>
            <div class="panel-title">Planes de fertilización</div>
            <div class="panel-sub">Monitorea generación y uso de recetas.</div>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Lote</th>
                <th>Creado</th>
                <th>Zn suelo</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of plans()">
                <td>#{{ p.id }}</td>
                <td>{{ formatName(p.soil_analysis?.lot?.user) }}</td>
                <td>{{ p.soil_analysis?.lot?.name || '—' }}</td>
                <td>{{ formatDate(p.created_at) }}</td>
                <td>
                  <span class="pill" [class.pill-admin]="p.use_zn_soil">{{ p.use_zn_soil ? 'Incluye' : 'No incluye' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-empty" *ngIf="!plans().length && !loadingPlans()">Sin planes generados.</div>
          <div class="skeleton-row" *ngIf="loadingPlans()"></div>
        </div>
        <div class="pager">
          <button class="btn btn-secondary" type="button" [disabled]="plansMeta().page <= 1 || loadingPlans()" (click)="loadPlans(plansMeta().page - 1)">Anterior</button>
          <span>Página {{ plansMeta().page }} de {{ plansMeta().last_page }}</span>
          <button class="btn btn-secondary" type="button" [disabled]="plansMeta().page >= plansMeta().last_page || loadingPlans()" (click)="loadPlans(plansMeta().page + 1)">Siguiente</button>
        </div>
      </div>
    </section>

    <div class="modal-backdrop" *ngIf="confirmUser()">
      <div class="modal-card">
        <div class="modal-title">Confirmar eliminación</div>
        <p class="modal-text">¿Eliminar al usuario {{ formatName(confirmUser()) }}?</p>
        <div class="modal-actions">
          <button class="btn" type="button" (click)="confirmDelete()">Eliminar</button>
          <button class="btn btn-secondary" type="button" (click)="closeConfirm()">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-hero { background: linear-gradient(120deg, #0f5132, #0c7c59); color:#fff; padding:24px; border-radius:20px; box-shadow:0 16px 40px rgba(12,124,89,0.35); margin-bottom:18px; }
    .hero-copy { max-width:820px; }
    .tagline { display:inline-flex; padding:6px 12px; background:rgba(255,255,255,0.16); border-radius:999px; font-weight:700; letter-spacing:.3px; }
    .hero-title { margin:10px 0 8px; font-size:32px; line-height:1.2; }
    .hero-subtitle { margin:0; color:rgba(255,255,255,0.88); font-size:16px; }

    .stat-section { margin: 10px 0 24px; }
    .stat-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; }
    .stat-card { padding:16px; border-radius:14px; background:#f7fdf9; border:1px solid #d5f2e3; box-shadow:0 10px 30px rgba(12,124,89,0.08); }
    .stat-card .stat-label { font-size:13px; color:#0c7c59; font-weight:700; text-transform:uppercase; letter-spacing:.3px; }
    .stat-card .stat-value { font-size:30px; font-weight:900; margin:6px 0; color:#0f5132; }
    .stat-card .stat-sub { color:#0f5132; opacity:0.8; font-weight:600; }
    .skeleton { background: linear-gradient(90deg, #eef3f0, #f7faf8, #eef3f0); background-size:200% 200%; animation:pulse 1.6s ease-in-out infinite; min-height:94px; }
    @keyframes pulse { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position:0% 50%; } }

    .panel-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:16px; margin: 12px 0 28px; }
    .panel-card { background:#fff; border:1px solid #e5ece7; border-radius:14px; padding:16px; box-shadow:0 14px 36px rgba(0,0,0,0.06); }
    .panel-header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px; flex-wrap:wrap; }
    .panel-title { font-weight:800; font-size:18px; color:#0f5132; }
    .panel-sub { color:#4b6355; font-size:13px; }
    .form-shell { background:#f9fbf7; border:1px solid #e5ece7; border-radius:12px; padding:12px; }
    .row { display:flex; gap:12px; flex-wrap:wrap; }
    .row .col { flex:1; min-width:180px; }
    label { font-size:12px; font-weight:700; color:#0f5132; display:block; margin-bottom:4px; }
    .input { width:100%; border:1px solid #cfe1d5; border-radius:10px; padding:10px 12px; outline:none; font-size:14px; }
    .input:focus { border-color:#0c7c59; box-shadow:0 0 0 2px rgba(0,124,89,0.15); }
    .actions { display:flex; gap:8px; margin-top:10px; }
    .btn { background:#0c7c59; color:#fff; border:none; border-radius:10px; padding:10px 14px; cursor:pointer; font-weight:800; }
    .btn:hover { filter:brightness(0.95); }
    .btn:disabled { opacity:0.6; cursor:not-allowed; }
    .btn-secondary { background:#eef3f0; color:#0f5132; border:1px solid #cfe1d5; }
    .link-btn { background:transparent; border:none; color:#0c7c59; font-weight:800; cursor:pointer; padding:6px 8px; }
    .link-btn.danger { color:#c53030; }
    .link-btn.disabled { color:#b8c3bb; cursor:not-allowed; }

    .data-table { width:100%; border-collapse:collapse; }
    .data-table th, .data-table td { text-align:left; padding:10px 8px; border-bottom:1px solid #eef3f0; }
    .data-table th { font-size:12px; letter-spacing:.3px; text-transform:uppercase; color:#4b6355; }
    .data-table td { font-size:14px; color:#1b3525; }
    .table-wrapper { overflow:auto; border-radius:10px; background:#fbfdfc; border:1px solid #eef3f0; }
    .table-empty { padding:14px; text-align:center; color:#6b7c70; }
    .skeleton-row { height:48px; background: linear-gradient(90deg,#eef3f0,#f7faf8,#eef3f0); animation:pulse 1.6s ease-in-out infinite; border-radius:8px; margin-top:8px; }

    .search { min-width:220px; }
    .pill { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; font-weight:800; font-size:12px; }
    .pill-admin { background:#0c7c59; color:#fff; }
    .pill-user { background:#e4f3eb; color:#0f5132; }
    .mini-stat { font-size:12px; color:#4b6355; }
    .actions-cell { display:flex; gap:6px; justify-content:flex-end; }
    .toggle { display:flex; align-items:center; gap:8px; font-size:13px; color:#1b3525; }
    .toggles { display:flex; flex-direction:column; gap:8px; justify-content:center; }
    .pager { display:flex; align-items:center; justify-content:space-between; margin-top:12px; gap:8px; flex-wrap:wrap; color:#0f5132; font-weight:700; }
    .table-wrapper table { min-width: 100%; }

    .modal-backdrop { position:fixed; inset:0; background:rgba(12,12,12,0.45); display:flex; align-items:center; justify-content:center; z-index:30; padding:12px; }
    .modal-card { background:#fff; border-radius:14px; padding:18px; max-width:360px; width:100%; box-shadow:0 18px 48px rgba(0,0,0,0.15); border:1px solid #e5ece7; }
    .modal-title { font-size:18px; font-weight:800; color:#1b3525; margin-bottom:8px; }
    .modal-text { margin:0 0 14px; color:#4b6355; }
    .modal-actions { display:flex; gap:10px; justify-content:flex-end; }

    .chart-card { background:#fff; border:1px solid #e5ece7; border-radius:16px; padding:14px 16px 20px; box-shadow:0 14px 36px rgba(0,0,0,0.06); margin: 10px 0 18px; }
    .chart-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:8px; }
    .bar-chart { overflow-x:auto; padding:24px 10px 56px; height:230px; display:flex; align-items:flex-end; }
    .bar-row { display:flex; align-items:flex-end; gap:14px; height:100%; min-height:100%; }
    .bar { flex:0 0 20px; min-height:8px; background: linear-gradient(180deg, #1ce094 0%, #0c7c59 100%); background-size:200% 200%; border-radius:7px 7px 3px 3px; position:relative; display:flex; justify-content:center; transition: transform .12s ease, filter .12s ease; box-shadow:0 6px 14px rgba(12,124,89,0.18); animation: barGlow 3.6s ease-in-out infinite; overflow:visible; }
    .bar::after { content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%); mix-blend-mode:screen; animation: barShimmer 2.8s ease-in-out infinite; }
    .bar:hover { transform: translateY(-4px); box-shadow:0 12px 20px rgba(12,124,89,0.28); filter: brightness(1.1); }
    .bar-tip { position:absolute; top:-22px; color:#0f5132; font-weight:800; font-size:11px; white-space: nowrap; }
    .bar-label { position:absolute; bottom:-40px; font-size:10px; color:#4b6355; transform: rotate(-45deg); transform-origin: top left; white-space: nowrap; }
    @keyframes barGlow {
      0% { background-position: 0% 0%; filter: brightness(1); }
      50% { background-position: 0% 80%; filter: brightness(1.08); }
      100% { background-position: 0% 0%; filter: brightness(1); }
    }
    @keyframes barShimmer {
      0% { transform: translateY(100%); opacity: 0; }
      20% { opacity: 1; }
      50% { transform: translateY(-20%); opacity: 0.85; }
      80% { opacity: 1; }
      100% { transform: translateY(-120%); opacity: 0; }
    }
  `],
})
export class AdminPageComponent implements OnInit {
  summary = signal<Summary | null>(null);
  usersSeries = computed<SeriesPoint[]>(() => this.summary()?.series?.users_last_14_days || []);
  users = signal<any[]>([]);
  analyses = signal<any[]>([]);
  plans = signal<any[]>([]);

  usersMeta = signal<PaginationMeta>({ page: 1, last_page: 1, total: 0 });
  analysesMeta = signal<PaginationMeta>({ page: 1, last_page: 1, total: 0 });
  plansMeta = signal<PaginationMeta>({ page: 1, last_page: 1, total: 0 });

  loadingUsers = signal(false);
  loadingAnalyses = signal(false);
  loadingPlans = signal(false);
  savingUser = signal(false);
  maxUsersCount = 1;
  totalUsersCount = 0;

  searchTerm = '';
  editingUserId = signal<number | null>(null);
  userForm = defaultUserForm();
  confirmUser = signal<any | null>(null);

  constructor(
    private admin: AdminService,
    private toast: ToastService,
    public auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (!this.auth.isAdmin()) {
      this.router.navigateByUrl('/');
      return;
    }
    await this.refreshAll();
  }

  async refreshAll() {
    await Promise.all([
      this.loadSummary(),
      this.loadUsers(),
      this.loadAnalyses(),
      this.loadPlans(),
    ]);
  }

  async loadSummary() {
    try {
      const res = await this.admin.summary();
      this.summary.set(res as Summary);
      const series = this.usersSeries();
      const counts = series.length ? series.map((p: SeriesPoint) => p.count) : [1];
      const max = Math.max(...counts);
      this.maxUsersCount = max > 0 ? max : 1;
      this.totalUsersCount = series.reduce((acc: number, p: SeriesPoint) => acc + p.count, 0);
    } catch {
      this.toast.show('No se pudo cargar el resumen', 'error');
    }
  }

  onSearchChange() {
    this.loadUsers(1);
  }

  async loadUsers(page = 1) {
    this.loadingUsers.set(true);
    try {
      const res: any = await this.admin.users({ q: this.searchTerm, page });
      this.users.set(res.data || []);
      this.usersMeta.set({
        page: res.current_page ?? page,
        last_page: res.last_page ?? page,
        total: res.total ?? (res.data?.length ?? 0),
      });
    } catch {
      this.toast.show('No se pudieron cargar los usuarios', 'error');
    } finally {
      this.loadingUsers.set(false);
    }
  }

  async loadAnalyses(page = 1) {
    this.loadingAnalyses.set(true);
    try {
      const res: any = await this.admin.soilAnalyses({ page });
      this.analyses.set(res.data || []);
      this.analysesMeta.set({
        page: res.current_page ?? page,
        last_page: res.last_page ?? page,
        total: res.total ?? (res.data?.length ?? 0),
      });
    } catch {
      this.toast.show('No se pudieron cargar los análisis', 'error');
    } finally {
      this.loadingAnalyses.set(false);
    }
  }

  async loadPlans(page = 1) {
    this.loadingPlans.set(true);
    try {
      const res: any = await this.admin.fertilizerPlans({ page });
      this.plans.set(res.data || []);
      this.plansMeta.set({
        page: res.current_page ?? page,
        last_page: res.last_page ?? page,
        total: res.total ?? (res.data?.length ?? 0),
      });
    } catch {
      this.toast.show('No se pudieron cargar los planes', 'error');
    } finally {
      this.loadingPlans.set(false);
    }
  }

  resetUserForm() {
    this.editingUserId.set(null);
    this.userForm = defaultUserForm();
  }

  editUser(user: any) {
    this.editingUserId.set(user.id);
    this.userForm = {
      primer_nombre: user.primer_nombre || '',
      segundo_nombre: user.segundo_nombre || '',
      primer_apellido: user.primer_apellido || '',
      segundo_apellido: user.segundo_apellido || '',
      ocupacion: user.ocupacion || '',
      telefono: user.telefono || '',
      tipo_documento: user.tipo_documento || 'CC',
      documento_identidad: user.documento_identidad || '',
      email: user.email || '',
      username: user.username || '',
      password: '',
      is_admin: !!user.is_admin,
      must_change_password: !!user.must_change_password,
    };
  }

  async saveUser() {
    this.savingUser.set(true);
    const payload: any = { ...this.userForm };
    try {
      if (!payload.password) delete payload.password;
      if (!payload.username) delete payload.username;
      if (!payload.email) payload.email = null;
      payload.must_change_password = !!payload.must_change_password;
      if (this.editingUserId()) {
        await this.admin.updateUser(this.editingUserId()!, payload);
        this.toast.show('Usuario actualizado', 'success');
      } else {
        await this.admin.createUser(payload);
        this.toast.show('Usuario creado', 'success');
      }
      this.resetUserForm();
      await this.loadUsers(this.usersMeta().page);
      await this.loadSummary();
    } catch (e: any) {
      const msg = e?.error?.message || 'No se pudo guardar el usuario';
      this.toast.show(msg, 'error');
    } finally {
      this.savingUser.set(false);
    }
  }

  async deleteUser(user: any) {
    try {
      await this.admin.deleteUser(user.id);
      this.toast.show('Usuario eliminado', 'success');
      await this.loadUsers(this.usersMeta().page);
      await this.loadSummary();
    } catch {
      this.toast.show('No se pudo eliminar el usuario', 'error');
    }
  }

  openConfirm(user: any) {
    this.confirmUser.set(user);
  }

  closeConfirm() {
    this.confirmUser.set(null);
  }

  async confirmDelete() {
    const user = this.confirmUser();
    if (!user) return;
    await this.deleteUser(user);
    this.closeConfirm();
  }

  formatName(u: any): string {
    if (!u) return '—';
    return [u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido].filter(Boolean).join(' ').trim() || (u.username ?? '—');
  }

  formatDate(input: string | null | undefined): string {
    if (!input) return '—';
    const d = new Date(input);
    return isNaN(d.getTime()) ? input : d.toLocaleDateString();
  }
}
