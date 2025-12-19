import { Clock } from 'lucide-react';
import PropTypes from 'prop-types';

const OperatingHours = ({
  openTime,
  closeTime,
  hasBreakTime,
  breakStartTime,
  breakEndTime,
  onOpenTimeChange,
  onCloseTimeChange,
  onBreakTimeToggle,
  onBreakStartTimeChange,
  onBreakEndTimeChange,
}) => {
  return (
    <fieldset>
      <legend className="flex items-center gap-2 text-gray-900 font-medium mb-2">
        <Clock size={20} />
        영업시간 <span className="text-red-500">*</span>
      </legend>
      <div className="flex items-center gap-3">
        <input
          id="open-time"
          type="time"
          value={openTime}
          onChange={(e) => onOpenTimeChange(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg outline-none"
        />
        <span className="text-gray-600">~</span>
        <input
          id="close-time"
          type="time"
          value={closeTime}
          onChange={(e) => onCloseTimeChange(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg outline-none"
        />
      </div>

      {/* 브레이크타임 설정 */}
      <div className="mt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasBreakTime}
            onChange={(e) => onBreakTimeToggle(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-gray-700">브레이크타임 설정</span>
        </label>
        {hasBreakTime && (
          <div className="flex items-center gap-3 mt-2 ml-6">
            <input
              id="break-start-time"
              type="time"
              value={breakStartTime}
              onChange={(e) => onBreakStartTimeChange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg outline-none"
            />
            <span className="text-gray-600">~</span>
            <input
              id="break-end-time"
              type="time"
              value={breakEndTime}
              onChange={(e) => onBreakEndTimeChange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg outline-none"
            />
          </div>
        )}
      </div>
    </fieldset>
  );
};

OperatingHours.propTypes = {
  openTime: PropTypes.string.isRequired,
  closeTime: PropTypes.string.isRequired,
  hasBreakTime: PropTypes.bool.isRequired,
  breakStartTime: PropTypes.string.isRequired,
  breakEndTime: PropTypes.string.isRequired,
  onOpenTimeChange: PropTypes.func.isRequired,
  onCloseTimeChange: PropTypes.func.isRequired,
  onBreakTimeToggle: PropTypes.func.isRequired,
  onBreakStartTimeChange: PropTypes.func.isRequired,
  onBreakEndTimeChange: PropTypes.func.isRequired,
};

export default OperatingHours;
