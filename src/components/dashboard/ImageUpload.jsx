import { X, Plus } from 'lucide-react';
import PropTypes from 'prop-types';

const ImageUpload = ({ images, onAdd, onRemove, error }) => {
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
          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500">
            <input type="file" accept="image/*" onChange={onAdd} className="hidden" multiple />
            <Plus size={24} className="text-gray-400" />
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
};

export default ImageUpload;
