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
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export type Product = {
  id: string;
  name: string;
  udiDi: string | null;
  deviceType: string | null;
  classification: string | null;
  applicableRegulation: string | null;
  status: string;
  createdAt: Date;
  manufacturer: {
    id: string;
    name: string;
    legalName: string;
  };
  _count: {
    documents: number;
    submissions: number;
  };
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/products/${row.original.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.getValue('name')}
        </Link>
      );
    },
  },
  {
    accessorKey: 'udiDi',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="UDI-DI" />
    ),
    cell: ({ row }) => {
      const udiDi = row.getValue('udiDi') as string | null;
      return <div className="text-sm text-gray-700">{udiDi || '-'}</div>;
    },
  },
  {
    accessorKey: 'deviceType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Device Type" />
    ),
    cell: ({ row }) => {
      const deviceType = row.getValue('deviceType') as string | null;
      return <div className="text-sm text-gray-700">{deviceType || '-'}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'classification',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Classification" />
    ),
    cell: ({ row }) => {
      const classification = row.getValue('classification') as string | null;
      return <div className="text-sm text-gray-700">{classification || '-'}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
    accessorKey: 'applicableRegulation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Regulation" />
    ),
    cell: ({ row }) => {
      const regulation = row.getValue('applicableRegulation') as string | null;
      return <div className="text-sm text-gray-700">{regulation || '-'}</div>;
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
      const product = row.original;

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
            <DropdownMenuItem asChild>
              <Link href={`/products/${product.id}`} className="flex items-center cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/products/${product.id}?edit=true`} className="flex items-center cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => {
                // Delete action will be handled by the parent component
                if (window.confirm('Are you sure you want to delete this product?')) {
                  // Trigger delete
                  // console.log('Delete product:', product.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
