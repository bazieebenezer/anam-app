import { Component, OnInit } from '@angular/core';
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

interface ImagePreview {
  path?: string;
  file?: File;
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
  activeForm: 'alert' | 'event' = 'alert';
  alertForm!: FormGroup;
  sendStartup = ['Sotraco', 'Orange', 'IBM'];
  selectedImages: ImagePreview[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initAlertForm();
  }

  private initAlertForm() {
    this.alertForm = this.fb.group({
      title: ['', [Validators.required]],
      images: this.fb.array([['', Validators.required]]),
      criticality: ['', [Validators.required]],
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
    try {
      // Demande de permission
      await Camera.requestPermissions();

      // Sélection des images
      const images = await Camera.pickImages({
        quality: 90,
        limit: 10, // Limite le nombre d'images à 10
      });

      // Traitement des images sélectionnées
      for (const image of images.photos) {
        const imageUrl = Capacitor.convertFileSrc(image.webPath);
        this.selectedImages.push({
          path: image.path,
          preview: imageUrl,
        });
      }

      this.updateImagesFormArray();
    } catch (error) {
      console.error('Erreur lors de la sélection des images:', error);
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

  submitAlert() {
    if (this.alertForm.valid) {
      console.log('Alerte publiée :', this.alertForm.value);
    } else {
      console.log('Formulaire invalide');
      Object.keys(this.alertForm.controls).forEach((key) => {
        const control = this.alertForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
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

  // Selection des images pour le web
  // onImagesSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files) {
  //     const files = Array.from(input.files);

  //     files.forEach((file) => {
  //       if (file.type.startsWith('image/')) {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //           this.selectedImages.push({
  //             file: file,
  //             preview: reader.result as string,
  //           });
  //           this.updateImagesFormArray();
  //         };
  //         reader.readAsDataURL(file);
  //       }
  //     });
  //   }
  // }

  removeImage(image: ImagePreview) {
    const index = this.selectedImages.indexOf(image);
    if (index > -1) {
      this.selectedImages.splice(index, 1);
      this.updateImagesFormArray();
    }
  }

  private updateImagesFormArray() {
    const imagesFormArray = this.alertForm.get('images') as FormArray;
    imagesFormArray.clear();
    this.selectedImages.forEach((image) => {
      imagesFormArray.push(this.fb.control(image.path || image.file));
    });
  }
}
