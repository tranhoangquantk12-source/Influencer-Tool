import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  // FIX: Explicitly type the injected Router to resolve type inference issues.
  const router: Router = inject(Router);
  if (authService.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/login');
};

const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  // FIX: Explicitly type the injected Router to resolve type inference issues.
  const router: Router = inject(Router);
  if (authService.isLoggedIn()) {
    return router.parseUrl('/discover');
  }
  return true;
};

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Login',
    canActivate: [loginGuard],
    loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'discover',
    title: 'Influencer Discovery',
    canActivate: [authGuard],
    loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'marketplace',
    title: 'Offer Marketplace',
    canActivate: [authGuard],
    loadComponent: () => import('./components/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
  },
  {
    path: 'campaigns',
    title: 'Campaign Management',
    canActivate: [authGuard],
    loadComponent: () => import('./components/lists/lists.component').then(m => m.ListsComponent)
  },
  {
    path: 'conversations',
    title: 'Conversations',
    canActivate: [authGuard],
    loadComponent: () => import('./components/conversations/conversations.component').then(m => m.ConversationsComponent)
  },
  {
    path: 'performance',
    title: 'Campaign Performance',
    canActivate: [authGuard],
    loadComponent: () => import('./components/performance/performance.component').then(m => m.PerformanceComponent)
  },
  {
    path: 'influencer/:id',
    title: 'Influencer Profile',
    canActivate: [authGuard],
    loadComponent: () => import('./components/influencer-profile/influencer-profile.component').then(m => m.InfluencerProfileComponent)
  },
  {
    path: 'admin',
    title: 'Admin Dashboard',
    canActivate: [authGuard], // In a real app, this would be a separate AdminGuard
    loadComponent: () => import('./components/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
        { path: '', redirectTo: 'users', pathMatch: 'full' },
        { path: 'users', title: 'Admin: User Metrics', loadComponent: () => import('./components/user-metrics/user-metrics.component').then(c => c.UserMetricsComponent) },
        { path: 'influencers', title: 'Admin: Influencer Database', loadComponent: () => import('./components/influencer-data/influencer-data.component').then(c => c.InfluencerDataComponent) }
    ]
  },
  {
    path: '',
    redirectTo: 'discover',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'discover'
  }
];