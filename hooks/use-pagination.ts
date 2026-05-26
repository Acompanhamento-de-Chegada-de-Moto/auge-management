import { useMemo, useState } from "react";

interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  itemsPerPage?: number;
  itemsPerPageOptions?: number[];
}

export function usePagination({
  totalItems,
  initialPage = 1,
  itemsPerPage = 10,
  itemsPerPageOptions = [10, 20, 50, 100],
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / currentItemsPerPage),
    [totalItems, currentItemsPerPage],
  );

  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const gotoPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const previousPage = () => {
    if (canPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const nextPage = () => {
    if (canNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const setItemsPerPage = (newItemsPerPage: number) => {
    setCurrentItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const paginatedRange = useMemo(() => {
    const start = (currentPage - 1) * currentItemsPerPage;
    const end = Math.min(start + currentItemsPerPage, totalItems);
    return { start, end };
  }, [currentPage, currentItemsPerPage, totalItems]);

  return {
    currentPage,
    totalPages,
    canPreviousPage,
    canNextPage,
    gotoPage,
    previousPage,
    nextPage,
    itemsPerPage: currentItemsPerPage,
    setItemsPerPage,
    itemsPerPageOptions,
    paginatedRange,
  };
}
