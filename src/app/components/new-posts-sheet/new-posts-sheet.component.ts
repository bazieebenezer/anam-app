import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Post } from '../../services/new-post.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward } from 'ionicons/icons';

@Component({
  selector: 'app-new-posts-sheet',
  templateUrl: './new-posts-sheet.component.html',
  styleUrls: ['./new-posts-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class NewPostsSheetComponent implements OnInit {
  @Input() newPosts: Post[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  dismiss(post?: Post) {
    this.modalCtrl.dismiss({
      post,
    });
  }

  getPostImage(post: Post): string {
    // Return the first image or a placeholder
    return post.images && post.images.length > 0
      ? post.images[0]
      : 'assets/icon/favicon.png';
  }
}
