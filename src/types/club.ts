// src/types/club.ts
export interface Club {
  unique_id: string;
  creator_id: string;
  name: string;
  created_at: string;
}

export interface Member {
  id: number;
  username: string;
}
