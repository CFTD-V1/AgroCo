import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" *ngIf="toasts().length">
      <div
        *ngFor="let toast of toasts()"
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
      >
        <span>{{ toast.text }}</span>
        <button type="button" (click)="dismiss(toast.id)" aria-label="Cerrar mensaje">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: grid;
      gap: 12px;
      z-index: 30;
    }
    .toast {
      min-width: 260px;
      max-width: 360px;
      padding: 14px 16px;
      border-radius: 18px;
      background: rgba(255,255,255,0.95);
      border: 1px solid rgba(21,62,41,0.2);
      box-shadow: 0 20px 40px rgba(21,62,41,0.18);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-weight: 600;
      color: var(--text-900);
    }
    .toast-success {
      border-color: rgba(61,141,64,0.35);
    }
    .toast-error {
      border-color: rgba(209,73,73,0.35);
      color: #742c2c;
    }
    .toast button {
      border: 0;
      background: transparent;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
    }
  `]
})
export class ToastContainerComponent {
  toasts = computed(() => this.toastService.messages());

  constructor(private toastService: ToastService) {}

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}
