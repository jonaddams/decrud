#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

// Get configuration from environment variables
const API_TOKEN = process.env.API_TOKEN;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Parse command line arguments
let documentId, documentUrl, title;

// Check if we have 3 arguments (docId, URL, title), 2 arguments (docId and URL), or 1 argument (just URL)
if (process.argv.length >= 5) {
  // Three arguments: document ID, URL, and title
  documentId = process.argv[2] || process.env.DOCUMENT_ID;
  documentUrl = process.argv[3] || process.env.DOCUMENT_URL;
  title = process.argv[4] || process.env.DOCUMENT_TITLE;
} else if (process.argv.length === 4) {
  // Two arguments: could be (docId, URL) or (URL, title)
  // Check if first arg looks like a URL
  if (process.argv[2].startsWith('http')) {
    documentUrl = process.argv[2] || process.env.DOCUMENT_URL;
    title = process.argv[3] || process.env.DOCUMENT_TITLE;
    documentId = process.env.DOCUMENT_ID;
  } else {
    documentId = process.argv[2] || process.env.DOCUMENT_ID;
    documentUrl = process.argv[3] || process.env.DOCUMENT_URL;
    title = process.env.DOCUMENT_TITLE;
  }
} else if (process.argv.length === 3) {
  // One argument: just URL
  documentId = process.env.DOCUMENT_ID;
  documentUrl = process.argv[2] || process.env.DOCUMENT_URL;
  title = process.env.DOCUMENT_TITLE;
} else {
  // No arguments: use env vars only
  documentId = process.env.DOCUMENT_ID;
  documentUrl = process.env.DOCUMENT_URL;
  title = process.env.DOCUMENT_TITLE;
}

if (!documentUrl) {
  console.error('Error: Document URL is required');
  console.log('Usage: node upload-url.js [document-id] [document-url] [title]');
  console.log('       node upload-url.js [document-url] [title]');
  console.log('       node upload-url.js [document-url]');
  process.exit(1);
}

async function uploadDocumentFromUrl(docId, docUrl, docTitle) {
  try {
    console.log(`Uploading document from URL: ${docUrl}`);
    if (docId) {
      console.log(`Document ID: ${docId}`);
    } else {
      console.log('Document ID: (server will generate)');
    }
    if (docTitle) {
      console.log(`Title: ${docTitle}`);
    }

    // Prepare the request payload
    const payload = {
      url: docUrl,
      copy_asset_to_storage_backend: false,
      keep_current_annotations: true,
      overwrite_existing_document: true,
    };

    // Only include document_id if provided
    if (docId) {
      payload.document_id = docId;
    }

    // Only include title if provided
    if (docTitle) {
      payload.title = docTitle;
    }

    // Make the API request
    const response = await axios.post(`${BASE_URL}/api/documents`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token token=${API_TOKEN}`,
      },
    });

    console.log('Document uploaded successfully!');
    console.log(`Document ID: ${response.data.document_id}`);
    console.log(`Status: ${response.data.status || 'uploaded'}`);
  } catch (error) {
    console.error('Error uploading document:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run the upload process
uploadDocumentFromUrl(documentId, documentUrl, title);
