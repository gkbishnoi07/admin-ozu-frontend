import { useState } from 'react';
import { CustomerDetails } from './index';
import LocationSearchInput, { LocationResult } from '../../components/LocationSearchInput';

interface DeliveryBoy {
  id: string;
  name: string;
  mobile: string;
  zone: string;
  isAvailable: boolean;
}

interface ShipmentFormProps {
  onSubmit: (customer: CustomerDetails, specificRiderId?: string) => void;
  disabled?: boolean;
}

function ShipmentForm({ onSubmit, disabled }: ShipmentFormProps) {
  const [formData, setFormData] = useState<CustomerDetails>({
    name: '',
    mobile: '',
    locationLink: '',
    address: '',
    landmark: '',
    price: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [selectedRider, setSelectedRider] = useState<string | null>(null);
  const [customerLocationDisplay, setCustomerLocationDisplay] = useState<string>('');
  const [customerHouseAddress, setCustomerHouseAddress] = useState<string>('');
  const [customerLandmark, setCustomerLandmark] = useState<string>('');

  const handleChange = (field: keyof CustomerDetails, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCustomerLocationSelect = (location: LocationResult) => {
    // Store location as coordinates format that backend can parse
    const locationLink = `${location.lat},${location.lng}`;
    
    // Build full address from location + house address
    const fullAddress = [
      customerHouseAddress,
      location.address
    ].filter(Boolean).join(', ');
    
    setFormData((prev) => ({ 
      ...prev, 
      locationLink,
      address: fullAddress || location.address,
      landmark: customerLandmark || location.landmark || prev.landmark
    }));
    
    setCustomerLocationDisplay(location.displayName);
    
    // Clear errors
    setErrors((prev) => ({ 
      ...prev, 
      locationLink: undefined,
      address: undefined,
      landmark: undefined
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Customer name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!/^[6-9]\d{9}$/.test(formData.mobile.replace(/\s+/g, ''))) {
      newErrors.mobile = 'Enter valid 10-digit mobile number';
    }
    if (!formData.locationLink.trim()) newErrors.locationLink = 'Location link is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.landmark.trim()) newErrors.landmark = 'Landmark is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchDeliveryBoys = async () => {
    setLoadingRiders(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/riders/available`);
      const data = await response.json();
      setDeliveryBoys(data);
    } catch (error) {
      console.error('Failed to fetch delivery boys:', error);
      alert('Failed to load delivery boys. Please try again.');
    } finally {
      setLoadingRiders(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      // Reset form after submission
      setFormData({
        name: '',
        mobile: '',
        locationLink: '',
        address: '',
        landmark: '',
        price: 0,
      });
      setCustomerLocationDisplay('');
      setCustomerHouseAddress('');
      setCustomerLandmark('');
    }
  };

  const handleSpecificRiderClick = () => {
    if (!validate()) return;
    fetchDeliveryBoys();
    setShowRiderModal(true);
  };

  const handleSendToSpecificRider = () => {
    if (!selectedRider) {
      alert('Please select a delivery boy');
      return;
    }
    
    console.log('🎯 Selected rider ID:', selectedRider);
    console.log('📦 Customer data:', formData);
    
    onSubmit(formData, selectedRider);
    setShowRiderModal(false);
    setSelectedRider(null);
    // Reset form after submission
    setFormData({
      name: '',
      mobile: '',
      locationLink: '',
      address: '',
      landmark: '',
      price: 0,
    });
    setCustomerLocationDisplay('');
    setCustomerHouseAddress('');
    setCustomerLandmark('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Delivery Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Location Search */}
        <div>
          <LocationSearchInput
            value={customerLocationDisplay}
            onChange={handleCustomerLocationSelect}
            placeholder="Search for customer location..."
            label="Customer Location"
            required
            error={errors.locationLink}
            showAddressFields={true}
            houseAddress={customerHouseAddress}
            landmark={customerLandmark}
            onHouseAddressChange={(value) => {
              setCustomerHouseAddress(value);
              // Update address in formData
              if (formData.locationLink) {
                const fullAddress = [value, customerLocationDisplay].filter(Boolean).join(', ');
                setFormData(prev => ({ ...prev, address: fullAddress }));
              }
            }}
            onLandmarkChange={(value) => {
              setCustomerLandmark(value);
              // Update landmark in formData
              setFormData(prev => ({ ...prev, landmark: value }));
              // Clear landmark error
              setErrors(prev => ({ ...prev, landmark: undefined }));
            }}
          />
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* Customer Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.mobile ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
        </div>

        {/* Address and Landmark are now included in LocationSearchInput above */}
        {/* Display selected address for confirmation */}
        {formData.address && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-semibold text-green-900 uppercase mb-1">Selected Address</p>
            <p className="text-sm text-green-800">{formData.address}</p>
            {formData.landmark && (
              <p className="text-xs text-green-700 mt-1">
                📍 Landmark: {formData.landmark}
              </p>
            )}
          </div>
        )}

        {/* Delivery Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            placeholder="50"
            min="0"
            step="10"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
          <p className="text-xs text-gray-500 mt-1">Amount delivery boy will receive</p>
        </div>

        {/* Submit Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={disabled}
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {disabled ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Please enable location & mobile number
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send to Available Delivery Boys
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSpecificRiderClick}
            disabled={disabled}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Send to Specific Delivery Boy
          </button>
        </div>
      </form>

      {/* Delivery Boy Selection Modal */}
      {showRiderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden relative z-[10000]">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Delivery Boy</h3>
              <button
                onClick={() => {
                  setShowRiderModal(false);
                  setSelectedRider(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              {loadingRiders ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : deliveryBoys.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-gray-500">No available delivery boys</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {deliveryBoys.map((rider) => (
                    <div
                      key={rider.id}
                      onClick={() => setSelectedRider(rider.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRider === rider.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{rider.name}</h4>
                            {rider.isAvailable && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">📞 {rider.mobile}</p>
                          <p className="text-sm text-gray-500 mt-1">📍 Zone: {rider.zone}</p>
                        </div>
                        {selectedRider === rider.id && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowRiderModal(false);
                  setSelectedRider(null);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToSpecificRider}
                disabled={!selectedRider}
                className="flex-1 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShipmentForm;

