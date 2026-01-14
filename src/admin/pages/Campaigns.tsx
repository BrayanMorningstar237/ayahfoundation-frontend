import { useState } from 'react';
import { 
  Save, 
  Plus, 
  Edit, 
  Play,
  Target
} from 'lucide-react';

const Campaigns = () => {
  const [videoCampaign, setVideoCampaign] = useState({
    title: "Watch How We're Changing Lives",
    description: "Take a journey through our communities and witness the transformative power of collective action.",
    thumbnail: "https://via.placeholder.com/800x450",
    videoUrl: "",
    enabled: true
  });

  const [featuredCampaigns, setFeaturedCampaigns] = useState([
    {
      id: 1,
      title: "They are Waiting For Warm Help.",
      raised: 25270,
      goal: 30000,
      category: "Education",
      image: "https://via.placeholder.com/300x200",
      enabled: true
    },
    // Add more campaigns...
  ]);

  const handleSaveVideo = () => {
    console.log('Saving video campaign:', videoCampaign);
    alert('Video campaign saved!');
  };

  const handleAddCampaign = () => {
    const newCampaign = {
      id: featuredCampaigns.length + 1,
      title: "New Campaign",
      raised: 0,
      goal: 10000,
      category: "General",
      image: "https://via.placeholder.com/300x200",
      enabled: true
    };
    setFeaturedCampaigns([...featuredCampaigns, newCampaign]);
  };

  const updateCampaign = (id: number, field: string, value: any) => {
    setFeaturedCampaigns(featuredCampaigns.map(campaign => 
      campaign.id === id ? { ...campaign, [field]: value } : campaign
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns Management</h1>
          <p className="text-gray-600">Manage video campaigns and featured fundraising campaigns</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2">
          <Save size={18} />
          <span>Save All</span>
        </button>
      </div>

      {/* Video Campaign Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Play className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold">Video Campaign</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={videoCampaign.title}
                onChange={(e) => setVideoCampaign({...videoCampaign, title: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={videoCampaign.description}
                onChange={(e) => setVideoCampaign({...videoCampaign, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={videoCampaign.videoUrl}
                onChange={(e) => setVideoCampaign({...videoCampaign, videoUrl: e.target.value})}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={videoCampaign.enabled}
                onChange={(e) => setVideoCampaign({...videoCampaign, enabled: e.target.checked})}
                className="w-4 h-4"
              />
              <label>Enable Video Section</label>
            </div>

            <button 
              onClick={handleSaveVideo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Save Video Campaign
            </button>
          </div>

          <div>
            <div className="border rounded-lg p-4">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <Play size={48} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Thumbnail Preview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Campaigns Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Target className="text-green-600" size={24} />
            <h2 className="text-xl font-bold">Featured Campaigns</h2>
          </div>
          <button 
            onClick={handleAddCampaign}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Campaign</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {featuredCampaigns.map((campaign) => (
            <div key={campaign.id} className="border rounded-xl overflow-hidden hover:shadow-md">
              <div className="aspect-video bg-gray-200 relative">
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-white rounded-full shadow">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  value={campaign.title}
                  onChange={(e) => updateCampaign(campaign.id, 'title', e.target.value)}
                  className="w-full font-bold text-lg border-b focus:border-blue-500"
                />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <input
                      type="number"
                      value={campaign.raised}
                      onChange={(e) => updateCampaign(campaign.id, 'raised', e.target.value)}
                      className="w-24 px-2 py-1 border rounded"
                      placeholder="Raised"
                    />
                    <span>of</span>
                    <input
                      type="number"
                      value={campaign.goal}
                      onChange={(e) => updateCampaign(campaign.id, 'goal', e.target.value)}
                      className="w-24 px-2 py-1 border rounded"
                      placeholder="Goal"
                    />
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-center text-2xl font-bold">
                    {Math.round((campaign.raised / campaign.goal) * 100)}%
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <select 
                    value={campaign.category}
                    onChange={(e) => updateCampaign(campaign.id, 'category', e.target.value)}
                    className="px-3 py-1 border rounded-lg"
                  >
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Food Security">Food Security</option>
                    <option value="General">General</option>
                  </select>
                  
                  <button 
                    onClick={() => updateCampaign(campaign.id, 'enabled', !campaign.enabled)}
                    className={`px-3 py-1 rounded-full text-sm ${campaign.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {campaign.enabled ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;