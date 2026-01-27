import HomeSearchHeader from '@/features/home/components/HomeSearchHeader';
import HomeViewModeTabs from '@/features/home/components/HomeViewModeTabs';
import HomeFilterModal from '@/features/home/components/HomeFilterModal';
import HomeStoreList from '@/features/home/components/HomeStoreList';
import { useHomePage } from '@/features/home/hooks/useHomePage';

const HomePage = () => {
  const {
    viewMode,
    searchQuery,
    showFilterModal,
    selectedCategory,
    selectedDivide,
    hasActiveFilters,
    loadMoreRef,
    stores,
    isLoading,
    totalElements,
    isFetchingNextPage,
    hasNextPage,
    handleSearchChange,
    handleViewModeList,
    handleViewModeMap,
    setShowFilterModal,
    setSelectedCategory,
    setSelectedDivide,
  } = useHomePage();

  const handleCategoryRemove = () => {
    setSelectedCategory('');
  };

  const handleDivideRemove = () => {
    setSelectedDivide('');
  };

  const handleFilterReset = () => {
    setSelectedCategory('');
    setSelectedDivide('');
    setShowFilterModal(false);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleDivideChange = (divide) => {
    setSelectedDivide(divide);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-white">
        <HomeSearchHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onFilterClick={() => setShowFilterModal(true)}
          hasActiveFilters={hasActiveFilters}
          selectedCategory={selectedCategory}
          selectedDivide={selectedDivide}
          onCategoryRemove={handleCategoryRemove}
          onDivideRemove={handleDivideRemove}
        />
        <HomeViewModeTabs
          viewMode={viewMode}
          onListClick={handleViewModeList}
          onMapClick={handleViewModeMap}
        />
      </div>

      <HomeStoreList
        viewMode={viewMode}
        stores={stores}
        isLoading={isLoading}
        totalElements={totalElements}
        loadMoreRef={loadMoreRef}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />

      <HomeFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedCategory={selectedCategory}
        selectedDivide={selectedDivide}
        onCategoryChange={handleCategoryChange}
        onDivideChange={handleDivideChange}
        onReset={handleFilterReset}
      />
    </div>
  );
};

export default HomePage;
