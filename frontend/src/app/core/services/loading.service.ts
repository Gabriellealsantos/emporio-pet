import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Gerencia um estado de carregamento global para a aplicação. */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly _loading = new BehaviorSubject<boolean>(false);

  /** Observable que emite o estado atual de carregamento (true ou false). */
  public readonly loading$ = this._loading.asObservable();

  /** Ativa o indicador de carregamento. */
  show(): void {
    this._loading.next(true);
  }

  /** Desativa o indicador de carregamento. */
  hide(): void {
    this._loading.next(false);
  }
}
