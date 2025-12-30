import { X, Plus } from 'lucide-react';
import PropTypes from 'prop-types';

const ImageUpload = ({ images, onAdd, onRemove, error, isUploading = false }) => {
  return (
    <div>
      <div className="block text-gray-900 font-medium mb-2">
        가게 사진 <span className="text-red-500">*</span> (최대 3개)
      </div>
      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={URL.createObjectURL(image)}
              alt={`가게 사진 ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {images.length < 3 && (
          <label
            className={`aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${
              isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-blue-500'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={onAdd}
              className="hidden"
              multiple
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span className="text-xs text-gray-500">업로드 중...</span>
              </div>
            ) : (
              <Plus size={24} className="text-gray-400" />
            )}
          </label>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

ImageUpload.propTypes = {
  images: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  error: PropTypes.string,
  isUploading: PropTypes.bool,
};

export default ImageUpload;
