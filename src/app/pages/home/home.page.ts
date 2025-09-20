import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonImg,
  IonIcon,
  IonBadge,
  IonContent,
  IonButton,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButtons,
  IonText,
  IonItem,
  IonModal,
  IonSkeletonText,
  ModalController,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { PublicationService } from 'src/app/services/publication/publication.service';
import { WeatherBulletin } from 'src/app/model/bulletin.model';
import { Router, RouterLink } from '@angular/router';
import { NavController } from '@ionic/angular';
import { BadgeComponent } from 'src/app/components/badge/badge.component';
import { AuthService, AppUser } from 'src/app/services/auth/auth.service';
import { firstValueFrom, Observable } from 'rxjs';
import { NewPostService, Post } from 'src/app/services/new-post.service';
import { NewPostsSheetComponent } from 'src/app/components/new-posts-sheet/new-posts-sheet.component';
import { PdfGenerationService } from 'src/app/services/pdf-generation.service';
import { ShareService } from 'src/app/services/share.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonModal,
    IonItem,
    IonText,
    IonButtons,
    IonCardContent,
    IonCardHeader,
    IonCard,
    IonSearchbar,
    IonButton,
    IonContent,
    IonBadge,
    IonIcon,
    CommonModule,
    FormsModule,
    IonImg,
    BadgeComponent,
    IonSkeletonText,
    DatePipe,
  ],
})
export class HomePage implements OnInit {
  @ViewChild('modal') modal!: IonModal;
  searchTerm: string = '';
  selectedFilter: string = 'tous';
  selectedBulletin: WeatherBulletin | null = null;
  bulletins: WeatherBulletin[] = [];
  filteredBulletins: WeatherBulletin[] = [];
  isLoading: boolean = true;
  newPostsCount$!: Observable<number>;
  themeService = inject(ThemeService);

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private bulletinService: PublicationService,
    private authService: AuthService,
    private newPostService: NewPostService,
    private modalCtrl: ModalController,
    private pdfGenerationService: PdfGenerationService,
    private shareService: ShareService
  ) {}

  ngOnInit() {
    this.loadBulletins();
  }

  handleRefresh(event: any) {
    this.loadBulletins(event);
  }

  private async loadBulletins(event?: any) {
    if (!event) {
      this.isLoading = true;
    }

    try {
      this.newPostsCount$ = this.newPostService.getNewPostsCount();
      const user = await firstValueFrom(this.authService.currentUser$);
      const bulletins = await firstValueFrom(
        this.bulletinService.getPublications()
      );

      if (user && user.isInstitution) {
        this.bulletins = bulletins.filter(
          (b) => !b.targetInstitutionId || b.targetInstitutionId === user.uid
        );
      } else {
        this.bulletins = bulletins.filter((b) => !b.targetInstitutionId);
      }

      this.applyFilters();
    } catch (error) {
      console.error('Error loading bulletins:', error);
    } finally {
      this.isLoading = false;
      if (event) {
        event.target.complete();
      }
    }
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.applyFilters();
  }

  onFilterChange(filter: string) {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredBulletins = this.bulletins.filter((bulletin) => {
      const matchSearch =
        bulletin.title.toLowerCase().includes(this.searchTerm) ||
        bulletin.description.toLowerCase().includes(this.searchTerm);
      const matchFilter =
        this.selectedFilter === 'tous' ||
        (this.selectedFilter === 'normal' && bulletin.severity === 'normal') ||
        (this.selectedFilter === 'eleve' && bulletin.severity === 'eleve') ||
        (this.selectedFilter === 'urgent' && bulletin.severity === 'urgent');
      return matchSearch && matchFilter;
    });
  }

  async openNewPostsSheet() {
    const newPosts = await firstValueFrom(this.newPostService.getNewPosts());
    const modal = await this.modalCtrl.create({
      component: NewPostsSheetComponent,
      componentProps: { newPosts },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.post) {
      const post: Post = data.post;
      this.newPostService.markPostAsSeen(post.id!).subscribe(() => {
        const route =
          post.type === 'bulletin'
            ? '/tabs/bulletin-details/'
            : '/tabs/event-details/';
        this.router.navigate([route, post.id]);
      });
    }
  }

  goToDetails(bulletin: WeatherBulletin, event: MouseEvent) {
    if ((event.target as HTMLElement).closest('ion-button')) return;
    this.router.navigate(['/tabs/bulletin-details', bulletin.id]);
  }

  openShareModal(bulletin: WeatherBulletin) {
    this.selectedBulletin = bulletin;
    this.modal.present();
  }

  downloadBulletin(bulletin: WeatherBulletin) {
    this.pdfGenerationService.generateBulletinPdf(bulletin);
  }

  async shareBulletin() {
    if (this.selectedBulletin) {
      await this.shareService.shareItem({
        title: this.selectedBulletin.title,
        description: this.selectedBulletin.description,
        images: this.selectedBulletin.images,
      });
      this.modal.dismiss();
    }
  }
}
