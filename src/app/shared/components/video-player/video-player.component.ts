import { Component, ElementRef, Input, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'rc-video-player',
  standalone: true,
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent {
  @Input({ required: true }) src!: string;
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

  readonly playing = signal(false);
  readonly muted = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  togglePlay(): void {
    const video = this.videoRef.nativeElement;
    if (video.paused) {
      video.play();
      this.playing.set(true);
    } else {
      video.pause();
      this.playing.set(false);
    }
  }

  toggleMute(): void {
    const video = this.videoRef.nativeElement;
    video.muted = !video.muted;
    this.muted.set(video.muted);
  }

  onTimeUpdate(): void {
    this.currentTime.set(this.videoRef.nativeElement.currentTime);
  }

  onLoadedMetadata(): void {
    this.duration.set(this.videoRef.nativeElement.duration);
  }

  onEnded(): void {
    this.playing.set(false);
  }

  seek(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.videoRef.nativeElement.currentTime = value;
    this.currentTime.set(value);
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }
}
