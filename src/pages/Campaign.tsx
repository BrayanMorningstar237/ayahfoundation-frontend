import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { motion, type Variants } from "framer-motion";


/* ================= TYPES ================= */

interface StoryBlock {
  text?: string;
}

interface SuccessStory {
  id: string;
  mainImage: string;
  title: string;
  description?: string;
  badge?: string;
  blocks?: StoryBlock[];
}

/* ================= SEO SCHEMA ================= */

function StorySchema({ story }: { story: SuccessStory }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.description || "",
    image: story.mainImage,
    author: {
      "@type": "Organization",
      name: "Ayah Foundation",
    },
    publisher: {
      "@type": "Organization",
      name: "Ayah Foundation",
    },
    mainEntityOfPage: window.location.href,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/* ================= ANIMATION VARIANTS ================= */

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // ✅ typed cubic-bezier (easeOutExpo style)
    },
  },
};


/* ================= COMPONENT ================= */

export default function Campaign() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sections/campaigns`
        );
        setStories(res.data?.content?.successStories ?? []);
      } catch (err) {
        console.error("Failed to load success stories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading stories…
      </div>
    );
  }

  const activeStory = id ? stories.find((s) => s.id === id) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= STICKY NAV ================= */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* ================= SINGLE STORY ================= */}
      {activeStory && (
        <>
          <StorySchema story={activeStory} />

          <article className="max-w-5xl mx-auto px-4 pb-20 pt-5">
            <img
              src={activeStory.mainImage}
              alt={activeStory.title}
              className="w-full h-[420px] object-cover rounded-3xl shadow-lg mb-12"
            />

            {activeStory.badge && (
              <span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                {activeStory.badge}
              </span>
            )}

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              {activeStory.title}
            </h1>

            {activeStory.description && (
              <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-3xl">
                {activeStory.description}
              </p>
            )}

            {Array.isArray(activeStory.blocks) &&
              activeStory.blocks.length > 0 && (
                <div className="space-y-8 max-w-3xl">
                  {activeStory.blocks.map((block, i) => (
                    <p
                      key={i}
                      className="text-lg text-gray-700 leading-relaxed"
                    >
                      {block.text}
                    </p>
                  ))}
                </div>
              )}
          </article>
        </>
      )}

      {/* ================= ALL STORIES ================= */}
      {!activeStory && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="text-center mb-20 relative">
  {/* Soft decorative glow */}
  <div className="absolute inset-0 -z-10 flex justify-center">
    <div className="w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />
  </div>

  {/* Title */}
  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
    Success Stories
  </h1>

  {/* Divider */}
  <div className="w-16 h-1 bg-blue-600 mx-auto mt-6 rounded-full" />

  {/* Subtext */}
  <p className="text-gray-600 mt-6 max-w-3xl mx-auto text-lg leading-relaxed">
    Behind every statistic is a human life. These are the real stories of people
    whose lives were transformed through compassion, education, and collective action.
  </p>

  {/* Brand */}
  <p className="mt-4 text-blue-600 font-semibold tracking-wide">
    Ayah Foundation
  </p>
</div>


          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {stories.map((story) => (
              <motion.div
                key={story.id}
                variants={cardVariants}
                onClick={() => navigate(`/campaigns/${story.id}`)}
                className="group cursor-pointer bg-white rounded-[2rem]
                           overflow-hidden shadow-sm hover:shadow-2xl
                           transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={story.mainImage}
                    alt={story.title}
                    className="w-full h-full object-cover
                               transition-transform duration-700
                               group-hover:scale-110"
                  />

                  {story.badge && (
                    <span className="absolute top-4 left-4 bg-white/90 px-4 py-1 rounded-full text-sm font-semibold shadow">
                      {story.badge}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                    {story.title}
                  </h3>

                  {story.description && (
                    <p className="text-gray-600 line-clamp-3 mb-6">
                      {story.description}
                    </p>
                  )}

                  <span className="inline-block font-semibold text-blue-600">
                    Read Full Story →
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}
