import { NgClass } from '@angular/common';
import { Component, computed, inject, signal, afterNextRender, HostListener } from '@angular/core';
import AOS from 'aos';
import { TranslatePipe } from '@ngx-translate/core';
import { LangService } from '../../../core/services/lang-service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons'


const BREAKPOINT_TABLET = 950;
const BREAKPOINT_DESKTOP = 1450;

@Component({
  selector: 'app-home',
  imports: [TranslatePipe, NgClass, FontAwesomeModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home {
  protected translateService = inject(LangService);
  protected selectedLang = signal(localStorage.getItem('lang'));

  private width = signal<number | null>(null);

  protected rightIcon = faAngleRight;
  protected leftIcon = faAngleLeft;

  protected facebookLink = 'https://www.facebook.com/share/1DZ2A2cHsg/?mibextid=wwXIfr';

  protected data = signal<any[]>([
    { id: 1, img: '/images/home/something.jpg', title: 'something 1' },
    { id: 2, img: '/images/home/test.jpg', title: 'something 2' },
    { id: 3, img: '/images/home/mta.jpg', title: 'something 3' },
    { id: 4, img: '/images/home/test.jpg', title: 'something 4' },
  ]);

  protected start = signal(0);
  protected perView = signal<number>(3);

  protected visible = computed(() =>
    this.data().slice(this.start(), this.start() + this.perView()),
  );

  protected canPrev = computed(() => this.start() > 0);
  protected canNext = computed(() => this.start() + this.perView() < this.data().length);

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
      date: new Date(2026, 9, 31),
      title: 'UPCOMING_EVENTS.EVENTS.EVENT_1.TITLE',
      dateToDisplay: 'UPCOMING_EVENTS.EVENTS.EVENT_1.DATE',
      place: 'UPCOMING_EVENTS.EVENTS.EVENT_1.PLACE',
      placeShort: 'UPCOMING_EVENTS.EVENTS.EVENT_1.PLACE_SHORT',
      description: 'UPCOMING_EVENTS.EVENTS.EVENT_1.DESCRIPTION',
    },
  ]);

  protected pastEvents = signal<{ date: string; title: string }[]>([
    {
      title: 'PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_1.TITLE',
      date: 'PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_1.DATE',
    },
    {
      title: 'PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_2.TITLE',
      date: 'PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_2.DATE',
    },
    {
      title: 'PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_3.TITLE',
      date: 'PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_3.DATE',
    },
    {
      title: 'PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_4.TITLE',
      date: 'PAST_EVENTS.PAST_EVENTS_LIST.PAST_EVENT_4.DATE',
    },
  ]);

  protected selectedFestival = signal<any>(this.activeFestivals()[0]);

  protected year = signal(2026);
  protected month = signal(new Date().getMonth());
  protected selected = signal<Date | null>(this.activeFestivals()[0].date ?? null);

  protected monthName = computed(() => this.months[this.month()]);

  protected cells = computed<Cell[]>(() => {
    const year = this.year();
    const month = this.month();

    const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Cell[] = Array.from({ length: leadingBlanks }, () => ({
      day: null,
      date: null,
    }));

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, date: new Date(year, month, day) });
    }

    return cells;
  });

  constructor() {
    this.width.set(window.innerWidth);
    this.setCarouselMaxVisibleItems(this.width()!);

    afterNextRender(() => {
      AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.width.set(event.target.innerWidth);
    this.setCarouselMaxVisibleItems(this.width()!);
  }

  protected next() {
    if (this.canNext()) this.start.update((s) => s + 1);
  }

  protected prev() {
    if (this.canPrev()) this.start.update((s) => s - 1);
  }

  private setCarouselMaxVisibleItems(windowWidth: number): void {
    if (windowWidth < BREAKPOINT_TABLET) {
      this.perView.set(1);
    } else if (windowWidth < BREAKPOINT_DESKTOP) {
      this.perView.set(2);
    } else {
      this.perView.set(3);
    }
  }

  protected shift(delta: number): void {
    const date = new Date(this.year(), this.month() + delta, 1);
    this.year.set(date.getFullYear());
    this.month.set(date.getMonth());
  }

  protected select(cell: Cell): void {
    if (!cell.date) return;

    this.selected.set(cell.date);
    this.selectFestival(cell);
  }

  protected selectFestival(cell: Cell): void {
    if (!cell.date) return;

    const festival = this.activeFestivals().find((f) => this.isSameDay(f.date, cell.date!));
    this.selectedFestival.set(festival ?? null);
  }

  protected isSelected(cell: Cell): boolean {
    const selected = this.selected();
    return !!cell.date && !!selected && this.isSameDay(cell.date, selected);
  }

  protected isFestival(cell: Cell): boolean {
    if (!cell.date) return false;

    return this.activeFestivals().some((f) => this.isSameDay(f.date, cell.date!));
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
  }
}

interface Cell {
  day: number | null;
  date: Date | null;
}
