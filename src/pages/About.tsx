import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Users,
  Heart,
  ChevronRight,
  TrendingUp,
  Calendar,
  Home,
  Users2,
  Award,
  HeartHandshakeIcon
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface StatItem {
  id: string;
  number: string;
  label: string;
}

interface AboutBlock {
  id: string;
  type: "subtitle" | "text" | "image";
  value: string;
  description?: string;
}

interface AboutData {
  badge: string;
  title: string;
  intro: string;
  image: string;
  years: string;
  stats: StatItem[];
  blocks: AboutBlock[];
  highlightStats?: StatItem[];
}

const About = () => {
  const navigate = useNavigate();
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${API_URL}/public/sections/about`);
        const content = res.data?.content;

        if (!content) {
          throw new Error("Invalid data structure");
        }

        // Process text blocks
        // const textBlocks = content?.blocks?.filter((b: any) => b.type === "text") || [];
       // const subtitles = content?.blocks?.filter((b: any) => b.type === "subtitle") || [];
        //const imageBlocks = content?.blocks?.filter((b: any) => b.type === "image") || [];

        // Combine stats: overlayStat + main stats
        const combinedStats = [
          content?.mainImage?.overlayStat,
          ...(content?.stats || [])
        ].filter(Boolean);

        setAboutData({
          badge: content?.header?.label || "About Us",
          title: content?.header?.title || "Ayah Foundation",
          intro: content?.header?.intro || "",
          image: content?.mainImage?.url || "",
          years: content?.mainImage?.overlayStat?.number || "5+",
          stats: combinedStats,
          blocks: content?.blocks || [],
          highlightStats: content?.highlightStats || [],
        });
      } catch (err) {
        console.error("Failed to load About section", err);
        setError("Unable to load about content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const getIconForLabel = (label: string) => {
    if (label.includes("Lives")) return <Users className="w-4 h-4" />;
    if (label.includes("Families")) return <HeartHandshakeIcon className="w-4 h-4" />;
    if (label.includes("Projects")) return <Home className="w-4 h-4" />;
    if (label.includes("Volunteers")) return <Users2 className="w-4 h-4" />;
    if (label.includes("Years")) return <Calendar className="w-4 h-4" />;
    if (label.includes("Partners")) return <Users className="w-4 h-4" />;
    if (label.includes("Awards")) return <Award className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !aboutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {error || "Content Not Available"}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2">
              
              <span className="text-sm font-bold text-gray-900 -ml-10">Ayah Foundation</span>
            </div>
            <div></div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column - Content */}
            <div className="order-2 lg:order-1">
              <div className="inline-block mb-4">
                <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <span className="text-blue-600 font-semibold">About</span>
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                {aboutData.title}
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
                {aboutData.intro}
              </p>

              {/* Stats Grid */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
  {aboutData.stats.slice(0, 4).map((stat, _index) => (
    <div
      key={stat.id}
      className="
        group
        bg-white
        p-4 sm:p-5
        rounded-2xl
        border border-gray-100
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        transition-all duration-300
        relative
        overflow-hidden
      "
    >
      {/* subtle accent glow */}
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          bg-gradient-to-br
          from-blue-50 via-transparent to-emerald-50
        "
      />

      <div className="relative flex items-center gap-3 mb-2">
        {/* Icon badge */}
        <div
          className="
            w-9 h-9
            rounded-xl
            flex items-center justify-center
            bg-gradient-to-br from-blue-100 to-blue-50
            text-blue-600
            ring-1 ring-blue-200/50
            group-hover:scale-110
            transition-transform duration-300
          "
        >
          {getIconForLabel(stat.label)}
        </div>

        <div>
          <div className="min-h-[3.5rem] flex items-center">
  <div
    className="
      text-2xl sm:text-3xl xl:text-[1.5rem]
      font-extrabold
      text-gray-900
      leading-none
      tracking-tight
      break-words
    "
  >
    {stat.number}
  </div>
</div>

          <div className="text-xs text-gray-600 font-medium">
            {stat.label}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

            </div>

            {/* Right Column - Image */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                {/* Main Image */}
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={aboutData.image}
                    alt="About Ayah Foundation"
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" text-anchor="middle" x="200" y="150"%3EImage%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {/* Overlay Stat */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                    <div className="text-2xl font-bold text-blue-600">{aboutData.years}</div>
                    <div className="text-xs font-medium text-gray-600">Years of Impact</div>
                  </div>
                </div>

                {/* Additional Images Grid */}
                {aboutData.blocks.filter((b): b is AboutBlock & { type: 'image' } => b.type === 'image').slice(0, 3).length > 0 && (
                  <div className="hidden sm:grid grid-cols-3 gap-4 mt-6">
                    {aboutData.blocks.filter((b): b is AboutBlock & { type: 'image' } => b.type === 'image').slice(0, 3).map((block, index) => (
                      <div key={block.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={block.value}
                          alt={block.description || `About image ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" text-anchor="middle" x="100" y="75"%3EImage%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Blocks Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-12">
            {aboutData.blocks.map((block) => {
              if (block.type === "subtitle") {
                return (
                  <div key={block.id} className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                      {block.value}
                    </h2>
                    <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
                  </div>
                );
              }

              if (block.type === "text") {
                return (
                  <div key={block.id} className="max-w-4xl mx-auto">
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed bg-white p-6 sm:p-8 rounded-xl shadow-sm">
                      {block.value}
                    </p>
                  </div>
                );
              }

              if (block.type === "image") {
                return (
                  <figure key={block.id} className="my-8">
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={block.value}
                        alt={block.description || "About Ayah Foundation"}
                        className="w-full h-64 sm:h-96 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="500"%3E%3Crect fill="%23e5e7eb" width="800" height="500"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" text-anchor="middle" x="400" y="250"%3EImage%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    {block.description && (
                      <figcaption className="mt-4 text-sm text-gray-600 text-center italic">
                        {block.description}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              return null;
            })}
          </div>
        </div>
      </section>

      

      {/* Highlight Stats */}
      {aboutData.highlightStats && aboutData.highlightStats.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-blue-600">
          <div className="max-w-7xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-8">
              {aboutData.highlightStats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-lg text-blue-100 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Join Us in Making a Difference
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Every contribution helps us continue our mission and expand our impact across communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
              Support Our Mission
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate("/contact")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
            >
              Get Involved
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;