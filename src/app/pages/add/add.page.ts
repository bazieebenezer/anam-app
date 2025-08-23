import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonDatetimeButton,
  IonDatetime,
  IonModal,
} from '@ionic/angular/standalone';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { PublicationService } from '../../services/publication/publication.service';
import { WeatherBulletin } from '../../model/bulletin.model';
import { Device } from '@capacitor/device';
import { Filesystem } from '@capacitor/filesystem';

// L'interface ne contient plus que la preview, qui sera notre DataURL Base64
interface ImagePreview {
  preview: string;
}

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonDatetimeButton,
    IonDatetime,
    IonModal,
  ],
})
export class AddPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  activeForm: 'alert' | 'event' = 'alert';
  alertForm!: FormGroup;
  sendStartup = ['Sotraco', 'Orange', 'IBM'];
  selectedImages: ImagePreview[] = [];

  constructor(
    private fb: FormBuilder,
    private publicationService: PublicationService
  ) {}

  ngOnInit() {
    this.initAlertForm();
  }

  private initAlertForm() {
    this.alertForm = this.fb.group({
      title: ['', [Validators.required]],
      images: this.fb.array([]),
      severity: ['', [Validators.required]],
      target: ['', [Validators.required]],
      description: ['', [Validators.required]],
      endDate: [new Date().toISOString(), [Validators.required]],
      pdfFile: [null],
      tips: this.fb.array([['']]),
    });
  }

  get tipsFormArray() {
    return this.alertForm.get('tips') as FormArray;
  }

  async onImagesSelected() {
    const info = await Device.getInfo();
    if (info.platform === 'web') {
      this.fileInput.nativeElement.click();
      return;
    }
    try {
      await Camera.requestPermissions();
      const images = await Camera.pickImages({
        quality: 90,
        limit: 10,
      });

      for (const image of images.photos) {
        if (image.path) {
          const file = await Filesystem.readFile({ path: image.path });
          const dataUrl = 'data:image/jpeg;base64,' + file.data;
          this.selectedImages.push({ preview: dataUrl });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection des images:', error);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            this.selectedImages.push({ preview: reader.result as string });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  setActiveForm(form: 'alert' | 'event') {
    this.activeForm = form;
    if (form === 'alert') {
      this.initAlertForm();
    }
  }

  addTip() {
    this.tipsFormArray.push(this.fb.control(''));
  }

  async submitAlert() {
    if (this.alertForm.invalid) {
      console.log('Formulaire invalide');
      Object.values(this.alertForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    try {
      // Extraire les chaînes Base64 de l'aperçu
      const imageUrls = this.selectedImages.map(img => img.preview);

      const alertData = {
        ...this.alertForm.value,
        images: imageUrls, // Remplacer par les URLs
        createdAt: new Date(), // Ajouter la date de création
      };

      await this.publicationService.addAlert(alertData as WeatherBulletin);
      console.log('Alerte publiée avec succès !');
      this.alertForm.reset();
      this.selectedImages = [];
    } catch (error) {
      console.error("Erreur lors de la publication de l'alerte :", error);
    }
  }

  onDateChange(event: any) {
    if (event.detail?.value) {
      this.alertForm.patchValue({
        endDate: event.detail.value,
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.alertForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  removeImage(image: ImagePreview) {
    const index = this.selectedImages.indexOf(image);
    if (index > -1) {
      this.selectedImages.splice(index, 1);
    }
  }
}