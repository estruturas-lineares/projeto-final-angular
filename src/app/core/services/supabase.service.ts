import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'webm'];
const MAX_SIZE_BYTES = 100 * 1024 * 1024; 

interface UploadUrlResponse {
  bucket: string;
  path: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private http = inject(HttpClient);
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabasePublishableKey
  );

  async uploadRecipeVideo(file: File): Promise<string> {
    this.validateFile(file);

    const { bucket, path, token } = await firstValueFrom(
      this.http.post<UploadUrlResponse>(`${environment.apiUrl}/recipes/video-upload-url/`, {
        filename: file.name,
        sizeBytes: file.size,
      })
    );

    const { error } = await this.supabase.storage.from(bucket).uploadToSignedUrl(path, token, file, {
      contentType: file.type,
    });

    if (error) {
      throw new Error(`Falha ao enviar o vídeo: ${error.message}`);
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  }

  private validateFile(file: File): void {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`Formato .${ext} não suportado. Use: ${ALLOWED_EXTENSIONS.join(', ')}.`);
    }
    if (file.size > MAX_SIZE_BYTES) {
      const maxMb = MAX_SIZE_BYTES / (1024 * 1024);
      throw new Error(`O vídeo excede o limite de ${maxMb}MB.`);
    }
  }
}