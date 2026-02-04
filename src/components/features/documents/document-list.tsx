'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { DocumentStatusBadge } from './document-status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, Trash2, FileText, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { DocumentStatus } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DocumentListProps {
  productId: string
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  DoC: 'Declaration of Conformity',
  IFU: 'Instructions for Use',
  Label: 'Label',
  TechnicalDoc: 'Technical Documentation',
  Certificate: 'Certificate',
}

export function DocumentList({ productId }: DocumentListProps) {
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)

  const utils = trpc.useUtils()
  const { data: documents, isLoading } = trpc.document.listByProduct.useQuery({ productId })
  const deleteDocument = trpc.document.delete.useMutation({
    onSuccess: () => {
      utils.document.listByProduct.invalidate({ productId })
      toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully',
      })
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete document',
        variant: 'destructive',
      })
    },
  })

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      await deleteDocument.mutateAsync({ id: documentToDelete })
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(2)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(2)} MB`
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
          <p className="text-sm text-muted-foreground">
            Upload your first document to get started
          </p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-xs">{document.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {document.version || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DocumentStatusBadge status={document.status as DocumentStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatFileSize(document.fileSize)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document.fileUrl, document.name)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(document.id)}
                        disabled={deleteDocument.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Review Notes Alert */}
        {documents.some(doc => doc.reviewNotes) && (
          <div className="border-t p-4 bg-muted/30">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium">Review Notes</p>
                {documents
                  .filter(doc => doc.reviewNotes)
                  .map(doc => (
                    <div key={doc.id} className="text-sm">
                      <span className="font-medium">{doc.name}:</span>{' '}
                      <span className="text-muted-foreground">{doc.reviewNotes}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteDocument.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDocument.isPending}
            >
              {deleteDocument.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
