'use client';

import type { DocumentCategory } from '@/lib/document-constants';
import type { DocumentItem } from '@/app/documents/page';
import DocumentCategoryCard from './document-category-card';
import SearchSortControls from './search-sort-controls';
import DocumentRow, { type SortOption } from './document-row';
import EmptyCategory from './empty-category';
import { useMemo, useState } from 'react';

interface DocumentAccordionProps {
  category: DocumentCategory;
  documents: DocumentItem[];
  expanded: boolean;
  onToggle: () => void;
  onPreview?: (document: DocumentItem) => void;
  onDownload?: (document: DocumentItem) => void;
}

export default function DocumentAccordion({
  category,
  documents,
  expanded,
  onToggle,
  onPreview,
  onDownload,
}: DocumentAccordionProps) {
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const filtered = documents.filter((document) =>
      normalizedSearch
        ? [document.name, document.type, document.uploadedBy].some((value) => value.toLowerCase().includes(normalizedSearch))
        : true,
    );

    return filtered.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      }
      if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });
  }, [documents, searchText, sortOption]);

  return (
    <DocumentCategoryCard category={category} count={documents.length} expanded={expanded} onToggle={onToggle}>
      {expanded ? (
        <div className="mt-4">
          <SearchSortControls
            category={category}
            searchText={searchText}
            sortOption={sortOption}
            onSearchTextChange={setSearchText}
            onSortOptionChange={setSortOption}
          />

          {filteredDocuments.length === 0 ? (
            <EmptyCategory />
          ) : (
            <div className="mt-4 space-y-4">
              {filteredDocuments.map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  onPreview={onPreview}
                  onDownload={onDownload}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </DocumentCategoryCard>
  );
}
