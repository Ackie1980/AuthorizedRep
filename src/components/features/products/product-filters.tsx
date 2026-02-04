'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductStatus } from '@/types/enums'
import { Search } from 'lucide-react'

interface ProductFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
}

export function ProductFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value={ProductStatus.DRAFT}>Draft</SelectItem>
          <SelectItem value={ProductStatus.UNDER_REVIEW}>Under Review</SelectItem>
          <SelectItem value={ProductStatus.REGISTERED}>Registered</SelectItem>
          <SelectItem value={ProductStatus.DISCONTINUED}>Discontinued</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
