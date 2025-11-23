import { createClient } from '@/lib/supabase-server';
import { CasesPageClient } from '@/components/cases/CasesPageClient';

export default async function CasesPage() {
  const supabase = await createClient();
  
  // 모든 회고 칼럼 데이터 가져오기
  const { data: cases, error: casesError } = await supabase
    .from('community_cases')
    .select('id, title, subtitle, body, category, is_featured, image_url, created_at')
    .order('created_at', { ascending: false });

  if (casesError) {
    console.error('Failed to fetch community cases:', {
      message: casesError.message,
      details: casesError.details,
      hint: casesError.hint,
      code: casesError.code,
    });
    // 에러가 발생해도 빈 배열로 표시
  }

  const displayCases = cases || [];

  return <CasesPageClient initialCases={displayCases} />;
}
