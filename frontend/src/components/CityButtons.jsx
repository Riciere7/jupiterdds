function CityButtons({ cidades, selectedCity, onSelect }) {
  const selectedCityName = typeof selectedCity === 'string' ? selectedCity : selectedCity?.nome || '';
  const estadoPorCidade = {
    'Açailândia': 'MA',
    'Amarante do Maranhão': 'MA',
    'Campestre do Maranhão': 'MA',
    'Cidelândia': 'MA',
    'Davinópolis': 'MA',
    'Estreito': 'MA',
    'Governador Edison Lobão': 'MA',
    'Grajaú': 'MA',
    'Imperatriz': 'MA',
    'João Lisboa': 'MA',
    'Marabá': 'PA',
    'Parauapebas': 'PA',
    'Porto Franco': 'MA',
    'Ribamar Fiquene': 'MA',
    'São Francisco do Brejão': 'MA',
    'São Pedro da Água Branca': 'MA',
    'Senador La Rocque': 'MA',
    'Sítio Novo': 'MA',
    'Vila Nova dos Martírios': 'MA'
  };

  return (
    <div className="city-buttons">
      <h2>Escolha a cidade</h2>
      <div className="city-grid">
        {cidades.map((cidade) => {
          const nomeCidade = typeof cidade === 'string' ? cidade : cidade.nome;
          let sigla;
          
          if (typeof cidade === 'string') {
            sigla = estadoPorCidade[nomeCidade] || 'MA';
          } else {
            sigla = cidade.estado === 'Pará' ? 'PA' : 'MA';
          }
          
          return (
            <button
              key={nomeCidade}
              className={nomeCidade === selectedCityName ? 'city-chip active' : 'city-chip'}
              onClick={() => onSelect(nomeCidade)}
            >
              <span className="city-chip-badge">{sigla}</span>
              <span>{nomeCidade}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CityButtons;
