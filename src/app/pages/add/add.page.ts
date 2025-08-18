import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonDatetimeButton,
  IonModal,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonModal,
    IonDatetimeButton,
    IonTitle,
    IonHeader,
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonDatetime,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToolbar,
  ],
})
export class AddPage {
  activeForm: 'alert' | 'event' = 'alert';

  alertForm = {
    title: '',
    criticality: '',
    target: '',
    description: '',
    endDate: '',
    pdfFile: null,
    tips: [''],
  };

  sendStartup = ['Sotraco', 'Orange', 'IBM'];

  setActiveForm(form: 'alert' | 'event') {
    this.activeForm = form;
  }

  addTip() {
    this.alertForm.tips.push('');
  }

  submitAlert() {
    console.log('Alerte publiée :', this.alertForm);
  }
}
