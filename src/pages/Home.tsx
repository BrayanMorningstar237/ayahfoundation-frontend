import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Heart, Users, Handshake, ArrowRight, Menu, X, Globe, Award, Target, Play } from 'lucide-react';
import logoimg from "../assets/images/logo/AyahFoundation.jpeg";
import { Facebook, Twitter, Linkedin } from 'lucide-react';
// Import 16 local images
import wallimg1 from "../assets/images/wall frame/frame_wall_img (1).png";
import wallimg2 from "../assets/images/wall frame/frame_wall_img (2).jpg";
import wallimg5 from "../assets/images/wall frame/frame_wall_img (5).jpg";
import wallimg6 from "../assets/images/wall frame/frame_wall_img (6).jpg";
import wallimg7 from "../assets/images/wall frame/frame_wall_img (7).jpg";
import wallimg8 from "../assets/images/wall frame/frame_wall_img (1).jpg";
import wallimg9 from "../assets/images/wall frame/frame_wall_img (9).jpg";
// Array of local images
const IMAGES = [
  wallimg1,
  wallimg2,
  wallimg5,
  wallimg6,
  wallimg7,
  wallimg8,
  wallimg9
];



function AnimatedImageWall() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [cols, setCols] = useState(8);

  /* -------------------------------------------
     Responsive columns (computed once + resize)
  --------------------------------------------*/
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 4 : w < 1024 ? 8 : 8);
    };

    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const total = useMemo(
    () => cols * Math.floor(cols / 1.8),
    [cols]
  );

  /* -------------------------------------------
     Static tiles (no flip dependency)
  --------------------------------------------*/
  const tiles = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => ({
        a: IMAGES[i % IMAGES.length],
        b: IMAGES[(i + 3) % IMAGES.length],
      })),
    [total]
  );

  /* -------------------------------------------
     Flip logic (efficient + capped)
  --------------------------------------------*/
  const flipRandomTiles = useCallback(() => {
    setFlipped(prev => {
      const next = new Set(prev);

      // Random removals
      if (next.size > 5) {
        [...next]
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .forEach(i => next.delete(i));
      }

      // Random additions
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        next.add(Math.floor(Math.random() * total));
      }

      // Cap size
      return new Set([...next].slice(-15));
    });
  }, [total]);

  /* -------------------------------------------
     Timed animation
  --------------------------------------------*/
  useEffect(() => {
    const timeout = setTimeout(flipRandomTiles, 700);
    const interval = setInterval(flipRandomTiles, 800);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [flipRandomTiles]);

  /* -------------------------------------------
     Mouse interaction (throttled by chance)
  --------------------------------------------*/
  useEffect(() => {
    const onMove = () => Math.random() > 0.7 && flipRandomTiles();
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [flipRandomTiles]);

  /* -------------------------------------------
     Render
  --------------------------------------------*/
  return (
    <div className="w-full max-h-[560px] overflow-hidden">
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {tiles.map((img, i) => {
          const isFlipped = flipped.has(i);

          return (
            <motion.div
              key={i}
              className="relative aspect-square cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                type: "spring",
                stiffness: 50,
                damping: 10,
              }}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() =>
                setFlipped(prev => {
                  const next = new Set(prev);
                  next.has(i) ? next.delete(i) : next.add(i);
                  return next;
                })
              }
              whileHover={{ scale: 1.4 }}
            >
              <motion.img
                src={img.a}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover backface-hidden"
                draggable={false}
                alt=""
              />
              <motion.img
                src={img.b}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover rotate-y-180 backface-hidden"
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


const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [videoModal, setVideoModal] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[id^="animate-"]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const impactStats = [
    { number: "5,000+", label: "Lives Touched", icon: Users },
    { number: "150+", label: "Families Supported", icon: Heart },
    { number: "20+", label: "Community Projects", icon: Handshake },
    { number: "50+", label: "Volunteers Active", icon: Globe },
  ];
const newsUpdates = [
  {
    title: "Mobile Health Outreach Reaches 5 New Communities",
    date: "Jan 2026",
    image: "https://www.afro.who.int/sites/default/files/2022-09/Saratu%2C%20a%20member%20of%20the%20Mobile%20health%20team%20providing%20essential%20health%20service%20in%20a%20nomadic%20setting%20in%20Yobe%20state..jpg",
    featured: true,
  },
  {
    title: "Emergency Food Distribution Launched",
    date: "Jan 2026",
    image: "https://cameroon.un.org/sites/default/files/styles/featured_image/public/2023-02/n.JPG?itok=aqT5pPGN",
    featured: true,
  },
  {
    title: "Clean Water Project Phase II Begins",
    date: "Dec 2025",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Clean Water Project Phase II Begins",
    date: "Dec 2025",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80",
  }
];

const featuredNews = newsUpdates.filter(n => n.featured);
const regularNews = newsUpdates.filter(n => !n.featured);



  const causes = [
    {
      title: "They are Waiting For Warm Help.",
      raised: 25270,
      goal: 30000,
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop",
      category: "Education"
    },
    {
      title: "Changing Lives One Meal at a Time.",
      raised: 14730,
      goal: 20000,
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop",
      category: "Food Security"
    },
    {
      title: "Let's Build Hope in Every Community.",
      raised: 18500,
      goal: 25000,
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop",
      category: "Healthcare"
    }
  ];

  const missionValues = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To empower underserved communities through sustainable development, education, and healthcare initiatives that create lasting positive change."
    },
    {
      icon: Heart,
      title: "Our Vision",
      description: "A Cameroon where every individual has equal access to opportunities, education, and healthcare regardless of their background."
    },
    {
      icon: Award,
      title: "Our Values",
      description: "Integrity, compassion, sustainability, and community-driven approaches guide everything we do."
    }
  ];

  const programs = [
    {
      title: "Education Programs",
      description: "Providing scholarships, school supplies, and learning centers for children in remote areas.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
      stats: "2,000+ students supported"
    },
    {
      title: "Healthcare Initiatives",
      description: "Mobile clinics, health awareness campaigns, and medical supply distribution to rural communities.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
      stats: "3,500+ patients treated"
    },
    {
      title: "Community Development",
      description: "Building infrastructure, clean water systems, and vocational training centers.",
      image: "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=600&h=400&fit=crop",
      stats: "15 villages transformed"
    }
  ];

  const successStories = [
    {
      name: "Amina's Story",
      role: "Scholarship Recipient",
      story: "From struggling to afford school supplies to becoming the top student in her class, Amina's journey shows the power of educational support.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop",
      achievement: "Now studying Medicine"
    },
    {
      name: "Douala Village Project",
      role: "Community Impact",
      story: "Installation of a clean water system transformed daily life for 800 families, reducing disease by 70% and freeing up time for education.",
      image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=300&h=300&fit=crop",
      achievement: "800+ families impacted"
    },
    {
      name: "Youth Skills Program",
      role: "Vocational Training",
      story: "120 young adults gained marketable skills in carpentry, tailoring, and technology, with 85% now earning sustainable incomes.",
      image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=300&h=300&fit=crop",
      achievement: "85% employment rate"
    }
  ];
const teamMembers = [
    {
      name: "Dr. Emmanuel Ayah",
      role: "Founder & Executive Director",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
    },
    {
      name: "Grace Mbella",
      role: "Program Coordinator",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
    },
    {
      name: "Jean-Paul Nkeng",
      role: "Community Outreach Lead",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
    }
  ];
  
  return (
    <div className="min-h-screen bg-white overflow-hidden">
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

  <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-14  items-center">
    
    {/* Text Block */}
    <div
      className="space-y-2 px-5 -mt-5 order-2 lg:order-1 text-center lg:text-left"
      style={{ animation: "fadeInLeft 1.1s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest uppercase text-blue-600/80">
        Ayah Foundation
      </span>

      <h1 className="font-extrabold text-[2.6rem] sm:text-5xl lg:text-[3.6rem] leading-[1.05] text-gray-900 tracking-tight">
        Life begins
        <span className="block mt-2 text-blue-600">
          where inequality ends
        </span>
      </h1>

      <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
        We work alongside communities to expand access to education,
        healthcare, and sustainable opportunities that create lasting impact.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-9 py-4 rounded-full font-semibold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5">
          Donate Now
        </button>

        <button
          onClick={() => setVideoModal(true)}
          className="bg-white/90 backdrop-blur border border-gray-200 text-gray-900 px-9 py-4 rounded-full font-semibold shadow transition transform hover:-translate-y-0.5"
        >
          Watch Our Story
        </button>
      </div>
    </div>

    {/* Animated Image Wall Block */}
<div
  className="relative order-1 lg:order-2 flex justify-center items-start m-0 p-0"
  style={{ animation: "fadeInRight 1.1s cubic-bezier(0.16, 1, 0.3, 1)" }}
>
  <div className="relative w-full max-w-4xl overflow-hidden">
    {/* Decorative dots */}
    <div className="absolute -top-6 -left-6 w-4 h-4 lg:w-5 lg:h-5 bg-orange-500 rounded-full z-10" />
    <div className="absolute top-1/4 -right-10 w-3 h-3 lg:w-4 lg:h-4 bg-green-400 rounded-full z-10" />
    <div className="absolute bottom-1/3 -left-10 w-3 h-3 lg:w-4 lg:h-4 bg-blue-400 rounded-full z-10" />
    <div className="absolute -bottom-20 right-5 w-6 h-6 lg:w-8 lg:h-8 bg-orange-400 rounded-full z-10" />

    {/* Background glow (contained, no overflow) */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg blur-xl -z-10" />

    {/* Image wall */}
    <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm ">
      <AnimatedImageWall />

      {/* Overlay text */}
      <div className="absolute left-1/2 bottom-4 -translate-x-1/2 w-80 bg-white/10 backdrop-blur-[1.2px] border border-white/20 px-6 py-3 rounded-full shadow-lg pointer-events-none">
        <span className="text-sm font-bold text-white text-center block">
          Every pixel represents a life touched
        </span>
      </div>
    </div>
  </div>
</div>

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
              Who We Are
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About Ayah Foundation
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Founded in the heart of Cameroon, Ayah Foundation is a beacon of hope dedicated to transforming lives through sustainable development, education, and community empowerment.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div 
              id="animate-about-image"
              className={`relative transition-all duration-1000 ${
                isVisible['animate-about-image'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
              }`}
            >
              <img 
                src="https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800&h=600&fit=crop" 
                alt="Our team"
                className="rounded-3xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 rounded-2xl shadow-xl">
                <div className="text-5xl font-bold">8+</div>
                <div className="text-lg">Years of Impact</div>
              </div>
            </div>
            
            <div 
              id="animate-about-text"
              className={`space-y-6 transition-all duration-1000 ${
                isVisible['animate-about-text'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
              }`}
            >
              <h3 className="text-3xl font-bold text-gray-900">Our Story</h3>
              <p className="text-gray-600 leading-relaxed">
                What began as a small grassroots initiative in 2018 has blossomed into a comprehensive organization serving thousands across Cameroon. Our founders, moved by the disparities they witnessed in rural communities, committed to creating sustainable change.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we work hand-in-hand with communities, ensuring that our programs are culturally sensitive, locally driven, and designed for long-term impact. Every project we undertake is guided by the voices and needs of those we serve.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex-1 bg-blue-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">150+</div>
                  <div className="text-sm text-gray-600">Partner Organizations</div>
                </div>
                <div className="flex-1 bg-green-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">25+</div>
                  <div className="text-sm text-gray-600">Awards Received</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Values */}
          <div 
            id="animate-mission-values"
            className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 ${
              isVisible['animate-mission-values'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
          >
            {missionValues.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <Icon className="w-16 h-16 text-blue-600 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
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
            ))}
          </div>
        </div>
      </section>

{/* News & Updates Section */}
<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
  <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="text-center mb-16">
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

      {/* Featured News (left / main) */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredNews.map((news, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-3xl h-[420px] shadow-lg"
          >
            <img
              src={news.image}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-sm uppercase tracking-widest text-yellow-400">
                {news.date}
              </span>
              <h3 className="text-3xl font-bold mt-2 leading-tight">
                {news.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Side / Regular News (right column) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {regularNews.map((news, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-2xl h-[200px] shadow-md"
          >
            <img
              src={news.image}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs uppercase tracking-widest text-yellow-400">
                {news.date}
              </span>
              <h4 className="text-lg font-semibold mt-1 leading-snug">
                {news.title}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div className="text-center mt-12">
      <button className="inline-flex items-center px-6 py-3 rounded-full bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition-colors">
        View All Updates
        <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  </div>
</section>


      {/* Video Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <span className="text-sm font-semibold text-blue-200 tracking-widest uppercase">
                See Our Impact
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                Watch How We're Changing Lives
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Take a journey through our communities and witness the transformative power of collective action. Every story is a testament to resilience and hope.
              </p>
              <button 
                onClick={() => setVideoModal(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg inline-flex items-center shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Play className="w-6 h-6 mr-3 fill-blue-600" />
                Watch Full Story
              </button>
            </div>

            <div 
              className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
              onClick={() => setVideoModal(true)}
            >
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop"
                alt="Video thumbnail"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-10 h-10 text-blue-600 fill-blue-600 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              These stories represent the heart of our work—real people, real change, real hope for a better tomorrow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div
                key={index}
                className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 ${
                  isVisible['animate-success'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={story.image} 
                    alt={story.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    {story.achievement}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{story.name}</h3>
                  <p className="text-blue-600 font-semibold mb-4">{story.role}</p>
                  <p className="text-gray-600 leading-relaxed">{story.story}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section 
        id="campaigns"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
              Be a Helping Hand
            </span>
            <h2 
              id="animate-campaigns"
              className={`text-4xl sm:text-5xl font-bold text-gray-900 transition-all duration-1000 ${
                isVisible['animate-campaigns'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              Featured Campaigns
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Join us in making a difference. Every contribution brings us closer to our goals and changes lives in meaningful ways.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {causes.map((cause, index) => {
              const percentage = (cause.raised / cause.goal) * 100;
              return (
                <div
                  key={index}
                  id={`animate-cause-${index}`}
                  className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 ${
                    isVisible[`animate-cause-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="relative h-64 overflow-hidden group">
                    <img 
                      src={cause.image} 
                      alt={cause.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full text-sm font-bold text-gray-900">
                      {cause.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{cause.title}</h3>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-900">${cause.raised.toLocaleString()}</span>
                        <span className="text-gray-600">raised of ${cause.goal.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-3xl font-bold text-gray-900">{Math.round(percentage)}%</span>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105">
                      Donate Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
{/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs sm:text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block animate-bounce-slow">
              Meet Our Team
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              The People Behind the Mission
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
              Dedicated professionals working tirelessly to create positive change in communities across Cameroon.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                id={`animate-team-${index}`}
                className={`group cursor-pointer transition-all duration-700 ${
                  isVisible[`animate-team-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex gap-4 justify-center">
                      <Facebook className="w-6 h-6 hover:scale-125 transition-transform cursor-pointer" />
                      <Twitter className="w-6 h-6 hover:scale-125 transition-transform cursor-pointer" />
                      <Linkedin className="w-6 h-6 hover:scale-125 transition-transform cursor-pointer" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=675&fit=crop"
                alt="Video placeholder"
                className="w-full h-full object-cover"
              />
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