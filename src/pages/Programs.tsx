import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Heart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// Define proper TypeScript interfaces
interface ContentBlock {
  id: string;
  type: "text" | "image";
  value: string;
}

interface ProgramItem {
  id: string;
  title: string;
  type: "program" | "project";
  mainImage: string;
  description: string;
  stats: string;
  sectionId: string; // 👈 IMPORTANT
  blocks?: ContentBlock[];
  gallery?: string[];
}


const Programs = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ProgramItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No program/project ID provided");
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
  try {
    const res = await axios.get(`${API_URL}/public/sections/programs`);

    const sectionId = res.data?._id; // 👈 Mongo Section ID
    const list = res.data?.content?.programs || [];

    const found = list.find((p: ProgramItem) => p.id === id);

    if (!found) {
      setError("Program/Project not found");
    } else {
      setItem({
        ...found,
        sectionId // 👈 attach sectionId to item
      });
    }
  } catch (err) {
    console.error("Failed to load program/project", err);
    setError("Failed to load content. Please try again.");
  } finally {
    setLoading(false);
  }
};


    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            The program or project you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isProject = item.type === "project";

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 sm:h-16 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate flex-1">
              {item.title}
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main Image with responsive container */}
        <div className="mb-8">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 aspect-[16/9] sm:aspect-[21/9]">
            <img
              src={item.mainImage}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = 
                  '<div class="w-full h-full flex items-center justify-center text-gray-400">Image not available</div>';
              }}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {/* Stats Badge */}
          <span className="inline-block px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-medium text-sm">
            {item.stats}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {item.title}
          </h1>

          {/* Description */}
          <p className="text-gray-700 text-lg leading-relaxed">
            {item.description}
          </p>

          <div className="pt-4">
  <button
    onClick={() =>
      navigate("/donate", {
        state: {
          section: "programs",   // identify Programs
          objectId: item.id,
          title: item.title
        }
      })
    }
    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg hover:shadow-xl active:shadow-md"
  >
    <Heart className="w-5 h-5" fill="currentColor" />
    {isProject ? "Donate to this Project" : "Donate to this Program"}
  </button>
</div>


          {/* Content Blocks */}
          {item.blocks && item.blocks.length > 0 && (
            <div className="pt-8 space-y-8">
              {item.blocks.map((block) => {
                if (block.type === "text") {
                  return (
                    <p
                      key={block.id}
                      className="text-gray-700 text-lg leading-relaxed"
                    >
                      {block.value}
                    </p>
                  );
                }

                if (block.type === "image") {
                  return (
                    <div
                      key={block.id}
                      className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]"
                    >
                      <img
                        src={block.value}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = 
                              '<div class="w-full h-full flex items-center justify-center text-gray-400">Image not available</div>';
                          }
                        }}
                      />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}

          {/* Gallery Section */}
          {item.gallery && item.gallery.length > 0 && (
            <div className="pt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Related Images
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {item.gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]"
                  >
                    <img
                      src={img}
                      alt={`Gallery image ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = 
                            '<div class="w-full h-full flex items-center justify-center text-gray-400">Image not available</div>';
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Programs;