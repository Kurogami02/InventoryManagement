import { DatePicker } from 'antd';

const DatePickerVI: React.FC<{ handleRangePicker: Function }> = ({ handleRangePicker }) => {
  return (
    <DatePicker
      format={'DD/MM/YYYY'}
      locale={{
        lang: {
          placeholder: 'Chọn ngày',
          locale: 'vi_VN',
          yearFormat: 'YYYY',
          monthFormat: 'MM',
          today: 'Hôm nay',
          now: 'Hiện tại',
          backToToday: 'Chuyển đến hôm nay',
          ok: 'OK',
          timeSelect: 'Chọn giờ',
          dateSelect: 'Chọn ngày',
          clear: 'Chọn lại',
          month: 'Tháng',
          year: 'Name',
          previousMonth: 'Tháng trước (PageUp)',
          nextMonth: 'Tháng sau (PageDown)',
          monthSelect: 'Chọn tháng',
          yearSelect: 'Chọn năm',
          decadeSelect: 'Chọn thập kỷ',
          dayFormat: 'DD',
          previousYear: 'Năm trước (Control + left)',
          nextYear: 'Năm sau (Control + right)',
          previousDecade: 'Thập kỷ trước',
          nextDecade: 'Thập kỷ sau',
          previousCentury: 'Thế kỷ trước',
          nextCentury: 'Thế kỷ sau',
          dateFormat: 'DD/MM/YYYY',
          dateTimeFormat: 'DD/MM/YYYY',
          monthBeforeYear: true,
          rangePlaceholder: ['Từ ngày', 'Đến ngày'],
          shortWeekDays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        },
        timePickerLocale: { rangePlaceholder: ['Từ ngày', 'Đến ngày'] },
      }}
      onChange={(values: any) => handleRangePicker(values)}
    />
  );
};

export default DatePickerVI;
