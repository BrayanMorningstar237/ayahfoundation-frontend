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
  HeartHandshake,
  Bookmark,
  Share2,
  Menu,
  X,
  ExternalLink,
  Mail,
  Phone
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

type RenderGroup =
  | { kind: "images"; items: AboutBlock[] }
  | { kind: "block"; item: AboutBlock };

function groupBlocks(blocks: AboutBlock[]): RenderGroup[] {
  const result: RenderGroup[] = [];
  let imageBuffer: AboutBlock[] = [];

  blocks.forEach((block) => {
    if (block.type === "image") {
      imageBuffer.push(block);
    } else {
      if (imageBuffer.length > 0) {
        result.push({ kind: "images", items: imageBuffer });
        imageBuffer = [];
      }
      result.push({ kind: "block", item: block });
    }
  });

  if (imageBuffer.length > 0) {
    result.push({ kind: "images", items: imageBuffer });
  }

  return result;
}

function renderSmartText(value: string) {
  const lines = value.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (!listBuffer.length) return;

    elements.push(
      <ul key={key} className="list-disc pl-5 space-y-2 text-gray-700">
        {listBuffer.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );

    listBuffer = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.replace(/^-\s*/, ""));
      return;
    }

    if (!trimmed) {
      flushList(`list-${index}`);
      return;
    }

    flushList(`list-${index}`);
    elements.push(
      <p key={`p-${index}`} className="text-gray-700 leading-relaxed">
        {trimmed}
      </p>
    );
  });

  flushList("list-end");

  return <div className="space-y-3">{elements}</div>;
}

