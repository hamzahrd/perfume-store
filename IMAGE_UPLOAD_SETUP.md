# Image Upload System Documentation

## Overview

The e-commerce platform includes a robust image upload system that supports both single image uploads for product main images and multiple image uploads for product galleries.

## Features

- **Single Image Upload**: For main product images
- **Multiple Image Upload**: For product image galleries
- **File Type Validation**: Supports JPEG, PNG, GIF, and WebP formats
- **File Size Validation**: Maximum 5MB per file
- **Unique File Naming**: Prevents conflicts with random hex filenames
- **Secure Storage**: Images stored in `/client/public/uploads/` directory

## How It Works

### Client-Side (Admin Dashboard)

1. **Main Image Upload**:
   - Users select an image file through the "Choose Main Image" button
   - File validation occurs (type and size)
   - Image is uploaded via API endpoint
   - Preview is displayed immediately

2. **Gallery Image Upload**:
   - Users can select multiple images through the "Add to Gallery" button
   - Each file is validated individually
   - Images are uploaded one by one
   - Gallery preview is updated with all uploaded images
   - Users can remove individual gallery images

### Server-Side (API)

1. **Upload Endpoint**: `/api/upload/upload`
2. **File Processing**:
   - Validates file type against allowed extensions
   - Generates unique filename using random hex
   - Saves file to `/client/public/uploads/` directory
   - Returns relative URL for frontend use

## File Structure

```
client/
└── public/
    └── uploads/          # Uploaded images stored here
        ├── abc123.jpg    # Example unique filename
        └── def456.png    # Example unique filename
```

## Security Features

- **File Type Validation**: Only allows image files (jpeg, jpg, png, gif, webp)
- **File Size Limit**: Maximum 5MB per file
- **Unique Naming**: Prevents filename conflicts and security issues
- **Restricted Upload Directory**: Images stored in public directory for serving

## Configuration

The image upload system is configured automatically and requires no additional setup. The upload directory is created automatically when the server starts.

## Troubleshooting

### Common Issues

1. **Upload Fails**:
   - Check if the uploads directory exists and has write permissions
   - Verify file type is supported
   - Ensure file size is under 5MB limit

2. **Images Not Displaying**:
   - Verify the image URL returned from the API
   - Check if the image file exists in the uploads directory
   - Ensure the server is serving static files from the public directory

3. **File Validation Errors**:
   - Confirm file extension matches the actual file type
   - Check that the file size is within limits
   - Ensure the file is not corrupted

## Extending the System

To add support for additional file types:
1. Update the `allowedExtensions` array in `server/upload.ts`
2. Add the new file types to the client-side validation in `client/src/pages/AdminDashboard.tsx`
3. Update this documentation to reflect the changes

## Best Practices

- Always validate file types and sizes on both client and server
- Use unique filenames to prevent conflicts
- Implement proper error handling for failed uploads
- Consider image optimization for better performance
- Regularly clean up unused images to save storage space