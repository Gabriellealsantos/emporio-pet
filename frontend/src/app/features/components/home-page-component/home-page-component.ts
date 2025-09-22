import { Component, AfterViewInit, Inject, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../models/Service';
import { RouterLink } from '@angular/router';
import { Header } from "../../../shared/components/header/header";
import { Footer } from "../../../shared/components/footer/footer";

Swiper.use([Navigation, Pagination, Autoplay]);

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home-page-component.html',
  styleUrls: ['./home-page-component.css'],
  imports: [CommonModule, RouterLink, Header, Footer],
})
export class HomePageComponent implements OnInit, AfterViewInit {
  private servicesService = inject(ServicesService);
  private platformId = inject(PLATFORM_ID);

  // Signal para armazenar os serviços que vêm da API
  services = signal<Service[]>([]);
  private swiperInstance: Swiper | null = null;

  ngOnInit(): void {
    this.loadServices();
  }

  ngAfterViewInit(): void {
    // A inicialização do Swiper foi movida para depois do carregamento dos dados
  }

  loadServices(): void {
    this.servicesService.findAll({ active: true }).subscribe(data => {
      this.services.set(data);

      setTimeout(() => {
        this.initSwiper();
      }, 0);
    });
  }

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
