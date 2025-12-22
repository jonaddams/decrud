'use client';

import { useCallback, useState } from 'react';

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

type SignatureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSign: (options: SignatureOptions, replaceOriginal: boolean) => Promise<void>;
  documentId: string;
};

export function SignatureModal({ isOpen, onClose, onSign }: SignatureModalProps) {
  const [signerName] = useState('Nutrient.io');
  const [reason] = useState('demonstration');
  const [signatureType, setSignatureType] = useState<'visible' | 'invisible'>('invisible');
  const [pageIndex, setPageIndex] = useState(0);
  const [xPosition, setXPosition] = useState(50);
  const [yPosition, setYPosition] = useState(50);
  const [signatureWidth, setSignatureWidth] = useState(400);
  const [signatureHeight, setSignatureHeight] = useState(150);
  const [flatten, setFlatten] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showSignDate, setShowSignDate] = useState(true);
  const [showDateTimezone, setShowDateTimezone] = useState(false);
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [appearanceMode, setAppearanceMode] = useState<
    'signatureOnly' | 'descriptionOnly' | 'signatureAndDescription'
  >('signatureOnly');
  const [replaceOriginal, setReplaceOriginal] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = useCallback(async () => {
    try {
      setIsSigning(true);
      setError(null);

      const position: SignaturePosition = {
        pageIndex,
        x: xPosition,
        y: yPosition,
        width: signatureWidth,
        height: signatureHeight,
      };

      const options: SignatureOptions = {
        signatureType,
        position,
        ...(signatureType === 'visible' && {
          flatten,
          showWatermark,
          showSignDate,
          showDateTimezone,
          useCustomImage,
          appearanceMode,
        }),
      };

      await onSign(options, replaceOriginal);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign document');
    } finally {
      setIsSigning(false);
    }
  }, [
    pageIndex,
    xPosition,
    yPosition,
    signatureWidth,
    signatureHeight,
    signatureType,
    flatten,
    showWatermark,
    showSignDate,
    showDateTimezone,
    useCustomImage,
    appearanceMode,
    replaceOriginal,
    onSign,
    onClose,
  ]);

  const handleCancel = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <button
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity cursor-default"
          onClick={handleCancel}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleCancel();
            }
          }}
          aria-label="Close modal"
        />

        {/* Modal */}
        <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full p-6 border border-border">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Sign Document</h2>
            <p className="text-sm text-muted mt-1">Configure and place your digital signature</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Signer Name */}
            <div>
              <label htmlFor="signer-name" className="block text-sm font-medium text-muted mb-1">
                Signer Name
              </label>
              <input
                id="signer-name"
                type="text"
                value={signerName}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md bg-surface text-foreground cursor-not-allowed opacity-75"
              />
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="signing-reason" className="block text-sm font-medium text-muted mb-1">
                Reason for Signing
              </label>
              <input
                id="signing-reason"
                type="text"
                value={reason}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md bg-surface text-foreground cursor-not-allowed opacity-75"
              />
            </div>

            {/* Signature Type */}
            <div>
              <div className="block text-sm font-medium text-muted mb-2">Signature Type</div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="signature-type"
                    value="invisible"
                    checked={signatureType === 'invisible'}
                    onChange={(e) => setSignatureType(e.target.value as 'invisible')}
                    className="h-4 w-4 border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-foreground">Invisible (Cryptographic only)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="signature-type"
                    value="visible"
                    checked={signatureType === 'visible'}
                    onChange={(e) => setSignatureType(e.target.value as 'visible')}
                    className="h-4 w-4 border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-foreground">Visible</span>
                </label>
              </div>
            </div>

            {/* Signature Position */}
            <div>
              <label htmlFor="page-index" className="block text-sm font-medium text-muted mb-1">
                Page Number (0-indexed)
              </label>
              <input
                id="page-index"
                type="number"
                min="0"
                value={pageIndex}
                onChange={(e) => setPageIndex(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* X and Y Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="x-position" className="block text-sm font-medium text-muted mb-1">
                  X Position
                </label>
                <input
                  id="x-position"
                  type="number"
                  min="0"
                  value={xPosition}
                  onChange={(e) => setXPosition(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="y-position" className="block text-sm font-medium text-muted mb-1">
                  Y Position
                </label>
                <input
                  id="y-position"
                  type="number"
                  min="0"
                  value={yPosition}
                  onChange={(e) => setYPosition(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Width and Height */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="signature-width"
                  className="block text-sm font-medium text-muted mb-1"
                >
                  Width
                </label>
                <input
                  id="signature-width"
                  type="number"
                  min="1"
                  value={signatureWidth}
                  onChange={(e) => setSignatureWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="signature-height"
                  className="block text-sm font-medium text-muted mb-1"
                >
                  Height
                </label>
                <input
                  id="signature-height"
                  type="number"
                  min="1"
                  value={signatureHeight}
                  onChange={(e) => setSignatureHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Visible Signature Options */}
            {signatureType === 'visible' && (
              <>
                {/* Appearance Mode */}
                <div>
                  <label
                    htmlFor="appearance-mode"
                    className="block text-sm font-medium text-muted mb-1"
                  >
                    Appearance Mode
                  </label>
                  <select
                    id="appearance-mode"
                    value={appearanceMode}
                    onChange={(e) =>
                      setAppearanceMode(
                        e.target.value as
                          | 'signatureOnly'
                          | 'descriptionOnly'
                          | 'signatureAndDescription'
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="signatureOnly">Signature Only</option>
                    <option value="descriptionOnly">Description Only</option>
                    <option value="signatureAndDescription">Signature and Description</option>
                  </select>
                </div>

                {/* Visible Signature Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flatten}
                      onChange={(e) => setFlatten(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">
                      Flatten signature (makes it non-editable)
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">Show watermark</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSignDate}
                      onChange={(e) => setShowSignDate(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">Show signature date</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDateTimezone}
                      onChange={(e) => setShowDateTimezone(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">Show date timezone</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomImage}
                      onChange={(e) => setUseCustomImage(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">Use signature image</span>
                  </label>
                </div>
              </>
            )}

            {/* Document Handling Option */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceOriginal}
                  onChange={(e) => setReplaceOriginal(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm text-foreground">
                  Replace original document (instead of creating a copy)
                </span>
              </label>
              <p className="text-xs text-muted mt-1 ml-6">
                {replaceOriginal
                  ? 'The unsigned document will be replaced with the signed version'
                  : 'A new signed document will be created and the original will remain unchanged'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSigning}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-md hover:bg-surface transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSign}
              disabled={isSigning}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-md shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigning ? 'Signing...' : 'Sign Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
