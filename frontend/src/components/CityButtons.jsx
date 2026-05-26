function CityButtons({ cidades, selectedCity, onSelect }) {
  return (
    <div className="city-buttons">
      <h2>Cidades / Escritórios</h2>
      <div className="city-grid">
        {cidades.map((cidade) => (
          <button
            key={cidade}
            className={cidade === selectedCity ? 'city-button active' : 'city-button'}
            onClick={() => onSelect(cidade)}
          >
            {cidade}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CityButtons;
