// Nutrient Viewer TypeScript definitions for CDN usage
// NOTE: These definitions are for the global window.NutrientViewer object loaded via CDN,
// not the @nutrient-sdk/viewer npm package. The npm package has different type exports.
declare namespace NutrientViewer {
  // Main load function
  function load(configuration: Configuration): Promise<Instance>;

  // Static unload function for cleanup
  function unload(container: HTMLElement): Promise<void>;

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
    authPayload?: { jwt: string };
    instant?: boolean;

    // UI Configuration
    toolbarItems?: ToolbarItem[];
    initialViewState?: ViewState;
    disableWebAssemblyStreaming?: boolean;

    // Office Document Conversion
    officeConversionSettings?: {
      documentMarkupMode?: 'allMarkup' | 'finalMarkup' | 'noMarkup';
    };

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

  // ViewState - Immutable.js Record
  interface ViewStateProperties {
    currentPageIndex?: number;
    zoom?: number | ZoomMode;
    scrollTop?: number;
    scrollLeft?: number;
    pagesRotation?: 0 | 90 | 180 | 270;
    layoutMode?: LayoutMode;
    sidebarMode?: SidebarMode;
    showToolbar?: boolean;
  }

  // ViewState constructor and instance
  interface ViewStateConstructor {
    new (properties?: ViewStateProperties): ViewStateInstance;
  }

  interface ViewStateInstance extends ViewStateProperties {
    set<K extends keyof ViewStateProperties>(
      key: K,
      value: ViewStateProperties[K]
    ): ViewStateInstance;
    merge(properties: Partial<ViewStateProperties>): ViewStateInstance;
  }

  // Type alias for backwards compatibility
  type ViewState = ViewStateProperties;

  const ViewState: ViewStateConstructor;

  // LayoutMode enum
  enum LayoutMode {
    SINGLE = 'SINGLE',
    DOUBLE = 'DOUBLE',
    AUTO = 'AUTO',
  }

  // SidebarMode enum
  enum SidebarMode {
    THUMBNAILS = 'THUMBNAILS',
    OUTLINE = 'OUTLINE',
    ANNOTATIONS = 'ANNOTATIONS',
    BOOKMARKS = 'BOOKMARKS',
    DOCUMENT_OUTLINE = 'DOCUMENT_OUTLINE',
    CUSTOM = 'CUSTOM',
  }

  // ZoomMode enum
  enum ZoomMode {
    AUTO = 'AUTO',
    FIT_TO_VIEWPORT = 'FIT_TO_VIEWPORT',
    FIT_TO_WIDTH = 'FIT_TO_WIDTH',
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
