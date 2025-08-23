import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonBadge } from '@ionic/angular/standalone';
import { WeatherBulletin } from 'src/app/model/bulletin.model';
import { PublicationService } from 'src/app/services/publication/publication.service';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  standalone: true,
  imports: [IonBadge, CommonModule],
})
export class BadgeComponent implements OnInit {
  @Input('severity') severity!: string | undefined;
  bulletins: WeatherBulletin[] = [];

  constructor(private bulletinService: PublicationService) {}

  ngOnInit() {
    this.bulletinService.getPublications().subscribe((data) => {
      this.bulletins = data;
    });
  }
}
