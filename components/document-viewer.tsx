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
  console.log('🎬 DocumentViewer: Component mounting with documentId:', documentId);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ViewerInstance | null>(null);
  const [error, setError] = useState<ViewerError | null>(null);
  const [viewerData, setViewerData] = useState<{
    documentEngineId: string;
    jwt: string;
  } | null>(null);

  // Fetch the viewer data from our API
  const fetchViewerData = useCallback(async () => {
    console.log('🔄 fetchViewerData: Starting for documentId:', documentId);
    try {
      setError(null);

      console.log('📡 fetchViewerData: Fetching viewer-url...');
      const response = await fetch(`/api/documents/${documentId}/viewer-url`);
      console.log('📡 fetchViewerData: viewer-url response:', response.status, response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ fetchViewerData: viewer-url error:', errorData);
        throw new Error(errorData.error || 'Failed to get viewer data');
      }

      const data = await response.json();
      console.log('📡 fetchViewerData: viewer-url data received:', { hasJWT: !!data.jwt, jwtLength: data.jwt?.length });
      
      // We need the document Engine ID and JWT for Instant mode
      console.log('📡 fetchViewerData: Fetching document details...');
      const documentResponse = await fetch(`/api/documents/${documentId}`);
      console.log('📡 fetchViewerData: document response:', documentResponse.status, documentResponse.ok);
      
      if (!documentResponse.ok) {
        console.error('❌ fetchViewerData: document error:', documentResponse.status);
        throw new Error('Failed to get document details');
      }
      
      const documentData = await documentResponse.json();
      console.log('📡 fetchViewerData: document data received:', { 
        hasDocument: !!documentData.document, 
        documentEngineId: documentData.document?.documentEngineId 
      });
      
      const viewerDataToSet = {
        documentEngineId: documentData.document.documentEngineId,
        jwt: data.jwt,
      };
      
      console.log('✅ fetchViewerData: Setting viewer data:', viewerDataToSet);
      setViewerData(viewerDataToSet);
    } catch (error) {
      console.error('❌ fetchViewerData: Error:', error);
      setError({
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'FETCH_ERROR',
      });
    }
  }, [documentId]);

  // Initialize the Nutrient Viewer using Instant Mode
  const initializeViewer = useCallback(async () => {
    console.log('🎯 initializeViewer: Starting...', { 
      hasViewerData: !!viewerData, 
      hasContainer: !!containerRef.current, 
      hasNutrientViewer: !!window.NutrientViewer 
    });
    
    if (!viewerData) {
      console.log('⏸️ initializeViewer: No viewer data, skipping');
      return;
    }
    
    if (!containerRef.current) {
      console.log('⏸️ initializeViewer: No container ref, skipping');
      return;
    }
    
    if (!window.NutrientViewer) {
      console.log('⏸️ initializeViewer: No NutrientViewer global, skipping');
      return;
    }

    try {
      console.log('🎯 initializeViewer: All checks passed, initializing...');
      setError(null);

      // Clear any existing viewer instance using NutrientViewer.unload()
      if (instanceRef.current) {
        console.log('🧹 initializeViewer: Cleaning up previous instance...');
        try {
          await instanceRef.current.unload();
          console.log('🧹 initializeViewer: Previous instance unloaded');
        } catch (error) {
          console.warn('⚠️ initializeViewer: Error cleaning up previous instance:', error);
        }
        instanceRef.current = null;
      }

      // Also try to unload any instance that might be attached to the container directly
      try {
        console.log('🧹 initializeViewer: Attempting NutrientViewer.unload on container...');
        await window.NutrientViewer.unload(containerRef.current);
        console.log('🧹 initializeViewer: Container unloaded successfully');
      } catch (error) {
        console.log('🧹 initializeViewer: No existing instance on container (this is fine):', error.message);
      }

      // Clear the container
      containerRef.current.innerHTML = '';
      console.log('🧹 initializeViewer: Container cleared');

      const serverUrl = (process.env.NEXT_PUBLIC_DOCUMENT_ENGINE_BASE_URL || 'http://localhost:8585').replace(/\/$/, '') + '/';
      
      const config = {
        serverUrl,
        container: containerRef.current,
        documentId: viewerData.documentEngineId,
        authPayload: { jwt: viewerData.jwt },
        instant: true,
      };
      
      console.log('🚀 initializeViewer: Calling NutrientViewer.load with config:', config);

      // Initialize using Instant Mode (like the working Express sample)
      const instance = await window.NutrientViewer.load(config).then((instance) => {
        console.log('✅ initializeViewer: NutrientViewer.load() resolved successfully', instance);
        return instance;
      }).catch((error) => {
        console.error('❌ initializeViewer: NutrientViewer.load() rejected:', error);
        throw error;
      });

      instanceRef.current = instance;
      console.log('✅ initializeViewer: Instance stored in ref');
    } catch (error) {
      console.error('❌ initializeViewer: Failed to initialize NutrientViewer:', error);
      setError({
        message: error instanceof Error ? error.message : 'Failed to load document viewer',
        code: 'VIEWER_ERROR',
      });
    }
  }, [viewerData]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (instanceRef.current) {
      try {
        // Prefer unload() as it's the proper async method
        instanceRef.current.unload().catch((error) => {
          console.warn('Error unloading Nutrient Viewer:', error);
        });
      } catch (error) {
        console.warn('Error cleaning up Nutrient Viewer:', error);
      }
      instanceRef.current = null;
    }

    // Also try to unload from container directly
    if (containerRef.current && window.NutrientViewer) {
      try {
        window.NutrientViewer.unload(containerRef.current).catch((error) => {
          console.log('Container cleanup: no instance found (this is fine)');
        });
      } catch (error) {
        console.log('Container cleanup: no instance found (this is fine)');
      }
    }
  }, []);

  // Effect to fetch viewer data
  useEffect(() => {
    console.log('🔄 useEffect: Fetching viewer data on mount');
    fetchViewerData();
  }, [fetchViewerData]);

  // Effect to initialize viewer when data is available
  useEffect(() => {
    console.log('🔄 useEffect: viewerData changed:', { hasData: !!viewerData });
    if (viewerData) {
      console.log('🔄 useEffect: viewerData available, checking for NutrientViewer and container...');
      // Wait for both NutrientViewer and container to be available
      let retryCount = 0;
      const maxRetries = 100; // 5 seconds max
      
      const checkAndInit = () => {
        console.log(`🔄 checkAndInit: Checking availability (attempt ${retryCount + 1}/${maxRetries})...`, { 
          hasNutrientViewer: !!window.NutrientViewer, 
          hasContainer: !!containerRef.current,
          containerRefType: typeof containerRef.current,
          containerRefValue: containerRef.current
        });
        
        if (window.NutrientViewer && containerRef.current) {
          // Also check that the container has computed dimensions
          const containerRect = containerRef.current.getBoundingClientRect();
          console.log('📐 checkAndInit: Container dimensions:', { 
            width: containerRect.width, 
            height: containerRect.height,
            offsetWidth: containerRef.current.offsetWidth,
            offsetHeight: containerRef.current.offsetHeight
          });
          
          if (containerRect.width > 0 && containerRect.height > 0) {
            console.log('✅ checkAndInit: All conditions met (NutrientViewer, container, dimensions), initializing...');
            initializeViewer();
          } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`⏳ checkAndInit: Container has no dimensions, retrying in 50ms (${retryCount}/${maxRetries})...`);
            setTimeout(checkAndInit, 50);
          } else {
            console.error('❌ checkAndInit: Container never gained dimensions after', maxRetries * 50, 'ms');
            setError({
              message: 'Failed to initialize document viewer: container has no dimensions',
              code: 'CONTAINER_SIZE_ERROR',
            });
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⏳ checkAndInit: Missing dependencies, retrying in 50ms (${retryCount}/${maxRetries})...`);
          setTimeout(checkAndInit, 50);
        } else {
          console.error('❌ checkAndInit: Timeout waiting for container after', maxRetries * 50, 'ms');
          setError({
            message: 'Failed to initialize document viewer: container not available',
            code: 'CONTAINER_ERROR',
          });
        }
      };
      checkAndInit();
    } else {
      console.log('⏸️ useEffect: No viewerData, skipping initialization');
    }
  }, [viewerData, initializeViewer]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleRetry = useCallback(() => {
    setError(null);
    setViewerData(null);
    fetchViewerData();
  }, [fetchViewerData]);

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

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`} style={{ minHeight: '600px' }}>
      {/* NutrientViewer container - it handles its own loading state */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[600px] rounded-lg"
        style={{ 
          minHeight: '600px',
          width: '100%',
          height: '600px'
        }}
      />
    </div>
  );
}