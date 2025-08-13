import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonBackButton,
  IonImg,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { PublicationService } from 'src/app/services/publication/publication.service';
import { WeatherBulletin } from 'src/app/model/bulletin.model';
import { BadgeComponent } from 'src/app/components/badge/badge/badge.component';

@Component({
  selector: 'app-bulletin-details',
  templateUrl: './bulletin-details.page.html',
  styleUrls: ['./bulletin-details.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonHeader,
    IonContent,
    CommonModule,
    FormsModule,
    BadgeComponent,
  ],
})
export class BulletinDetailsPage implements OnInit {
  constructor() {}

  bulletin!: WeatherBulletin | undefined;
  route = inject(ActivatedRoute);
  bulletinService = inject(PublicationService);

  images: string[] = [];
  selectedImage: string | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bulletin = this.bulletinService.getPublicationById(id);
  }
}
