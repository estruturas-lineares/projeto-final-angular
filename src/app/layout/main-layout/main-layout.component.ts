import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ToastContainerComponent } from '../../shared/components/toast/toast-container.component';
import { routeFadeAnimation } from '../../core/route-animations';

@Component({
  selector: 'rc-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent],
  animations: [routeFadeAnimation],
})
export class MainLayoutComponent {
  getRouteKey(outlet: RouterOutlet): string {
    return outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('/') : '';
  }
}
