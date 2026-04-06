import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailConnection } from '@/lib/services/email.service';

export async function GET(req: NextRequest) {
  try {
    const isConnected = await verifyEmailConnection();

    return NextResponse.json({
      success: true,
      emailConfigured: isConnected,
      environment: process.env.NODE_ENV,
      gmailUser: process.env.GMAIL_USER ? '✅ Configured' : '❌ Missing',
      gmailPassword: process.env.GMAIL_APP_PASSWORD ? '✅ Configured' : '❌ Missing',
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