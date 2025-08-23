import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/evenments/event.service';
import { AnamEvent } from '../../model/event.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonImg,
  IonBackButton,
} from '@ionic/angular/standalone';
import { IonicSlides } from '@ionic/core';
import { ImageViewerModalComponent } from 'src/app/components/image-viewer-modal/image-viewer-modal.component';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonImg,
    IonContent,
    IonHeader,
    CommonModule,
    FormsModule,
    ImageViewerModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EventDetailsPage implements OnInit {
  event: AnamEvent | undefined;

  swiperModule = [IonicSlides];

  images: string[] = [];
  selectedImage: string | null = null;

  // Modal properties
  isImageViewerOpen = false;
  currentImageUrl = '';

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEventById(id).subscribe(event => {
        this.event = event;
      });
    }
  }

  openImageViewer(imageUrl: string) {
    if (!imageUrl) return;

    this.currentImageUrl = imageUrl;
    this.isImageViewerOpen = true;
  }

  closeImageViewer() {
    this.isImageViewerOpen = false;
    this.currentImageUrl = '';
  }

  onModalDismiss() {
    this.closeImageViewer();
  }
}
