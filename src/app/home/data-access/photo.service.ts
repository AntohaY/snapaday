import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { Photo } from '../../shared/interfaces/photo';
import {Platform} from '@ionic/angular';
import { ImageOptions, CameraResultType, CameraSource, Camera } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { StorageService } from 'src/app/shared/data-access/storage.service';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  #photos$ = new BehaviorSubject<Photo[]>([]);

  photos$ = this.#photos$.pipe(
    tap((photos) => this.storageService.save(photos))
  );

  hasTakenPhotoToday$ = this.#photos$.pipe(
    map((photos) =>
      photos.find(
        (photo) =>
          new Date().setHours(0, 0, 0, 0) ===
          new Date(photo.dateTaken).setHours(0, 0, 0, 0)
      )
        ? true
        : false
    )
  );

  constructor(
    private platform: Platform,
    private storageService: StorageService
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

  load() {
    this.storageService.load$.pipe(take(1)).subscribe((photos) => {
      this.#photos$.next(photos);
    });
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
      const uniqueName = Date.now().toString();
      if (this.platform.is('capacitor') && photo.path) {
        const photoOnFileSystem = await Filesystem.readFile({
          path: photo.path,
        });
        const fileName = uniqueName + '.jpeg';
        const permanentFile = await Filesystem.writeFile({
          data: photoOnFileSystem.data,
          path: fileName,
          directory: Directory.Data,
        });
        this.addPhoto(fileName, Capacitor.convertFileSrc(permanentFile.uri));
      } else if (photo.dataUrl) {
        this.addPhoto(uniqueName, photo.dataUrl);
      }
    } catch (err) {
      console.log(err);
      throw new Error('Could not save photo');
    }
  }

  async deletePhoto(name: string) {
    const newPhotos = this.#photos$.value.filter(
      (photos) => photos.name !== name
    );
    this.#photos$.next(newPhotos);
    if (this.platform.is('capacitor')) {
      await Filesystem.deleteFile({
        path: name,
        directory: Directory.Data,
      });
    }
  }
}
