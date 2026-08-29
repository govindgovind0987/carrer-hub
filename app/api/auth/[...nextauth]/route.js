import { handlers } from '@/lib/auth';

export async function GET(request, context) {
  return handlers.GET(request, context);
}

export async function POST(request, context) {
  return handlers.POST(request, context);
}
