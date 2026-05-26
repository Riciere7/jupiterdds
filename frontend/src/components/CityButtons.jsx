function CityButtons({ cidades, selectedCity, onSelect }) {
  return (
    <div className="city-buttons">
      <h2>Escolha a cidade</h2>
      <div className="city-grid">
        {cidades.map((cidade) => (
          <button
            key={cidade}
            className={cidade === selectedCity ? 'city-chip active' : 'city-chip'}
            onClick={() => onSelect(cidade)}
          >
            <span className="city-chip-badge">MA</span>
            <span>{cidade}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CityButtons;
