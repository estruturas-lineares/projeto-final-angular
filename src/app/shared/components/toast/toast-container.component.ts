import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'rc-toast-container',
  standalone: true,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-12px) scale(0.96)' }),
        animate('220ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('160ms ease-in', style({ opacity: 0, transform: 'translateY(-8px) scale(0.96)' })),
      ]),
    ]),
  ],
})
export class ToastContainerComponent {
  constructor(readonly toastService: ToastService) {}

  iconFor(type: string): string {
    return type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
