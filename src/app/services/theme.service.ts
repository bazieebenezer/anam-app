import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode$ = new BehaviorSubject<boolean>(false);
  isDarkMode = this.darkMode$.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    let initialTheme = (localStorage.getItem('theme') as Theme) || 'system';

    // Backward compatibility
    const legacyDarkMode = localStorage.getItem('darkMode');
    if (legacyDarkMode) {
      initialTheme = legacyDarkMode === 'true' ? 'dark' : 'light';
      localStorage.removeItem('darkMode');
    }
    
    this.setTheme(initialTheme);

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', (mediaQuery) => {
      const storedTheme = localStorage.getItem('theme') as Theme;
      if (storedTheme === 'system' || !storedTheme) {
        this.applyTheme(mediaQuery.matches);
      }
    });
  }

  setTheme(theme: Theme): void {
    localStorage.setItem('theme', theme);
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.applyTheme(prefersDark.matches);
    } else {
      this.applyTheme(theme === 'dark');
    }
  }

  private applyTheme(isDark: boolean): void {
    this.darkMode$.next(isDark);
    document.body.classList.toggle('dark', isDark);
  }

  getTheme(): Theme {
    return (localStorage.getItem('theme') as Theme) || 'system';
  }
}
