import { useEffect, useState } from 'react';
import { apiClient, Banner } from '@/lib/api-client';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const res = await apiClient.getAdminBanners();
    if (res.success && res.data) setBanners(res.data);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Submitting form, editingBanner =', editingBanner);
  try {
    if (editingBanner) {
      console.log('Calling updateBanner...');
      const res = await apiClient.updateBanner(editingBanner.id, formData);
      console.log('Update response:', res);
    } else {
      console.log('Calling createBanner...');
      const res = await apiClient.createBanner(formData);
      console.log('Create response:', res);
    }
  } catch (err) {
    console.error('Error in handleSubmit:', err);
  }
  setShowForm(false);
  setEditingBanner(null);
  setFormData({ title: '', subtitle: '', imageUrl: '', linkUrl: '' });
  await loadBanners();
};


  const toggleActive = async (id: string, currentStatus: boolean) => {
    await apiClient.updateBanner(id, { isActive: !currentStatus });
    loadBanners();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    await apiClient.deleteBanner(id);
    loadBanners();
  };

  const startEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
        <button
          onClick={() => {
            setEditingBanner(null);
            setFormData({ title: '', subtitle: '', imageUrl: '', linkUrl: '' });
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingBanner ? 'Edit Banner' : 'Add Banner'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
              <input
                type="text"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
              <input
                type="text"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Banner
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBanner(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-100">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{banner.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(banner.id, banner.isActive)}
                    className={`p-1 rounded ${
                      banner.isActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {banner.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => startEdit(banner)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {banner.linkUrl && (
                <p className="text-xs text-gray-500 truncate">Link: {banner.linkUrl}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          No banners found. Add your first banner to get started.
        </div>
      )}
    </div>
  );
}