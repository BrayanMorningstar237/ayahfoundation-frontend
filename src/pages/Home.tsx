import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Heart, ArrowRight, Menu, X, Globe, Play } from 'lucide-react';
import logoimg from "../assets/images/logo/AyahFoundation.jpeg";
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import type { PublicHero, WallImage } from '../services/hero.public.api';
import { HeroPublicAPI } from '../services/hero.public.api';
import { SectionsPublicAPI } from "../services/sections.public.api";
import { Link } from "react-router-dom";
import {
  Users,
  Home as HomeIcon,
  HandHeart,
} from "lucide-react";




function AnimatedImageWall({ images }: { images: WallImage[] }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [cols, setCols] = useState(8);
  const [hovered, setHovered] = useState<number | null>(null); // ✅ NEW

  /* -------------------------------------------
     Responsive columns
  --------------------------------------------*/
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 4 : w < 1024 ? 6 : 8);
    };

    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const safeImages = images?.length ? images : [];

  const total = useMemo(() => cols * Math.floor(cols / 1.8), [cols]);

  /* -------------------------------------------
     RANDOMIZED tiles
  --------------------------------------------*/
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

  /* -------------------------------------------
     Flip logic (pause on hover)
  --------------------------------------------*/
  const flipRandomTiles = useCallback(() => {
    if (hovered !== null) return; // ✅ pause flipping when hovering

    setFlipped(prev => {
      const next = new Set(prev);

      if (next.size > 6) {
        [...next]
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .forEach(i => next.delete(i));
      }

      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        next.add(Math.floor(Math.random() * total));
      }

      return new Set([...next].slice(-18));
    });
  }, [total, hovered]);

  /* -------------------------------------------
     Timed animation
  --------------------------------------------*/
  useEffect(() => {
    if (!tiles.length) return;

    const interval = setInterval(flipRandomTiles, 900);
    return () => clearInterval(interval);
  }, [flipRandomTiles, tiles.length]);

  /* -------------------------------------------
     Render
  --------------------------------------------*/
  if (!tiles.length) {
    return (
      <div className="h-[320px] flex items-center justify-center text-sm text-gray-400">
        Image wall unavailable
      </div>
    );
  }

  return (
    <div className="w-full max-h-[560px] overflow-visible">
      {/* ✅ overflow-visible so scaled tile is not clipped */}
      <div
        className="grid gap-px overflow-visible"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {tiles.map((img, i) => {
          const isFlipped = flipped.has(i);
          const isHovered = hovered === i;

          return (
            <motion.div
              key={i}
              className="relative aspect-square cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                zIndex: isHovered ? 20 : 1, // ✅ bring to front
              }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              whileHover={{
                scale: 1.35, // ✅ SCALE ON HOVER
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
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
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-6">
    <div className="text-center max-w-lg">
      <img
        src={logoimg}
        alt="Ayah Foundation"
        className="w-20 h-20 mx-auto mb-6 rounded-full"
      />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Website Under Construction
      </h1>

      <p className="text-gray-600 text-lg leading-relaxed mb-6">
        We’re currently making improvements behind the scenes.
        Our website will be up and running very soon.
      </p>

      <p className="text-sm text-gray-400">
        Thank you for your patience 💙
      </p>
    </div>
  </div>
);


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

  // =============================
  // UI STATE
  // =============================
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [videoModal, setVideoModal] = useState(false);

  const [impactStats, setImpactStats] = useState<
  {
    number: string;
    label: string;
    icon: React.ElementType;
  }[]
>([]);

  // =============================
  // LOAD HERO FROM BACKEND (PUBLIC)
  // =============================
  useEffect(() => {
   const loadHero = async () => {
    try {
      const data = await HeroPublicAPI.getHero();
      setHero(data);
      setBackendDown(false); // ✅ backend OK
    } catch (err) {
      console.error('Backend unreachable', err);
      setBackendDown(true); // 🚨 backend down
    } finally {
      setLoadingHero(false);
    }
  };

  loadHero();
}, []);

const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -80px 0px",
    }
  );
useEffect(() => {
  programs.forEach((_, index) => {
    const id = `animate-program-${index}`;
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}, [programs]);

useEffect(() => {
  if (loadingHero) return;

  

  const targets = document.querySelectorAll('[id^="animate-"]');
  targets.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}, [loadingHero]);

useEffect(() => {
  const loadStats = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/public/sections/about"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch About section");
    }

    const aboutSection = await response.json();

    // ✅ THIS IS THE ONLY CORRECT ARRAY
    const stats = aboutSection?.content?.stats ?? [];

    setImpactStats(
  stats.map((stat: any) => {
    const label = stat.label.toLowerCase();

    let icon = Globe; // fallback

    if (label.includes("life") || label.includes("lives")) {
      icon = Heart; // Lives Touched
    } else if (label.includes("famil")) {
      icon = HomeIcon; //  Families Supported
    } else if (label.includes("community")) {
      icon = HandHeart; // Community Projects
    } else if (label.includes("volunteer")) {
      icon = Users; // 👥 Volunteers Active
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

    console.log("🟢 RAW ABOUT SECTION:", section);

    const content = section?.content;
    if (!content) return;

    // extract blocks safely
    const subtitles = content.blocks?.filter((b: any) => b.type === "subtitle") ?? [];
    const texts = content.blocks?.filter((b: any) => b.type === "text") ?? [];

    setAboutData({
      // Header
      badge: content.header?.label,
      title: content.header?.title,
      intro: content.header?.intro,

      // Image
      image: content.mainImage?.url,
      years: content.mainImage?.overlayStat?.number,

      // Story content
      storyTitle: subtitles[0]?.value,
      storyParagraph1: texts[0]?.value,
      storyParagraph2: texts[1]?.value,

      // Highlight stats
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
        'http://localhost:5000/api/public/sections/programs'
      );
      const json = await res.json();

      console.log('🧠 RAW PROGRAMS RESPONSE:', json);

      const dbPrograms = json?.content?.programs ?? [];

      // 🔑 MAP DB → UI (NO UI CHANGE)
      const mappedPrograms = dbPrograms.map((p: any) => ({
  id: p.id,                 // ✅ ADD THIS LINE
  image: p.mainImage,
  stats: p.stats,
  title: p.title,
  description: p.description,
  gallery: p.gallery,
  blocks: p.blocks,
  type: p.type
}));


      console.log('🎯 PROGRAMS USED BY UI:', mappedPrograms);

      setPrograms(mappedPrograms);
    } catch (err) {
      console.error('Failed to load programs', err);
    }
  };
const loadNews = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/public/sections/news"
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
      "http://localhost:5000/api/public/sections/campaigns"
    );

    if (!res.ok) throw new Error("Failed to load campaigns");

    const section = await res.json();

    console.log("🟣 CAMPAIGNS SECTION:", section);

    setCampaignsSection(section);
    setSuccessStories(section?.content?.successStories ?? []);
  } catch (err) {
    console.error("Failed to load campaigns", err);
  }
};
const loadTeam = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/public/sections/team");
    if (!res.ok) throw new Error("Failed to load team");

    const section = await res.json();
    setTeamSection(section?.content);
  } catch (err) {
    console.error("Failed to load team", err);
  }
};
loadTeam();

loadCampaigns();
loadNews();
  loadPrograms();
loadAbout();
  loadStats();
}, []);





const featuredNews = newsItems.filter(n => n.featured);
const regularNews = newsItems.filter(n => !n.featured);

const teamMembers = teamSection?.members ?? [];

  

 


  // GUARD GOES HERE — RIGHT HERE
  if (loadingHero) return null;

if (backendDown) {
  return <UnderConstruction />;
}

if (!hero || !hero.enabled) return null;


  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Navigation */}
<nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    {/* Header */}
    <div className="h-20 grid grid-cols-3 items-center lg:flex lg:justify-between">
      
      {/* Logo */}
      <div className="flex items-center">
        <img src={logoimg} alt="AFLogo" height={44} width={44} />
       <span className="ml-2 font-brand text-[15px] sm:text-lg lg:text-2xl font-semibold tracking-tight text-gray-900">
  Ayah Foundation
</span>
      </div>
<div></div>
      
      {/* Mobile Menu Toggle (right column) */}
      <div className="flex justify-end lg:hidden">
        {/* Mobile Donate (center column) */}
      <div className="flex justify-center lg:hidden mr-5">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition">
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

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-8">
        <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition">HOME</a>
        <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition">ABOUT</a>
        <a href="#programs" className="text-gray-700 hover:text-blue-600 font-medium transition">PROGRAMS</a>
        <a href="#campaigns" className="text-gray-700 hover:text-blue-600 font-medium transition">CAMPAIGNS</a>
        <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition">CONTACT</a>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition">
          DONATE
        </button>
      </div>

    </div>
  </div>

  {/* Mobile Dropdown (NO donate here) */}
  {isMenuOpen && (
    <div className="lg:hidden bg-white border-t">
      <div className="px-4 py-6 space-y-4">
        <a href="#home" className="block text-gray-700 hover:text-blue-600 font-medium">HOME</a>
        <a href="#about" className="block text-gray-700 hover:text-blue-600 font-medium">ABOUT</a>
        <a href="#programs" className="block text-gray-700 hover:text-blue-600 font-medium">PROGRAMS</a>
        <a href="#campaigns" className="block text-gray-700 hover:text-blue-600 font-medium">CAMPAIGNS</a>
        <a href="#contact" className="block text-gray-700 hover:text-blue-600 font-medium">CONTACT</a>
      </div>
    </div>
  )}
