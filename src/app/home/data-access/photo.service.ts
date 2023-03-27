import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Photo } from '../../shared/interfaces/photo';
import {Platform} from '@ionic/angular';
import { ImageOptions, CameraResultType, CameraSource, Camera } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  #photos$ = new BehaviorSubject<Photo[]>([]);
  photo$ = this.#photos$.asObservable();

  constructor(
    private platform: Platform,
  ){}

  private addPhoto(fileName: string, filePath: string) {
    const newPhotos = [
      {
        name: fileName,
        path: filePath,
        dateTaken: new Date().toISOString(),
      },
      ...this.#photos$.value,
    ];

    this.#photos$.next(newPhotos);
  }

  async takePhoto() {
    const options: ImageOptions = {
      quality: 50,
      width: 600,
      allowEditing: false,
      resultType: this.platform.is('capacitor')
        ? CameraResultType.Uri
        : CameraResultType.DataUrl,
      source: CameraSource.Camera,
    };
    try {
      const photo = await Camera.getPhoto(options);
      if (photo.path) {
        this.addPhoto(Date.now().toString(), photo.path);
      } else if (photo.dataUrl) {
        this.addPhoto(Date.now().toString(), photo.dataUrl);
      }
    } catch (err) {
      console.log(err);
      throw new Error('Could not save photo');
    }
  }
}
