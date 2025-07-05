import { existsSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const path = join(
    process.cwd(),
    'node_modules',
    '@sparticuz',
    'chromium-min',
    'bin',
    'chromium'
  );

  return NextResponse.json({
    expectedPath: path,
    exists: existsSync(path)
  });
} 