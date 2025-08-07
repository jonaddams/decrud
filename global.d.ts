// Nutrient Viewer TypeScript definitions based on official API documentation
declare namespace NutrientViewer {
  // Main load function
  function load(configuration: Configuration): Promise<Instance>;

  // Configuration interface for NutrientViewer.load()
  interface Configuration {
    // Required
    container: string | HTMLElement;
    document?: string | ArrayBuffer | Blob | File;
    baseUrl?: string;
    
    // Authentication
    licenseKey?: string;
    
    // Document Engine integration
    serverUrl?: string;
    documentId?: string;
    jwt?: string;
    
    // UI Configuration
    toolbarItems?: ToolbarItem[];
    initialViewState?: ViewState;
    disableWebAssemblyStreaming?: boolean;
    
    // Feature toggles
    enableHistory?: boolean;
    enableAnnotations?: boolean;
    enableForms?: boolean;
    enableDocumentEditor?: boolean;
    
    // Styling
    theme?: 'light' | 'dark' | 'auto';
    styleSheets?: string[];
    
    // Event handlers
    onDocumentLoaded?: (document: unknown) => void;
    onDocumentLoadFailed?: (error: Error) => void;
  }

  // Instance class - returned by NutrientViewer.load()
  interface Instance {
    // Document management
    readonly totalPageCount: number;
    readonly documentId: string | null;
    
    // Lifecycle methods
    unload(): Promise<void>;
    destroy(): void;
    
    // Navigation
    setViewState(viewState: ViewState): Promise<ViewState>;
    getViewState(): ViewState;
    
    // Event handling
    addEventListener(event: string, callback: Function): void;
    removeEventListener(event: string, callback: Function): void;
    
    // Export/Save
    exportPDF(options?: unknown): Promise<ArrayBuffer>;
    save(options?: unknown): Promise<ArrayBuffer>;
  }

  // ViewState interface
  interface ViewState {
    currentPageIndex?: number;
    zoom?: number;
    scrollTop?: number;
    scrollLeft?: number;
    rotation?: number;
    layoutMode?: 'single' | 'double' | 'auto';
    sidebarMode?: 'thumbnails' | 'outline' | 'annotations' | 'none';
    showToolbar?: boolean;
  }

  // Toolbar configuration
  interface ToolbarItem {
    type: string;
    id?: string;
    title?: string;
    className?: string;
    icon?: string;
    onPress?: () => void;
    selected?: boolean;
    disabled?: boolean;
  }
}

declare global {
  interface Window {
    // Nutrient Web SDK will be available on window.NutrientViewer once loaded
    NutrientViewer?: typeof NutrientViewer;
  }
}
