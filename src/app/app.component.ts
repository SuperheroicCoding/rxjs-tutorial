import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {Observer, Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'rxjs-tutorial';
  logs: string[] = [];
  private subscriptions: Subscription;


  constructor() {
  }

  log(...args: any[]) {
    this.logs = [args.reduce((previousValue, currentValue) => {
      if (typeof currentValue === 'string') {
        return previousValue + currentValue + ' ';
      }
      return previousValue + JSON.stringify(currentValue) + ' ';
    }, ''),
      ...this.logs
    ];
  }


  initObservable(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();

    }
    this.clear();
    this.log('init observables');

    const observer: (string) => Observer<any> = (prefix: string) => ({
      next: value => this.log(prefix + ' next', value),
      error: (error) => this.log(prefix + ' error', error),
      complete: () => this.log(prefix + ' complete')
    });


  }

  clear() {
    this.logs = [];
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.initObservable();
  }
}
