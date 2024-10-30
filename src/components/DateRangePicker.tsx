import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <DatePicker
        selected={startDate}
        onChange={(date) => onChange({ startDate: date, endDate })}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        placeholderText="Start Date"
        className="border border-gray-300 rounded-md p-2"
      />
      <span>to</span>
      <DatePicker
        selected={endDate}
        onChange={(date) => onChange({ startDate, endDate: date })}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        placeholderText="End Date"
        className="border border-gray-300 rounded-md p-2"
      />
    </div>
  );
};

export default DateRangePicker;