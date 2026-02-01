'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/tables/data-table';
import { columns, type Document } from './columns';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import { DocumentUploadDialog } from '@/components/documents/document-upload-dialog';
import { DocumentStatusDialog } from '@/components/documents/document-status-dialog';
import { useSession } from 'next-auth/react';

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();

    // Listen for status update events from column actions
    const handleStatusUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ documentId: string }>;
      setSelectedDocumentId(customEvent.detail.documentId);
      setStatusDialogOpen(true);
    };

    window.addEventListener('update-document-status', handleStatusUpdate);
    return () => {
      window.removeEventListener('update-document-status', handleStatusUpdate);
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/documents');

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    fetchDocuments();
  };

  const handleStatusUpdateSuccess = () => {
    setStatusDialogOpen(false);
    setSelectedDocumentId(null);
    fetchDocuments();
  };

  const canUploadDocument = session?.user?.role && [
    'EC_REP_ASSISTANT',
    'EC_REP_EXPERT',
    'EC_REP_MANAGER',
    'ADMIN'
  ].includes(session.user.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Documents"
          description="Manage regulatory documents and submissions"
        />
        <ErrorMessage message={error} />
      </div>
    );
  }

  const filterColumns = [
    {
      id: 'status',
      title: 'Status',
      options: [
        { label: 'Pending Review', value: 'PENDING_REVIEW' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
        { label: 'Needs Revision', value: 'NEEDS_REVISION' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED_DOC' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
    },
    {
      id: 'category',
      title: 'Document Type',
      options: [
        { label: 'Declaration of Conformity', value: 'DOC' },
        { label: 'Instructions for Use', value: 'IFU' },
        { label: 'Label', value: 'LABEL' },
        { label: 'Technical Documentation', value: 'TECHNICAL_DOC' },
        { label: 'Certificate', value: 'CERTIFICATE' },
        { label: 'Other', value: 'OTHER' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Documents"
          description="Manage regulatory documents and submissions"
        />
        {canUploadDocument && (
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="Get started by uploading your first document."
          action={
            canUploadDocument
              ? {
                  label: 'Upload Document',
                  onClick: () => setUploadDialogOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={documents}
          searchKey="title"
          searchPlaceholder="Search documents..."
          filterColumns={filterColumns}
        />
      )}

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={handleUploadSuccess}
      />

      {selectedDocumentId && (
        <DocumentStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          documentId={selectedDocumentId}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}
    </div>
  );
}
