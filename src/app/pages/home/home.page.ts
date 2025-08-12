import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonImg,
  IonIcon,
  IonBadge,
  IonContent,
  IonButton,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButtons,
  IonText,
  IonItem,
  IonModal,
  IonList,
  IonLabel,
} from '@ionic/angular/standalone';
import { PublicationService } from 'src/app/services/publication/publication.service';
import { WeatherBulletin } from 'src/app/model/bulletin.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonList,
    IonModal,
    IonItem,
    IonText,
    IonButtons,
    IonCardContent,
    IonCardHeader,
    IonCard,
    IonSearchbar,
    IonButton,
    IonContent,
    IonBadge,
    IonIcon,
    CommonModule,
    FormsModule,
    IonImg,
  ],
})
export class HomePage implements OnInit {
  @ViewChild('modal') modal!: IonModal;
  searchTerm: string = '';
  selectedFilter: string = 'tous';
  selectedBulletin: WeatherBulletin | null = null;
  bulletinService = inject(PublicationService);
  bulletins: WeatherBulletin[] = [];
  filteredBulletins: WeatherBulletin[] = [];
  constructor() {}

  ngOnInit() {
    this.bulletins = this.bulletinService.getPublications();
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.applyFilters();
  }

  onFilterChange(filter: string) {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredBulletins = this.bulletins.filter((bulletin) => {
      const matchSearch =
        bulletin.title.toLowerCase().includes(this.searchTerm) ||
        bulletin.description.toLowerCase().includes(this.searchTerm);
      const matchFilter =
        this.selectedFilter === 'tous' ||
        (this.selectedFilter === 'normal' && bulletin.severity === 'normal') ||
        (this.selectedFilter === 'eleve' && bulletin.severity === 'eleve') ||
        (this.selectedFilter === 'urgent' && bulletin.severity === 'urgent');
      return matchSearch && matchFilter;
    });
  }

  openNotifications() {}

  openShareModal(bulletin: WeatherBulletin) {
    this.selectedBulletin = bulletin;
    this.modal.present();
  }
}
