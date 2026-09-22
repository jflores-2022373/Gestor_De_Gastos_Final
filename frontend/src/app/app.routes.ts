import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard], title: 'Iniciar sesión | SpendWise' },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard], title: 'Crear cuenta | SpendWise' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], title: 'Dashboard | SpendWise' },
  { path: 'transacciones', component: TransactionsComponent, canActivate: [authGuard], title: 'Transacciones | SpendWise' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
