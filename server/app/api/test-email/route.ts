import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailConnection } from '@/lib/services/email.service';

export async function GET(req: NextRequest) {
  try {
    const isConnected = await verifyEmailConnection();

    return NextResponse.json({
      success: true,
      emailConfigured: isConnected,
      environment: process.env.NODE_ENV,
      serviceAccountEmail: process.env.GMAIL_SERVICE_ACCOUNT_EMAIL ? '✅ Configured' : '❌ Missing',
      privateKey: process.env.GMAIL_PRIVATE_KEY ? '✅ Configured' : '❌ Missing',
      delegatedUser: process.env.GMAIL_DELEGATED_USER ? '✅ Configured' : '❌ Missing',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
