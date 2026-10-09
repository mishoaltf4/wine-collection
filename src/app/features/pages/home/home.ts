import { NgClass } from '@angular/common';
import { Component, computed, inject, signal, afterNextRender, HostListener } from '@angular/core';
import AOS from 'aos';
import { TranslatePipe } from '@ngx-translate/core';
import { LangService } from '../../../core/services/lang-service';

@Component({
  selector: 'app-home',
  imports: [TranslatePipe, NgClass],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected translateService = inject(LangService);
  protected selectedLang = signal(localStorage.getItem('lang'));

  ngOnChanges() {
    console.log(localStorage.getItem('lang'));
  }

  private width = signal<number | null>(null);
  constructor() {
    this.width.set(window.innerWidth);

    this.setCaruselMaxVisibleItems(this.width()!);

    afterNextRender(() => {
      AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.width.set(event.target.innerWidth);

    this.setCaruselMaxVisibleItems(this.width()!);
  }

  protected data = signal<any[]>([
    {
      id: 1,
      img: '/images/home/something.jpg',
      title: 'something 1',
    },
    {
      id: 2,
      img: '/images/home/test.jpg',
      title: 'something 2',
    },
    {
      id: 3,
      img: '/images/home/mta.jpg',
      title: 'something 3',
    },
    {
      id: 4,
      img: '/images/home/test.jpg',
      title: 'something 4',
    },
  ]);

  protected start = signal(0);
  protected perView = signal<number>(3);

  protected visible = computed(() =>
    this.data().slice(this.start(), this.start() + this.perView()),
  );

  protected canPrev = computed(() => this.start() > 0);
  protected canNext = computed(() => this.start() + this.perView() < this.data().length);

  protected next() {
    if (this.canNext()) this.start.update((s) => s + 1);
  }

  protected prev() {
    if (this.canPrev()) this.start.update((s) => s - 1);
  }

  readonly months = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  readonly weekdays = signal([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ]);

  protected activeFestivals = signal([
    {
      id: 1,
      date: new Date(2026, 9, 24),
      title: 'UPCOMING_EVENTS.EVENTS.EVENT_1.TITLE',
      dateToDisplay: 'UPCOMING_EVENTS.EVENTS.EVENT_1.DATE',
      place: 'UPCOMING_EVENTS.EVENTS.EVENT_1.PLACE',
      placeShort: 'UPCOMING_EVENTS.EVENTS.EVENT_1.PLACE_SHORT',
      description: 'UPCOMING_EVENTS.EVENTS.EVENT_1.DESCRIPTION',
    },
    {
      id: 1,
      date: new Date(2026, 9, 27),
      title: 'something',
    },
  ]);

  protected pastEvents = signal<{date: string, title: string}[]>(
    [
      {
        title: "PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_1.TITLE",
        date: "PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_1.DATE"
      },
      {
        title: "PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_2.TITLE",
        date: "PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_2.DATE"
      },
      {
        title: "PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_3.TITLE",
        date: "PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_3.DATE"
      },
      {
        title: "PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_4.TITLE",
        date: "PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_4.DATE"
      },
    ]
  )

  protected selectedFestival = signal<any>(this.activeFestivals()[0]);

  protected year = signal(2026);
  protected month = signal(new Date().getMonth());
  protected selected = signal<Date | null>(this.activeFestivals()[0].date ?? null);

  protected monthName = computed(() => this.months[this.month()]);

  protected cells = computed<Cell[]>(() => {
    const y = this.year();
    const m = this.month();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const total = new Date(y, m + 1, 0).getDate();
    const out: Cell[] = Array.from({ length: offset }, () => ({ day: null, date: null }));
    for (let d = 1; d <= total; d++) out.push({ day: d, date: new Date(y, m, d) });
    return out;
  });

  private setCaruselMaxVisibleItems(windowWidth: number): void {
    if (windowWidth < 950) {
      this.perView.set(1);
    } else if (windowWidth < 1450) {
      this.perView.set(2);
    } else {
      this.perView.set(3);
    }
  }

  protected isSelected(cell: Cell): boolean {
    const s = this.selected();
    return !!cell.date && !!s && cell.date.toDateString() === s.toDateString();
  }

  protected select(cell: Cell): void {
    if (!cell.date) return;

    this.selected.set(cell.date);
    this.selectFestival(cell);
  }

  protected selectFestival(cell: Cell): void {
    if (!cell.date) return;

    const festival = this.activeFestivals().find(
      (f) => f.date.toDateString() === cell.date!.toDateString(),
    );

    this.selectedFestival.set(festival ?? null);
  }

  protected shift(delta: number): void {
    const d = new Date(this.year(), this.month() + delta, 1);
    this.year.set(d.getFullYear());
    this.month.set(d.getMonth());
  }

  protected isFestival(cell: Cell): boolean {
    if (!cell.date) return false;

    console.log(
      this.activeFestivals().some(
        (festival) => festival.date.toDateString() === cell.date!.toDateString(),
      ),
    );

    return this.activeFestivals().some(
      (festival) => festival.date.toDateString() === cell.date!.toDateString(),
    );
  }
}

interface Cell {
  day: number | null;
  date: Date | null;
}
