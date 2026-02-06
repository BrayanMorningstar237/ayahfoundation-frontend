import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { motion, type Variants } from "framer-motion";

/* ================= TYPES ================= */

interface StoryBlock {
  id: string;
  type: "text" | "image" | "subtitle";
  text?: string;
  image?: string;
}

interface SuccessStory {
  id: string;
  mainImage: string;
  title: string;
  description?: string;
  badge?: string;
  blocks?: StoryBlock[];
}
interface Donation {
  _id: string;
  donorName?: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
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
      name: "Ayah Foundation"
    },
    publisher: {
      "@type": "Organization",
      name: "Ayah Foundation"
    },
    mainEntityOfPage: window.location.href
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/* ================= ANIMATIONS ================= */

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/* ================= COMPONENT ================= */
type GroupedBlock =
  | { type: "image-group"; blocks: StoryBlock[] }
  | StoryBlock;

function groupStoryBlocks(blocks: StoryBlock[]): GroupedBlock[] {
  const grouped: GroupedBlock[] = [];
  let buffer: StoryBlock[] = [];

  blocks.forEach(block => {
    if (block.type === "image") {
      buffer.push(block);
    } else {
      if (buffer.length) {
        grouped.push({ type: "image-group", blocks: buffer });
        buffer = [];
      }
      grouped.push(block);
    }
  });

  if (buffer.length) {
    grouped.push({ type: "image-group", blocks: buffer });
  }

  return grouped;
}

