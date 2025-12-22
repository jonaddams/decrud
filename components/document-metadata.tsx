'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SignatureModal } from './signature-modal';

type SignaturePosition = {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type SignatureOptions = {
  signatureType: 'visible' | 'invisible';
  position: SignaturePosition;
  flatten?: boolean;
  showWatermark?: boolean;
  showSignDate?: boolean;
  showDateTimezone?: boolean;
  useCustomImage?: boolean;
  appearanceMode?: 'signatureOnly' | 'descriptionOnly' | 'signatureAndDescription';
};

type DocumentMetadataProps = {
  document: {
    id: string;
    title: string;
    fileSize: bigint | null;
    fileType: string;
    createdAt: Date;
    owner: {
      name: string | null;
      email: string;
    };
  };
  isOwner: boolean;
};

export function DocumentMetadata({ document, isOwner }: DocumentMetadataProps) {
  const router = useRouter();
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSigningSuccess, setIsSigningSuccess] = useState(false);

  const formatFileSize = (bytes: bigint | null) => {
    if (!bytes || bytes === BigInt(0)) return '0 Bytes';
    const bytesNumber = Number(bytes);
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytesNumber) / Math.log(k));
    return `${Math.round((bytesNumber / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleSignClick = useCallback(() => {
    setIsSignModalOpen(true);
  }, []);

  const handleSign = useCallback(
    async (options: SignatureOptions, replaceOriginal: boolean) => {
      const response = await fetch(`/api/documents/${document.id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signerName: 'Nutrient.io',
          reason: 'demonstration',
          signatureOptions: options,
          replaceOriginal,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error: string; message?: string };
        throw new Error(errorData.message || errorData.error || 'Failed to sign document');
      }

      const data = (await response.json()) as { documentId: string; message: string };

      // Show success message
      setIsSigningSuccess(true);

      // If replacing original, force a hard refresh to reload the viewer
      if (replaceOriginal) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Redirect to the signed document after a short delay
        setTimeout(() => {
          router.push(`/documents/${data.documentId}`);
        }, 1500);
      }
    },
    [document.id, router]
  );

  return (
    <>
      <div className="bg-background shadow rounded-lg border border-border p-3 mb-3">
        {isSigningSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium">
              ✓ Document signed successfully! Redirecting...
            </p>
          </div>
        )}

        <table className="w-full text-xs">
          <tbody className="divide-y divide-border">
            <tr>
              <td className="py-1.5 font-medium text-muted w-20">Title</td>
              <td className="py-1.5 text-foreground font-medium" colSpan={2}>
                {document.title}
              </td>
              <td className="py-1.5 text-right">
                {isOwner && (
                  <button
                    type="button"
                    onClick={handleSignClick}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary hover:text-primary-hover border border-primary hover:border-primary-hover rounded transition-colors cursor-pointer"
                    title="Digitally sign document via DWS"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <title>Lock</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Sign via DWS
                  </button>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-1.5 font-medium text-muted w-20">Size</td>
              <td className="py-1.5 text-foreground w-20">{formatFileSize(document.fileSize)}</td>
              <td className="py-1.5 font-medium text-muted w-24">Uploaded by</td>
              <td className="py-1.5 text-foreground">
                {document.owner.name || document.owner.email}
              </td>
            </tr>
            <tr>
              <td className="py-1.5 font-medium text-muted">Created</td>
              <td className="py-1.5 text-foreground" colSpan={3}>
                {formatDate(document.createdAt)}
              </td>
            </tr>
            <tr>
              <td className="py-1.5 font-medium text-muted">Type</td>
              <td className="py-1.5 text-foreground break-all" colSpan={3}>
                {document.fileType}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSign={handleSign}
        documentId={document.id}
      />
    </>
  );
}
