import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Service account credentials from environment
const getAuthClient = async () => {
  try {
    const credentialsStr = process.env.GOOGLE_SHEETS_CREDENTIALS;

    if (!credentialsStr) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS not found in environment');
    }

    const credentials = JSON.parse(credentialsStr);

    // Validate required fields
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Invalid credentials: missing client_email or private_key');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    return auth.getClient();
  } catch (error) {
    console.error('Failed to initialize Google Sheets auth:', error);
    throw error;
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
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;

  if (!SHEET_ID) {
    console.warn('⚠️ GOOGLE_SHEET_ID not configured - skipping sheet sync');
    return;
  }

  console.log('🔄 Starting Google Sheets sync...');
  console.log('📊 Sheet ID:', SHEET_ID);

  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    // Build Bitcoin acceptance string
    const bitcoinAcceptance: string[] = [];
    if (data.bitcoinOnchain) bitcoinAcceptance.push('Bitcoin Onchain');
    if (data.lightning) bitcoinAcceptance.push('Lightning Network');
    if (data.giftCards) bitcoinAcceptance.push('Gift Cards');
    const bitcoinAcceptanceStr = bitcoinAcceptance.length > 0 ? bitcoinAcceptance.join(', ') : 'None';

    // Build project socials string (with newlines)
    const projectSocials: string[] = [];
    if (data.twitterHandle) projectSocials.push(`Twitter: ${data.twitterHandle}`);
    if (data.linkedinUsername) projectSocials.push(`LinkedIn: ${data.linkedinUsername}`);
    if (data.facebookUsername) projectSocials.push(`Facebook: ${data.facebookUsername}`);
    if (data.youtubeChannel) projectSocials.push(`YouTube: ${data.youtubeChannel}`);
    if (data.telegramGroup) projectSocials.push(`Telegram: ${data.telegramGroup}`);
    if (data.nostrAddress) projectSocials.push(`Nostr: ${data.nostrAddress}`);
    if (data.instagramUsername) projectSocials.push(`Instagram: ${data.instagramUsername}`);
    const projectSocialsStr = projectSocials.length > 0 ? projectSocials.join('\n') : '';

    // Prepare row data in NEW order
    const row = [
      data.submittedAt,              // DATE
      data.projectName,              // PROJECT NAME
      data.countryName,              // COUNTRY
      data.categoryName,             // CATEGORY
      data.tags.join(', '),          // TAGS
      bitcoinAcceptanceStr,          // BITCOIN ACCEPTANCE (combined)
      data.description,              // SHORT DESCRIPTION
      data.longDescription || '',    // LONG DESCRIPTION
      data.initiatives || '',        // CORE INITIATIVES
      data.impact || '',             // IMPACT & ACHIEVEMENTS
      data.challenges || '',         // CHALLENGES
      data.websiteUrl || '',         // WEBSITE
      data.email,                    // EMAIL
      data.phone || '',              // PHONE
      projectSocialsStr,             // PROJECT SOCIALS (combined with \n)
      data.founderName || '',        // FOUNDER NAME
      data.founderTwitter || '',     // FOUNDER TWITTER
      data.founderEmail || '',       // FOUNDER EMAIL
      data.foundedYear || '',        // YEAR FOUNDED
    ];

    console.log('📝 Appending row with', row.length, 'columns');

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Live Directory Entries!A:AB', // Updated to column S (19 columns)
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    console.log('✅ Successfully added project to Google Sheet');
    console.log('📍 Updated range:', response.data.updates?.updatedRange);
  } catch (error: any) {
    console.error('❌ Failed to append to Google Sheet:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errors: error.errors,
    });
    // Don't throw - we don't want to fail the entire submission if sheets sync fails
  }
}