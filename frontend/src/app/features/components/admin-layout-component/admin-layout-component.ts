import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBars, faPaw, faChartPie, faBell, faUser,
  faCalendarAlt, faCut, faUsers, faIdBadge
} from '@fortawesome/free-solid-svg-icons';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FaIconComponent],
  templateUrl: './admin-layout-component.html',
  styleUrls: ['./admin-layout-component.css']
})
export class AdminLayoutComponent implements OnInit {
  isSidebarOpen = signal(false);

  faBars = faBars;
  faPaw = faPaw;
  faChartPie = faChartPie;
  faBell = faBell;
  faUser = faUser;
  faCalendarAlt = faCalendarAlt;
  faCut = faCut;
  faUsers = faUsers;
  faIdBadge = faIdBadge;

  pageTitle = signal('Carregando...');
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

   ngOnInit(): void {
    // Função para extrair o título da rota ativa
    const getTitleFromRoute = () => {
      let child = this.activatedRoute.firstChild;
      while (child?.firstChild) {
        child = child.firstChild;
      }
      return child?.snapshot.data['title'] || '';
    };

    // 1. Define o título inicial assim que o componente carrega
    const initialTitle = getTitleFromRoute();
    if (initialTitle) {
      this.pageTitle.set(initialTitle);
    }

    // 2. Continua ouvindo por mudanças de rota para o futuro
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const title = getTitleFromRoute();
      if (title) {
        this.pageTitle.set(title);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }
}
