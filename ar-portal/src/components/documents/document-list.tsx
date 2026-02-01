'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card } from '@/components/ui/card';
import {
  Download,
  FileText,
  FileCheck,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  version: number;
  status: string;
  createdAt: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
}

interface DocumentListProps {
  documents: Document[];
  productId: string;
  onRefresh?: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'DOC':
      return <FileCheck className="h-5 w-5 text-green-600" />;
    case 'IFU':
      return <FileText className="h-5 w-5 text-blue-600" />;
    case 'LABEL':
      return <ImageIcon className="h-5 w-5 text-purple-600" />;
    case 'TECHNICAL_DOC':
      return <FileSpreadsheet className="h-5 w-5 text-orange-600" />;
    case 'CERTIFICATE':
      return <FileCheck className="h-5 w-5 text-indigo-600" />;
    default:
      return <FileIcon className="h-5 w-5 text-gray-600" />;
  }
};

const categoryLabels: Record<string, string> = {
  DOC: 'Declaration of Conformity',
  IFU: 'Instructions for Use',
  LABEL: 'Label',
  TECHNICAL_DOC: 'Technical Documentation',
  CERTIFICATE: 'Certificate',
  OTHER: 'Other',
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export function DocumentList({ documents, productId, onRefresh }: DocumentListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (document: Document) => {
    try {
      setDownloadingId(document.id);
      const response = await fetch(`/api/documents/${document.id}/download`);

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    } finally {
      setDownloadingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-2 text-sm text-gray-500">
          Upload documents to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <Card key={document.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1">
                {getCategoryIcon(document.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {document.title}
                  </h4>
                  <StatusBadge status={document.status} />
                </div>

                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Type:</span>
                    {categoryLabels[document.category] || document.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Version:</span>
                    v{document.version}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Size:</span>
                    {formatFileSize(document.fileSize)}
                  </span>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">{document.fileName}</span>
                  <span className="mx-2">•</span>
                  Uploaded by {document.uploadedBy.name} on{' '}
                  {format(new Date(document.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            <div className="ml-4 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(document)}
                disabled={downloadingId === document.id}
              >
                {downloadingId === document.id ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
