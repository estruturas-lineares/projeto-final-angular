import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'rc-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [style({ opacity: 0 }), animate('160ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('120ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('popIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.94) translateY(8px)' }),
        animate('180ms 40ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
    ]),
  ],
})
export class ConfirmModalComponent {
  @Input() open = false;
  @Input() title = 'Confirmar ação';
  @Input() message = 'Tem certeza que deseja continuar?';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() danger = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
