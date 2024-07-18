import React from 'react';
import { Select } from 'antd';

import NotFoundContent from '@/app/components/NotFoundContent';

type SelectUserDetailsProps = {
  options: SelectOptionDataType[];
  optionName: string;
  onSelect: Function;
  id?: string;
  currentValue?: string;
  disabled?: boolean;
};

export type SelectOptionDataType = {
  value: string;
  label: string;
};

const filterOption = (input: string, option?: { label: string; value: string }) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

const SelectDropdown: React.FC<SelectUserDetailsProps> = ({
  options,
  optionName,
  onSelect,
  id,
  currentValue,
  disabled,
}) => {
  return (
    <Select
      id={id || ''}
      allowClear
      defaultValue={options?.find((option) => option.value == currentValue)?.label}
      notFoundContent={<NotFoundContent />}
      style={{ minWidth: '35%' }}
      onSelect={(value: string) => onSelect(value)}
      onClear={() => onSelect(null)}
      showSearch
      placeholder={`Chọn ${optionName}`}
      optionFilterProp="children"
      options={options}
      filterOption={filterOption as any}
      disabled={disabled}
    />
  );
};

export default SelectDropdown;
