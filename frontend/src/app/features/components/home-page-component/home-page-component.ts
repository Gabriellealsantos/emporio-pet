import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Header } from "../../../shared/components/header/header";
import { Footer } from "../../../shared/components/footer/footer";

// Configuração global do Swiper
Swiper.use([Navigation, Pagination, Autoplay]);

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home-page-component.html',
  styleUrls: ['./home-page-component.css'],
  imports: [Header, Footer],
})
export class HomePageComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Só executa no navegador (evita erro de "document is not defined")
      new Swiper('.swiper', {
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
