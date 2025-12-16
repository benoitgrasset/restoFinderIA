import React, { useState, useMemo } from 'react';
import { Restaurant } from '../types';
import { Star, MapPin, Heart, X, MessageSquare, ArrowRight } from 'lucide-react';

interface Props {
  restaurant: Restaurant;
  isSelected: boolean;
  isFavorite: boolean;
  userLocation: [number, number];
  onSelect: (id: string) => void;
  onToggleFavorite: (e: React.MouseEvent, restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<Props> = ({ restaurant, isSelected, isFavorite, userLocation, onSelect, onToggleFavorite }) => {
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  
  // Calculate distance from user location (search center)
  const distanceDisplay = useMemo(() => {
    if (!userLocation || !restaurant.lat || !restaurant.lng) return null;

    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Rayon de la terre en km
    const lat1 = userLocation[0];
    const lon1 = userLocation[1];
    const lat2 = restaurant.lat;
    const lon2 = restaurant.lng;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  }, [userLocation, restaurant.lat, restaurant.lng]);

  const handleOpenReviews = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReviewsModal(true);
  };

  const handleCloseReviews = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReviewsModal(false);
  };

  // Get up to 3 reviews for the card preview
  const previewReviews = restaurant.reviews?.slice(0, 3) || [];

  return (
    <>
      <div 
        className={`
          flex flex-col gap-4 p-5 rounded-xl border border-gray-100 bg-white
          shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-gray-200
          transition-all duration-300 ease-out cursor-pointer group relative z-0 hover:z-10
          ${isSelected ? 'ring-2 ring-black bg-gray-50' : ''}
        `}
        onClick={() => onSelect(restaurant.id)}
      >
        {/* Save Button */}
        <button
          onClick={(e) => onToggleFavorite(e, restaurant)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-200 transition-all hover:scale-110 active:scale-95 bg-white/50 backdrop-blur-sm"
          title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-[#FF385C] text-[#FF385C]' : 'text-gray-400'}`} 
          />
        </button>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start pr-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{restaurant.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">{restaurant.cuisine}</span>
                  {restaurant.priceLevel && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600">{restaurant.priceLevel}</span>
                    </>
                  )}
                </div>
              </div>
              {/* Rating */}
              <div className="flex items-center gap-1 text-sm font-medium bg-gray-100 px-2 py-1 rounded-md">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span>{restaurant.rating}</span>
                <span className="text-gray-400 font-normal text-xs">({restaurant.reviewCount || 50}+)</span>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {restaurant.description}
            </p>
            
            {/* Reviews Snippet List (Up to 3) */}
            <div className="mt-4 space-y-3">
              {previewReviews.length > 0 ? (
                previewReviews.map((review, idx) => (
                   <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 shadow-sm text-sm hover:bg-white transition-colors">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-semibold text-xs text-gray-900">{review.author}</span>
                       <div className="flex gap-0.5">
                         {[...Array(5)].map((_, i) => (
                           <Star
                             key={i}
                             size={12}
                             className={`${
                               i < Math.round(review.rating)
                                 ? 'fill-black text-black'
                                 : 'text-gray-300 fill-transparent'
                             }`}
                           />
                         ))}
                       </div>
                     </div>
                     <p className="text-gray-600 text-xs line-clamp-2 italic">"{review.text}"</p>
                   </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100 text-center flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span>Aucun avis trouvé.</span>
                </div>
              )}
              
              {restaurant.reviews && restaurant.reviews.length > 0 && (
                <button 
                  onClick={handleOpenReviews}
                  className="mt-3 group/btn flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black transition-colors"
                >
                  <span className="underline decoration-gray-300 underline-offset-4 group-hover/btn:decoration-black transition-all">
                    Voir les {restaurant.reviews.length} avis
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500 font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-gray-400" />
            <span className="line-clamp-1 truncate">{restaurant.address}</span>
            {distanceDisplay && (
              <>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-gray-700">à {distanceDisplay}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Modal */}
      {showReviewsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseReviews}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
               <div>
                  <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-black" />
                        <span className="font-semibold">{restaurant.rating}</span>
                        <span className="text-gray-500">({restaurant.reviewCount} avis)</span>
                    </div>
                    {restaurant.priceLevel && (
                        <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-900 font-medium">{restaurant.priceLevel}</span>
                        </>
                    )}
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500">{restaurant.cuisine}</span>
                  </div>
               </div>
               <button 
                 onClick={handleCloseReviews}
                 className="p-2 rounded-full hover:bg-gray-100 transition-colors"
               >
                 <X className="w-5 h-5 text-gray-500" />
               </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 space-y-8">
               <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-[#FF385C]" />
                  <h3 className="text-lg font-semibold">Ce que les gens en disent</h3>
               </div>

               <div className="grid gap-6">
                 {restaurant.reviews?.map((review, idx) => (
                   <div key={idx} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                     <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                         {review.author.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <div className="font-semibold text-gray-900">{review.author}</div>
                         <div className="flex items-center gap-1">
                            <div className="flex text-black gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14}
                                  className={`${
                                    i < Math.round(review.rating) 
                                      ? 'fill-black text-black' 
                                      : 'text-gray-300 fill-transparent'
                                  }`} 
                                />
                              ))}
                            </div>
                         </div>
                       </div>
                     </div>
                     <p className="text-gray-700 leading-relaxed text-sm">
                       {review.text}
                     </p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantCard;