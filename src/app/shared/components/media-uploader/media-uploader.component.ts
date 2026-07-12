import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { MAX_IMAGE_SIZE_MB, fileToBase64, isImageFile } from '../../../core/services/file.util';

@Component({
  selector: 'rc-media-uploader',
  standalone: true,
  templateUrl: './media-uploader.component.html',
  styleUrl: './media-uploader.component.scss',
})
export class MediaUploaderComponent {
  @Input() label = 'Foto do prato final';
  @Input() previewUrl: string | null | undefined = null;
  @Output() previewUrlChange = new EventEmitter<string | null>();

  readonly dragOver = signal(false);

  constructor(private toast: ToastService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
    input.value = '';
  }

  removeImage(): void {
    this.previewUrl = null;
    this.previewUrlChange.emit(null);
  }

  private async handleFile(file: File): Promise<void> {
    if (!isImageFile(file)) {
      this.toast.error('Selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      this.toast.error(`A imagem deve ter no máximo ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    const base64 = await fileToBase64(file);
    this.previewUrl = base64;
    this.previewUrlChange.emit(base64);
  }
}
