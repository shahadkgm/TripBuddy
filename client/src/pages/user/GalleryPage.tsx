import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  Camera,
  X,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  User,
  MapPin,
  Clock,
  Heart,
  Share2,
  Shield,
} from 'lucide-react';
import { authService } from '../../services/c.authService';
import { galleryService, type GalleryPost } from '../../services/c.gallery.service';
import toast from 'react-hot-toast';

const GalleryPage = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Is this the current user's OWN gallery?
  const isOwnGallery = !userId || userId === currentUser?.id;

  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    caption: '',
    tripName: '',
    image: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let res;
      if (isOwnGallery) {
        // Fetch current user's gallery
        res = await galleryService.getUserPosts(currentUser?.id || '');
      } else {
        // Fetch target user's gallery
        res = await galleryService.getUserPosts(userId!);
      }
      setPosts(res.data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load gallery';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await galleryService.uploadImage(file);
      setUploadData(prev => ({ ...prev, image: res.data.imageUrl }));
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.image) return toast.error('Please upload an image first');

    try {
      setIsUploading(true);
      await galleryService.createPost(uploadData);
      setShowUploadModal(false);
      setUploadData({ caption: '', tripName: '', image: '' });
      fetchPosts();
      toast.success('Memory posted to gallery!');
    } catch (error) {
      toast.error('Failed to post');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to format time relative to now without external library
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-outfit">
      {/* Header Area */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
                {isOwnGallery ? 'My Gallery' : `${posts[0]?.user.name || 'User'}'s Gallery`}
              </h1>
              {!isOwnGallery && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  <Shield size={10} /> Connected Traveler
                </div>
              )}
            </div>
          </div>

          {isOwnGallery && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-indigo-600 text-white p-3 rounded-full shadow-lg shadow-indigo-200 hover:bg-slate-900 hover:scale-110 active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">
              Fetching memories...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-40 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <X size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
              Access Denied
            </h2>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all"
            >
              Go Back
            </button>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-12">
            {posts.map(post => (
              <div
                key={post._id}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 group transition-all hover:shadow-2xl"
              >
                {/* Post User Header */}
                <div className="p-6 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-50 bg-slate-100 shadow-sm">
                      {post.user.avatar ? (
                        <img
                          src={post.user.avatar}
                          alt={post.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-white">
                          <User size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 leading-tight">{post.user.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} className="text-slate-300" />
                          {formatRelativeTime(post.createdAt)}
                        </span>
                        {post.tripName && (
                          <>
                            <span className="text-slate-200 text-[10px]">•</span>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                              <MapPin size={10} className="text-indigo-300" />
                              {post.tripName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button className="p-2.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all">
                      <Heart size={20} />
                    </button>
                    <button className="p-2.5 text-slate-300 hover:bg-indigo-50 hover:text-indigo-500 rounded-full transition-all">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Post Image */}
                <div className="p-6 pt-4">
                  <div className="aspect-video w-full rounded-4xl overflow-hidden relative bg-slate-100 shadow-inner">
                    <img
                      src={post.image}
                      alt={post.caption || 'Trip photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none p-8 flex items-end">
                      <p className="text-white text-xs font-bold uppercase tracking-widest opacity-80">
                        Capture your moment
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Caption / Bio */}
                {post.caption && (
                  <div className="px-10 pb-10">
                    <div className="h-px w-8 bg-indigo-100 mb-6 group-hover:w-16 transition-all duration-700"></div>
                    <p className="text-slate-600 font-medium leading-relaxed italic text-lg drop-shadow-sm">
                      "{post.caption}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 flex flex-col items-center gap-8">
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-xl relative group">
              <div className="absolute inset-0 bg-indigo-50 rounded-full animate-ping opacity-20 scale-125"></div>
              <ImageIcon
                size={64}
                className="text-slate-200 group-hover:text-indigo-200 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <p className="font-black text-2xl text-slate-400 uppercase tracking-tighter">
                Gallery is Quiet
              </p>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">
                Click the button above to share your first travel story!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isUploading && setShowUploadModal(false)}
          />

          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative z-10 animate-in zoom-in slide-in-from-bottom-12 duration-500">
            <button
              onClick={() => setShowUploadModal(false)}
              disabled={isUploading}
              className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 transition-all"
            >
              <X size={20} />
            </button>

            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Share Memory</h2>
              <p className="text-slate-400 font-medium mt-1">
                Post a beautiful moment from your trip.
              </p>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-8">
              {/* Image Upload Area */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`aspect-video w-full rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative shadow-inner
                                    ${uploadData.image ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'}`}
              >
                {uploadData.image ? (
                  <div className="w-full h-full">
                    <img
                      src={uploadData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white font-black text-xs uppercase tracking-widest bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20">
                        Change Photo
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                          Uploading...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white p-5 rounded-4xl shadow-lg border border-slate-100 text-indigo-500 mb-4 group-hover:rotate-12 transition-transform">
                          <Camera size={38} />
                        </div>
                        <p className="font-black text-slate-800 tracking-tight text-xl">
                          Upload Memory
                        </p>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                          JPEG, PNG, WebP up to 5MB
                        </p>
                      </>
                    )}
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-5">
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2">
                    Trip Destination Context
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <input
                      type="text"
                      placeholder="e.g. Paris, France"
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700 shadow-sm"
                      value={uploadData.tripName}
                      onChange={e => setUploadData(prev => ({ ...prev, tripName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2">
                    Memory / Bio
                  </label>
                  <textarea
                    placeholder="Write a small note about this memory..."
                    rows={3}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100  outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700 resize-none shadow-sm"
                    value={uploadData.caption}
                    onChange={e => setUploadData(prev => ({ ...prev, caption: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading || !uploadData.image}
                className="w-full py-6 bg-slate-900 text-white rounded-4xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-indigo-200/50 hover:bg-indigo-600 transition-all disabled:opacity-30 active:scale-95 group"
              >
                {isUploading ? (
                  'Posting Story...'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Post Memory{' '}
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