</nav>


<section
  id="home"
  className="relative pt-14 sm:pt-20 pb-20 lg:px-8 min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white"
>
  {/* Soft background accent */}
  <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-blue-100 rounded-full blur-3xl opacity-50" />
  <div className="absolute bottom-0 -left-32 w-[320px] h-[320px] bg-blue-50 rounded-full blur-3xl opacity-60" />

  {/* 🔁 HERO STATE HANDLING */}
  {loadingHero ? (
    /* Loading state */
    <div className="relative w-full flex items-center justify-center h-[70vh] text-gray-400">
      Loading hero…
    </div>
  ) : hero?.enabled ? (
    /* ✅ ENABLED HERO */
    <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-14 items-center">
      
      {/* Text Block */}
      <div
        className="space-y-2 px-5 -mt-5 order-2 lg:order-1 text-center lg:text-left"
        style={{ animation: "fadeInLeft 1.1s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest uppercase text-blue-600/80">
          {hero.tagline}
        </span>

        <h1 className="font-extrabold text-[2.6rem] sm:text-5xl lg:text-[3.6rem] leading-[1.05] text-gray-900 tracking-tight">
          {hero.titleLine1}
          <span className="block mt-2 text-blue-600">
            {hero.titleLine2}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
          {hero.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-9 py-4 rounded-full font-semibold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5">
            {hero.donateButtonText}
          </button>

          <button
            onClick={() => setVideoModal(true)}
            className="bg-white/90 backdrop-blur border border-gray-200 text-gray-900 px-9 py-4 rounded-full font-semibold shadow transition transform hover:-translate-y-0.5"
          >
            {hero.watchButtonText}
          </button>
        </div>
      </div>

      {/* Image Wall */}
      <div
        className="relative order-1 lg:order-2 flex justify-center items-start"
        style={{ animation: "fadeInRight 1.1s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="relative w-full max-w-4xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg blur-xl -z-10" />

          <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
            <AnimatedImageWall images={hero.wallImages} />

            <div className="absolute z-50 left-1/2 bottom-4 -translate-x-1/2 w-80 bg-white/10 backdrop-blur-xsm border border-white/20 px-6 py-3 rounded-full shadow-lg pointer-events-none">
              <span className="text-sm font-bold text-white text-center block">
                Every pixel represents a life touched
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  ) : (
    /* 🚫 DISABLED HERO PLACEHOLDER */
    <div className="relative w-full flex items-center justify-center h-[70vh] bg-gray-50">
      <div className="text-center max-w-md">
        <p className="text-xs tracking-widest uppercase text-gray-400">
          Hero Section Disabled
        </p>
        <p className="mt-3 text-gray-500">
          This section is temporarily unavailable. Please check back soon.
        </p>
      </div>
    </div>
  )}
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
            {impactStats.map((stat, index: number) => {
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
          className="rounded-3xl shadow-2xl w-full h-96 object-cover"
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

        <p className="text-gray-600 leading-relaxed">
          {aboutData?.storyParagraph2}
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

    {/* Mission & Values stays unchanged */}
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

</section>


      {/* Programs Section */}
      <section 
        id="programs"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
              What We Do
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Current Programs & Projects
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Our comprehensive programs address the root causes of inequality through education, healthcare, and community development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
           {programs.map((program, index) => (
  <Link
    key={program.id}
    to={`/programs/${program.id}`}
    className="block"
  >
              <div
                key={index}
                id={`animate-program-${index}`}
                className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 ${
                  isVisible[`animate-program-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-64 overflow-hidden group">
                  <img 
                    src={program.image} 
                    alt={program.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-gray-900 inline-block">
                      {program.stats} 
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{program.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{program.description}</p>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center group">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
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

    {/* Main Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Featured News */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredNews.map((news, index) => (
          <Link
            key={news.id}
            to={`/news/${news.id}`}
            className={`relative group overflow-hidden rounded-3xl h-[420px] shadow-lg block
                        transition-all duration-700
                        ${isVisible['animate-news']
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-12'}`}
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <img
              src={news.heroImage}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover
                         transform group-hover:scale-105 transition-transform duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-t
                            from-black/80 via-black/40 to-transparent" />

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

      {/* Regular News */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {regularNews.map((news, index) => (
          <Link
            key={news.id}
            to={`/news/${news.id}`}
            className={`relative group overflow-hidden rounded-2xl h-[200px] shadow-md block
                        transition-all duration-700
                        ${isVisible['animate-news']
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-12'}`}
            style={{ transitionDelay: `${(index + featuredNews.length) * 120}ms` }}
          >
            <img
              src={news.heroImage}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover
                         transform group-hover:scale-110 transition-transform duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-t
                            from-black/80 to-transparent" />

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
    {/* Background blobs */}
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
        {/* Text */}
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

        {/* Video Card */}
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
        id="animate-success"
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 transition-all duration-1000 ${
          isVisible['animate-success'] ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
              Real Impact Stories
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Achievements & Success Stories
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              These stories represent the heart of our work, real people, real change, real hope for a better tomorrow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
  {successStories.map((story, index) => (
    <Link
      key={story.id}
      to={`/campaigns/${story.id}`}
      id={`animate-success-${index}`}
      className={`bg-white rounded-3xl overflow-hidden shadow-lg
                  hover:shadow-2xl transition-all duration-700
                  transform hover:-translate-y-3
                  ${isVisible['animate-success']
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-20'}`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden group">
        <img
          src={story.mainImage}
          alt={story.title}
          className="w-full h-full object-cover
                     transform group-hover:scale-110
                     transition-transform duration-700"
        />

        {/* Optional badge */}
        {story.badge && (
          <div className="absolute top-4 left-4 bg-white px-4 py-2
                          rounded-full text-sm font-bold text-gray-900">
            {story.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {story.title}
        </h3>

        {story.description && (
          <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
            {story.description}
          </p>
        )}

        {/* CTA BUTTON (NO PERCENTAGE) */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700
                     text-white py-3 rounded-full
                     font-bold transition-all duration-300
                     transform hover:scale-105"
        >
          Read Full Story
        </button>
      </div>
    </Link>
  ))}
</div>

{/* CTA */}
    <div
      className={`text-center mt-12 transition-all duration-700 delay-500
                  ${isVisible['animate-news']
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'}`}
    >
      <Link
        to="/campaigns"
        className="inline-flex items-center px-6 py-3 rounded-full
                   bg-blue-600 text-white font-semibold
                   hover:bg-blue-600 transition-colors"
      >
        All Success Stories 
        <i className="ri-arrow-right-wide-fill"></i>
      </Link>
    </div>
        </div>
      </section>

      
{/* Team Section */}
{teamMembers.length > 0 && (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-xs sm:text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
          {teamSection?.title}
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          {teamSection?.subtitle}
        </h2>
      </div>

      {/* Grid */}
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


                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Socials */}
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

              {/* Name */}
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
          <button className="group bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-12 py-6 rounded-full text-xl font-bold shadow-2xl transform hover:scale-110 transition-all duration-500 inline-flex items-center">
            <Heart className="w-7 h-7 mr-3 group-hover:fill-gray-900" />
            DONATE NOW
            <ArrowRight className="w-7 h-7 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
          </button>
          <p className="text-blue-100 mt-6">✓ 100% Secure Payment • Tax Deductible • Trusted by 5,000+ Donors</p>
        </div>
      </section>

      
      {/* Video Modal */}
      {videoModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setVideoModal(false)}
        >
          <div className="relative max-w-5xl w-full">
            <button 
              onClick={() => setVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-black rounded-2xl overflow-hidden aspect-video">
              {campaignVideo?.videoUrl ? (
  <iframe
    src={campaignVideo.videoUrl}
    className="w-full h-full"
    allow="autoplay; fullscreen"
    allowFullScreen
  />
) : (
  <img
    src={campaignVideo?.thumbnail}
    alt={campaignVideo?.title}
    className="w-full h-full object-cover"
  />
)}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </div>
              </div>
            </div>
            <p className="text-white text-center mt-4">Video player would be integrated here</p>
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

        /* CSS for backface-hidden and rotate-y-180 */
        .backface-hidden {
          backface-visibility: hidden;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Home;