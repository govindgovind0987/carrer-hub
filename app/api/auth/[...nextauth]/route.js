import { handlers } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, context) {
  return handlers.GET(request, context);
}

export async function POST(request, context) {
  return handlers.POST(request, context);
}
