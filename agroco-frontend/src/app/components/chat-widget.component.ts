import { Component, ElementRef, HostListener, ViewChild, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

type ChatMsg = {
  role: 'user' | 'bot';
  text: string;
  timestamp?: string;
  error?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'seen';
};
type ChatHistoryItem = { role: string; message: string; created_at?: string };

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="open()"
      class="chat-panel"
      style="height: 420px; max-height: calc(100vh - 140px);"
      #panel
      [ngClass]="position()"
      role="dialog"
      aria-label="Asistente Virtual Agro"
      aria-modal="true"
      tabindex="-1"
      (keydown)="onPanelKeydown($event)"
    >
      <div class="chat-header chat-header--agro">
        <button type="button" class="chat-close" (click)="closePanel()" aria-label="Minimizar chat">
          <span aria-hidden="true">&times;</span>
        </button>
        <div class="chat-header-title">Asistente Virtual Agro</div>
        <div class="chat-brand" aria-hidden="true">
          <img src="assets/GranoDeArrozSaludando.png" alt="" width="28" height="28" />
        </div>
      </div>

      <div class="chat-body" #body aria-live="polite">
        <div *ngFor="let m of messages()" class="msg-row" [ngClass]="m.role">
          <img class="avatar" *ngIf="m.role === 'bot'" [src]="'assets/GranoDeArrozSaludando.png'" alt="" />
          <div class="msg" [ngClass]="m.role">
            <span class="msg-text">{{ m.text }}</span>
            <small class="msg-meta">
              <span *ngIf="m.timestamp" class="msg-time">{{ m.timestamp | date:'shortTime' }}</span>
              <span *ngIf="m.role === 'user'" class="checks" [ngClass]="m.status" aria-hidden="true">
                <svg class="check one" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 8.5l3 3 8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg class="check two" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 8.5l3 3 8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </small>
          </div>
        </div>
        <div *ngIf="busy()" class="msg bot typing">Escribiendo...</div>
        <div class="chat-guest-hint" *ngIf="!canChat()">Inicia sesion o registrate para enviar mensajes.</div>
      </div>

      <div class="chat-status" *ngIf="status()">{{ status() }}</div>

      <div class="chat-input">
        <input
          #messageInput
          class="input"
          [(ngModel)]="input"
          [disabled]="busy() || !canChat()"
          [attr.aria-disabled]="busy() || !canChat() ? true : null"
          [placeholder]="canChat() ? 'Escribe tu mensaje.' : 'Debes iniciar sesion para escribir'"
          (keyup.enter)="send()"
        />
        <button class="btn" type="button" (click)="send()" [disabled]="busy() || !input.trim() || !canChat()">Enviar</button>
      </div>
    </div>

    <button
      *ngIf="canChat()"
      #toggleBtn
      class="chat-mascot-btn"
      [ngClass]="position()"
      aria-label="Abrir chat con Agro"
      (click)="toggle()"
      [attr.aria-pressed]="open()"
      [attr.aria-expanded]="open()"
    >
      <img [src]="open() ? 'assets/GranoDeArroz.webp' : 'assets/GranoDeArrozCentado.webp'" alt="Agro - asistente" class="mascot-img" />
    </button>
  `,
  styles: [`
    .chat-panel{
      position: fixed;
      bottom: 88px;
      right: 16px;
      left: auto;
      width: 360px;
      max-width: calc(100vw - 32px);
      border-radius: 22px;
      box-shadow: 0 18px 40px rgba(0,0,0,0.35);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      font-family: 'Outfit', system-ui, -apple-system, Segoe UI, sans-serif;
      background: #0f172a;
    }
    .chat-panel.left{
      left: 16px;
      right: auto;
    }
    .chat-header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding: 10px 14px;
      background: linear-gradient(135deg,#15803d,#166534);
      color:#f9fafb;
      font-size:17px;
      font-weight:800;
    }
    .chat-header-title{
      flex:1;
      text-align:center;
      font-size:17px;
      letter-spacing:.02em;
    }
    .chat-header--agro .chat-brand img{
      width:52px;
      height:52px;
    }
    .chat-close{
      border:none;
      background:transparent;
      color:#f9fafb;
      font-size:22px;
      width:32px;
      height:32px;
      border-radius:999px;
      cursor:pointer;
    }
    .chat-body{
      flex:1;
      padding: 12px 10px;
      background: url('/assets/FondoChatBot.png') center/cover no-repeat, #020617;
      overflow-y:auto;
      font-size:15px;
    }
    .msg-row{
      display:flex;
      gap:8px;
      margin-bottom:10px;
    }
    .msg-row.user{
      justify-content:flex-end;
    }
    .avatar{
      width:52px;
      height:52px;
      border-radius:50%;
      flex-shrink:0;
    }
    .msg{
      max-width: 82%;
      padding:10px 12px;
      border-radius:18px;
      line-height:1.4;
      font-size:15px;
    }
    .msg.bot{
      background: #14532d; /* verde oscuro sólido */
      border: 1px solid #16a34a;
      color:#f9fafb;
    }
    .msg.user{
      background: #15803d; /* verde algo más claro pero sólido */
      color:#ecfdf3;
    }
    .msg-text{
      display:block;
      white-space:pre-line;
    }
    .msg-meta{
      display:flex;
      justify-content:flex-end;
      gap:4px;
      margin-top:4px;
      font-size:11px;
      opacity:.85;
    }
    .chat-status{
      padding:4px 10px;
      font-size:12px;
      color:#f97316;
      background:#0b1120;
    }
    .chat-input{
      display:flex;
      align-items:center;
      gap:8px;
      padding:8px 10px 10px;
      background: #020617;
      border-top:1px solid rgba(148,163,184,0.4);
    }
    .chat-input .input{
      flex:1;
      border-radius:999px;
      border:1px solid rgba(148,163,184,0.8);
      padding:10px 14px;
      font-size:15px;
      outline:none;
      background:#020617;
      color:#e5e7eb;
    }
    .chat-input .input::placeholder{
      color:#6b7280;
    }
    .chat-input .btn{
      border:none;
      border-radius:999px;
      padding:9px 16px;
      font-size:15px;
      font-weight:700;
      background: linear-gradient(135deg,#22c55e,#16a34a);
      color:#022c22;
      cursor:pointer;
    }
    .chat-input .btn:disabled{
      opacity:.5;
      cursor:not-allowed;
    }
    .chat-guest-hint{
      margin-top:6px;
      font-size:13px;
      color:#f97316;
    }
    .chat-mascot-btn{
      position: fixed;
      bottom: 18px;
      right: 18px;
      border:none;
      padding:0;
      background:transparent;
      box-shadow:none;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .chat-mascot-btn.left{
      left:18px;
      right:auto;
    }
    .mascot-img{
      width:88px;
      height:88px;
      display:block;
    }
    @media (max-width: 480px){
      .chat-panel{
        right: 10px;
        left: 10px;
        width: auto;
        bottom: 80px;
      }
      .mascot-img{
        width:76px;
        height:76px;
      }
    }
  `]
})
export class ChatWidgetComponent {
  @ViewChild('body') body?: ElementRef<HTMLDivElement>;
  @ViewChild('panel') panel?: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') messageInput?: ElementRef<HTMLInputElement>;
  @ViewChild('toggleBtn') toggleBtn?: ElementRef<HTMLButtonElement>;

  open = signal(false);
  busy = signal(false);
  position = signal<'right' | 'left'>('right');
  messages = signal<ChatMsg[]>(this.defaultGreeting());
  suggestions = signal<string[]>([]);
  status = signal<string | null>(null);
  input = '';
  private storageKeyRef: string | null = null;

  canChat = computed(() => !!this.auth.token());
  userName = computed(() => this.auth.user()?.nombre_completo ?? 'Invitado');
  userAvatar(): string {
    const u: any = this.auth.user?.() ? this.auth.user() : null;
    return u?.avatar_url || u?.avatar || u?.photo_url || u?.photo || u?.foto || 'assets/223074-P1OEKE-223.jpg';
  }

  constructor(public auth: AuthService, private api: ApiService) {
    effect(() => {
      this.auth.user();
      this.restoreHistory();
    }, { allowSignalWrites: true });

    effect(() => {
      const snapshot = this.messages();
      this.persistHistory(snapshot);
      queueMicrotask(() => this.scrollToBottom());
    });

    effect(() => {
      if (!this.canChat() && this.open()) {
        this.open.set(false);
      }
    }, { allowSignalWrites: true });
  }

  toggle() {
    const next = !this.open();
    this.open.set(next);
    if (next) {
      this.resetConversation();
      setTimeout(() => this.focusPanel(), 0);
    } else {
      this.returnFocus();
    }
  }

  closePanel() {
    if (this.open()) this.toggle();
  }

  switchSide() {
    this.position.set(this.position() === 'right' ? 'left' : 'right');
  }

  async send() {
    if (!this.canChat()) { this.status.set('Debes iniciar sesion para conversar con el asistente.'); return; }
    if (!this.input.trim() || this.busy()) return;

    const text = this.input.trim();
    this.input = '';
    this.status.set(null);
    this.messages.update(arr => [...arr, { role: 'user', text, timestamp: new Date().toISOString(), status: 'sending' }]);
    queueMicrotask(() => this.markLastUser('sent'));
    this.busy.set(true);

    try {
      const res = await this.api.post<any>('/api/v1/assistant/chat', { message: text }, true);
      const reply = this.sanitizeReply(res?.message ?? '...');
      this.markLastUser('delivered');
      this.hydrateHistory(res?.history, reply);
      this.markLastUser('seen');
      this.suggestions.set([]);
    } catch (error: any) {
      const message = error?.error?.message || 'Lo siento, hubo un problema. Intentalo de nuevo.';
      this.status.set(message);
      this.input = text;
      this.markLastUser('sent');
      this.messages.update(arr => [...arr, { role: 'bot', text: message, error: true }]);
    } finally {
      this.busy.set(false);
    }
  }

  applySuggestion(text: string) { this.input = text; this.send(); }

  private sanitizeReply(text: string): string {
    if (!text) return '';
    const trimmed = text.replace(/Tip\s*para\s*ti[:\.]?[\s\S]*$/i, '').trim();
    return trimmed
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .join('\n');
  }

  private hydrateHistory(_history: ChatHistoryItem[] | undefined, fallback: string) {
    this.messages.update(arr => [...arr, { role: 'bot', text: fallback, timestamp: new Date().toISOString() }]);
  }

  private defaultGreeting(): ChatMsg[] {
    return [{ role: 'bot', text: 'Hola, estoy listo para ayudarte con tus lotes, analisis o planes.', timestamp: new Date().toISOString() }];
  }

  private storageKey(): string { const userId = this.auth.user()?.id; return `agroco_chat_${userId ?? 'invitado'}`; }

  private restoreHistory() {
    const key = this.storageKey();
    this.storageKeyRef = key;
    try { localStorage.removeItem(key); } catch { }
    this.resetConversation();
  }
  private persistHistory(_history: ChatMsg[]) { return; }

  private focusPanel() { this.panel?.nativeElement.focus(); setTimeout(() => this.messageInput?.nativeElement.focus(), 50); }
  private returnFocus() { this.toggleBtn?.nativeElement.focus(); }
  private resetConversation() { this.messages.set(this.defaultGreeting()); this.suggestions.set([]); this.status.set(null); }

  private scrollToBottom() { const el = this.body?.nativeElement; if (!el) return; el.scrollTop = el.scrollHeight; }

  private markLastUser(status: ChatMsg['status']) {
    const current = this.messages();
    for (let i = current.length - 1; i >= 0; i--) {
      if (current[i].role === 'user') {
        const next = [...current]; next[i] = { ...next[i], status }; this.messages.set(next); break;
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.open()) { event.preventDefault(); this.closePanel(); }
  }

  onPanelKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !this.open()) return;
    const focusable = this.getFocusableElements(); if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1]; const active = document.activeElement as HTMLElement | null;
    if (event.shiftKey) { if (active === first) { event.preventDefault(); last.focus(); } }
    else if (active === last) { event.preventDefault(); first.focus(); }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.panel) return [];
    return Array.from(this.panel.nativeElement.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
  }
}
