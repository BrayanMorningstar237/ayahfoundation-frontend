import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, ChevronRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

type NewsBlock = {
  id: string;
  type?: "text" | "image" | "video";
  value: string;
  description?: string;
};

const News = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [allNews, setAllNews] = useState<any[]>([]);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const res = await fetch(`${API_URL}/public/sections/news`);
      const json = await res.json();

      const news = json?.content?.news || [];
      setAllNews(news);

      if (id) {
        setArticle(news.find((n: any) => n.id === id));
      } else {
        setArticle(null);
      }

      setLoading(false);
    };

    load();
  }, [id]);

  return (
    <>
      {/* ===== STICKY NAVBAR ===== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <span className="text-sm font-semibold text-gray-900 truncate max-w-[60%]">
            {article ? article.title : "News & Updates"}
          </span>
        </div>
      </header>

      {/* ===== LOADING ===== */}
      {loading && (
        <div className="py-32 text-center text-gray-500">
          Loading…
        </div>
      )}

      {/* ===== ALL NEWS PAGE ===== */}
      {!loading && !id && (
        <section className="pt-20 pb-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mb-10 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                News & Updates
              </h1>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Stories, impact updates, and announcements from Ayah Foundation.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {allNews.map(n => (
                <Link
                  key={n.id}
                  to={`/news/${n.id}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition"
                >
                  <div className="h-52 bg-gray-100 overflow-hidden">
                    <img
                      src={n.heroImage}
                      alt={n.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(n.date).toLocaleDateString()}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {n.title}
                    </h3>

                    {n.subtitle && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {n.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SINGLE ARTICLE PAGE ===== */}
      {!loading && id && article && (
        <section className="pb-24 bg-gray-50">
          <div className="max-w-7xl mx-auto pt-10 grid lg:grid-cols-12 gap-10 px-4 sm:px-6 lg:px-8">

            {/* ARTICLE */}
            <article className="lg:col-span-8 bg-white rounded-3xl shadow-sm overflow-hidden">

              {article.heroImage && (
                <div className="bg-gray-100">
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    className="w-full max-h-[520px] object-contain mx-auto"
                  />
                </div>
              )}

              <div className="p-6 sm:p-10">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.date).toLocaleDateString()}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
                  {article.title}
                </h1>

                {article.subtitle && (
                  <p className="text-xl text-gray-600 mb-8">
                    {article.subtitle}
                  </p>
                )}

                {/* ===== BLOCKS ===== */}
                <div className="space-y-8">
                  {article.blocks?.map((block: NewsBlock) => {

                    // IMAGE
                    if (block.type === "image") {
                      return (
                        <figure key={block.id}>
                          <img
                            src={block.value}
                            alt={block.description || ""}
                            className="w-full rounded-2xl bg-gray-100"
                          />
                          {block.description && (
                            <figcaption className="text-sm text-gray-500 text-center mt-2 italic">
                              {block.description}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }

                    // VIDEO
                    if (block.type === "video") {
                      return (
                        <div
                          key={block.id}
                          className="w-full rounded-2xl overflow-hidden bg-black"
                        >
                          <video
                            src={block.value}
                            controls
                            preload="metadata"
                            className="w-full max-h-[520px] object-contain bg-black"
                          />
                          {block.description && (
                            <p className="text-sm text-gray-500 text-center mt-2 italic">
                              {block.description}
                            </p>
                          )}
                        </div>
                      );
                    }

                    // TEXT
                    return (
                      <p
                        key={block.id}
                        className="text-lg text-gray-700 leading-relaxed"
                      >
                        {block.value}
                      </p>
                    );
                  })}
                </div>
              </div>
            </article>

            {/* SIDEBAR */}
            <aside className="lg:col-span-4 space-y-6 sticky top-24 h-fit">

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">More From Field</h3>

                {allNews
                  .filter(n => n.id !== article.id)
                  .slice(0, 4)
                  .map(n => (
                    <Link
                      key={n.id}
                      to={`/news/${n.id}`}
                      className="flex gap-4 group mb-4"
                    >
                      <img
                        src={n.heroImage}
                        className="w-20 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-semibold group-hover:text-blue-600 transition line-clamp-2">
                          {n.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(n.date).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>

              <div className="bg-blue-600 rounded-2xl p-6 text-white">
                <h4 className="text-lg font-bold mb-2">Support Our Mission</h4>
                <p className="text-blue-100 text-sm mb-4">
                  Help us continue sharing impactful stories.
                </p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-blue-50 transition">
                  Donate Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </aside>
          </div>
        </section>
      )}
    </>
  );
};

export default News;
