import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddressAPI } from '../lib/supabase';
import type { AdminAddress } from '../types/address';
import { MapPin, ChevronDown, Home, MapPinned, Plus } from 'lucide-react';

interface AddressSelectorProps {
  selectedAddress: AdminAddress | null;
  onAddressChange: (address: AdminAddress) => void;
}

export default function AddressSelector({ selectedAddress, onAddressChange }: AddressSelectorProps) {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<AdminAddress[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await AddressAPI.getAll();
      setAddresses(data);
      
      // If no address selected, select default
      if (!selectedAddress && data.length > 0) {
        const defaultAddr = data.find(a => a.is_default) || data[0];
        onAddressChange(defaultAddr);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAddress = (address: AdminAddress) => {
    onAddressChange(address);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-blue-600">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Loading addresses...</span>
        </div>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg text-center">
        <p className="text-sm text-gray-600 mb-3">No addresses found</p>
        <button
          onClick={() => navigate('/profile')}
          className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
        >
          Add Address in Profile →
        </button>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-blue-900">
          Your Location (Shop Address) <span className="text-red-500">*</span>
        </label>
        <button
          onClick={() => navigate('/profile')}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
        >
          Manage Addresses
        </button>
      </div>

      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:border-blue-500 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedAddress?.address_name || 'Select Address'}
            </p>
            {selectedAddress && (
              <p className="text-xs text-gray-500 truncate">
                {selectedAddress.location_address}
              </p>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {addresses.map((address) => (
            <button
              key={address.id}
              onClick={() => handleSelectAddress(address)}
              className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                selectedAddress?.id === address.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  selectedAddress?.id === address.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {address.address_name}
                    </p>
                    {address.is_default && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                    {selectedAddress?.id === address.id && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{address.location_address}</p>
                  {(address.location_house_address || address.location_landmark) && (
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {address.location_house_address && (
                        <span className="flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          {address.location_house_address}
                        </span>
                      )}
                      {address.location_landmark && (
                        <span className="flex items-center gap-1">
                          <MapPinned className="w-3 h-3" />
                          {address.location_landmark}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Add New Address */}
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/profile');
            }}
            className="w-full p-3 text-left hover:bg-gray-50 border-t border-gray-200 text-blue-600 font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>
      )}

      {/* Selected Address Details */}
      {selectedAddress && (
        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 mb-2">SELECTED ADDRESS:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-900">{selectedAddress.location_address}</p>
            </div>
            {selectedAddress.location_house_address && (
              <div className="flex items-start gap-2">
                <Home className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{selectedAddress.location_house_address}</p>
              </div>
            )}
            {selectedAddress.location_landmark && (
              <div className="flex items-start gap-2">
                <MapPinned className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{selectedAddress.location_landmark}</p>
              </div>
            )}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                📍 Coordinates: {selectedAddress.location_lat.toFixed(6)}, {selectedAddress.location_lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

