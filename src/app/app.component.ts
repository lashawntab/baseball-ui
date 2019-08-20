import { Component } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { skipWhile, map } from 'rxjs/operators';

import { Game } from './game';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
 
  private selectedInningSubject = new BehaviorSubject<number>(1);
  private selectedInningPersonnelSubject = new Subject<{}>();

  public selectedInning$ = this.selectedInningSubject.asObservable();
  public selectedInningPersonnel$ = this.selectedInningPersonnelSubject.asObservable();
  public game = new Game(565609);
  public personnelPairings = {};

  constructor(){
    this.game.initialized$.pipe(
      skipWhile(initialized => !initialized),
      map(initialized => {
        this.selectedInningSubject.next(1);
        return initialized;
      })).subscribe();

    this.selectedInning$.pipe(
      map(inning => {
        this.loadGameInningInfo(inning);
    })).subscribe();

  }

  public onDecrementInning(){
    const currentValue = this.selectedInningSubject.getValue();
    this.selectedInningSubject.next(currentValue - 1);
  }

  public onIncrementInning() {
    const currentValue = this.selectedInningSubject.getValue();
    this.selectedInningSubject.next(currentValue + 1);
  }

  private loadGameInningInfo(inning: number) {
    this.personnelPairings = this.game.getStatsByPersonnelPairing(inning);
  }
}

