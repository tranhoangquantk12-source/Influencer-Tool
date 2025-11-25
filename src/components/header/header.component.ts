import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../shared/icon/icon.component';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
})
export class HeaderComponent {
  private authService = inject(AuthService);
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);

  userNavLinks: NavLink[] = [
    { path: '/discover', label: 'Discovery' },
    { path: '/campaigns', label: 'Campaigns' },
    { path: '/conversations', label: 'Conversations' },
    { path: '/performance', label: 'Performance' }
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
  
  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
  }

  closeMenus() {
    this.isMobileMenuOpen.set(false);
    this.isUserMenuOpen.set(false);
  }

  logout() {
    this.closeMenus();
    this.authService.logout();
  }
}
