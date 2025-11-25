import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../shared/icon/icon.component';

interface AdminNavLink {
  path: string;
  label: string;
  featureName: string;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  navLinks: AdminNavLink[] = [
    { path: '/admin/users', label: 'User Metrics', featureName: 'Users' },
    { path: '/admin/influencers', label: 'Influencer DB', featureName: 'Database' },
  ];

  logout() {
    this.authService.logout();
  }
}
