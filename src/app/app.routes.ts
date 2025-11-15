import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { TalksComponent } from './components/talks/talks';
import { PublicationsComponent } from './components/publications/publications';
import { AboutComponent } from './components/about/about';
import { OutreachComponent } from './components/outreach/outreach';
import { QaComponent } from './components/qa/qa';
import { BlogComponent } from './components/blog/blog';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'talks', component: TalksComponent },
  { path: 'publications', component: PublicationsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'outreach', component: OutreachComponent },
  { path: 'qa', component: QaComponent },
  { path: 'blog', component: BlogComponent },
  { path: '**', redirectTo: '/home' }
];
