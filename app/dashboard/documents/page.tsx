import DocumentsClient from "./DocumentsClient";
import { supabase } from "@/lib/supabase";

type StorageFile = {
  id: string | null;
  name: string;
  created_at: string;
  metadata?: { size?: number } | null;
};

export default async function DocumentsPage() {
  // Try to list files from a "documents" bucket
  const { data: files, error } = await supabase.storage.from("documents").list();

  const documents = (files as StorageFile[] | null | undefined || [])
    .filter((file) => Boolean(file.id))
    .map((file) => ({
      id: file.id as string,
      name: file.name,
      created_at: file.created_at,
      metadata: file.metadata,
    }));

  return <DocumentsClient documents={documents} />;
}
