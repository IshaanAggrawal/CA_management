import DocumentsClient from "./DocumentsClient";
import { supabase } from "@/lib/supabase";

export default async function DocumentsPage() {
  // Try to list files from a "documents" bucket
  const { data: files, error } = await supabase.storage.from("documents").list();
  
  const documents = files || [];

  return <DocumentsClient documents={documents} />;
}
