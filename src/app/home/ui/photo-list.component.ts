import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Photo } from '../../shared/interfaces/photo';
@Component({
  selector: 'app-photo-list',
  template: `
    <ion-list lines="none">
      <ion-item *ngFor="let photo of photos; trackBy: trackByFn">
        <img [src]="photo.safeResourceUrl" />
        <ion-badge slot="end" color="light">
          {{ photo.dateTaken }}
        </ion-badge>
      </ion-item>
    </ion-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoListComponent {
  @Input() photos!: Photo[];

  constructor() {}

  trackByFn(index: number, photo: Photo) {
    return photo.name;
  }
}
@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [PhotoListComponent],
  exports: [PhotoListComponent],
})
export class PhotoListComponentModule {}
