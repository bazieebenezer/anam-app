import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
} from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonBackButton,
  IonImg,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/angular/standalone';

import { ActivatedRoute } from '@angular/router';
import { PublicationService } from 'src/app/services/publication/publication.service';
import { WeatherBulletin } from 'src/app/model/bulletin.model';
import { BadgeComponent } from 'src/app/components/badge/badge.component';
import { IonicSlides } from '@ionic/angular/standalone';
import { ImageViewerModalComponent } from 'src/app/components/image-viewer-modal/image-viewer-modal.component';

@Component({
  selector: 'app-bulletin-details',
  templateUrl: './bulletin-details.page.html',
  styleUrls: ['./bulletin-details.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonHeader,
    IonContent,
    NgIf,
    FormsModule,
    BadgeComponent,
    IonImg,
    IonButton,
    IonIcon,
    IonText,
    ImageViewerModalComponent,
    DatePipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BulletinDetailsPage implements OnInit {
  swiperModule = [IonicSlides];
  bulletin: WeatherBulletin | undefined;
  images: string[] = [];
  selectedImage: string | null = null;
  isImageViewerOpen = false;
  currentImageUrl = '';

  constructor(
    private route: ActivatedRoute,
    private bulletinService: PublicationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bulletinService.getPublicationById(id).subscribe((bulletin) => {
        this.bulletin = bulletin;
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

