import { NextRequest } from 'next/server';

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (!origin || !host) {
    return false;
  }
  
  // localhost は開発環境でOK
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return origin.includes('localhost') || origin.includes('127.0.0.1');
  }
  
  // Same-originチェック
  const validOrigins = [
    `https://${host}`,
    `http://${host}`,
  ];
  
  return validOrigins.includes(origin);
}

export function csrfError() {
  return new Response(JSON.stringify({ error: 'Invalid origin' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}