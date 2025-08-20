import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonImg,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButtons,
  IonText,
  IonModal,
  IonList,
  IonLabel,
} from '@ionic/angular/standalone';
import { EventService } from '../../services/evenments/event.service';
import { Event } from '../../model/event.model';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonList,
    IonModal,
    IonText,
    IonButtons,
    IonCardContent,
    IonCardHeader,
    IonCard,
    IonSearchbar,
    IonIcon,
    IonButton,
    IonImg,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class EventsPage implements OnInit {
  @ViewChild('modal') modal!: IonModal;

  searchTerm: string = '';
  selectedFilter: string = 'tous';
  selectedEvent: Event | null = null;
  events: Event[] = [];
  filteredEvents: Event[] = [];

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit() {
    this.events = this.eventService.getEvents();
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
    let filteredByDate = this.events;

    if (this.selectedFilter !== 'tous') {
      filteredByDate = this.eventService.getEventsByDateFilter(
        this.selectedFilter
      );
    }

    this.filteredEvents = filteredByDate.filter((event) => {
      const matchSearch =
        event.title.toLowerCase().includes(this.searchTerm) ||
        event.description.toLowerCase().includes(this.searchTerm);

      return matchSearch;
    });
  }

  goToDetails(event: Event, eventClick: MouseEvent) {
    if ((eventClick.target as HTMLElement).closest('ion-button')) return;
    this.router.navigate(['tabs/event-details', event.id]);
  }

  openShareModal(event: Event) {
    this.selectedEvent = event;
    this.modal.present();
  }
}
