export interface Tasbih {
  id: number;
  arabic_name: string;
  en_name: string;
  fr_name: string;
  communityId: number;
  image: string;
  wirds: Wird[];
}

export interface Wird {
  id: number;
  ar_name: string;
  en_name: string;
  fr_name: string;
  ar_content: string;
  fr_content: string;
  en_content: string;
  ml_content: string;
  total: number;
  transcription: string;
  audio_url?: string;
  tasbih_id?: number;
  numOrder: number;
}
