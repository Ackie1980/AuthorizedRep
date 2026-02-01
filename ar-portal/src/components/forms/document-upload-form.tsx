'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { documentUploadSchema, type DocumentUploadData } from '@/lib/validations/document';
import { FormField } from './form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Upload, X, FileText } from 'lucide-react';

interface DocumentUploadFormProps {
  onSubmit: (data: DocumentUploadData) => Promise<void>;
  isLoading?: boolean;
}

const categories = [
  { value: 'DOC', label: 'Declaration of Conformity' },
  { value: 'IFU', label: 'Instructions for Use' },
  { value: 'LABEL', label: 'Label' },
  { value: 'TECHNICAL_DOC', label: 'Technical Documentation' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'OTHER', label: 'Other' },
];

export function DocumentUploadForm({
  onSubmit,
  isLoading = false,
}: DocumentUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const methods = useForm<DocumentUploadData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      productId: null,
      tags: [],
      metadata: {},
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      methods.setValue('file', file);
      // Auto-fill title from filename if empty
      if (!methods.getValues('title')) {
        methods.setValue('title', file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    methods.setValue('file', undefined as any);
  };

  const handleSubmit = async (data: DocumentUploadData) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            File <span className="text-red-500">*</span>
          </label>

          {!selectedFile ? (
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <Upload className="mb-3 h-10 w-10 text-gray-400" />
              <p className="mb-1 text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, Word, Excel, or Images (max 10MB)
              </p>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {methods.formState.errors.file && (
            <p className="text-sm text-red-600">
              {methods.formState.errors.file.message}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField name="title" label="Title" required className="md:col-span-2">
            <Input placeholder="Enter document title" />
          </FormField>

          <FormField name="category" label="Category" required>
            <Select onValueChange={(value) => methods.setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            name="description"
            label="Description"
            className="md:col-span-2"
          >
            <Textarea placeholder="Enter document description (optional)" rows={3} />
          </FormField>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => methods.reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !selectedFile}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
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
      </form>
    </FormProvider>
  );
}
