import { ChangeEvent } from 'react';

export type WellnessFiltersState = {
  service: string[];
  childPrograms: string;
};

type WellnessFiltersProps = {
  value: WellnessFiltersState;
  onChange: (next: WellnessFiltersState) => void;
  serviceOptions: string[];
};

export function WellnessFilters({ value, onChange, serviceOptions }: WellnessFiltersProps) {
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
            <label key={option} className="checkbox-pill">
              <input
                type="checkbox"
                value={option}
                checked={value.service.includes(option)}
                onChange={handleCheckbox}
              />
              <span>{option}</span>
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
