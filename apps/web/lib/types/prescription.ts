import type { IFile } from "@/lib/types";

export type PrescriptionTypeApi = "fillup" | "photo";

export interface IPrescription {
  id: string;
  user_id: string;
  type: PrescriptionTypeApi;
  comments: string | null;
  right_sph: string | null;
  right_cyl: string | null;
  right_axis: string | null;
  right_add: string | null;
  left_sph: string | null;
  left_cyl: string | null;
  left_axis: string | null;
  left_add: string | null;
  image: Pick<IFile, "id" | "url"> | null;
  created_at: string;
  updated_at: string;
}
