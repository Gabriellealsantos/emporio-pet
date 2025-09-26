import { Component, ElementRef, ViewChild, Inject, PLATFORM_ID, AfterViewInit, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Rive } from '@rive-app/canvas';

/** Componente para a página de erro genérica (ex: Erro 500), exibindo uma animação. */
@Component({
  selector: 'app-error-page',
  standalone: true,
  templateUrl: './error-page-component.html',
  styleUrls: ['./error-page-component.css']
})
export class ErrorPageComponent implements AfterViewInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  // ===================================================================
  // REFERÊNCIAS DE TEMPLATE
  // ===================================================================
  /** Referência ao elemento canvas onde a animação do Rive será renderizada. */
  @ViewChild('riveCanvas', { static: true }) riveCanvas!: ElementRef<HTMLCanvasElement>;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa a animação do Rive no canvas após a view ser renderizada. */
  ngAfterViewInit(): void {
    // Garante que a animação Rive, que manipula o DOM, só seja executada no navegador.
    if (isPlatformBrowser(this.platformId)) {
      new Rive({
        src: '/assets/rive/cat-playing.riv',
        canvas: this.riveCanvas.nativeElement,
        artboard: 'Cat playing animation',
        animations: 'Cat playing animation',
        autoplay: true,
      });
    }
  }

  // ===================================================================
  // MÉTODOS DE NAVEGAÇÃO
  // ===================================================================

  /** Navega o usuário de volta para a página de login. */
  goHome(): void {
    this.router.navigate(['/login']);
  }
}
