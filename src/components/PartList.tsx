import React, { useState, useMemo } from 'react';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Part } from '../types';

interface PartListProps {
  parts: Part[];
  onDeleteParts: (partIds: string[]) => void;
}

const PartList: React.FC<PartListProps> = ({ 
  parts, 
  onDeleteParts
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(5)
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const [sortType, setSortType] = useState<{
    key: keyof Part | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getTotalValue = (): string => {
    const total = parts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
    return formatPrice(total);
  };

  //Sort parts array based on filter given
  const sortedParts = useMemo(() => {
    if (!sortType.key) return parts;
    
    return [...parts].sort((a, b) => {
      const aValue = a[sortType.key!];
      const bValue = b[sortType.key!];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortType.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortType.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [parts, sortType]);

  //Sort handler function for dropdown menu
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (!value) {
      setSortType({ key: null, direction: "asc" });
      return;
    }

    const [key, direction] = value.split("-") as [keyof Part, "asc" | "desc"];
    setSortType({ key, direction });
  };

  // Pagination calculations
  /*
  totalPages: Calculates total pages based on length of items and items per page
  startIndex and endIndex: Indexes for beginning and end of part list per page
  currentParts: A section of the total parts array which will be displayed on the current page 
  */
  const totalPages = Math.ceil(parts.length / itemsPerPage); 
  const startIndex = (currentPage - 1) * itemsPerPage; //
  const endIndex = startIndex + itemsPerPage;
  const currentParts = sortedParts.slice(startIndex, endIndex);


  //Change the number of items per page value
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  //Select a page to go to based on buttons 
  const goToPage = (page: number): void => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  //Show the number of pages available in the UI or do sliding window if greater than 5 pages
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 3;
    
    if (totalPages <= maxVisiblePages) {
      //show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      //use sliding window to show page numbers when there are many pages
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };


  //Selection and bulk deletion
  const toggleSelectMode = (): void => {
    setIsSelectMode(!isSelectMode);
    setSelectedParts(new Set());
  };

  const togglePartSelection = (partId: string): void => {
    const newSelected = new Set(selectedParts);
    if (newSelected.has(partId)) {
      newSelected.delete(partId);
    } else {
      newSelected.add(partId);
    }
    setSelectedParts(newSelected);
  };

  const handleBulkDelete = (): void => {
    if (selectedParts.size === 0) return;
    setDeleteConfirm(true);
  };

  const confirmBulkDelete = (): void => {
    onDeleteParts(Array.from(selectedParts));
    setSelectedParts(new Set());
    setIsSelectMode(false);
    setDeleteConfirm(false);

    //Adjust current page if necessary based on deletion of parts 
    const newTotalPages = Math.ceil(((parts?.length || 0) - selectedParts.size) / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
    
  };

  const cancelBulkDelete = (): void => {
    setDeleteConfirm(false);
  };


  if (parts.length === 0) {
    return (
      <div className="card">
        <h2>Parts Inventory</h2>
        <div className="empty-state">
          <p>No parts in inventory</p>
          <p>Add your first part using the form on the left.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="part-list-header">
        <h2>Parts Inventory ({parts.length} items)</h2>
      </div>

      {/* Option Bar (Sort, Delete, Items Per Page) */}
      <div className="option-bar">
        <div className="option-bar-content">
          
          {/* Sorting Filters */}
          <div className="sorting-filter-section">
            <label className="sort-by-label">Sort by:</label>
            <select
              value={`${sortType.key || ""}-${sortType.direction}`}
              onChange={handleSort}
              className="select-filters"
            >
              <option value="">Default</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low-High)</option>
              <option value="price-desc">Price (High-Low)</option>
              <option value="quantity-asc">Quantity (Low-High)</option>
              <option value="quantity-desc">Quantity (High-Low)</option>
            </select>
          </div>

          {/* Select mode toggle */}
          <button
            onClick={toggleSelectMode}
            className={`select-button ${
              isSelectMode
                ? "select-button-cancel"
                : "select-button-select"
            }`}
          >
            {isSelectMode ? "Cancel" : "Select"}
          </button>

          {/* Items per page selector */}
          <div className="items-per-page-container">
            <label className="items-per-page-label">Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="items-per-page-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>


      {/* Bulk Deletion Button */}
      {isSelectMode && (
        <div>  
          {selectedParts.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedParts.size})
            </button>
          )}
        </div>
      )}

      {/* Parts table */}
      <div className="parts-list">
        <table className="parts-table">
          <thead>
            <tr>
              {/* Only show select column header when in select mode (default) */}
              {isSelectMode && (
                <th className="w-12">
                  Select
                </th>
              )}
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {currentParts.map((part: Part) => (
              <tr key={part.id} className={selectedParts.has(part.id) ? 'selected-row' : ''}>
                {/* Only show checkbox when in select mode */}
                {isSelectMode && (
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedParts.has(part.id)}
                      onChange={() => togglePartSelection(part.id)}
                    />
                  </td>
                )}
                <td>{part.name}</td>
                <td>{part.quantity}</td>
                <td>{formatPrice(part.price)}</td>
                <td>{formatPrice(part.quantity * part.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, parts.length)} of {parts.length} items
          </div>
          
          <div className="pagination-controls">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-primary"
              style={{ opacity: currentPage === 1 ? 0.6 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="pagination-controls">
              {getPageNumbers().map((pageNum: number) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`btn ${currentPage === pageNum ? 'btn-primary' : 'btn'}`}
                  style={{ 
                    backgroundColor: currentPage === pageNum ? '#3498db' : 'white',
                    color: currentPage === pageNum ? 'white' : 'black',
                    border: currentPage === pageNum ? 'none' : '1px solid gray'
                  }}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-primary"
              style={{ opacity: currentPage === totalPages ? 0.6 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Total inventory value */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '6px',
        textAlign: 'right'
      }}>
        <strong>Total Inventory Value: {getTotalValue()}</strong>
      </div>

      {/* Bulk delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                Confirm Bulk Deletion
              </h3>
            </div>
            <div className="modal-body">
              Are you sure you want to delete the selected part{selectedParts.size !== 1 ? 's' : ''}? 
            </div>
            <div className="modal-actions">
              <button
                onClick={cancelBulkDelete}
                className="modal-btn modal-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="modal-btn modal-btn-danger"
              >
                Delete {selectedParts.size} Item{selectedParts.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartList;