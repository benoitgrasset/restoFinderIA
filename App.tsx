import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchState, Restaurant } from './types';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import MapComponent from './components/MapComponent';
import { searchRestaurants } from './services/geminiService';
import { UtensilsCrossed, Heart, Map, ArrowLeft, Locate } from 'lucide-react';
import RestaurantCard from './components/RestaurantCard';
import Toast from './components/Toast';

const App: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    address: '',
    radius: 1,
    loading: false,
    error: null,
    results: [],
    center: [48.8566, 2.3522], // Default to Paris
  });

  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [viewMode, setViewMode] = useState<'search' | 'favorites'>('search');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]); // New state for price filter
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('restoFinderFavorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    }
  }, []);

  const handleSearch = async (address: string, radius: number, locationOverride?: [number, number]) => {
    setState((prev) => ({ ...prev, loading: true, error: null, address, radius }));
    setSelectedId(null);
    setSelectedPrices([]); // Reset filters on new search
    setSelectedCategory(null);
    setViewMode('search'); // Switch back to search view
    
    try {
      const { restaurants, center } = await searchRestaurants(address, radius, locationOverride);
      setState((prev) => ({
        ...prev,
        loading: false,
        results: restaurants,
        center,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Impossible de récupérer les restaurants. Veuillez réessayer.",
      }));
    }
  };

  const triggerGeolocation = useCallback((isUserInitiated = false) => {
    if ("geolocation" in navigator) {
      if (isUserInitiated) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocText = "Ma position actuelle";
          
          setState(prev => ({ 
            ...prev, 
            address: userLocText,
            center: [latitude, longitude] 
          }));

          // Automatically search with the found location
          handleSearch(userLocText, 1, [latitude, longitude]);
        },
        (error) => {
          console.log("Geolocation permission denied or failed", error);
          if (isUserInitiated) {
            setState(prev => ({ ...prev, loading: false, error: "Impossible de vous géolocaliser. Vérifiez vos permissions." }));
          } else {
            // Silent failure for auto-detection
            setState(prev => ({ ...prev, loading: false }));
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      if (isUserInitiated) {
        setState(prev => ({ ...prev, loading: false, error: "La géolocalisation n'est pas supportée par votre navigateur." }));
      }
    }
  }, []); 

  // Geolocation on mount - silent
  useEffect(() => {
    triggerGeolocation(false);
  }, [triggerGeolocation]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('restoFinderFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e: React.MouseEvent, restaurant: Restaurant) => {
    e.stopPropagation(); // Prevent card click
    
    // Check existence based on current state before updating
    const exists = favorites.find(r => r.id === restaurant.id);
    
    if (exists) {
      setFavorites(prev => prev.filter(r => r.id !== restaurant.id));
      setToast({ message: "Retiré des favoris", visible: true });
    } else {
      setFavorites(prev => [...prev, restaurant]);
      setToast({ message: "Ajouté aux favoris", visible: true });
    }
  };

  const handleTogglePrice = (price: string) => {
    setSelectedPrices(prev => {
      if (prev.includes(price)) {
        return prev.filter(p => p !== price);
      } else {
        return [...prev, price];
      }
    });
  };

  // Determine which list to show
  const activeList = viewMode === 'search' ? state.results : favorites;

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cuisines = new Set(activeList.map(r => r.cuisine));
    return Array.from(cuisines).sort();
  }, [activeList]);

  // Filter the active list based on selected category and price
  const filteredList = useMemo(() => {
    let result = activeList;

    // Filter by Cuisine
    if (selectedCategory) {
      result = result.filter(r => r.cuisine === selectedCategory);
    }

    // Filter by Price
    if (selectedPrices.length > 0) {
      result = result.filter(r => {
        // Handle potential missing price levels or format discrepancies
        if (!r.priceLevel) return false; 
        return selectedPrices.includes(r.priceLevel);
      });
    }

    return result;
  }, [activeList, selectedCategory, selectedPrices]);

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        isVisible={toast.visible} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />

      {/* Header / Navbar */}
      <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-30 relative shadow-sm">
        <div 
          className="flex items-center gap-2 text-[#FF385C] cursor-pointer"
          onClick={() => setViewMode('search')}
        >
          <UtensilsCrossed className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight hidden sm:block">RestoFinder</span>
        </div>
        
        <div className="flex items-center gap-4">
           {viewMode === 'search' ? (
             <button 
                onClick={() => setViewMode('favorites')}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 text-gray-600 font-medium transition-colors"
             >
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Favoris ({favorites.length})</span>
             </button>
           ) : (
             <button 
                onClick={() => setViewMode('search')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 font-medium transition-colors"
             >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour à la recherche</span>
                <span className="sm:hidden">Retour</span>
             </button>
           )}
        </div>
      </header>

      {/* Search Bar - Only show in search mode */}
      {viewMode === 'search' && (
        <SearchBar 
          initialAddress={state.address} 
          initialRadius={state.radius} 
          isLoading={state.loading}
          onSearch={handleSearch}
          onLocateMe={() => triggerGeolocation(true)}
        />
      )}

      {/* Category & Price Filter */}
      {(activeList.length > 0 || viewMode === 'favorites') && (
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPrices={selectedPrices}
          onTogglePrice={handleTogglePrice}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side: List (Scrollable) */}
        <div className={`
          w-full md:w-[55%] lg:w-[45%] xl:w-[40%] 
          h-full overflow-y-auto no-scrollbar 
          p-4 sm:p-6 
          ${filteredList.length === 0 && !state.loading ? 'flex items-center justify-center' : ''}
        `}>
          
          {/* Loading State */}
          {state.loading && viewMode === 'search' && (
             <div className="space-y-8 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between items-start mb-2">
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-px bg-gray-200 w-full mt-6"></div>
                  </div>
                ))}
             </div>
          )}

          {/* Empty States */}
          {!state.loading && filteredList.length === 0 && !state.error && (
            <div className="text-center text-gray-500 max-w-md mx-auto">
              <div className="mb-4 flex justify-center">
                 <div className="p-4 bg-gray-100 rounded-full">
                    {viewMode === 'favorites' ? (
                       <Heart className="w-8 h-8 text-gray-400" />
                    ) : (
                       <Map className="w-8 h-8 text-gray-400" />
                    )}
                 </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {viewMode === 'favorites' 
                  ? 'Aucun favori pour le moment' 
                  : 'Aucun résultat trouvé'}
              </h2>
              <p>
                {viewMode === 'favorites'
                  ? "Sauvegardez des restaurants lors de vos recherches pour les retrouver ici."
                  : "Essayez de modifier vos filtres ou votre recherche."}
              </p>
            </div>
          )}

          {/* Error State */}
          {!state.loading && state.error && viewMode === 'search' && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center border border-red-100">
              {state.error}
            </div>
          )}

          {/* List Content */}
          {!state.loading && filteredList.length > 0 && (
            <>
              <div className="mb-4 text-sm font-medium text-gray-800 flex justify-between items-center flex-wrap gap-2 animate-fadeInUp">
                <span>
                  {filteredList.length} {filteredList.length > 1 ? 'restaurants trouvés' : 'restaurant trouvé'}
                  {viewMode === 'favorites' && ' dans vos favoris'}
                </span>
                <div className="flex gap-2">
                  {selectedCategory && (
                     <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                       {selectedCategory}
                     </span>
                  )}
                  {selectedPrices.length > 0 && (
                     <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                       {selectedPrices.join(', ')}
                     </span>
                  )}
                </div>
              </div>
              <div className="space-y-4 pb-20">
                {filteredList.map((restaurant, index) => (
                  <div 
                    key={restaurant.id} 
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <RestaurantCard 
                      restaurant={restaurant}
                      isSelected={selectedId === restaurant.id}
                      isFavorite={favorites.some(f => f.id === restaurant.id)}
                      userLocation={state.center}
                      onSelect={setSelectedId}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Map (Fixed) */}
        <div className="hidden md:block flex-1 h-full bg-white p-4">
          <div className="h-full w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative group">
            <MapComponent 
              center={viewMode === 'search' ? state.center : (filteredList[0]?.lat && filteredList[0]?.lng ? [filteredList[0].lat, filteredList[0].lng] : state.center)}
              restaurants={filteredList}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {/* Geolocation Button on Map */}
            <button
              onClick={() => triggerGeolocation(true)}
              className="absolute top-4 right-4 z-[400] bg-white p-2.5 rounded-full shadow-lg hover:bg-gray-50 transition-all border border-gray-200 text-gray-700 hover:text-black hover:scale-105"
              title="Me géolocaliser"
            >
              <Locate className="w-5 h-5" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;