import {
  Component,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  ToastController,
} from '@ionic/angular/standalone';
import { ImageDownloadService } from '../../services/image-download.service';

@Component({
  selector: 'app-image-viewer-modal',
  templateUrl: './image-viewer-modal.component.html',
  styleUrls: ['./image-viewer-modal.component.scss'],
  imports: [
    CommonModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ImageViewerModalComponent {
  @Input() isOpen = false;
  @Input() imageUrl = '';
  @Input() title: string | undefined = '';
  @Output() didDismiss = new EventEmitter<void>();

  scale = 1;
  translateX = 0;
  translateY = 0;
  isTransitioning = false;
  isDownloading = false;

  private initialDistance = 0;
  private initialScale = 1;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private isDragging = false;

  constructor(
    private imageDownloadService: ImageDownloadService,
    private toastController: ToastController
  ) {}

  closeModal() {
    this.isOpen = false;
    this.resetZoom();
    this.didDismiss.emit();
  }

  zoomIn() {
    this.scale = Math.min(this.scale * 1.2, 5);
  }

  zoomOut() {
    this.scale = Math.max(this.scale / 1.2, 0.5);
  }

  resetZoom() {
    this.isTransitioning = true;
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;

    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      this.initialDistance = this.getDistance(
        event.touches[0],
        event.touches[1]
      );
      this.initialScale = this.scale;
    } else if (event.touches.length === 1) {
      this.isDragging = true;
      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    }
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();

    if (event.touches.length === 2) {
      const currentDistance = this.getDistance(
        event.touches[0],
        event.touches[1]
      );
      const scaleFactor = currentDistance / this.initialDistance;
      this.scale = Math.max(0.5, Math.min(5, this.initialScale * scaleFactor));
    } else if (
      event.touches.length === 1 &&
      this.isDragging &&
      this.scale > 1
    ) {
      const deltaX = event.touches[0].clientX - this.lastTouchX;
      const deltaY = event.touches[0].clientY - this.lastTouchY;

      this.translateX += deltaX;
      this.translateY += deltaY;

      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    }
  }

  onTouchEnd() {
    this.isDragging = false;
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  async downloadImage() {
    this.isDownloading = true;

    try {
      const testResponse = await fetch(this.imageUrl, { method: 'HEAD' });

      if (!testResponse.ok) {
        throw new Error(`Image non accessible: ${testResponse.status}`);
      }

      const fileName = this.title
        ? `${this.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
        : 'bulletin_meteo.jpg';

      await this.imageDownloadService.downloadImage(this.imageUrl, fileName);
    } catch (error) {
      await this.showErrorToast(error);
    } finally {
      this.isDownloading = false;
    }
  }

  private async showErrorToast(error: any): Promise<void> {
    const message = error.message || 'Erreur lors du téléchargement';
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  }
}
