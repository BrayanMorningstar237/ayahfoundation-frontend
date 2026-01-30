import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface VideoItem {
  videoUrl: string;
  sourceId: string; // newsId or campaignId or successStoryId
  title: string;
  date: string;
  type: "news" | "campaignMain" | "campaignStory";
}

export default function VideoHighlights() {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    const newsFetch = fetch("https://ayahfoundation-backend.onrender.com/api/public/sections/news")
      .then(res => res.json())
      .then((data) => {
        const allNews = data?.content?.news ?? [];
        const newsVideos: VideoItem[] = [];

        allNews.forEach((news: any) => {
          news.blocks?.forEach((block: any) => {
            if (block.type === "video" && block.value) {
              newsVideos.push({
                videoUrl: block.value,
                sourceId: news.id,
                title: news.title,
                date: news.date,
                type: "news",
              });
            }
          });
        });

        return newsVideos;
      });

    const campaignsFetch = fetch("https://ayahfoundation-backend.onrender.com/api/public/sections/campaigns")
      .then(res => res.json())
      .then((data) => {
        const campaignsVideos: VideoItem[] = [];
        const content = data?.content;

        // Main campaign video
        if (content?.video?.videoUrl) {
          campaignsVideos.push({
            videoUrl: content.video.videoUrl,
            sourceId: data._id,
            title: content.video.title,
            date: data.updatedAt ?? "",
            type: "campaignMain",
          });
        }

        // Success stories with optional video blocks
        content?.successStories?.forEach((story: any) => {
          story.blocks?.forEach((block: any) => {
            if (block.type === "video" && block.videoUrl) {
              campaignsVideos.push({
                videoUrl: block.videoUrl,
                sourceId: story.id,
                title: story.title,
                date: data.updatedAt ?? "",
                type: "campaignStory",
              });
            }
          });
        });

        return campaignsVideos;
      });

    Promise.all([newsFetch, campaignsFetch])
      .then(([newsVideos, campaignsVideos]) => {
        setVideos([...newsVideos, ...campaignsVideos]);
      })
      .catch(err => console.error("Failed to load videos", err));
  }, []);

  if (!videos.length) return null;

  const getLink = (video: VideoItem) => {
    switch (video.type) {
      case "news":
        return `/news/${video.sourceId}`;
      case "campaignMain":
        return `/campaigns/${video.sourceId}`;
      case "campaignStory":
        return `/campaigns/${video.sourceId}`;
      default:
        return "#";
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
            Video Highlights
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            See Our Work in Action
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Watch videos from the field and follow the progress of our initiatives.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={`${video.sourceId}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl bg-gray-50"
            >
              <video
                src={video.videoUrl}
                controls
                className="w-full aspect-video object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <span className="text-xs text-gray-500 mb-2 block">
                  {video.date ? new Date(video.date).toLocaleDateString() : ""}
                </span>
                <Link
                  to={getLink(video)}
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition"
                >
                  View Full Update
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}