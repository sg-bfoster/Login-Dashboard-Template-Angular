import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrap" [class.overlay]="overlay">
      <div class="spinner" role="status" aria-label="Loading"></div>
      @if (message) {
        <div class="message">{{ message }}</div>
      }
    </div>
  `,
  styles: [
    `
      .spinner-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
      }

      .spinner-wrap.overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(1px);
      }

      .spinner {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        border: 4px solid rgba(25, 118, 210, 0.2);
        border-top-color: #1976d2;
        animation: spin 0.9s linear infinite;
      }

      .message {
        font-size: 0.9rem;
        color: #444;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() message: string | null = null;
  @Input() overlay = false;
}

