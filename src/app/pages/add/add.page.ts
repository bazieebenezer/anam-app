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
  ToastController, // Added ToastController
} from '@ionic/angular/standalone';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { PublicationService } from '../../services/publication/publication.service';
import { EventService } from '../../services/evenments/event.service';
import { WeatherBulletin } from '../../model/bulletin.model';
import { AnamEvent } from '../../model/event.model';
import { Device } from '@capacitor/device';
import { Filesystem } from '@capacitor/filesystem';

import { AuthService, AppUser } from '../../services/auth/auth.service';

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
  eventForm!: FormGroup;
  institutions: AppUser[] = [];
  selectedImages: ImagePreview[] = [];

  constructor(
    private fb: FormBuilder,
    private publicationService: PublicationService,
    private eventService: EventService,
    private authService: AuthService,
    private toastController: ToastController // Injected ToastController
  ) {}

  async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }

  ngOnInit() {
    this.initAlertForm();
    this.initEventForm();
    this.loadInstitutions();
  }

  loadInstitutions() {
    this.authService.getInstitutionUsers().subscribe(users => {
      this.institutions = users;
    });
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
      tips: this.fb.array([this.fb.control('')]),
    });
  }

  private initEventForm() {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      images: this.fb.array([]),
      description: ['', [Validators.required]],
      usefulLinks: this.fb.array([this.createLink()]),
    });
  }

  createLink(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      url: ['', Validators.required],
    });
  }

  get tipsFormArray() {
    return this.alertForm.get('tips') as FormArray;
  }

  get usefulLinksFormArray() {
    return this.eventForm.get('usefulLinks') as FormArray;
  }

  addTip() {
    this.tipsFormArray.push(this.fb.control(''));
  }

  addLink() {
    this.usefulLinksFormArray.push(this.createLink());
  }

  removeLink(index: number) {
    this.usefulLinksFormArray.removeAt(index);
  }

  removeTip(index: number) {
    this.tipsFormArray.removeAt(index);
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
    this.selectedImages = [];
    if (form === 'alert') {
      this.initAlertForm();
    } else {
      this.initEventForm();
    }
  }

  async submitAlert() {
    if (this.alertForm.invalid) {
      Object.values(this.alertForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      await this.presentToast(
        "Veuillez remplir tous les champs requis pour l'alerte.",
        'warning'
      );
      return;
    }

    try {
      const imageUrls = this.selectedImages.map((img) => img.preview);
      const alertData = {
        ...this.alertForm.value,
        images: imageUrls,
        createdAt: new Date(), // Sera remplacé par le timestamp Firebase
        targetInstitutionId: this.alertForm.value.target === 'all' ? null : this.alertForm.value.target,
      };
      await this.publicationService.addAlert(alertData as WeatherBulletin);
      await this.presentToast('Alerte publiée avec succès !', 'success');
      this.alertForm.reset();
      this.selectedImages = [];
    } catch (error) {
      console.error("Erreur lors de la publication de l'alerte :", error);
      await this.presentToast(
        "Erreur lors de la publication de l'alerte.",
        'danger'
      );
    }
  }

  async submitEvent() {
    if (this.eventForm.invalid) {
      Object.values(this.eventForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      await this.presentToast(
        "Veuillez remplir tous les champs requis pour l'événement.",
        'warning'
      );
      return;
    }

    try {
      const imageUrls = this.selectedImages.map((img) => img.preview);
      const eventData: AnamEvent = {
        title: this.eventForm.value.title,
        description: this.eventForm.value.description,
        images: imageUrls,
        usefulLinks: this.eventForm.value.usefulLinks,
        createdAt: new Date(), // Sera remplacé par le timestamp Firebase
      };
      await this.eventService.addEvent(eventData);
      await this.presentToast('Événement publié avec succès !', 'success');
      this.eventForm.reset();
      this.selectedImages = [];
    } catch (error) {
      console.error("Erreur lors de la publication de l'événement :", error);
      await this.presentToast(
        "Erreur lors de la publication de l'événement.",
        'danger'
      );
    }
  }

  onDateChange(event: any) {
    if (event.detail?.value) {
      this.alertForm.patchValue({
        endDate: event.detail.value,
      });
    }
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  removeImage(image: ImagePreview) {
    const index = this.selectedImages.indexOf(image);
    if (index > -1) {
      this.selectedImages.splice(index, 1);
    }
  }
}
