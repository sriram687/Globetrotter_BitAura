import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';

interface Destination {
  id: string;
  city: string;
  country: string;
  image: string;
  rating: number;
  priceLevel: '$' | '$$' | '$$$';
}

const popularDestinations: Destination[] = [
  { id: '1', city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', rating: 4.8, priceLevel: '$$$' },
  { id: '2', city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80', rating: 4.9, priceLevel: '$$' },
  { id: '3', city: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', rating: 4.7, priceLevel: '$' },
  { id: '4', city: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80', rating: 4.6, priceLevel: '$$$' },
  { id: '5', city: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80', rating: 4.7, priceLevel: '$$' },
  { id: '6', city: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80', rating: 4.5, priceLevel: '$$$' },
  { id: '7', city: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80', rating: 4.8, priceLevel: '$$' },
  { id: '8', city: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80', rating: 4.9, priceLevel: '$$' },
];

const DestinationCard = ({ destination, index }: { destination: Destination; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="w-full"
    >
      <Link to={`/explore?city=${destination.city}`}>
        <div className="relative group overflow-hidden rounded-2xl shadow-[0_20px_60px_-35px_rgba(15,23,42,0.7)] hover:shadow-[0_25px_75px_-35px_rgba(79,70,229,0.55)] transition-all border border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur">
          <div className="relative h-52 md:h-60 overflow-hidden">
            <img
              src={destination.image}
              alt={destination.city}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Rating badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <FiStar className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{destination.rating}</span>
            </div>
            
            {/* City info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h4 className="font-semibold text-white text-base drop-shadow-sm">{destination.city}</h4>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">{destination.country}</span>
                <span className="text-emerald-400 text-sm font-medium">{destination.priceLevel}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const PopularDestinations = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.38 }}
      className="mb-6 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/85 dark:bg-slate-900/60 backdrop-blur shadow-[0_22px_70px_-38px_rgba(15,23,42,0.7)] p-4 md:p-5"
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
          Popular Destinations
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {popularDestinations.map((destination, index) => (
          <DestinationCard key={destination.id} destination={destination} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default PopularDestinations;
