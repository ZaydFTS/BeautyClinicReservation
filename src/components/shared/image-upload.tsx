"use client"

import { useState, useRef, useCallback } from"react"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Upload, X, Loader2, Link as LinkIcon } from"lucide-react"
import { toast } from"sonner"

interface ImageUploadProps {
 value: string
 onChange: (url: string) => void
 label?: string
 acceptVideo?: boolean
}

export function ImageUpload({ value, onChange, label ="Image", acceptVideo = false }: ImageUploadProps) {
 const [uploading, setUploading] = useState(false)
 const [mode, setMode] = useState<"upload" |"url">("upload")
 const [dragOver, setDragOver] = useState(false)
 const fileInputRef = useRef<HTMLInputElement>(null)

 const handleFile = useCallback(async (file: File) => {
 const allowedImageTypes = ["image/jpeg","image/png","image/webp","image/gif","image/jpg"]
 const allowedVideoTypes = ["video/mp4","video/webm","video/ogg","video/quicktime"]
 const isImage = allowedImageTypes.includes(file.type)
 const isVideo = allowedVideoTypes.includes(file.type)
 if (!isImage && !(acceptVideo && isVideo)) {
 toast.error(`Invalid file type. Allowed: images${acceptVideo ?" and videos (mp4, webm)" :""}`)
 return
 }
 const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
 if (file.size > maxSize) {
 toast.error(`File too large. Maximum: ${isVideo ?"50MB" :"5MB"}`)
 return
 }
 setUploading(true)
 try {
 const formData = new FormData()
 formData.append("file", file)
 const res = await fetch("/api/upload", { method:"POST", body: formData })
 const data = await res.json()
 if (!res.ok) throw new Error(data.error ||"Upload failed")
 onChange(data.url)
 toast.success("Image uploaded successfully")
 } catch (err) {
 toast.error(err instanceof Error ? err.message :"Upload failed")
 } finally {
 setUploading(false)
 }
 }, [acceptVideo, onChange])

 const handleDrop = useCallback((e: React.DragEvent) => {
 e.preventDefault()
 setDragOver(false)
 const file = e.dataTransfer.files[0]
 if (file) handleFile(file)
 }, [handleFile])

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0]
 if (file) handleFile(file)
 if (fileInputRef.current) fileInputRef.current.value =""
 }

 const isVideoUrl = value.match(/\.(mp4|webm|ogg|mov)$/i) || value.includes("video")

 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <Label>{label}</Label>
 <div className="flex gap-1 rounded-md border p-0.5">
 <button
 type="button"
 onClick={() => setMode("upload")}
 className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition ${
 mode ==="upload" ?"bg-primary text-primary-foreground" :"text-muted-foreground hover:text-foreground"
 }`}
 >
 <Upload className="h-3 w-3" />
 Upload
 </button>
 <button
 type="button"
 onClick={() => setMode("url")}
 className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition ${
 mode ==="url" ?"bg-primary text-primary-foreground" :"text-muted-foreground hover:text-foreground"
 }`}
 >
 <LinkIcon className="h-3 w-3" />
 URL
 </button>
 </div>
 </div>

 {value && (
 <div className="group relative rounded-lg border border-border/60 overflow-hidden">
 <div className="aspect-video bg-muted/30 flex items-center justify-center">
 {isVideoUrl ? (
 <video src={value} className="max-h-32 max-w-full object-contain" controls muted />
 ) : (
 <img src={value} alt="Preview" className="max-h-32 max-w-full object-contain" />
 )}
 </div>
 <button
 type="button"
 onClick={() => onChange("")}
 className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary"
 aria-label="Remove"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 </div>
 )}

 {mode ==="upload" ? (
 <div
 onDrop={handleDrop}
 onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
 onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
 onClick={() => !uploading && fileInputRef.current?.click()}
 className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition ${
 dragOver ?"border-primary bg-primary/5" :"border-border hover:border-primary/40 hover:bg-muted/30"
 } ${uploading ?"pointer-events-none" :""}`}
 >
 {uploading ? (
 <>
 <Loader2 className="h-6 w-6 animate-spin text-primary" />
 <p className="mt-2 text-xs text-muted-foreground">Uploading...</p>
 </>
 ) : (
 <>
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
 <Upload className="h-5 w-5 text-primary" />
 </div>
 <p className="mt-2 text-sm font-medium">Click to upload or drag & drop</p>
 <p className="text-xs text-muted-foreground">
 {acceptVideo ?"PNG, JPG, WebP (5MB) · MP4, WebM (50MB)" :"PNG, JPG, WebP (max 5MB)"}
 </p>
 </>
 )}
 <input
 ref={fileInputRef}
 type="file"
 accept={acceptVideo
 ?"image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg,video/quicktime"
 :"image/jpeg,image/png,image/webp,image/gif"
 }
 onChange={handleFileSelect}
 className="hidden"
 />
 </div>
 ) : (
 <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
 )}
 </div>
 )
}
