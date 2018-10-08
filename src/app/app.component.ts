import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {fromEvent, interval, Observer, Subscription} from 'rxjs';
import {filter, map, repeat, switchMap, switchMapTo, takeUntil, tap} from 'rxjs/operators';

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

    // counter
    const startButton: HTMLButtonElement = document.querySelector('#start-button');
    const stopButton: HTMLButtonElement = document.querySelector('#stop-button');

    const startCounter$ = fromEvent(startButton, 'click');
    const stopCounter$ = fromEvent(stopButton, 'click');
    const interval$ = interval(1000);

    const observerCounter = observer('counter:');

    this.subscriptions =
      startCounter$.pipe(
        switchMapTo(interval$),
        takeUntil(stopCounter$),
        repeat(),
      )
        .subscribe(observerCounter);

// drag and drop
    const dragAndDropTarget: HTMLDivElement = document.querySelector('#drag-and-drop-item');
    dragAndDropTarget.style.top = 0 + 'px';
    dragAndDropTarget.style.left = 0 + 'px';
    const mouseDownDD$ = fromEvent(dragAndDropTarget, 'mousedown');
    const mouseUpDD$ = fromEvent(document, 'mouseup');
    const mapStartPos = map(({offsetX, offsetY}: MouseEvent) => ({
      startX: offsetX,
      startY: offsetY
    }));


    const ddContainer: HTMLDivElement = document.querySelector('.drag-and-drop-container');
    const switchMapElementPosition$ = switchMap(({startX, startY}) =>
      fromEvent(ddContainer, 'mousemove').pipe(
        map((event: MouseEvent) => {
            event.preventDefault();
            const {offsetX, offsetY} = event;
            return {
              top: offsetY - startY,
              left: offsetX - startX
            };
          }
        )
      ));

    this.subscriptions.add(
      mouseDownDD$.pipe(
        mapStartPos,
        switchMapElementPosition$,
        filter(({top, left}) => top > -1 && left > -1),
        tap((pos) => {
          dragAndDropTarget.style.top = pos.top + 'px';
          dragAndDropTarget.style.left = pos.left + 'px';
        }),
        takeUntil(mouseUpDD$),
        repeat(),
      ).subscribe(observer('drag and drop'))
    );
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
