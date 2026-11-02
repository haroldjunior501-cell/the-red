import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export async function uploadFile(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.min(30, Math.ceil(video.duration || 15)));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(15);
    };
    video.src = url;
  });
}

export function getVideoDurationLong(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.ceil(video.duration || 60));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(60);
    };
    video.src = url;
  });
}
