import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MatchesComponent } from './components/matches/matches.component';
import { MatchDetailComponent } from './components/match-detail/match-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PublicProfileComponent } from './components/public-profile/public-profile.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'matches', component: MatchesComponent },
  { path: 'match/:id', component: MatchDetailComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'user/:id', component: PublicProfileComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
