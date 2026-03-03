import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Service account credentials from environment
const getAuthClient = () => {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    return auth;
  } catch (error) {
    console.error('Failed to initialize Google Sheets auth:', error);
    throw new Error('Google Sheets authentication failed');
  }
};

interface ProjectSubmissionData {
  projectName: string;
  countryName: string;
  categoryName: string;
  tags: string[];
  bitcoinOnchain: boolean;
  lightning: boolean;
  giftCards: boolean;
  description: string;
  longDescription?: string;
  initiatives?: string;
  impact?: string;
  challenges?: string;
  websiteUrl?: string;
  email: string;
  phone?: string;
  foundedYear?: string;
  founderName?: string;
  founderTwitter?: string;
  founderEmail?: string;
  twitterHandle?: string;
  linkedinUsername?: string;
  facebookUsername?: string;
  youtubeChannel?: string;
  telegramGroup?: string;
  nostrAddress?: string;
  instagramUsername?: string;
  submittedAt: string;
  submittedBy: string;
}

export async function appendToSheet(data: ProjectSubmissionData): Promise<void> {
  try {
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!SHEET_ID) {
      console.warn('⚠️ GOOGLE_SHEET_ID not configured - skipping sheet sync');
      return;
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    // Prepare row data (order must match your sheet headers)
    const row = [
      data.submittedAt,
      data.projectName,
      data.countryName,
      data.categoryName,
      data.tags.join(', '),
      data.bitcoinOnchain ? 'Yes' : 'No',
      data.lightning ? 'Yes' : 'No',
      data.giftCards ? 'Yes' : 'No',
      data.description,
      data.longDescription || '',
      data.initiatives || '',
      data.impact || '',
      data.challenges || '',
      data.websiteUrl || '',
      data.email,
      data.phone || '',
      data.foundedYear || '',
      data.founderName || '',
      data.founderTwitter || '',
      data.founderEmail || '',
      data.twitterHandle || '',
      data.linkedinUsername || '',
      data.facebookUsername || '',
      data.youtubeChannel || '',
      data.telegramGroup || '',
      data.nostrAddress || '',
      data.instagramUsername || '',
      data.submittedBy,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:AB', // Adjust if your sheet has a different name
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log('✅ Successfully added project to Google Sheet');
  } catch (error) {
    console.error('❌ Failed to append to Google Sheet:', error);
    // Don't throw - we don't want to fail the entire submission if sheets sync fails
  }
}