import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

type NewsBlock = {
  id: string;
  type?: "text" | "image";
  value: string;
  description?: string;
};

const News = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [allNews, setAllNews] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_URL}/public/sections/news`);
      const json = await res.json();

      const news = json?.content?.news || [];
      setAllNews(news);

      const found = news.find((n: any) => n.id === id);
      setArticle(found);
    };

    load();
  }, [id]);

  if (!article) {
    return (
      <div className="py-32 text-center text-gray-500">
        Loading article…
      </div>
    );
  }

  return (
    <section className=" pb-24  bg-gray-50">
      <div className="max-w-7xl mx-auto lg:pt-5">

        {/* Sticky Article Bar */}
<div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 lg:mb-5">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-sm font-medium text-gray-700
                 hover:text-blue-600 transition group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      Back 
    </button>

    <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[60%]">
      {article.title}
    </span>

  </div>
</div>


        <div className="grid lg:grid-cols-12 gap-10">

          {/* MAIN ARTICLE */}
          <article className="lg:col-span-8 bg-white rounded-3xl shadow-sm overflow-hidden">

            {/* Hero */}
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

              {/* Meta */}
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4" />
                {new Date(article.date).toLocaleDateString()}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Subtitle */}
              {article.subtitle && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {article.subtitle}
                </p>
              )}

              {/* Content */}
              <div className="space-y-8">
                {article.blocks?.map((block: NewsBlock) => {
                  if (block.type === "image") {
                    return (
                      <figure key={block.id}>
                        <div className="rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                          <img
                            src={block.value}
                            alt={block.description || ""}
                            className="w-full max-h-[520px] object-contain mx-auto"
                          />
                        </div>
                        {block.description && (
                          <figcaption className="text-sm text-gray-500 text-center mt-3 italic">
                            {block.description}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }

                  return (
                    <p
                      key={block.id}
                      className="text-gray-700 text-lg leading-relaxed"
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                More Stories
              </h3>

              <div className="space-y-4">
                {allNews
                  .filter(n => n.id !== article.id)
                  .slice(0, 4)
                  .map(n => (
                    <Link
                      key={n.id}
                      to={`/news/${n.id}`}
                      className="group flex gap-4"
                    >
                      <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={n.heroImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                          {n.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(n.date).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white">
              <h4 className="text-lg font-bold mb-2">
                Support Our Mission
              </h4>
              <p className="text-blue-100 text-sm mb-4">
                Help us continue sharing impactful stories and changing lives.
              </p>
              <button className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
                Donate Now
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </aside>
        </div>
      </div>
    </section>
  );
};

export default News;
