import axios from './axios';

export const HeroAPI = {
  async getHero() {
    const res = await axios.get('/dashboard/hero');
    return res.data;
  },

  async updateHero(data: any) {
    const res = await axios.put('/dashboard/hero', data);
    return res.data;
  },

  async uploadImages(files: File[]) {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('images', file); // MUST be "images"
    });

    const res = await axios.post(
      '/dashboard/hero/images', // ✅ FIXED ENDPOINT
      formData
    );

  return res.data;
}
,

  async deleteImage(publicId: string) {
  const encodedId = encodeURIComponent(publicId);
  return axios.delete(`/dashboard/hero/images/${encodedId}`);
}


};
