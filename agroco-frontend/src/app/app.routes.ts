import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { LotsPageComponent } from './pages/lots-page.component';
import { AnalysesPageComponent } from './pages/analyses-page.component';
import { AnalysisDetailPageComponent } from './pages/analysis-detail-page.component';
import { LotsCreatedPageComponent } from './pages/lots-created-page.component';
import { RiceRequirementsPageComponent } from './pages/rice-requirements-page.component';
import { ProfilePageComponent } from './pages/profile-page.component';
import { AdminPageComponent } from './pages/admin-page.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';
import { adminHomeRedirectGuard } from './guards/admin-home.guard';

export const routes: Routes = [
  { path: '', component: DashboardPageComponent, canActivate: [adminHomeRedirectGuard] },
  { path: 'login', component: LoginPageComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPageComponent, canActivate: [guestGuard] },
  { path: 'lots', component: LotsPageComponent, canActivate: [authGuard] },
  { path: 'lots-created', component: LotsCreatedPageComponent, canActivate: [authGuard] },
  { path: 'analyses', component: AnalysesPageComponent, canActivate: [authGuard] },
  { path: 'analyses/:id', component: AnalysisDetailPageComponent, canActivate: [authGuard] },
  { path: 'rice', component: RiceRequirementsPageComponent },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPageComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];
