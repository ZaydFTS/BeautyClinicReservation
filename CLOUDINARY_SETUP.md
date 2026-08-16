# Image Upload Setup

## Overview

The beauty clinic app supports image uploads for product images. In development, images are saved locally to `/public/uploads/`. In production, images are uploaded to Cloudinary.

## Development (Local)

No configuration needed. Images are automatically saved to `public/uploads/` and served from `/uploads/<filename>`.

## Production (Cloudinary)

### 1. Create a Cloudinary account

Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account.

### 2. Get your credentials

From the [Cloudinary Console](https://cloudinary.com/console), copy:
- **Cloud Name**
- **API Key**
- **API Secret**

### 3. Add environment variables

Add ONE of these options to your `.env` file:

**Option A — Single URL format (recommended):**
```env
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

**Option B — Separate variables:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Optional — specify upload folder:**
```env
CLOUDINARY_FOLDER=beauty-clinic
```

### 4. How it works

The upload API (`/api/upload`) automatically detects if Cloudinary is configured:
- If `CLOUDINARY_URL` OR all three `CLOUDINARY_*` vars are set → uploads to Cloudinary
- Otherwise → saves locally to `public/uploads/`

The API returns `{ url: string }` which is stored in the database. When using Cloudinary, the URL is a full HTTPS URL like `https://res.cloudinary.com/your-cloud/image/upload/v123/beauty-clinic/abc.jpg`.

## Features

- **Drag & drop** upload support
- **Click to browse** file selection
- **File validation**: PNG, JPG, WebP, GIF only
- **Size limit**: 5MB maximum
- **Preview** with remove button
- **URL fallback**: Can still paste an image URL if needed (toggle between Upload and URL modes)
- **Signed uploads**: Uses Cloudinary's signed upload API for security (API secret never exposed to client)

## API Endpoint

```
POST /api/upload
Content-Type: multipart/form-data
Body: file=<binary>

Response: { "url": "https://..." } or { "error": "message" }
```

Requires admin authentication (session cookie).
