import jwt from 'jsonwebtoken';
import fs from 'fs';

export interface DocumentEngineUploadResponse {
  documentId: string;
}

export interface DocumentEngineError {
  message: string;
  status?: number;
}

export interface ViewerJWTPayload {
  document_id: string;
  permissions: string[];
  exp: number;
  user_id?: string;
}

class DocumentEngineService {
  private baseUrl: string;
  private apiKey: string;
  private privateKeyPath: string;

  constructor() {
    this.baseUrl = process.env.DOCUMENT_ENGINE_BASE_URL!;
    this.apiKey = process.env.DOCUMENT_ENGINE_API_KEY!;
    this.privateKeyPath = process.env.DOCUMENT_ENGINE_PRIVATE_KEY_PATH!;

    if (!this.baseUrl || !this.apiKey || !this.privateKeyPath) {
      throw new Error('Missing Document Engine configuration');
    }
  }

  /**
   * Upload a file to Document Engine
   */
  async uploadDocument(file: File): Promise<DocumentEngineUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Document Engine upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.documentId) {
        throw new Error('Document Engine did not return a document ID');
      }

      return { documentId: result.documentId };
    } catch (error) {
      console.error('Document Engine upload error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a document from Document Engine
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Document Engine delete failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Document Engine delete error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate a JWT token for Document Engine viewer access
   */
  async generateViewerJWT(
    documentId: string, 
    permissions: string[] = ['read-document'],
    userId?: string,
    expiresInHours: number = 1
  ): Promise<string> {
    try {
      const privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
      
      const payload: ViewerJWTPayload = {
        document_id: documentId,
        permissions,
        exp: Math.floor(Date.now() / 1000) + (expiresInHours * 60 * 60),
      };

      if (userId) {
        payload.user_id = userId;
      }

      return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    } catch (error) {
      console.error('JWT generation error:', error);
      throw new Error('Failed to generate viewer JWT');
    }
  }

  /**
   * Get Document Engine viewer URL with JWT
   */
  getViewerUrl(documentId: string, jwtToken: string): string {
    const params = new URLSearchParams({
      document_id: documentId,
      jwt: jwtToken,
    });

    return `${this.baseUrl}/viewer?${params.toString()}`;
  }

  /**
   * Get thumbnail/cover image URL
   */
  getThumbnailUrl(documentId: string, jwtToken: string, width: number = 400): string {
    const params = new URLSearchParams({
      jwt: jwtToken,
      width: width.toString(),
    });

    return `${this.baseUrl}/documents/${documentId}/cover?${params.toString()}`;
  }

  /**
   * Get download URL for a document
   */
  getDownloadUrl(documentId: string, jwtToken: string): string {
    const params = new URLSearchParams({
      jwt: jwtToken,
    });

    return `${this.baseUrl}/documents/${documentId}/pdf?${params.toString()}`;
  }

  /**
   * Check if Document Engine is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Document Engine health check failed:', error);
      return false;
    }
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): DocumentEngineError {
    if (error instanceof Error) {
      return {
        message: error.message,
        status: error.message.includes('fetch') ? 503 : 500,
      };
    }
    
    return {
      message: 'An unknown error occurred with Document Engine',
      status: 500,
    };
  }

  /**
   * Retry wrapper for operations
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxRetries) {
          console.log(`Document Engine operation failed, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError!;
  }
}

export const documentEngineService = new DocumentEngineService();