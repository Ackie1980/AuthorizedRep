'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'
import { DocumentType } from '@/types'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  productId: string
  onUploadComplete?: () => void
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'DoC', label: 'Declaration of Conformity (DoC)' },
  { value: 'IFU', label: 'Instructions for Use (IFU)' },
  { value: 'Label', label: 'Label' },
  { value: 'TechnicalDoc', label: 'Technical Documentation' },
  { value: 'Certificate', label: 'Certificate' },
]

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function DocumentUpload({ productId, onUploadComplete }: DocumentUploadProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>('DoC')
  const [version, setVersion] = useState('')

  const createDocument = trpc.document.create.useMutation()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          variant: 'destructive',
        })
        return
      }
      setSelectedFile(file)
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)

    try {
      // Step 1: Upload file to server
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('productId', productId)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Upload failed')
      }

      const uploadData = await uploadResponse.json()

      // Step 2: Create document record in database
      await createDocument.mutateAsync({
        productId,
        documentType,
        name: selectedFile.name,
        version: version || undefined,
        fileUrl: uploadData.file.url,
        fileSize: uploadData.file.size,
        mimeType: uploadData.file.mimeType,
      })

      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded successfully',
      })

      // Reset form
      setSelectedFile(null)
      setVersion('')
      setDocumentType('DoC')

      // Notify parent component
      onUploadComplete?.()
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
          <p className="text-sm text-muted-foreground">
            Upload product documentation (PDF, DOC, DOCX, or images)
          </p>
        </div>

        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type</Label>
          <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
            <SelectTrigger id="documentType">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Version Input */}
        <div className="space-y-2">
          <Label htmlFor="version">Version (optional)</Label>
          <Input
            id="version"
            placeholder="e.g., 1.0, Rev. 2"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            disabled={uploading}
          />
        </div>

        {/* Drag and Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            uploading && 'pointer-events-none opacity-50'
          )}
        >
          <input {...getInputProps()} />
          {selectedFile ? (
            <div className="flex items-center justify-between bg-muted rounded-md p-4">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              {!uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop file here' : 'Drag and drop file here, or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX, PNG, JPG (max {MAX_FILE_SIZE / 1024 / 1024}MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
