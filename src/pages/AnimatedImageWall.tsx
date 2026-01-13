import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";

// Import images with React.lazy for better performance
const IMAGES = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"
];

function AnimatedImageWall() {
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Responsive density - simplified
  const COLS = useMemo(() => {
    if (!isClient) return 5;
    if (window.innerWidth < 640) return 4;
    if (window.innerWidth < 1024) return 6;
    return 8;
  }, [isClient]);

  const TOTAL = useMemo(() => COLS * Math.floor(COLS / 1.8), [COLS]);

  // Memoized tiles calculation
  const tiles = useMemo(() => {
    return Array.from({ length: TOTAL }, (_, i) => ({
      a: IMAGES[i % IMAGES.length],
      b: IMAGES[(i + 3) % IMAGES.length],
      id: i
    }));
  }, [TOTAL]);

  // Optimized flip function with requestAnimationFrame
  const flipRandomTiles = useCallback(() => {
    requestAnimationFrame(() => {
      const numToFlip = Math.floor(Math.random() * 2) + 1; // Flip 1-2 tiles at a time
      const newFlipped = new Set(flippedIndices);
      
      // Remove some previously flipped tiles
      if (newFlipped.size > 3) {
        const toRemove = Array.from(newFlipped)
          .sort(() => Math.random() - 0.5)
          .slice(0, 1);
        toRemove.forEach(index => newFlipped.delete(index));
      }
      
      // Add new random tiles
      for (let i = 0; i < numToFlip; i++) {
        const randomIndex = Math.floor(Math.random() * TOTAL);
        newFlipped.add(randomIndex);
      }
      
      // Keep only last 10 flipped for performance
      const newArray = Array.from(newFlipped).slice(-10);
      setFlippedIndices(newArray);
    });
  }, [TOTAL, flippedIndices]);

  // Optimized animation intervals
  useEffect(() => {
    if (!isClient) return;

    const initialTimeout = setTimeout(() => {
      flipRandomTiles();
    }, 500);

    // Slower interval for better performance
    const intervalId = setInterval(flipRandomTiles, 1200);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [flipRandomTiles, isClient]);

  // Throttled mouse move handler
  useEffect(() => {
    if (!isClient) return;

    let lastCall = 0;
    const handleMouseMove = () => {
      const now = Date.now();
      if (now - lastCall > 300) { // Throttle to 300ms
        lastCall = now;
        if (Math.random() > 0.8) {
          flipRandomTiles();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [flipRandomTiles, isClient]);

  if (!isClient) {
    return (
      <div className="w-full aspect-[560px] max-h-[560px] bg-gray-200 animate-pulse rounded-lg" />
    );
  }

  return (
    <div className="w-full aspect-[560px] max-h-[560px] overflow-hidden">
      <div 
        className="grid gap-px" 
        style={{ 
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          transform: 'translateZ(0)' // GPU acceleration
        }}
      >
        {tiles.map((tile) => (
          <motion.div
            key={tile.id}
            className="relative aspect-square cursor-pointer"
            animate={{ rotateY: flippedIndices.includes(tile.id) ? 180 : 0 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeInOut"
            }}
            style={{ 
              transformStyle: "preserve-3d",
              willChange: "transform"
            }}
            onClick={() => {
              setFlippedIndices(prev => 
                prev.includes(tile.id) 
                  ? prev.filter(idx => idx !== tile.id)
                  : [...prev.slice(-9), tile.id]
              );
            }}
            whileHover={{ scale: 1.03 }}
          >
            <img
              src={tile.a}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover backface-hidden"
              draggable={false}
              alt={`Community impact ${tile.id + 1}`}
            />
            <img
              src={tile.b}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover rotate-y-180 backface-hidden"
              draggable={false}
              alt={`Community support ${tile.id + 1}`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AnimatedImageWall;