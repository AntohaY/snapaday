import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { BehaviorSubject, concatMap, delay, from, of, switchMap, tap } from 'rxjs';
import { Photo } from '../shared/interfaces/photo';
import { SlideshowImageComponentModule } from './ui/slideshow-image.component';

@Component({
  selector: 'app-slideshow',
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-title>Play</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="modalCtrl.dismiss()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="label-container" [hidden]="!hideSlideshow">
        <ion-label color="danger">You don't have enough photos for slideshow, minimum is 2</ion-label>
      </div>
      <app-slideshow-image
        *ngIf="currentPhoto$ | async as photo"
        [hidden]="hideSlideshow"
        [safeResourceUrl]="photo.safeResourceUrl"
      ></app-slideshow-image>
    </ion-content>
  `,
  styles: [
    `
      :host {
        height: 100%;
      }

      .label-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SlideshowComponent {
  hideSlideshow = true;
  currentPhotos$ = new BehaviorSubject<Photo[]>([]);
  currentPhoto$ = this.currentPhotos$.pipe(
    // Emit one photo at a time
    tap((photos) => this.hideSlideshow = photos.length <= 1),
    switchMap((photos) =>
    from(photos)),
    concatMap((photo) =>
      // Create a new stream for each individual photo
      of(photo).pipe(
        // Creating a stream for each individual photo
        // will allow us to delay the start of the stream
        delay(1000)
      )
    )
  );
  constructor(protected modalCtrl: ModalController) {}
  @Input() set photos(value: Photo[]) {
    this.currentPhotos$.next([...value].reverse());
  }
}

@NgModule({
  declarations: [SlideshowComponent],
  imports: [IonicModule, CommonModule, SlideshowImageComponentModule],
  exports: [SlideshowComponent],
})
export class SlideshowComponentModule {}
