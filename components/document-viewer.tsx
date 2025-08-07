'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type DocumentViewerProps = {
  documentId: string;
  className?: string;
};

type ViewerError = {
  message: string;
  code?: string;
};

type ViewerInstance = NutrientViewer.Instance;

export function DocumentViewer({ documentId, className = '' }: DocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ViewerInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ViewerError | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  // Fetch the viewer URL from our API
  const fetchViewerUrl = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/documents/${documentId}/viewer-url`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get viewer URL');
      }

      const data = await response.json();
      setViewerUrl(data.viewerUrl);
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'FETCH_ERROR',
      });
      setIsLoading(false);
    }
  }, [documentId]);

  // Initialize the Nutrient Viewer
  const initializeViewer = useCallback(async () => {
    if (!viewerUrl || !containerRef.current || !window.NutrientViewer) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Clear any existing viewer instance
      if (instanceRef.current) {
        try {
          await instanceRef.current.unload();
        } catch (error) {
          console.warn('Error cleaning up previous instance:', error);
          // Fallback to destroy if unload fails
          try {
            instanceRef.current.destroy();
          } catch (destroyError) {
            console.warn('Error destroying previous instance:', destroyError);
          }
        }
        instanceRef.current = null;
      }

      // Clear the container
      containerRef.current.innerHTML = '';

      // Initialize the Nutrient Viewer with enhanced configuration
      const instance = await window.NutrientViewer.load({
        container: containerRef.current,
        document: viewerUrl,
        baseUrl: `${window.location.protocol}//${window.location.host}/`,
        
        // Enable useful features
        enableAnnotations: true,
        enableForms: true,
        enableHistory: true,
        
        // Set initial view state
        initialViewState: {
          showToolbar: true,
          layoutMode: 'auto',
          sidebarMode: 'none',
        },
        
        // Event handlers for better user experience
        onDocumentLoaded: () => {
          console.log('Document loaded successfully');
        },
        onDocumentLoadFailed: (error) => {
          console.error('Document load failed:', error);
          setError({
            message: error.message || 'Failed to load document',
            code: 'DOCUMENT_LOAD_ERROR',
          });
          setIsLoading(false);
        },
      });

      instanceRef.current = instance;
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Nutrient Viewer:', error);
      setError({
        message: error instanceof Error ? error.message : 'Failed to load document viewer',
        code: 'VIEWER_ERROR',
      });
      setIsLoading(false);
    }
  }, [viewerUrl]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (instanceRef.current) {
      try {
        // Prefer unload() as it's the proper async method
        instanceRef.current.unload().catch((error) => {
          console.warn('Error unloading Nutrient Viewer:', error);
          // Fallback to synchronous destroy
          try {
            instanceRef.current?.destroy();
          } catch (destroyError) {
            console.warn('Error destroying Nutrient Viewer:', destroyError);
          }
        });
      } catch (error) {
        console.warn('Error cleaning up Nutrient Viewer:', error);
        // Final fallback to destroy
        try {
          instanceRef.current.destroy();
        } catch (destroyError) {
          console.warn('Error destroying Nutrient Viewer:', destroyError);
        }
      }
      instanceRef.current = null;
    }
  }, []);

  // Effect to fetch viewer URL
  useEffect(() => {
    fetchViewerUrl();
  }, [fetchViewerUrl]);

  // Effect to initialize viewer when URL is available
  useEffect(() => {
    if (viewerUrl) {
      // Wait for NutrientViewer to be available
      const checkAndInit = () => {
        if (window.NutrientViewer) {
          initializeViewer();
        } else {
          // Retry after a short delay
          setTimeout(checkAndInit, 100);
        }
      };
      checkAndInit();
    }
  }, [viewerUrl, initializeViewer]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleRetry = useCallback(() => {
    setError(null);
    setViewerUrl(null);
    fetchViewerUrl();
  }, [fetchViewerUrl]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center p-6">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load document</h3>
          <p className="mt-1 text-sm text-gray-500">{error.message}</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading document...</h3>
          <p className="mt-1 text-sm text-gray-500">
            {viewerUrl ? 'Initializing viewer...' : 'Getting document...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full min-h-[600px] rounded-lg"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}