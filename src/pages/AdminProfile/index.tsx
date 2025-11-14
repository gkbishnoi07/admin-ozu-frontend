import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AddressManager from '../../components/AddressManager';
import { ArrowLeft, Save, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

interface AdminProfile {
  mobile: string;
  name: string;
  shopName?: string;
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [profile, setProfile] = useState<AdminProfile>({
    mobile: user?.user_metadata?.mobile || '',
    name: user?.user_metadata?.name || '',
    shopName: '',
  });

  // Load existing profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);

    try {
      // Fetch profile from Supabase
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet
          setProfile({
            mobile: user.user_metadata?.mobile || '',
            name: user.user_metadata?.name || '',
            shopName: '',
          });
        } else {
          console.error('Error loading profile:', error);
          setMessage({ type: 'error', text: 'Failed to load profile' });
        }
      } else if (data) {
        // Profile exists
        setProfile({
          mobile: data.mobile,
          name: data.name,
          shopName: data.shop_name || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
    
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!profile.name) {
      setMessage({ type: 'error', text: 'Your name is required' });
      return;
    }

    if (!profile.mobile) {
      setMessage({ type: 'error', text: 'Mobile number is required' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Prepare profile data for Supabase
      const profileData = {
        user_id: user.id,
        mobile: profile.mobile,
        name: profile.name,
        shop_name: profile.shopName || null,
      };

      // Upsert to Supabase (insert or update)
      const { error } = await supabase
        .from('admin_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
        });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: '✅ Profile saved successfully!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to save profile. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/shipment')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Set up your shop details and default location</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Your login email</p>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={profile.mobile}
                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Shared with delivery boys</p>
            </div>

            {/* Your Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Shop Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop/Business Name
              </label>
              <input
                type="text"
                value={profile.shopName || ''}
                onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                placeholder="ABC Store"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - for your reference</p>
            </div>
          </div>

          {/* Address Management Section */}
          <div className="border-t pt-6">
            <AddressManager />
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> Add multiple addresses (shop, warehouse, home office, etc.). 
                You can choose which one to use when creating shipments.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/shipment')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

