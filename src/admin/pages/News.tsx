import { useState } from 'react';
import { 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Image as ImageIcon,
  Globe
} from 'lucide-react';

const NewsPrograms = () => {
  const [news, setNews] = useState([
    { 
      id: 1, 
      title: "Mobile Health Outreach Reaches 5 New Communities", 
      date: "Jan 2026",
      image: "https://via.placeholder.com/300x200",
      featured: true,
      enabled: true
    },
    { 
      id: 2, 
      title: "Emergency Food Distribution Launched", 
      date: "Jan 2026",
      image: "https://via.placeholder.com/300x200",
      featured: true,
      enabled: true
    },
    { 
      id: 3, 
      title: "Clean Water Project Phase II Begins", 
      date: "Dec 2025",
      image: "https://via.placeholder.com/300x200",
      featured: false,
      enabled: true
    },
  ]);

  const [programs, setPrograms] = useState([
    {
      id: 1,
      title: "Education Programs",
      description: "Providing scholarships, school supplies, and learning centers",
      stats: "2,000+ students supported",
      enabled: true
    },
    // Add more programs...
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, _setEditingItem] = useState<any>(null);

  const deleteItem = (id: number, type: 'news' | 'program') => {
    if (type === 'news') {
      setNews(news.filter(item => item.id !== id));
    } else {
      setPrograms(programs.filter(item => item.id !== id));
    }
  };

  const toggleFeatured = (id: number) => {
    setNews(news.map(item => 
      item.id === id ? { ...item, featured: !item.featured } : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Programs</h1>
          <p className="text-gray-600">Manage news articles and program listings</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add New</span>
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2">
            <Save size={18} />
            <span>Save All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News Management */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold flex items-center">
              <Globe className="mr-2" />
              News & Updates
            </h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar size={14} className="mr-1" />
                            {item.date}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleFeatured(item.id)}
                            className={`px-2 py-1 text-xs rounded-full ${item.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {item.featured ? 'Featured' : 'Regular'}
                          </button>
                          <button className="p-1 text-gray-500 hover:text-blue-600">
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => deleteItem(item.id, 'news')}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Programs Management */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Programs Management</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {programs.map((program) => (
                <div key={program.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{program.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                      <p className="text-sm text-blue-600 mt-2">{program.stats}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-500 hover:text-blue-600">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => deleteItem(program.id, 'program')}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit Item' : 'Add New News/Program'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <input 
                type="text" 
                placeholder="Title" 
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea 
                placeholder="Description" 
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input 
                type="date" 
                className="px-4 py-2 border rounded-lg"
              />
              <input 
                type="file" 
                accept="image/*"
                className="w-full"
              />
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPrograms;