import { Component,  inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LangService } from '../../../core/services/lang-service';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

export type Lang = 'ka' | 'en';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe, NgClass, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private langService = inject(LangService);
  private translateService = inject(TranslateService);
  readonly activeLang = signal<Lang>(
    (localStorage.getItem('lang') as Lang) ?? 'en'
  );

  protected isMenuOpen = signal<boolean>(false);

  constructor() {
    this.translateService.addLangs(['en', 'ka']);
    this.apply(this.activeLang());
  }

  changeLang(lang: Lang) {
    this.activeLang.set(lang);
    this.langService.changeLang(lang);
    this.apply(lang);
  }

  private apply(lang: Lang) {
    this.translateService.use(lang);
    document.documentElement.lang = lang;
  }

  protected openMenu(){
    this.isMenuOpen.update((val: boolean) => !val);
  }
}
