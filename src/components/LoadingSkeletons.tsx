export const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border animate-pulse">
    <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-t-lg"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-gray-200 rounded-md"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  </div>
);

export const CartItemSkeleton = () => (
  <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border animate-pulse">
    <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
    <div className="flex-1 min-w-0">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-28"></div>
    </div>
    <div className="flex flex-col gap-2 flex-shrink-0">
      <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
      <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);
