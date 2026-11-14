import React from 'react';

type Props = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

const FilterButton: React.FC<Props> = ({ label, selected, onClick }) => (
  <button
    type="button"
    className="filter-btn"
    aria-pressed={selected ? 'true' : 'false'}
    onClick={onClick}
  >
    {label}
  </button>
);

export default FilterButton;
