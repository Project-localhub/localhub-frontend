import { MapPin } from 'lucide-react';
import PropTypes from 'prop-types';

const AddressSearch = ({ address, onAddressChange, onSearch, error }) => {
  return (
    <div>
      <label htmlFor="address" className="block text-gray-900 font-medium mb-2">
        위치 주소 <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="주소를 검색하세요"
          className={`flex-1 px-4 py-3 border rounded-lg outline-none ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={onSearch}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <MapPin size={20} />
          검색
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

AddressSearch.propTypes = {
  address: PropTypes.string.isRequired,
  onAddressChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default AddressSearch;
