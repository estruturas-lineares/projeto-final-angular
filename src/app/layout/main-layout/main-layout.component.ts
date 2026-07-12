import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ToastContainerComponent } from '../../shared/components/toast/toast-container.component';
import { routeFadeAnimation } from '../../core/route-animations';

import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'rc-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent],
  animations: [routeFadeAnimation],
})
export class MainLayoutComponent {

  private router = inject(Router);

  readonly routeKey = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.resolveDeepestRouteKey())
    ),
    { initialValue: '' }
  );

  private resolveDeepestRouteKey(): string {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    // usa `data.animation` se você definir nas rotas, senão cai pro path da URL
    return route.snapshot.data['animation'] ?? route.snapshot.url.map((s) => s.path).join('/');
  }
  
}
