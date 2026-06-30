import { GalleryManager } from "@/components/admin/gallery-manager";
import { getGalleryImages } from "@/lib/actions/gallery";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl font-semibold text-ink">גלריית עבודות</h1>
      <p className="mb-8 text-sm text-muted-foreground">הוספה ומחיקה של תמונות — מוצג מיידית בעמוד הבית</p>
      <GalleryManager initialImages={images} />
    </div>
  );
}
