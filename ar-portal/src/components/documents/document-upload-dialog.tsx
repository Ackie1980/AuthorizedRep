'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DocumentUploadForm } from '@/components/forms/document-upload-form';
import { type DocumentUploadData } from '@/lib/validations/document';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  onSuccess?: () => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  productId,
  onSuccess,
}: DocumentUploadDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: DocumentUploadData) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('title', data.title);
      formData.append('category', data.category);

      if (data.description) {
        formData.append('description', data.description);
      }

      if (productId) {
        formData.append('productId', productId);
      } else if (data.productId) {
        formData.append('productId', data.productId);
      }

      if (data.tags && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags));
      }

      if (data.metadata && Object.keys(data.metadata).length > 0) {
        formData.append('metadata', JSON.stringify(data.metadata));
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a regulatory document for product compliance and registration.
          </DialogDescription>
        </DialogHeader>

        <DocumentUploadForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
