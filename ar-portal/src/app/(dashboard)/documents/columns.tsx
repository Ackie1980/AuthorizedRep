'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/tables/data-table-column-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Download,
  Eye,
  FileText,
  FileCheck,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export type Document = {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  status: string;
  createdAt: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
  } | null;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'DOC':
      return <FileCheck className="h-4 w-4 text-green-600" />;
    case 'IFU':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'LABEL':
      return <ImageIcon className="h-4 w-4 text-purple-600" />;
    case 'TECHNICAL_DOC':
      return <FileSpreadsheet className="h-4 w-4 text-orange-600" />;
    case 'CERTIFICATE':
      return <FileCheck className="h-4 w-4 text-indigo-600" />;
    default:
      return <FileIcon className="h-4 w-4 text-gray-600" />;
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

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Document Name" />
    ),
    cell: ({ row }) => {
      const product = row.original.product;
      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium text-gray-900">
            {row.getValue('title')}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.fileName} • v{row.original.version}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Document Type" />
    ),
    cell: ({ row }) => {
      const category = row.getValue('category') as string;
      return (
        <div className="flex items-center gap-2">
          {getCategoryIcon(category)}
          <span className="text-sm text-gray-700">
            {categoryLabels[category] || category}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'product',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      const product = row.original.product;
      if (!product) {
        return <div className="text-sm text-gray-500">-</div>;
      }
      return (
        <Link
          href={`/products/${product.id}`}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          {product.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return <StatusBadge status={status} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'uploadedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uploaded By" />
    ),
    cell: ({ row }) => {
      const uploader = row.original.uploadedBy;
      return <div className="text-sm text-gray-700">{uploader.name}</div>;
    },
  },
  {
    accessorKey: 'fileSize',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => {
      const size = row.getValue('fileSize') as number;
      return <div className="text-sm text-gray-600">{formatFileSize(size)}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return <div className="text-sm text-gray-600">{format(new Date(date), 'MMM d, yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const document = row.original;

      const handleDownload = async () => {
        try {
          const response = await fetch(`/api/documents/${document.id}/download`);
          if (!response.ok) throw new Error('Download failed');

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
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            {document.product && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/products/${document.product.id}`}
                  className="flex items-center cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Product
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                // This will be handled by the document status dialog
                const event = new CustomEvent('update-document-status', {
                  detail: { documentId: document.id }
                });
                window.dispatchEvent(event);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
