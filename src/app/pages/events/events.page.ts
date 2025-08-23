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
import { AnamEvent } from '../../model/event.model';
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
  selectedEvent: AnamEvent | null = null;
  events: AnamEvent[] = [];
  filteredEvents: AnamEvent[] = [];

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit() {
    this.eventService.getEventsFromFirebase().subscribe((events) => {
      this.events = events;
      this.applyFilters();
    });
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
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    let filteredByDate = this.events;

    if (this.selectedFilter !== 'tous') {
      switch (this.selectedFilter) {
        case 'recents':
          filteredByDate = this.events.filter((event) => {
            const eventDate = (event.createdAt as any).toDate();
            return eventDate >= twoDaysAgo;
          });
          break;
        case '2jours':
          filteredByDate = this.events.filter((event) => {
            const eventDate = (event.createdAt as any).toDate();
            return eventDate >= oneWeekAgo && eventDate < twoDaysAgo;
          });
          break;
        case 'plus_anciens':
          filteredByDate = this.events.filter((event) => {
            const eventDate = (event.createdAt as any).toDate();
            return eventDate < oneWeekAgo;
          });
          break;
      }
    }

    this.filteredEvents = filteredByDate.filter((event) => {
      const matchSearch =
        event.title.toLowerCase().includes(this.searchTerm) ||
        event.description.toLowerCase().includes(this.searchTerm);

      return matchSearch;
    });
  }

  goToDetails(event: AnamEvent, eventClick: MouseEvent) {
    if ((eventClick.target as HTMLElement).closest('ion-button')) return;
    this.router.navigate(['tabs/event-details', event.id]);
  }

  openShareModal(event: AnamEvent) {
    this.selectedEvent = event;
    this.modal.present();
  }
}
