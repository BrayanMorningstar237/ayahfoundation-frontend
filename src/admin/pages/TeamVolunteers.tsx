import {useState } from 'react';
import { 
  Save, 
  Edit, 
  Trash2, 
  Upload,
  Facebook,
  Twitter,
  Linkedin,
  UserPlus
} from 'lucide-react';

const TeamVolunteers = () => {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Dr. Emmanuel Ayah",
      role: "Founder & Executive Director",
      image: "https://via.placeholder.com/150x150",
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      enabled: true
    },
    // Add more members...
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    facebook: '',
    twitter: '',
    linkedin: ''
  });

  const handleAddMember = () => {
    const newMember = {
      id: teamMembers.length + 1,
      ...formData,
      enabled: true
    };
    setTeamMembers([...teamMembers, newMember]);
    setShowForm(false);
    setFormData({
      name: '',
      role: '',
      image: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    });
  };

  const deleteMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team & Volunteers</h1>
          <p className="text-gray-600">Manage team members and volunteers information</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
          >
            <UserPlus size={18} />
            <span>Add Team Member</span>
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2">
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">Image</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{member.name}</h3>
                      <p className="text-gray-600">{member.role}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-500 hover:text-blue-600">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => deleteMember(member.id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Facebook URL"
                        value={member.facebook}
                        onChange={(_e) => console.log('Update facebook')}
                        className="flex-1 px-3 py-1 text-sm border rounded"
                      />
                      <Facebook size={18} className="text-blue-600" />
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Twitter URL"
                        value={member.twitter}
                        onChange={(_e) => console.log('Update twitter')}
                        className="flex-1 px-3 py-1 text-sm border rounded"
                      />
                      <Twitter size={18} className="text-blue-400" />
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="LinkedIn URL"
                        value={member.linkedin}
                        onChange={(_e) => console.log('Update linkedin')}
                        className="flex-1 px-3 py-1 text-sm border rounded"
                      />
                      <Linkedin size={18} className="text-blue-700" />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={member.enabled}
                        onChange={() => console.log('Toggle enabled')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Add New Team Member</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role/Position
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Executive Director"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload profile picture</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                  >
                    <Upload size={18} className="mr-2" />
                    Select Image
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="url"
                    placeholder="Facebook URL"
                    value={formData.facebook}
                    onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="url"
                    placeholder="Twitter URL"
                    value={formData.twitter}
                    onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamVolunteers;