import { Component, AfterViewInit } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

Swiper.use([Navigation, Pagination, Autoplay]);

@Component({
  selector: 'app-home',
  templateUrl: './home-page-component.html',
  styleUrls: ['./home-page-component.css'],
})
export class HomePageComponent implements AfterViewInit {
  ngAfterViewInit() {
    new Swiper('.swiper', {
      modules: [Navigation, Pagination, Autoplay], // 👈 obrigatório no Swiper 11
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
