# Firebase Backend Provider

A comprehensive backend management system built with React and Firebase, providing powerful tools for database and file storage management.

## Features

### File Storage
- Drag-and-drop file upload with progress tracking
- File preview for images, videos, audio, and PDFs
- Public/private access control for files
- File metadata management
- File linking with database records
- Support for multiple file types
- File size limits and type restrictions

### Database Management
- CRUD operations for Firestore collections
- Real-time updates for documents
- Schema management with field customization
- Document search and filtering
- Indexing support
- Collection organization

### User Interface
- Modern, responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Intuitive file and database management
- Settings management
- Progress tracking for uploads
- File preview capabilities

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore and Storage enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/firebase-backend-provider.git
cd firebase-backend-provider
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Project Structure

```
src/
├── components/
│   ├── DatabaseManager.js
│   ├── DocumentEditor.js
│   ├── FileManager.js
│   ├── FilePreview.js
│   ├── FileUpload.js
│   └── SchemaManager.js
├── config/
│   └── firebase.js
├── hooks/
│   └── useCollection.js
├── pages/
│   ├── DatabasePage.js
│   └── StoragePage.js
├── services/
│   ├── DatabaseService.js
│   └── StorageService.js
└── App.js
```

## API Documentation

### StorageService

#### Methods

- `uploadFile(file, path, progressCallback)`: Upload a file with progress tracking
- `getFileMetadata(path)`: Get metadata for a file
- `updateFileMetadata(path, metadata)`: Update file metadata
- `deleteFile(path)`: Delete a file
- `listFiles(path)`: List all files in a directory
- `getDownloadUrl(path)`: Get download URL for a file
- `setFileAccess(path, isPublic)`: Set file access control
- `linkFileToRecord(filePath, recordId)`: Link file with database record

### DatabaseService

#### Methods

- `createDocument(id, data)`: Create a new document with custom ID
- `addDocument(data)`: Add a new document with auto-generated ID
- `getDocument(id)`: Get a document by ID
- `getAllDocuments()`: Get all documents
- `updateDocument(id, data)`: Update a document
- `deleteDocument(id)`: Delete a document
- `queryDocuments(field, operator, value)`: Query documents
- `subscribeToUpdates(callback)`: Subscribe to real-time updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Firebase](https://firebase.google.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
