'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from '@/components/forms/product-form';
import { DocumentUploadForm } from '@/components/forms/document-upload-form';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Pencil, Upload, FileText, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { ProductFormInput } from '@/lib/validations/product';

type ProductDetail = {
  id: string;
  name: string;
  udiDi: string | null;
  deviceType: string | null;
  classification: string | null;
  applicableRegulation: string | null;
  intendedPurpose: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  manufacturer: {
    id: string;
    name: string;
    legalName: string;
    address: string | null;
    primaryContact: string | null;
    services: string[];
  };
  documents: Array<{
    id: string;
    documentType: string;
    name: string;
    version: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  submissions: Array<{
    id: string;
    authority: string;
    status: string;
    registrationNumber: string | null;
    submittedAt: Date | null;
    registeredAt: Date | null;
  }>;
};

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const productId = params.id as string;
  const editMode = searchParams.get('edit') === 'true';

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(editMode);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (data: ProductFormInput) => {
    try {
      setIsSaving(true);

      // Transform form data to API format
      const apiData = {
        name: data.name,
        udiDi: data.sku,
        classification: data.category,
        intendedPurpose: data.description,
        status: data.status,
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }

      const updatedProduct = await response.json();

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });

      setIsEditDialogOpen(false);
      fetchProduct(); // Refresh product data
      router.push(`/products/${productId}`); // Remove edit query param
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDocument = async (data: any) => {
    try {
      const response = await fetch(`/api/products/${productId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      setIsUploadDialogOpen(false);
      fetchProduct(); // Refresh product data
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  const canEdit = session?.user?.role && ['EC_REP_ASSISTANT', 'EC_REP_EXPERT', 'EC_REP_MANAGER', 'ADMIN'].includes(session.user.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <PageHeader title="Product Not Found" />
        <ErrorMessage message={error || 'Product not found'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <PageHeader
            title={product.name}
            description={`Product ID: ${product.id}`}
          />
          <div className="mt-2">
            <StatusBadge status={product.status} />
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">
            Documents
            {product.documents.length > 0 && (
              <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                {product.documents.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic product details and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">UDI-DI</label>
                  <p className="mt-1 text-sm text-gray-900">{product.udiDi || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Device Type</label>
                  <p className="mt-1 text-sm text-gray-900">{product.deviceType || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Classification</label>
                  <p className="mt-1 text-sm text-gray-900">{product.classification || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Regulation</label>
                  <p className="mt-1 text-sm text-gray-900">{product.applicableRegulation || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={product.status} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Intended Purpose</label>
                  <p className="mt-1 text-sm text-gray-900">{product.intendedPurpose || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Manufacturer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{product.manufacturer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Legal Name</label>
                  <p className="mt-1 text-sm text-gray-900">{product.manufacturer.legalName}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{product.manufacturer.address || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Primary Contact</label>
                  <p className="mt-1 text-sm text-gray-900">{product.manufacturer.primaryContact || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Services</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.manufacturer.services.length > 0 ? product.manufacturer.services.join(', ') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(product.createdAt), 'PPpp')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(product.updatedAt), 'PPpp')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Documents
                  </CardTitle>
                  <CardDescription>Product-related documents and files</CardDescription>
                </div>
                {canEdit && (
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {product.documents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No documents uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {product.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            {doc.documentType} • Version {doc.version}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={doc.status} />
                        <p className="text-sm text-gray-500">
                          {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <ProductForm
            defaultValues={{
              name: product.name,
              description: product.intendedPurpose || '',
              category: product.classification || '',
              price: '0.00',
              stockQuantity: '0',
              sku: product.udiDi || '',
              status: product.status as any,
              specifications: {},
              tags: [],
            }}
            onSubmit={handleEdit}
            isLoading={isSaving}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Add a new document to this product</DialogDescription>
          </DialogHeader>
          <DocumentUploadForm
            onSubmit={handleUploadDocument}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