export default function Campaign() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
const [donations, setDonations] = useState<Donation[]>([]);
const [donationTotal, setDonationTotal] = useState(0);
const [donationsLoading, setDonationsLoading] = useState(true);
const [showAllDonations, setShowAllDonations] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sections/campaigns`
        );
        setStories(res.data?.content?.successStories ?? []);
      } catch (err) {
        console.error("Failed to load stories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

 

  const activeStory = id ? stories.find(s => s.id === id) : null;
useEffect(() => {
  if (!activeStory?.id) return;

  console.log("Fetching donations for story ID:", activeStory.id);

  const fetchDonations = async () => {
    try {
      setDonationsLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/donations`,
        {
          params: {
            sectionId: "69685f175a491ae8ca37ca36", // campaigns section ObjectId
            objectId: activeStory.id              // story id (UUID/string)
          }
        }
      );

      const completed = (res.data?.donations || []).filter(
        (d: Donation) =>
          d.status === "completed"
      );

      setDonations(completed);

      const total = completed.reduce(
        (sum: number, d: Donation) => sum + d.amount,
        0
      );

      setDonationTotal(total);

    } catch (err) {
      console.error("Failed to fetch donations", err);
    } finally {
      setDonationsLoading(false);
    }
  };

  fetchDonations();
}, [activeStory?.id]);


 if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading stories…
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ================= NAV ================= */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition py-2"
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

          <article className="mx-auto px-4 pt-6 pb-24 max-w-[1100px]">
            {/* Hero */}
            <img
              src={activeStory.mainImage}
              alt={activeStory.title}
              className="
                w-full
                aspect-[4/3]
                sm:aspect-[16/9]
                object-[50%_25%]
                object-cover
                rounded-3xl
                shadow-xl
                mb-12
              "
            />

            {/* Content */}
            <div className="max-w-prose mx-auto">
              {activeStory.badge && (
                <span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  {activeStory.badge}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                {activeStory.title}
              </h1>

              {activeStory.description && (
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-12">
                  {activeStory.description}
                </p>
              )}

              {Array.isArray(activeStory.blocks) && (
                <div className="space-y-12">
                  {groupStoryBlocks(activeStory.blocks).map((block, index) => {
  if ("type" in block && block.type === "image-group") {
    return (
      <div
        key={`image-group-${index}`}
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-6
          my-14
        "
      >
        {block.blocks.map(img => (
          <img
            key={img.id}
            src={img.image}
            alt=""
            loading="lazy"
            className="
              w-full
              aspect-[4/3]
              object-cover
              object-[50%_25%]
              rounded-2xl
              shadow-md
            "
          />
        ))}
      </div>
    );
  }

  switch (block.type) {
    case "subtitle":
      return (
        <h3
          key={block.id}
          className="text-xl sm:text-2xl font-semibold tracking-tight"
        >
          {block.text}
        </h3>
      );

    case "text":
      return (
        <p
          key={block.id}
          className="text-base sm:text-lg leading-relaxed text-gray-700"
        >
          {block.text}
        </p>
      );

    default:
      return null;
  }
})}

                </div>
              )}
            </div>
            <div className="flex justify-center">
          <button
  onClick={() =>
    navigate("/donate", {
      state: {
        section: "campaigns",
        objectId: activeStory.id,
        title: activeStory.title
      }
    })
  }
  className="
    mt-10
    inline-flex
    items-center
    justify-center
    px-8
    py-4
    rounded-full
    bg-blue-600
    text-white
    font-semibold
    hover:bg-blue-700
    transition
    m-auto
  "
>
  Take Action
</button>
</div>
          </article>
          

        </>
      )}

      {/* ================= ALL STORIES ================= */}
      {!activeStory && (
        <section className="max-w-7xl mx-auto px-4 pb-24">
          {/* Header */}
          <div className="text-center mb-20 relative">
            <div className="absolute inset-0 -z-10 flex justify-center">
              <div className="w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold">
              Success Stories
            </h1>

            <div className="w-16 h-1 bg-blue-600 mx-auto mt-6 rounded-full" />

            <p className="text-gray-600 mt-6 max-w-3xl mx-auto text-lg leading-relaxed">
              Behind every statistic is a human life. These are the real stories
              of people whose lives were transformed through compassion,
              education, and collective action.
            </p>

            <p className="mt-4 text-blue-600 font-semibold tracking-wide">
              Ayah Foundation
            </p>
          </div>

          {/* Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-8
              lg:gap-12
            "
          >
            {stories.map(story => (
              <motion.div
                key={story.id}
                variants={cardVariants}
                onClick={() => navigate(`/campaigns/${story.id}`)}
                className="
                  group
                  cursor-pointer
                  bg-white
                  rounded-3xl
                  overflow-hidden
                  shadow-sm
                  hover:shadow-2xl
                  transition-all
                  duration-500
                "
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={story.mainImage}
                    alt={story.title}
                    className="
                      w-full h-auto object-cover object-[50%_25%]
                      transition-transform duration-700
                      group-hover:scale-110
                    "
                  />

                  {story.badge && (
                    <span className="absolute top-4 left-4 bg-white/90 px-4 py-1 rounded-full text-sm font-semibold shadow">
                      {story.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition">
                    {story.title}
                  </h3>

                  {story.description && (
                    <p className="text-gray-600 line-clamp-3 mb-6">
                      {story.description}
                    </p>
                  )}

                  <span className="font-semibold text-blue-600">
                    Read Full Story →
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
        
      )}
      <div className="pt-12 pb-10 px-5 lg:max-w-[50%] m-auto">
  <h3 className="text-2xl font-bold text-gray-900 mb-6">Donations</h3>

  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <div>
      <p className="text-gray-700 text-lg">Total Donations Collected:</p>
      <p className="text-3xl font-extrabold text-green-700 mt-1">
        ${donationTotal.toFixed(2)}
      </p>
    </div>

    <div className="mt-4 sm:mt-0 w-full sm:w-48 h-32 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
      <img
        src={activeStory?.mainImage}
        alt={activeStory?.title}
        className="w-full h-full object-cover"
      />
    </div>
  </div>

  {donationsLoading && (
    <div className="py-6 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )}

  {!donationsLoading && donations.length === 0 && (
    <div className="text-center py-12 bg-gray-50 rounded-2xl shadow-sm">
      <p className="text-gray-500 mb-4">No donations yet. Be the first to support this campaign!</p>
      <button
        onClick={() =>
          navigate("/donate", {
            state: {
              section: "campaigns",
              objectId: activeStory?.id,
              title: activeStory?.title
            }
          })
        }
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 active:bg-blue-800 transition-shadow shadow-lg hover:shadow-xl"
      >
        Donate to this Campaign
      </button>
    </div>
  )}

  {!donationsLoading && donations.length > 0 && (
    <div className="space-y-3">
      {(showAllDonations ? donations : donations.slice(0, 5)).map((d) => (
        <div
          key={d._id}
          className="flex justify-between items-center p-4 rounded-lg bg-gray-50 border hover:bg-gray-100 transition"
        >
          <span className="font-medium text-gray-700">{d.donorName || "Anonymous"}</span>
          <span className="font-semibold text-green-700">
            ${(d.amount).toFixed(2)}
          </span>
        </div>
      ))}

      {donations.length > 5 && (
        <button
          onClick={() => setShowAllDonations(!showAllDonations)}
          className="mt-4 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          {showAllDonations ? "Show Less" : "View All"}
        </button>
      )}
    </div>
  )}
</div>

    </div>
  );
}
