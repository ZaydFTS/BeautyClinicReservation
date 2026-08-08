// Image/Video upload endpoint
// - In production: uploads to Cloudinary
// - In development: saves to /public/uploads/
//
// Accepts multipart/form-data with a single "file" field.
// Returns { url: string } on success.

import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/auth"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudinaryUrl = process.env.CLOUDINARY_URL

  if (cloudinaryUrl) {
    try {
      const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
      if (match) return { cloudName: match[3], apiKey: match[1], apiSecret: match[2] }
    } catch { /* fall through */ }
  }
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret }
  return null
}

function generateCloudinarySignature(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&")
  return crypto.createHash("sha1").update(sorted + apiSecret).digest("hex")
}

async function uploadToCloudinary(file: Buffer, filename: string, folder: string): Promise<string> {
  const config = getCloudinaryConfig()
  if (!config) throw new Error("Cloudinary not configured")
  const { cloudName, apiKey, apiSecret } = config
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = generateCloudinarySignature({ folder, timestamp }, apiSecret)
  const boundary = crypto.randomBytes(16).toString("hex")
  const chunks: Buffer[] = []

  for (const [key, value] of Object.entries({ folder, timestamp, api_key: apiKey, signature })) {
    chunks.push(Buffer.from(`--${boundary}\r\n`))
    chunks.push(Buffer.from(`Content-Disposition: form-data; name="${key}"\r\n\r\n`))
    chunks.push(Buffer.from(`${value}\r\n`))
  }
  chunks.push(Buffer.from(`--${boundary}\r\n`))
  chunks.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`))
  chunks.push(Buffer.from("Content-Type: application/octet-stream\r\n\r\n"))
  chunks.push(file)
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`))

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body: Buffer.concat(chunks),
  })
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`)
  const data = await res.json()
  return data.secure_url as string
}

async function uploadToLocal(file: Buffer, filename: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  await fs.mkdir(uploadsDir, { recursive: true })
  const ext = path.extname(filename) || ".jpg"
  const safeName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`
  await fs.writeFile(path.join(uploadsDir, safeName), file)
  return `/uploads/${safeName}`
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"]
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]
    const isImage = allowedImageTypes.includes(file.type)
    const isVideo = allowedVideoTypes.includes(file.type)
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 })
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max: ${isVideo ? "50MB" : "5MB"}` }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const useCloudinary = !!getCloudinaryConfig()
    let url: string
    if (useCloudinary) {
      url = await uploadToCloudinary(bytes, file.name, process.env.CLOUDINARY_FOLDER || "beauty-clinic")
    } else {
      url = await uploadToLocal(bytes, file.name)
    }
    return NextResponse.json({ url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
