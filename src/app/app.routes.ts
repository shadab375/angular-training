import { Routes } from '@angular/router';
import { LoginComponent } from './MyComponents/login/login.component';
import { RegisterComponent } from './MyComponents/register/register.component';
import { DashboardComponent } from './MyComponents/dashboard/dashboard.component';
import { AuthGuard } from './Services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  }
];
