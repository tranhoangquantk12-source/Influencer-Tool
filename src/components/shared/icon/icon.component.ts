import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconService } from '../../../services/icon.service';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      [style.color]="color()"
      [innerHTML]="iconHtml()"
    ></svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private iconService = inject(IconService);
  // FIX: Explicitly type the injected DomSanitizer to resolve type inference issues.
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  featureName = input.required<string>();
  size = input<number | string>(24);
  color = input<string>('#003fb5'); // Main color theme as default

  iconHtml = computed<SafeHtml>(() => {
    const iconContent = this.iconService.getIconSvg(this.featureName());
    return this.sanitizer.bypassSecurityTrustHtml(iconContent);
  });
}