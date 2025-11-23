import { createClient } from '@/lib/supabase-server';
import { ContentsPageClient } from '@/components/contents/ContentsPageClient';

export default async function ContentsPage() {
  const supabase = await createClient();
  
  // is_published=true인 콘텐츠만 가져오기
  const { data: contents, error } = await supabase
    .from('contents')
    .select('id, slug, type, title, subtitle, description, price, thumbnail_image_url, detail_image_url, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch contents:', error);
  }

  const displayContents = contents || [];

  return <ContentsPageClient initialContents={displayContents} />;
}
