import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { judgeSubmission } from '@/lib/compiler/judge-engine';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, language, customInput, timeLimitMs, memoryLimitMb } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Missing code or language parameters' }, { status: 400 });
    }

    const ALLOWED_LANGUAGES = ['python', 'java', 'cpp'];
    if (!ALLOWED_LANGUAGES.includes(language.toLowerCase())) {
      return NextResponse.json(
        { error: `Unsupported language "${language}". Only Python, Java, and C++ are supported.` },
        { status: 400 }
      );
    }

    const result = await judgeSubmission({
      code,
      language,
      customInput: customInput ?? '',
      timeLimitMs: timeLimitMs || 3000,
      memoryLimitMb: memoryLimitMb || 128,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Execution API Error:', error);
    return NextResponse.json({ error: error.message || 'Execution error' }, { status: 500 });
  }
}
