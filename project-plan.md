# **Project Plan: Nutrient Document Engine CRUD Application**

## **1\. Project Overview**

**Objective:** To build a web-based CRUD application that interfaces with Document Engine. This application will allow users to manage documents and view them using an integrated document viewer, demonstrating the core functionalities of the Document Engine server product. The final product will serve as a proof-of-concept for customers evaluating our product.

**Target Audience:**

* **Primary:** Prospective customers evaluating Document Engine.  
* **Secondary:** Internal sales representatives demoing product, developers and solutions engineers.

**Key Features:**

* **Secure user authentication with Google OAuth.**  
* An integrated **document viewer** to render various file types.  
* A clean, intuitive, and responsive user interface (UI).  
* Functionality to create, read, update, and delete documents.  
* Real-time updates to the UI as data changes in the backend.  
* A search feature to quickly find documents.

## **2\. Core Functionalities (User Stories)**

* **As a user, I want to...**  
  * Log in with my Google account to access the application. 
  * Create a new document record by providing a title, author, and other metadata.  
  * Read a list of all existing documents.  
  * View and edit (via the Nutrient Viewer) a document by selecting it from the list.  
  * Update the metadata of an existing document.  
  * Delete a document. 
  * Search for documents based on their title or content or file type.

## **3\. Technical Specifications**

* **Frontend:**  
  * **Framework:** Next.js (App Directory) with React  
  * **Language:** TypeScript  
  * **Styling:** Tailwind CSS for a utility-first approach.  
  * **State Management:** React Context for managing application state.  
  * **UI Components:** Prefer pure Tailwind/CSS UI components over JavaScipt UI components for performance. 
   
* **Authentication:**  
  * **Library:** NextAuth.js  
  * **Provider:** Google OAuth 2.0  

* **Document Engine API Integration:**  

  * **Integration:** The application will integrate with the Nutrient Document Engine's server-side rendering capabilities via an API.  
* **Document Viewer:**  

  * **Integration:** The application will integrate with the Nutrient Document Engine's API via server components/API route only - no client components may communicate directly with the server.  
  * **Supported File Types:**  
    * **PDF:** PDF  
    * **Microsoft Office:** DOC, DOCX, XLS, XLSX, XLSM, PPT, PPTX, PPS, PPSX  
    * **Other Formats:** RTF, ODT  
    * **Images:** BMP, JPG, JPEG, PNG, TIFF, HEIC, GIF, WEBP, SVG, TGA, EPS  
    * **Email:** EML, MSG  
    * **CAD:** DWG, DXF  

* **Backend (integrates with Nutrient Document Engine's API):**  
  * **API:** RESTful API with CRUD endpoints and Document Engine integration.  
    * POST /api/documents \- Upload file to Document Engine and create metadata record.  
    * GET /api/documents \- Retrieve filtered list of documents based on user role/mode.  
    * GET /api/documents/{id} \- Retrieve a single document's metadata.  
    * GET /api/documents/{id}/viewer-url \- Generate Document Engine viewer URL with JWT.  
    * PUT /api/documents/{id} \- Update a document's metadata.  
    * DELETE /api/documents/{id} \- Delete document from database and Document Engine.  
  * **Data Model (Document):**  
    {  
      "id": "uuid",  
      "documentEngineId": "string",  
      "title": "string",  
      "filename": "string",  
      "fileType": "string",  
      "fileSize": "number",  
      "author": "string",  
      "ownerId": "uuid",  
      "createdAt": "timestamp",  
      "updatedAt": "timestamp"  
    }  
  * **User Roles & Impersonation:**  
    * **Admin Role:** Can view/manage all documents when in "admin mode"  
    * **User Role:** Can only view/manage their own documents  
    * **Impersonation:** Admins can switch between "admin" and "user" viewing modes

* **Database:**  
  * **Type:** PostgreSQL  
  * **Schema:** Users table with role and impersonation mode, Documents table with owner reference  
  * **NextAuth.js:** Auto-generated auth tables (accounts, sessions, users, verification_tokens)  
  * **Note:** Role-based access control with admin impersonation capability

* **Authentication & Security:**  
  * **OAuth:** Google authentication via NextAuth.js  
  * **Session Validation:** Utility functions to validate sessions in all API routes and components  
  * **Document Engine:** JWT-based authentication for viewer access  
  * **Middleware:** Protected routes with additional session validation due to Vercel middleware bugs
  
* **Document Engine Integration:**  
  * **Base URL:** http://localhost:8585 (development)  
  * **Authentication:** API key + RSA private key for JWT signing  
  * **File Storage:** Document Engine manages file storage in S3  
  * **Viewer:** Embedded viewer with JWT-authenticated access  
  * **Error Handling:** Retry logic for uploads, server unreachable notifications

* **UI:**  
  * Modern, clean, minimal design  
  * Dark and Light mode support  
  * Role switcher for admin users (admin mode vs user mode)  
  * Embedded document viewer








