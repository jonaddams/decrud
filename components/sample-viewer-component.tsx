// Only render the SDK on the client-side
'use client';

import { useEffect, useRef } from 'react';

export default function SampleViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<NutrientViewer.Instance | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container && window.NutrientViewer) {
      window.NutrientViewer.load({
        container,
        // You can specify a file in public directory, for example /document.pdf
        document: 'https://www.nutrient.io/downloads/nutrient-web-demo.pdf',
      })
        .then((instance) => {
          instanceRef.current = instance;
        })
        .catch((error) => {
          console.error('Failed to load viewer:', error);
        });
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.unload().catch((error) => {
          console.warn('Error unloading viewer:', error);
          try {
            instanceRef.current?.destroy();
          } catch (destroyError) {
            console.warn('Error destroying viewer:', destroyError);
          }
        });
        instanceRef.current = null;
      }
    };
  }, []);

  // You must set the container height and width
  return <div ref={containerRef} style={{ height: '100vh', width: '100%' }} />;
}
