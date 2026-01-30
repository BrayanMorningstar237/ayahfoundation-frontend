import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface VideoItem {
  videoUrl?: string;   // for news/campaigns
  imageUrl?: string;   // for programs or fallback
  sourceId: string;    // newsId, campaignId, programId
  title: string;
  date?: string;
  type: "news" | "campaignMain" | "campaignStory" | "program";
}

export default function Highlights() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getLink = (item: VideoItem) => {
    switch (item.type) {
      case "news":
        return `/news/${item.sourceId}`;
      case "campaignMain":
      case "campaignStory":
        return `/campaigns/${item.sourceId}`;
      case "program":
        return `/programs/${item.sourceId}`;
      default:
        return "#";
    }
  };

  useEffect(() => {
    setLoading(true);

    const newsFetch = fetch("https://ayahfoundation-backend.onrender.com/api/public/news")
      .then(res => res.json())
      .then(data => (data || []).map((n: any) => ({
        videoUrl: n.videoUrl,
        imageUrl: n.thumbnail,
        sourceId: n._id,
        title: n.title,
        date: n.createdAt,
        type: "news" as const,
      })));

    const campaignsFetch = fetch("https://ayahfoundation-backend.onrender.com/api/public/campaigns")
      .then(res => res.json())
      .then(data => (data || []).map((c: any) => ({
        videoUrl: c.mainVideo,  // or c.videoUrl if different
        imageUrl: c.thumbnail,
        sourceId: c._id,
        title: c.title,
        date: c.createdAt,
        type: "campaignMain" as const,
      })));

    const programsFetch = fetch("https://ayahfoundation-backend.onrender.com/api/public/sections/programs")
      .then(res => res.json())
      .then(data => {
        const programs = data?.content?.programs ?? [];
        return programs.map((p: any) => ({
          imageUrl: p.mainImage,
          sourceId: p.id,
          title: p.title,
          date: data.updatedAt,
          type: "program" as const,
        }));
      });

    Promise.all([newsFetch, campaignsFetch, programsFetch])
      .then(([newsItems, campaignItems, programItems]) => {
        setItems([...newsItems, ...campaignItems, ...programItems]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch highlights:", err);
        setLoading(false);
      });

  }, []);

  if (loading) return <p className="text-center py-10">Loading highlights...</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Highlights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.sourceId + index}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.videoUrl ? (
              <video
                src={item.videoUrl}
                controls
                className="w-full aspect-video object-cover"
              />
            ) : (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full aspect-video object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
              <Link
                to={getLink(item)}
                className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}