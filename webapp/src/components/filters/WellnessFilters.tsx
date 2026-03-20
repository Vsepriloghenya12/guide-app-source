import { ChangeEvent } from 'react';

export type WellnessFiltersState = {
  service: string[];
  childPrograms: string;
};

type WellnessFiltersProps = {
  value: WellnessFiltersState;
  onChange: (next: WellnessFiltersState) => void;
};

const serviceOptions = [
  { value: 'massage', label: 'Массажные салоны' },
  { value: 'sauna', label: 'Баня' },
  { value: 'spa', label: 'СПА комплексы' },
  { value: 'hammam', label: 'Хамам' },
  { value: 'cosmetology', label: 'Косметология' },
  { value: 'wraps', label: 'Обертывания' },
  { value: 'yoga', label: 'Йога' }
];

export function WellnessFilters({ value, onChange }: WellnessFiltersProps) {
  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, value: itemValue } = event.target;

    if (checked) {
      onChange({
        ...value,
        service: [...value.service, itemValue]
      });
      return;
    }

    onChange({
      ...value,
      service: value.service.filter((item) => item !== itemValue)
    });
  };

  const handleChildPrograms = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...value,
      childPrograms: event.target.value
    });
  };

  return (
    <div className="filter-grid">
      <fieldset className="field fieldset">
        <legend>Тип услуг</legend>
        <div className="checkbox-list">
          {serviceOptions.map((option) => (
            <label key={option.value} className="checkbox-pill">
              <input
                type="checkbox"
                value={option.value}
                checked={value.service.includes(option.value)}
                onChange={handleCheckbox}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Детские программы</span>
        <select value={value.childPrograms} onChange={handleChildPrograms}>
          <option value="all">Не важно</option>
          <option value="yes">Да</option>
          <option value="no">Нет</option>
        </select>
      </label>
    </div>
  );
}
