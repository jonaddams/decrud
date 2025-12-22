/**
 * Nutrient DWS (Document Workflow Service) API Client
 * Handles digital signature operations via the Nutrient Processor API
 */

type DWSSessionResponse = {
  token: string;
  expiresAt: string;
};

type SignatureOptions = {
  signatureType: 'visible' | 'invisible';
  position: {
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  flatten?: boolean;
  showWatermark?: boolean;
  showSignDate?: boolean;
  showDateTimezone?: boolean;
  useCustomImage?: boolean;
  appearanceMode?: 'signatureOnly' | 'descriptionOnly' | 'signatureAndDescription';
};

type SignDocumentOptions = {
  documentBuffer: Buffer;
  signerName: string;
  reason: string;
  signatureOptions: SignatureOptions;
};

type DWSErrorResponse = {
  error: string;
  message: string;
};

const DWS_BASE_URL = process.env.NUTRIENT_API_BASE_URL || 'https://api.nutrient.io/';
const DWS_API_KEY = process.env.NUTRIENT_API_KEY;

if (!DWS_API_KEY) {
  throw new Error('NUTRIENT_API_KEY is not configured');
}

/**
 * Get a session token from DWS for signing operations
 */
export const getDWSSessionToken = async (): Promise<string> => {
  const response = await fetch(`${DWS_BASE_URL}dws/auth/session`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DWS_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = (await response.json()) as DWSErrorResponse;
    throw new Error(`Failed to get DWS session token: ${errorData.message || response.statusText}`);
  }

  const data = (await response.json()) as DWSSessionResponse;
  return data.token;
};

/**
 * Sign a PDF document using Nutrient Digital Signatures API
 * Supports both visible and invisible (cryptographic only) signatures
 */
export const signDocument = async (options: SignDocumentOptions): Promise<Buffer> => {
  const { documentBuffer, signatureOptions } = options;

  // Create form data for the signing request
  const formData = new FormData();
  formData.append(
    'file',
    new Blob([new Uint8Array(documentBuffer)], { type: 'application/pdf' }),
    'document.pdf'
  );

  // Build signature configuration based on visibility
  const signatureData: Record<string, unknown> = {
    signatureType: 'cades',
    cadesLevel: 'b-lt',
  };

  // For visible signatures, add appearance configuration
  if (signatureOptions.signatureType === 'visible') {
    // Rect format per Nutrient API: [left, top, width, height]
    // Units are PDF points (1 point = 1/72 inch)
    // left: distance from left edge of page
    // top: distance from top edge of page
    // width: width of signature bounding box
    // height: height of signature bounding box
    signatureData.position = {
      pageIndex: signatureOptions.position.pageIndex,
      rect: [
        signatureOptions.position.x, // left
        signatureOptions.position.y, // top
        signatureOptions.position.width, // width
        signatureOptions.position.height, // height
      ],
    };

    // Build appearance configuration
    const appearance: Record<string, unknown> = {
      mode: signatureOptions.appearanceMode || 'signatureOnly',
      showWatermark: signatureOptions.showWatermark ?? true,
      showSignDate: signatureOptions.showSignDate ?? true,
      showDateTimezone: signatureOptions.showDateTimezone ?? false,
    };

    // If useCustomImage is true, fetch and include the custom signature image
    if (signatureOptions.useCustomImage) {
      appearance.contentType = 'image/png';

      try {
        // Fetch the custom signature image from the public folder
        const imageResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/john-hancock-signature.png`
        );

        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          formData.append('graphicImage', imageBlob, 'john-hancock-signature.png');
          console.log('Custom signature image attached as graphicImage:', {
            size: imageBlob.size,
            type: imageBlob.type,
          });
        } else {
          console.error('Failed to fetch custom signature image:', {
            status: imageResponse.status,
            statusText: imageResponse.statusText,
          });
        }
      } catch (error) {
        console.error('Error fetching custom signature image:', error);
      }
    }
    // Note: When showWatermark is true and no custom image is provided,
    // Nutrient automatically uses its default logo

    signatureData.appearance = appearance;

    console.log('=== SIGNATURE DEBUG INFO ===');
    console.log('Signature options received:', JSON.stringify(signatureOptions, null, 2));
    console.log('Appearance configuration:', JSON.stringify(signatureData.appearance, null, 2));
    console.log('Complete signature data:', JSON.stringify(signatureData, null, 2));
    console.log('===========================');

    signatureData.flatten = signatureOptions.flatten ?? false;
  } else {
    // For invisible signatures, only add pageIndex
    signatureData.position = {
      pageIndex: signatureOptions.position.pageIndex,
    };
  }

  formData.append('data', JSON.stringify(signatureData));

  // Use Nutrient Digital Signatures API endpoint
  const response = await fetch(`${DWS_BASE_URL}sign`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DWS_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Nutrient Digital Signatures API error:', errorText);
    throw new Error(`Failed to sign document: ${response.status} ${response.statusText}`);
  }

  const signedBuffer = await response.arrayBuffer();
  return Buffer.from(signedBuffer);
};
