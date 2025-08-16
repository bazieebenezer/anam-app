import { Component, inject, Input, OnInit } from '@angular/core';
import { IonBadge } from '@ionic/angular/standalone';
import { WeatherBulletin } from 'src/app/model/bulletin.model';
import { PublicationService } from 'src/app/services/publication/publication.service';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  imports: [IonBadge],
})
export class BadgeComponent implements OnInit {
  constructor() {}

  @Input('severity') severity!: string | undefined;

  ngOnInit() {
    this.bulletins = this.bulletinService.getPublications();
  }

  bulletinService = inject(PublicationService);
  bulletins: Array<WeatherBulletin> = [];
}
