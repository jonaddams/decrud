'use client';

import { useState } from 'react';
import { DocumentViewer } from './document-viewer';

type PermissionLevel = 'read-only' | 'edit';

type DocumentViewWrapperProps = {
  documentId: string;
  isOwner: boolean;
  className?: string;
};

export function DocumentViewWrapper({ documentId, isOwner, className }: DocumentViewWrapperProps) {
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('read-only');
  const [viewerKey, setViewerKey] = useState(0);

  const handlePermissionChange = (level: PermissionLevel) => {
    setPermissionLevel(level);
    // Force viewer to reload with new permissions by changing the key
    setViewerKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Permission Level Selector */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Document Permissions</h3>
            <p className="text-xs text-muted mt-1">
              Choose your level of access for this viewing session
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="permission-level"
                value="read-only"
                checked={permissionLevel === 'read-only'}
                onChange={() => handlePermissionChange('read-only')}
                className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <span className="text-sm text-foreground">View Only</span>
            </label>
            <label className="flex items-center space-x-2 ml-4">
              <input
                type="radio"
                name="permission-level"
                value="edit"
                checked={permissionLevel === 'edit'}
                onChange={() => handlePermissionChange('edit')}
                className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <span className="text-sm text-foreground">Edit & Annotate</span>
            </label>
          </div>
        </div>
        {permissionLevel === 'edit' && (
          <div className="mt-2 text-xs text-muted">
            Edit mode enables annotation tools: drawing, highlighting, text, signatures, stamps, and more.
          </div>
        )}
      </div>

      {/* Document Viewer */}
      <DocumentViewer
        key={viewerKey}
        documentId={documentId}
        permissionLevel={permissionLevel}
        className={className}
      />
    </div>
  );
}
