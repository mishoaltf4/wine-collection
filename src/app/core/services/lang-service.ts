import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LangService {
  private translate = inject(TranslateService);
  public lang = signal<string>(localStorage.getItem('lang') ?? 'ka');

  public changeLang(lang: 'ka' | 'en') {
    this.lang.set(lang);
    localStorage.setItem('lang', lang);
    this.translate.onLangChange.subscribe(e => this.lang.set(e.lang));
  }

  public getSelecteadLang(){
    return this.lang();
  }
}
