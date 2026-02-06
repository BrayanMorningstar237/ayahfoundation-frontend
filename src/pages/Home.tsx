import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Heart, ArrowRight, Menu, X, Globe, Play } from 'lucide-react';
import logoimg from "../assets/images/logo/AyahFoundation.jpeg";
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import type { PublicHero, WallImage } from '../services/hero.public.api';
import { HeroPublicAPI } from '../services/hero.public.api';
import { SectionsPublicAPI } from "../services/sections.public.api";
import PayPalDonateModal from "./PayPalDonate";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Users,
  Home as HomeIcon,
  HandHeart,
} from "lucide-react";
import VideoHighlights from "./VideoHighlights";
interface AnimatedImageWallProps {
  images: WallImage[];
  height?: string; // optional
}
function AnimatedImageWall({ images, height }: AnimatedImageWallProps) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [cols, setCols] = useState(8);
  const [hovered, setHovered] = useState<number | null>(null);
  const [rows, setRows] = useState(1);

  // Determine number of columns based on screen width
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 640) setCols(4);
      else if (w < 1024) setCols(6);
      else setCols(8);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  // Calculate rows to fill screen with square tiles
  useEffect(() => {
    const updateRows = () => {
      const tileWidth = window.innerWidth / cols;
      const numRows = Math.ceil(window.innerHeight / tileWidth);
      setRows(numRows);
    };
    updateRows();
    window.addEventListener("resize", updateRows);
    return () => window.removeEventListener("resize", updateRows);
  }, [cols]);

  const safeImages = images?.length ? images : [];
  const total = cols * rows;

  const tiles = useMemo(() => {
    if (!safeImages.length) return [];
    return Array.from({ length: total }, () => {
      let a, b;
      do {
        a = safeImages[Math.floor(Math.random() * safeImages.length)].url;
        b = safeImages[Math.floor(Math.random() * safeImages.length)].url;
      } while (a === b);
      return { a, b };
    });
  }, [safeImages, total]);

  const flipRandomTiles = useCallback(() => {
    if (hovered !== null) return;

    setFlipped(prev => {
      const next = new Set(prev);

      if (next.size > 6) {
        [...next].sort(() => Math.random() - 0.5).slice(0, 2).forEach(i => next.delete(i));
      }

      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        next.add(Math.floor(Math.random() * total));
      }

      return new Set([...next].slice(-18));
    });
  }, [total, hovered]);

  useEffect(() => {
    if (!tiles.length) return;
    const interval = setInterval(flipRandomTiles, 900);
    return () => clearInterval(interval);
  }, [flipRandomTiles, tiles.length]);

  if (!tiles.length) return (
    <div className="h-screen flex items-center justify-center text-sm text-gray-400">
      Image wall unavailable
    </div>
  );

    return (
    <div className="w-full flex items-center justify-center overflow-hidden" style={{ height }}>
      <div
        className="grid w-full h-full gap-px"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {tiles.map((img, i) => {
          const isFlipped = flipped.has(i);
          const isHovered = hovered === i;

          return (
            <motion.div
              key={i}
              className="relative w-full h-full cursor-pointer"
              style={{ transformStyle: "preserve-3d", zIndex: isHovered ? 20 : 1 }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              whileHover={{ scale: 1.35 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
            >
              <img
                src={img.a}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover backface-hidden rounded-sm"
                draggable={false}
                alt=""
              />
              <img
                src={img.b}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover rotate-y-180 backface-hidden rounded-sm"
                draggable={false}
                alt=""
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );

}


const UnderConstruction = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6">
    <div className="text-center max-w-lg">
      <img
        src={logoimg}
        alt="Ayah Foundation"
        className="w-20 h-20 mx-auto mb-6 rounded-full shadow-md animate-pulse-slow"
      />
      <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        Website updates in progress
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        We're Improving Our Website
      </h1>
      <p className="text-gray-600 text-lg leading-relaxed mb-6">
        Ayah Foundation is currently rolling out updates to improve your
        experience and better share our impact.
        <br />
        <span className="font-medium text-gray-700">
          Everything will be back shortly.
        </span>
      </p>
      <p className="text-sm text-gray-400">
        Thank you for your patience and continued support 💙
      </p>
    </div>
  </div>
);

const isEmbedUrl = (url?: string) =>
  !!url && (url.includes('youtube') || url.includes('vimeo'));

const Home = () => {
  const [backendDown, setBackendDown] = useState(false);
  const [hero, setHero] = useState<PublicHero | null>(null);
  const [loadingHero, setLoadingHero] = useState(true);
  const [aboutData, setAboutData] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [campaignsSection, setCampaignsSection] = useState<any>(null);
  const campaignVideo = campaignsSection?.content?.video;
  const [teamSection, setTeamSection] = useState<any>(null);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [donateModal, setDonateModal] = useState(false);
const navigate = useNavigate();
  const [impactStats, setImpactStats] = useState<
    {
      number: string;
      label: string;
      icon: React.ElementType;
    }[]
  >([]);

  // UI STATE
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [videoModal, setVideoModal] = useState(false);

  // SINGLE IntersectionObserver instance
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedElementsRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
const hideFogTimeout = useRef<number | null>(null);

const [showLeftFog, setShowLeftFog] = useState(false);
const [showRightFog, setShowRightFog] = useState(false);
const [_isScrolling, setIsScrolling] = useState(false);


const handleScroll = () => {
  const el = scrollRef.current;
  if (!el) return;

  const { scrollLeft, scrollWidth, clientWidth } = el;

  // If no horizontal scroll possible → hide everything
  if (scrollWidth <= clientWidth) {
    setShowLeftFog(false);
    setShowRightFog(false);
    return;
  }

  // Show fog while scrolling
  setIsScrolling(true);
  setShowLeftFog(scrollLeft > 5);
  setShowRightFog(scrollLeft + clientWidth < scrollWidth - 5);

  // Clear previous hide timer
  if (hideFogTimeout.current) {
    window.clearTimeout(hideFogTimeout.current);
  }

  // Hide fog shortly after scroll stops
  hideFogTimeout.current = window.setTimeout(() => {
    setIsScrolling(false);
    setShowLeftFog(false);
    setShowRightFog(false);
  }, 900); // ← feels very natural (like video controls)
};


useEffect(() => {
  handleScroll();
}, [programs]);

  // Initialize the observer once
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
            // Unobserve after it becomes visible
            observerRef.current?.unobserve(entry.target);
            observedElementsRef.current.delete(entry.target.id);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "50px 0px -50px 0px", // Adjusted for better mobile detection
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Observe elements when they're added to the DOM
  const observeElement = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element && observerRef.current && !observedElementsRef.current.has(id)) {
      observerRef.current.observe(element);
      observedElementsRef.current.add(id);
    }
  }, []);

  // Observe all elements that need animation
  useEffect(() => {
    if (loadingHero) return;

    // Observe static sections
    const staticIds = [
      'animate-stats',
      'animate-about-image',
      'animate-about-text',
      'animate-news',
      'animate-success',
    ];

    staticIds.forEach(id => observeElement(id));

    // Observe program cards
    programs.forEach((_, index) => {
      observeElement(`animate-program-${index}`);
    });

    // Observe success story cards
    successStories.forEach((_, index) => {
      observeElement(`animate-success-${index}`);
    });

    // Re-check after a delay to catch any dynamically rendered elements
    const timeoutId = setTimeout(() => {
      staticIds.forEach(id => observeElement(id));
      programs.forEach((_, index) => {
        observeElement(`animate-program-${index}`);
      });
      successStories.forEach((_, index) => {
        observeElement(`animate-success-${index}`);
      });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadingHero, programs, successStories, observeElement]);

  // Also observe when elements are added/removed
  useEffect(() => {
    const mutationObserver = new MutationObserver(() => {
      // Check for any new elements that might have been added
      const allIds = [
        ...document.querySelectorAll('[id^="animate-"]'),
      ].map(el => el.id);

      allIds.forEach(id => observeElement(id));
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => mutationObserver.disconnect();
  }, [observeElement]);

  // LOAD HERO FROM BACKEND
  useEffect(() => {
    const loadHero = async () => {
      try {
        const data = await HeroPublicAPI.getHero();
        setHero(data);
        setBackendDown(false);
      } catch (err) {
        console.error('Backend unreachable', err);
        setBackendDown(true);
      } finally {
        setLoadingHero(false);
      }
    };

    loadHero();
  }, []);

  // LOAD ALL OTHER DATA
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(
          "https://ayahfoundation-backend.onrender.com/api/public/sections/about"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch About section");
        }

        const aboutSection = await response.json();
        const stats = aboutSection?.content?.stats ?? [];

        setImpactStats(
          stats.map((stat: any) => {
            const label = stat.label.toLowerCase();
            let icon = Globe;

            if (label.includes("life") || label.includes("lives")) {
              icon = Heart;
            } else if (label.includes("famil")) {
              icon = HomeIcon;
            } else if (label.includes("community")) {
              icon = HandHeart;
            } else if (label.includes("volunteer")) {
              icon = Users;
            }

            return {
              number: stat.number,
              label: stat.label,
              icon,
            };
          })
        );
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };

    const loadAbout = async () => {
      try {
        const section = await SectionsPublicAPI.getAbout();
        const content = section?.content;
        if (!content) return;

        const subtitles = content.blocks?.filter((b: any) => b.type === "subtitle") ?? [];
        const texts = content.blocks?.filter((b: any) => b.type === "text") ?? [];

        setAboutData({
          badge: content.header?.label,
          title: content.header?.title,
          intro: content.header?.intro,
          image: content.mainImage?.url,
          years: content.mainImage?.overlayStat?.number,
          storyTitle: subtitles[0]?.value,
          storyParagraph1: texts[0]?.value,
          storyParagraph2: texts[1]?.value,
          partnersCount: content.highlightStats?.[0]?.number,
          awardsCount: content.highlightStats?.[1]?.number,
        });
      } catch (err) {
        console.error("Failed to load about", err);
      }
    };

    const loadPrograms = async () => {
      try {
        const res = await fetch(
          'https://ayahfoundation-backend.onrender.com/api/public/sections/programs'
        );
        const json = await res.json();
        const dbPrograms = json?.content?.programs ?? [];

        const mappedPrograms = dbPrograms.map((p: any) => ({
          id: p.id,
          image: p.mainImage,
          stats: p.stats,
          title: p.title,
          description: p.description,
          gallery: p.gallery,
          blocks: p.blocks,
          type: p.type
        }));

        setPrograms(mappedPrograms);
      } catch (err) {
        console.error('Failed to load programs', err);
      }
    };

    const loadNews = async () => {
      try {
        const res = await fetch(
          "https://ayahfoundation-backend.onrender.com/api/public/sections/news"
        );
        const json = await res.json();

        const published = json?.content?.news?.filter(
          (n: any) => n.status === "published"
        ) ?? [];

        setNewsItems(published);
      } catch (err) {
        console.error("Failed to load news", err);
      }
    };

    const loadCampaigns = async () => {
      try {
        const res = await fetch(
          "https://ayahfoundation-backend.onrender.com/api/public/sections/campaigns"
        );
        if (!res.ok) throw new Error("Failed to load campaigns");
        const section = await res.json();
        setCampaignsSection(section);
        setSuccessStories(section?.content?.successStories ?? []);
      } catch (err) {
        console.error("Failed to load campaigns", err);
      }
    };

    const loadTeam = async () => {
      try {
        const res = await fetch("https://ayahfoundation-backend.onrender.com/api/public/sections/team");
        if (!res.ok) throw new Error("Failed to load team");
        const section = await res.json();
        setTeamSection(section?.content);
      } catch (err) {
        console.error("Failed to load team", err);
      }
    };

    loadStats();
    loadAbout();
    loadPrograms();
    loadNews();
    loadCampaigns();
    loadTeam();
  }, []);
  const [_imgHeight, setImgHeight] = useState("40vh");
 // Dynamically adjust height based on viewport (mobile-first)
  useEffect(() => {
    const updateHeight = () => {
      const width = window.innerWidth;
      if (width < 640) setImgHeight("40vh");
      else if (width < 1024) setImgHeight("55vh");
      else setImgHeight("60vh");
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const featuredNews = newsItems.filter(n => n.featured);
  const regularNews = newsItems.filter(n => !n.featured);
  const teamMembers = teamSection?.members ?? [];

  if (loadingHero) return null;
  if (backendDown) return <UnderConstruction />;
  if (!hero || !hero.enabled) return null;

  return (
    
    <div className="min-h-screen bg-white overflow-x-hidden">
      {donateModal && <PayPalDonateModal onClose={() => setDonateModal(false)} />}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 grid grid-cols-3 items-center lg:flex lg:justify-between">
            <div className="flex items-center">
              <img src={logoimg} alt="AFLogo" height={44} width={44} />
              <span className="ml-2 font-brand text-[15px] sm:text-lg lg:text-2xl font-semibold tracking-tight text-gray-900">
                AYAH FOUNDATION
              </span>
            </div>
            <div></div>
            <div className="flex justify-end lg:hidden">
              <div className="flex justify-center lg:hidden mr-5">
                <button onClick={() => navigate("/donate")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition">
                  DONATE
                </button>
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
  <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition">HOME</a>
  <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition">ABOUT</a>
  <a href="#programs" className="text-gray-700 hover:text-blue-600 font-medium transition">PROGRAMS</a>
  <a href="#campaigns" className="text-gray-700 hover:text-blue-600 font-medium transition">CAMPAIGNS</a>
  <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition">CONTACT</a>

  {/* Donations link */}
  <a href="/donors" className="text-gray-700 hover:text-blue-600 font-medium transition">
    DONATIONS
  </a>

  <button
    onClick={() => navigate("/donate")}
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition"
  >
    DONATE
  </button>
</div>

          </div>
          {isMenuOpen && (
            <div className="lg:hidden bg-white border-t">
              <div className="px-4 py-6 space-y-4">
                <a href="#home" className="block text-gray-700 hover:text-blue-600 font-medium">HOME</a>
                <a href="#about" className="block text-gray-700 hover:text-blue-600 font-medium">ABOUT</a>
                <a href="#programs" className="block text-gray-700 hover:text-blue-600 font-medium">PROGRAMS</a>
                <a href="#campaigns" className="block text-gray-700 hover:text-blue-600 font-medium">CAMPAIGNS</a>
                <a href="#contact" className="block text-gray-700 hover:text-blue-600 font-medium">CONTACT</a>
                {/* Donor link */}
  <a href="/donors" className="block text-gray-700 hover:text-blue-600 font-medium transition">
    DONATIONS
  </a>
              </div>
            </div>
          )}
        </div>
      </nav>

   {/* Hero Section */}
<section
  id="home"
  className="
    relative
    min-h-screen
    lg:h-screen
    flex
    items-center
    overflow-x-hidden
    bg-gradient-to-br from-teal-700 via-cyan-600 to-blue-800
    animate-slow-gradient
  "
>
  {/* Paper / Editorial Texture */}
  <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />

  {/* Decorative Panels (desktop only) */}
  <div className="hidden lg:block absolute left-0 top-0 h-full w-24 bg-white/10 pointer-events-none" />
  <div className="hidden lg:block absolute right-0 top-0 h-full w-16 bg-black/10 pointer-events-none" />

  {/* CONTENT WRAPPER */}
  <div
    className="
      relative
      max-w-7xl
      mx-auto
      px-6
      w-full
      flex flex-col-reverse
      gap-12
      items-center
      lg:grid lg:grid-cols-2
      lg:gap-16
      lg:items-center
    "
  >
    {/* LEFT — TEXT */}
    <div className="relative z-10 space-y-4 text-center lg:text-left lg:max-w-xl">
      <span className="inline-block text-xs tracking-[0.3em] uppercase text-cyan-200 font-semibold">
        {hero.tagline}
      </span>

      <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
        {hero.titleLine1}
        <span className="block mt-2">{hero.titleLine2}</span>
      </h1>

      <p className="text-cyan-100 text-base sm:text-lg max-w-md mx-auto lg:mx-0">
        {hero.description}
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-4">
        <button
          onClick={() => navigate("/donate")}
          className="
            bg-white text-[#1d73b4] font-semibold
            px-6 py-3 rounded-full
            hover:bg-blue-300 transition
          "
        >
          {hero.donateButtonText}
        </button>

        <button
          onClick={() => setVideoModal(true)}
          className="
            border border-white/40 text-white
            px-6 py-3 rounded-full
            hover:bg-white/10 transition
          "
        >
          {hero.watchButtonText}
        </button>
      </div>
      <div className="lg:hidden h-[100px]"></div>
    </div>

    {/* RIGHT — IMAGE WALL */}
    <div
      className="
        relative
        w-screen
        -mx-6
        sm:-mx-6
        lg:w-full
        lg:mx-0
        lg:h-full
        lg:justify-self-end
        lg:overflow-hidden
      "
    >
      <div className="relative w-full h-[40vh] sm:h-[50vh] lg:h-full">
        {/* Offset card (desktop only feel, harmless on mobile) */}
        <div className="absolute -top-4 -right-4 w-full h-full bg-cyan-400/30 rotate-2 scale-105 pointer-events-none" />

        {/* Main card */}
        <div className="relative bg-white overflow-hidden shadow-2xl rounded-none lg:rounded-l-xl h-full">
          <AnimatedImageWall
            images={hero.wallImages}
            height="100%"
          />

          {/* Caption */}
          <div className="absolute bottom-0 w-full bg-teal-800/80 backdrop-blur px-4 py-2">
            <p className="text-sm text-white font-semibold tracking-wide text-center">
              Ayah Foundation
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Bottom Wave */}
  <div className="absolute -bottom-10 w-full overflow-hidden leading-none pointer-events-none">
    <svg
      className="block w-full h-20 sm:h-28 md:h-32"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <path
        d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
        className="fill-white"
      />
    </svg>
  </div>
</section>



      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div
            id="animate-stats"
            className={`grid grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 ${
              isVisible['animate-stats'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
          >
            {impactStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 p-8 rounded-3xl text-center hover:bg-blue-50 transition-all duration-500 transform hover:-translate-y-2 group"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section
        id="about"
        className="py-20 px-5 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
              {aboutData?.badge}
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {aboutData?.title}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              {aboutData?.intro}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div
              id="animate-about-image"
              className={`relative transition-all duration-1000 ${
                isVisible['animate-about-image']
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-20'
              }`}
            >
              <img
                src={aboutData?.image}
                alt="Our team"
                className="rounded-3xl shadow-2xl w-full h-96 object-cover object-[50%_35%]"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 rounded-2xl shadow-xl">
                <div className="text-5xl font-bold">{aboutData?.years}</div>
                <div className="text-lg">Years of Impact</div>
              </div>
            </div>

            <div
              id="animate-about-text"
              className={`space-y-6 transition-all duration-1000 ${
                isVisible['animate-about-text']
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-20'
              }`}
            >
              <h3 className="text-3xl font-bold text-gray-900">
                {aboutData?.storyTitle}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {aboutData?.storyParagraph1}
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex-1 bg-blue-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">
                    {aboutData?.partnersCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    Partner Organizations
                  </div>
                </div>
                <div className="flex-1 bg-green-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">
                    {aboutData?.awardsCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    Awards Received
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 m-auto text-center">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full
                         bg-blue-600 text-white font-semibold
                         hover:bg-blue-700 transition"
            >
              Learn More About Us
              <i className="ri-arrow-right-wide-fill"></i>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Video Higlights */}
<VideoHighlights />

      {/* Programs & Projects Section */}
    <section
  id="programs"
  className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
>
  <div className="max-w-7xl mx-auto relative">
    {/* Header */}
    <div className="text-center mb-16">
      <span className="text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
        What We Do
      </span>
      <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
        Current Programs & Projects
      </h2>
      <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
        Our comprehensive programs address the root causes of inequality through
        education, healthcare, and community development.
      </p>
    </div>

    {/* Left fog */}
    <div
      className={`pointer-events-none absolute left-0 top-0 bottom-0 w-12
        bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent
        transition-opacity duration-500 ease-out z-10
        ${showLeftFog ? 'opacity-100' : 'opacity-0'}`}
    />

    {/* Right fog */}
    <div
      className={`pointer-events-none absolute right-0 top-0 bottom-0 w-12
        bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent
        transition-opacity duration-500 ease-out z-10
        ${showRightFog ? 'opacity-100' : 'opacity-0'}`}
    />

    {/* Scroll container */}
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="
        grid grid-flow-col gap-6
        overflow-x-auto pb-10
        snap-x snap-mandatory
        scrollbar-hide
        cursor-grab active:cursor-grabbing

        auto-cols-[85%]
        md:auto-cols-[22rem]
        md:grid-rows-2
        md:gap-8
        md:pr-[20%]
      "
    >
      {programs.map((program, index) => (
        <Link
          key={program.id}
          to={`/programs/${program.id}`}
          className="snap-start"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: index * 0.05, // subtle stagger
            }}
            className="
              h-full bg-white rounded-3xl overflow-hidden
              shadow-lg hover:shadow-2xl
              flex flex-col
            "
          >
            {/* Image */}
            <div className="relative h-48 shrink-0 overflow-hidden group">
              <img
                src={program.image}
                alt={program.title}
                className="
                  w-full h-full object-cover
                  transform group-hover:scale-110
                  transition-transform duration-700 overflow-hidden
                "
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm px-4 py-1
                  rounded-full text-sm font-bold text-gray-900">
                  {program.stats}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {program.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                {program.description}
              </p>

              <div className="mt-auto">
                <span className="inline-flex items-center text-blue-600 font-semibold group">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  </div>
</section>




      {/* News & Updates Section */}
<section
  id="animate-news"
  className={`py-20 px-4 sm:px-6 lg:px-8 bg-gray-50
              transition-all duration-1000
              ${isVisible['animate-news']
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'}`}
>
  <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="text-center mb-16 transition-all duration-1000 delay-150">
      <span className="text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
        News & Updates
      </span>
      <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
        Latest From the Field
      </h2>
      <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
        Real-time updates from our ongoing projects and community impact initiatives.
      </p>
    </div>

    {/* CONTENT GRID */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* FEATURED POSTS (LEFT) */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredNews.map((news, index) => (
          <Link
            key={news.id}
            to={`/news/${news.id}`}
            className={`relative group overflow-hidden rounded-3xl
                        h-[420px] w-full shadow-lg block
                        transition-all duration-700
                        ${isVisible['animate-news']
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-12'}`}
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            {/* Image */}
            <img
              src={news.heroImage}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover
                         group-hover:scale-105 transition-transform duration-700"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t
                            from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-xs uppercase tracking-widest text-yellow-400">
                {new Date(news.date).toLocaleDateString()}
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold mt-2 leading-tight">
                {news.title}
              </h3>
              {news.excerpt && (
                <p className="text-sm text-white/80 mt-2 line-clamp-2">
                  {news.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* REGULAR POSTS (RIGHT) — FLEX COLUMN (KEY FIX) */}
      <div className="flex flex-col gap-6">
        {regularNews.map((news, index) => (
          <Link
            key={news.id}
            to={`/news/${news.id}`}
            className={`relative group overflow-hidden rounded-2xl
                        h-[220px] shadow-md block
                        transition-all duration-700
                        ${isVisible['animate-news']
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-12'}`}
            style={{
              transitionDelay: `${(index + featuredNews.length) * 120}ms`,
            }}
          >
            {/* Image */}
            <img
              src={news.heroImage}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover
                         group-hover:scale-110 transition-transform duration-700"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t
                            from-black/85 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs uppercase tracking-widest text-yellow-400">
                {new Date(news.date).toLocaleDateString()}
              </span>
              <h4 className="text-base font-semibold mt-1 leading-snug line-clamp-2">
                {news.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div
      className={`text-center mt-12 transition-all duration-700 delay-500
                  ${isVisible['animate-news']
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'}`}
    >
      <Link
        to="/news"
        className="inline-flex items-center px-6 py-3 rounded-full
                   bg-yellow-600 text-white font-semibold
                   hover:bg-yellow-700 transition-colors"
      >
        View All Updates
        <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  </div>
</section>


      {/* Video Section */}
      {campaignVideo && (
        <motion.section
          id="campaigns"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 30, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"
            />
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-white space-y-6"
              >
                <span className="text-sm font-semibold text-blue-200 tracking-widest uppercase">
                  {campaignVideo.eyebrow}
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                  {campaignVideo.title}
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  {campaignVideo.description}
                </p>
                <button
                  onClick={() => setVideoModal(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg inline-flex items-center shadow-xl transition-transform duration-300 hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3 fill-blue-600" />
                  {campaignVideo.ctaText}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.03 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
                onClick={() => setVideoModal(true)}
              >
                <img
                  src={campaignVideo.thumbnail}
                  alt={campaignVideo.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center"
                  >
                    <Play className="w-10 h-10 text-blue-600 fill-blue-600 ml-1" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Success Stories */}
<section
        id="animate-news"
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-gray-50
                    transition-all duration-1000
                    ${isVisible['animate-news']
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-16'}`}
      >
  <div className="max-w-7xl mx-auto">

    {/* Header */}
    <div className="text-center mb-16">
      <span className="text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
        Real Impact Stories
      </span>
      <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
        Achievements & Success Stories
      </h2>
      <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
        These stories represent the heart of our work, real people, real change, real hope.
      </p>
    </div>

    {/* Cards */}
    <div className="grid md:grid-cols-3 gap-8">
      {successStories.map((story, index) => (
        <Link
          key={story.id}
          to={`/campaigns/${story.id}`}
          id={`animate-success-${index}`}
          className={`group h-full
            transition-all duration-700
            ${isVisible[`animate-success-${index}`]
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-20'}`}
          style={{ transitionDelay: `${index * 150}ms` }}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden shadow-lg
                       hover:shadow-2xl h-full
                       transform transition-all duration-700
                       hover:-translate-y-3
                       flex flex-col"
          >
            {/* IMAGE */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={story.mainImage}
                alt={story.title}
                className="w-full h-full object-cover
                           transform transition-transform duration-700
                           group-hover:scale-110"
              />

              {/* Emotional gradient */}
              <div className="absolute inset-0 bg-gradient-to-t
                              from-black/50 via-black/10 to-transparent" />

              {/* Badge */}
              {story.badge && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur
                                px-4 py-2 rounded-full text-sm font-bold text-gray-900">
                  {story.badge}
                </div>
              )}

              {/* Glow pulse */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                              transition duration-700
                              ring-2 ring-blue-400/30 rounded-3xl" />
            </div>

            {/* CONTENT */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {story.title}
              </h3>

              {story.description && (
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                  {story.description}
                </p>
              )}

              {/* CTA pushed to bottom */}
              <div className="mt-auto">
                <div
                  className="w-full text-center bg-blue-600 text-white
                             py-3 rounded-full font-semibold
                             transition-all duration-300
                             group-hover:bg-blue-700
                             group-hover:shadow-lg
                             group-hover:scale-[1.02]"
                >
                  Read Full Story
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>

    {/* CTA */}
    <div
      className={`text-center mt-14 transition-all duration-700 delay-500
                  ${isVisible['animate-success']
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'}`}
    >
      <Link
        to="/campaigns"
        className="inline-flex items-center px-8 py-4 rounded-full
                   bg-blue-600 text-white font-semibold
                   hover:bg-blue-700 transition"
      >
        All Success Stories
        <i className="ri-arrow-right-wide-fill ml-2"></i>
      </Link>
    </div>

  </div>
</section>


      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs sm:text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
                {teamSection?.title}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                {teamSection?.subtitle}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers
                .filter((m: any) => m.enabled)
                .map((member: any, index: number) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.85, rotateX: -15 }}
                    whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.15,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group cursor-pointer"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-3xl">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="absolute inset-0 w-full h-full
                                   object-cover
                                   transition-transform duration-700
                                   group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white
                                      transform translate-y-full group-hover:translate-y-0
                                      transition-transform duration-500">
                        <div className="flex gap-4 justify-center">
                          {member.socials?.facebook && (
                            <a
                              href={member.socials.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Facebook"
                              className="hover:scale-125 transition-transform"
                            >
                              <Facebook className="w-6 h-6 cursor-pointer text-white" />
                            </a>
                          )}
                          {member.socials?.twitter && (
                            <a
                              href={member.socials.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Twitter"
                              className="hover:scale-125 transition-transform"
                            >
                              <Twitter className="w-6 h-6 cursor-pointer text-white" />
                            </a>
                          )}
                          {member.socials?.linkedin && (
                            <a
                              href={member.socials.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="LinkedIn"
                              className="hover:scale-125 transition-transform"
                            >
                              <Linkedin className="w-6 h-6 cursor-pointer text-white" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 text-center">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-gray-600">{member.role}</p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <Heart className="w-20 h-20 text-white mx-auto mb-6 animate-pulse-slow" />
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Your Donation Means A Lot To Them
          </h2>
          <p className="text-xl text-blue-50 mb-8 leading-relaxed">
            Transform lives today. Every contribution creates ripples of hope that extend far beyond what we can imagine.
          </p>
          <button onClick={() => navigate("/donate")} className="group bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-12 py-6 rounded-full text-xl font-bold shadow-2xl transform hover:scale-110 transition-all duration-500 inline-flex items-center">
            <Heart className="w-7 h-7 mr-3 group-hover:fill-gray-900" />
            DONATE NOW
            <ArrowRight className="w-7 h-7 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
          </button>
          <p className="text-blue-100 mt-6">✓ 100% Secure Payment • Tax Deductible • Trusted by 5,000+ Donors</p>
        </div>
      </section>

      {/* Video Modal */}
      {videoModal && campaignVideo?.videoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
          onClick={() => setVideoModal(false)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoModal(false)}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
              aria-label="Close video"
            >
              <X className="w-7 h-7" />
            </button>
            {isEmbedUrl(campaignVideo.videoUrl) ? (
              <iframe
                src={`${campaignVideo.videoUrl}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={campaignVideo.videoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
              />
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 6s ease-in-out infinite 3s;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }
          @keyframes blueWhiteShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-blue-white {
  background-size: 300% 300%;
  animation: blueWhiteShift 16s ease-in-out infinite;
}

      `}</style>
    </div>
  );
};

export default Home;