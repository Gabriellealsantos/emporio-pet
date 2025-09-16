import { Component, ElementRef, OnInit, ViewChild, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Rive, Fit, Alignment, Layout } from '@rive-app/canvas';

@Component({
  selector: 'app-error-page',
  standalone: true,
  templateUrl: './error-page-component.html',
  styleUrls: ['./error-page-component.css']
})
export class ErrorPageComponent implements AfterViewInit {
  @ViewChild('riveCanvas', { static: true }) riveCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) { }

 ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      new Rive({
        src: '/assets/rive/cat-playing.riv',
        canvas: this.riveCanvas.nativeElement,
        artboard: 'Cat playing animation',
        animations: 'Cat playing animation',
        autoplay: true,
        // A propriedade layout não é mais necessária,
        // pois o CSS/HTML está controlando o posicionamento.
      });
    }
  }


  goHome(): void {
    this.router.navigate(['/login']);
  }
}
