import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent]
})
export class AppComponent {
  // FIX: Explicitly type the injected Router to resolve type inference issues.
  private router: Router = inject(Router);
  protected authService = inject(AuthService);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      // FIX: Explicitly type the 'event' parameter to resolve type inference issues in the map operator.
      map((event: NavigationEnd) => event.urlAfterRedirects)
    )
  );
  
  isFullPageLayout = computed(() => {
    const url = this.currentUrl();
    if (!url) return false;
    // FIX: Cast url to string to resolve type inference issue where it was being treated as 'unknown'.
    return (url as string).startsWith('/login') || (url as string).startsWith('/admin');
  });
}
