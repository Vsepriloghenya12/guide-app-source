import { ChangeEvent } from 'react';

export type RestaurantFiltersState = {
  kind: string;
  cuisine: string;
  breakfast: string;
  vegan: string;
  pets: string;
  minCheck: string;
  maxCheck: string;
};

type RestaurantFiltersProps = {
  value: RestaurantFiltersState;
  onChange: (next: RestaurantFiltersState) => void;
  kindOptions: string[];
  cuisineOptions: string[];
};

export function RestaurantFilters({
  value,
  onChange,
  kindOptions,
  cuisineOptions
}: RestaurantFiltersProps) {
  const handleField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({
      ...value,
      [event.target.name]: event.target.value
    });
  };

  return (
    <div className="filter-grid">
      <label className="field">
        <span>Тип</span>
        <select name="kind" value={value.kind} onChange={handleField}>
          <option value="all">Все</option>
          {kindOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Кухня</span>
        <select name="cuisine" value={value.cuisine} onChange={handleField}>
          <option value="all">Все</option>
          {cuisineOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Завтраки</span>
        <select name="breakfast" value={value.breakfast} onChange={handleField}>
          <option value="all">Не важно</option>
          <option value="yes">Да</option>
          <option value="no">Нет</option>
        </select>
      </label>

      <label className="field">
        <span>Веганское меню</span>
        <select name="vegan" value={value.vegan} onChange={handleField}>
          <option value="all">Не важно</option>
          <option value="yes">Да</option>
          <option value="no">Нет</option>
        </select>
      </label>

      <label className="field">
        <span>Можно с животными</span>
        <select name="pets" value={value.pets} onChange={handleField}>
          <option value="all">Не важно</option>
          <option value="yes">Да</option>
          <option value="no">Нет</option>
        </select>
      </label>

      <div className="field field--range">
        <span>Средний чек</span>
        <div className="field__range-row">
          <input
            type="number"
            name="minCheck"
            placeholder="от"
            value={value.minCheck}
            onChange={handleField}
          />
          <input
            type="number"
            name="maxCheck"
            placeholder="до"
            value={value.maxCheck}
            onChange={handleField}
          />
        </div>
      </div>
    </div>
  );
}
