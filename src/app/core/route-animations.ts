import { animate, query, style, transition, trigger } from '@angular/animations';

export const routeFadeAnimation = trigger('routeFade', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0, transform: 'translateY(8px)' })], { optional: true }),
    query(
      ':leave',
      [style({ position: 'absolute', width: '100%' }), animate('120ms ease-in', style({ opacity: 0 }))],
      { optional: true }
    ),
    query(':enter', [animate('220ms 60ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))], {
      optional: true,
    }),
  ]),
]);
