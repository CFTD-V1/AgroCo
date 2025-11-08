import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  messages = signal<ToastMessage[]>([]);

  show(text: string, type: ToastType = 'info', duration = 4000) {
    const id = ++this.counter;
    this.messages.update((items) => [...items, { id, text, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number) {
    this.messages.update((items) => items.filter((item) => item.id !== id));
  }
}
