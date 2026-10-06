import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './features/layout/header/header';
import { ViewportScroller } from '@angular/common';
import { Footer } from './features/layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('wine-collection');
  constructor() {
    inject(ViewportScroller).setOffset([0, 100]); // [x, y] = header height
  }
}
