import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnimatedBackgroundComponent } from './components/animated-background.component';
import { ChatWidgetComponent } from './components/chat-widget.component';
import { ToastContainerComponent } from './components/toast-container.component';
import { TopbarChipComponent } from './components/topbar-chip.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AnimatedBackgroundComponent, ChatWidgetComponent, ToastContainerComponent, TopbarChipComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AGROCO';
  menuOpen = false;
  isHomeRoute = true;
  isAuthRoute = false;

  constructor(public auth: AuthService, private router: Router) {
    this.setHomeFlag(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.setHomeFlag(event.urlAfterRedirects));
  }

  private setHomeFlag(url: string) {
    const normalized = url.split('?')[0];
    this.isHomeRoute = normalized === '/' || normalized === '';
    this.isAuthRoute = normalized === '/login' || normalized === '/register';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout() { this.auth.logout(); }
}
