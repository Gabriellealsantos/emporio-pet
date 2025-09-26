import { Component, AfterViewInit, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../models/Service';
import { RouterLink } from '@angular/router';
import { Header } from "../../../shared/components/header/header";
import { Footer } from "../../../shared/components/footer/footer";
import { environment } from '../../../../environments/environment';

// Inicializa os módulos do Swiper globalmente
Swiper.use([Navigation, Pagination, Autoplay]);

/** Componente da página inicial (home page), exibindo serviços em um carrossel. */
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home-page-component.html',
  styleUrls: ['./home-page-component.css'],
  imports: [CommonModule, RouterLink, Header, Footer],
})
export class HomePageComponent implements OnInit, AfterViewInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private servicesService = inject(ServicesService);
   private platformId = inject(PLATFORM_ID);


  // ===================================================================
  // ESTADO DO COMPONENTE
  // ===================================================================
  /** Armazena a lista de serviços ativos a serem exibidos no carrossel. */
  services = signal<Service[]>([]);
  /** Armazena a instância do carrossel Swiper para evitar reinicialização. */
  private swiperInstance: Swiper | null = null;
  /** Expõe as variáveis de ambiente para uso no template. */
  environment = environment;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, disparando o carregamento dos serviços. */
  ngOnInit(): void {
    this.loadServices();
  }

  /** Gancho do ciclo de vida executado após a view ser inicializada. */
  ngAfterViewInit(): void {
    // A inicialização do Swiper agora ocorre dentro de loadServices para garantir
    // que o DOM seja atualizado com os dados antes de o Swiper ser ativado.
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO E INICIALIZAÇÃO
  // ===================================================================

  /** Busca a lista de serviços ativos da API e, em seguida, inicializa o Swiper. */
  loadServices(): void {
    this.servicesService.findAll({ active: true }).subscribe(data => {
      this.services.set(data);

      // Garante que o Swiper seja inicializado apenas após o DOM ser atualizado com os novos dados.
      setTimeout(() => {
        this.initSwiper();
      }, 0);
    });
  }

  /** Inicializa a biblioteca do carrossel Swiper, se estiver no ambiente do navegador. */
  initSwiper(): void {
    if (isPlatformBrowser(this.platformId) && !this.swiperInstance) {
      this.swiperInstance = new Swiper('.swiper', {
        modules: [Navigation, Pagination, Autoplay],
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        slidesPerView: 1,
        spaceBetween: 20,
        centeredSlides: true,
      });
    }
  }
}
