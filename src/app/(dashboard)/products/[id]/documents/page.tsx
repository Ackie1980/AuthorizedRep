import { auth } from '@/server/auth/config'
import { redirect } from 'next/navigation'
import { DocumentList } from '@/components/features/documents/document-list'
import { DocumentUpload } from '@/components/features/documents/document-upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Upload } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ProductDocumentsPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const productId = params.id

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Documents</h1>
        <p className="text-muted-foreground mt-2">
          Manage documentation for this product
        </p>
      </div>

      {/* Tabs for Upload and View */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document List</CardTitle>
              <CardDescription>
                View and manage all documents associated with this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList productId={productId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <DocumentUpload productId={productId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