const About = () => {
  const navigate = useNavigate();
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${API_URL}/public/sections/about`);
        const content = res.data?.content;

        if (!content) {
          throw new Error("Invalid data structure");
        }

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
    if (label.includes("Lives") || label.includes("Students")) return <Users className="w-4 h-4" />;
    if (label.includes("Families")) return <HeartHandshake className="w-4 h-4" />;
    if (label.includes("Projects")) return <Home className="w-4 h-4" />;
    if (label.includes("Volunteers")) return <Users2 className="w-4 h-4" />;
    if (label.includes("Years")) return <Calendar className="w-4 h-4" />;
    if (label.includes("Awards")) return <Award className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const handleSave = () => {
    setSaved(!saved);
    // In a real app, you would save to localStorage or API
    if (!saved) {
      localStorage.setItem('saved_about_page', 'true');
    } else {
      localStorage.removeItem('saved_about_page');
    }
  };

  const handleShare = async (method: 'clipboard' | 'email' | 'whatsapp' = 'clipboard') => {
    const url = window.location.href;
    const title = aboutData?.title || "Ayah Foundation";
    const text = aboutData?.intro || "Learn about our mission";

    try {
      switch (method) {
        case 'clipboard':
          await navigator.clipboard.writeText(url);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
          break;
        
        case 'email':
          window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`);
          break;
        
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${title}: ${url}`)}`);
          break;
      }
      setShareMenuOpen(false);
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: aboutData?.title,
          text: aboutData?.intro,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShareMenuOpen(!shareMenuOpen);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !aboutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error || "Content Not Available"}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
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
      {/* Navigation - Clean & Professional */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4">
          <div className="h-14 flex items-center justify-between">
            {/* Left: Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium p-2 -ml-2"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only sm:not-sr-only sm:text-sm">Back</span>
            </button>

            {/* Center: Brand */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <span className="text-base font-bold text-gray-900  -ml-10 md;ml-0">Ayah Foundation</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {/* Save Button */}
              <button
                onClick={handleSave}
                className="p-2 rounded-md hover:bg-gray-50 transition-colors relative"
                aria-label={saved ? "Remove from saved" : "Save this page"}
              >
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-blue-600 text-blue-600' : 'text-gray-600'}`} />
              </button>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={handleNativeShare}
                  className="p-2 rounded-md hover:bg-gray-50 transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                
                {/* Share Dropdown */}
                {shareMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => handleShare('clipboard')}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleShare('email')}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.5 3.5A10.5 10.5 0 0 0 3.5 14.5L2 22l7.5-1.5a10.5 10.5 0 0 0 5 1.3A10.5 10.5 0 0 0 20.5 3.5zM12 20a8.4 8.4 0 0 1-4.5-1.3l-.3-.2-3.1.6.6-3.1-.2-.3A8.5 8.5 0 1 1 12 20zm4.6-6.2c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.9 1-.2.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.3-1.3-1.5-.2-.2 0-.4.1-.5.1-.1.2-.2.3-.3.1-.1.2-.2.2-.3.1-.1.1-.2 0-.3 0-.2-.5-1.3-.7-1.8-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.4-.5 1.6-1 .2-.5.2-1 .1-1.2-.1-.3-.3-.4-.6-.5z"/>
                      </svg>
                      WhatsApp
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-50 transition-colors lg:hidden"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => navigate("/programs")}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md text-sm"
              >
                <Award className="w-4 h-4" />
                Programs
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md text-sm"
              >
                <Phone className="w-4 h-4" />
                Contact
              </button>
              <button
                onClick={() => navigate("/donation")}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium"
              >
                <Heart className="w-4 h-4" />
                Donate
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Copy Success Toast */}
      {copySuccess && (
        <div className="fixed top-20 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in">
          Link copied to clipboard!
        </div>
      )}

      {/* Main Content */}
      <main className="pb-16">
        {/* Hero Section */}
        <section className="px-4 pt-6 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
               
                {aboutData.badge}
              </span>
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
              {/* Left Column - Content */}
              <div className="lg:order-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {aboutData.title}
                </h1>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {aboutData.intro}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {aboutData.stats.slice(0, 4).map((stat) => (
                    <div
                      key={stat.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                          {getIconForLabel(stat.label)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xl font-bold text-gray-900 truncate">
                            {stat.number}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 font-medium truncate">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/donation")}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Support Our Mission
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate("/volunteer")}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    Get Involved
                  </button>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="mt-6 lg:mt-0 lg:order-2">
                <div className="relative">
                  <div className="rounded-xl overflow-hidden shadow-md">
                    <img
                      src={aboutData.image}
                      alt="About Ayah Foundation"
                      className="w-full h-64 md:h-80 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" text-anchor="middle" x="200" y="150"%3EAbout%20Ayah%20Foundation%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {/* Overlay Stat */}
                    <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-2 shadow-md">
                      <div className="text-xl font-bold text-blue-600">{aboutData.years}</div>
                      <div className="text-xs text-gray-600 font-medium">Years of Impact</div>
                    </div>
                  </div>

                  {/* Additional Images */}
                  {aboutData.blocks.filter((b): b is AboutBlock & { type: 'image' } => b.type === 'image').slice(0, 3).length > 0 && (
                    <div className="hidden sm:grid grid-cols-3 gap-3 mt-4">
                      {aboutData.blocks.filter((b): b is AboutBlock & { type: 'image' } => b.type === 'image').slice(0, 3).map((block, index) => (
                        <div key={block.id} className="rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={block.value}
                            alt={block.description || `Gallery image ${index + 1}`}
                            className="w-full h-20 object-cover"
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

        {/* Content Blocks */}
        <section className="px-4 py-10 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-10">
              {groupBlocks(aboutData.blocks).map((group, index) => {
                if (group.kind === "images") {
                  const cols =
                    group.items.length === 1
                      ? "grid-cols-1"
                      : group.items.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 md:grid-cols-3";

                  return (
                    <div key={`images-${index}`} className={`grid ${cols} gap-4`}>
                      {group.items.map((img, i) => (
                        <div key={img.id} className="rounded-lg overflow-hidden shadow-md">
                          <img
                            src={img.value}
                            alt={img.description || `Image ${i + 1}`}
                            className="w-full h-48 md:h-56 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="500"%3E%3Crect fill="%23e5e7eb" width="800" height="500"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" text-anchor="middle" x="400" y="250"%3EImage%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          {img.description && (
                            <div className="p-3 bg-white">
                              <p className="text-sm text-gray-600">{img.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }

                const block = group.item;

                if (block.type === "subtitle") {
                  return (
                    <div key={block.id} className="text-center">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        {block.value}
                      </h2>
                      <div className="w-16 h-0.5 bg-blue-600 mx-auto"></div>
                    </div>
                  );
                }

                if (block.type === "text") {
                  return (
                    <div
                      key={block.id}
                      className="bg-white p-5 md:p-6 rounded-lg shadow-sm"
                    >
                      {renderSmartText(block.value)}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </section>

        {/* Highlight Stats */}
        {aboutData.highlightStats && aboutData.highlightStats.length > 0 && (
          <section className="px-4 py-12 bg-blue-600">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Our Impact</h3>
                <div className="w-12 h-0.5 bg-blue-300 mx-auto"></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                {aboutData.highlightStats.map((stat) => (
                  <div key={stat.id} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-blue-100 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Join Us in Making a Difference
            </h3>
            <p className="text-gray-600 mb-6">
              Every contribution helps us continue our mission and expand our impact across communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/donate")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Donate Now
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/volunteer")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Volunteer
              </button>
            </div>
          </div>
        </section>
      </main>

      
    </div>
  );
};

export default About;