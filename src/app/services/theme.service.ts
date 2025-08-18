import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode$ = new BehaviorSubject<boolean>(false);
  isDarkMode = this.darkMode$.asObservable();

  constructor() {
    // Vérifie si un thème est déjà enregistré
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.setDarkMode(savedTheme === 'true');
    } else {
      // Vérifie les préférences système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.setDarkMode(prefersDark.matches);

      // Écoute les changements de préférences système
      prefersDark.addEventListener('change', (mediaQuery) => 
        this.setDarkMode(mediaQuery.matches)
      );
    }
  }

  setDarkMode(enable: boolean): void {
    this.darkMode$.next(enable);
    document.body.classList.toggle('dark', enable);
    localStorage.setItem('darkMode', enable.toString());
  }
}
