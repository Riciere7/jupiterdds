function DdsList({ ddsList, selectedDds, onSelect, onMarkConferido, onDeleteDds, isAdmin }) {
  return (
    <div className="dds-list">
      <h2>Lista de DDS</h2>
      <div className="table-wrapper">
        <table className="dds-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Operador</th>
              <th>Cidade</th>
              <th>Data</th>
              <th>Status</th>
              <th>Conferido</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ddsList.length === 0 ? (
              <tr>
                <td colSpan="7">Nenhum DDS encontrado.</td>
              </tr>
            ) : (
              ddsList.map((dds) => (
                <tr
                  key={dds.id}
                  className={selectedDds?.id === dds.id ? 'selected-row' : ''}
                  onClick={() => onSelect(dds)}
                >
                  <td>{dds.titulo}</td>
                  <td>{dds.operador_nome}</td>
                  <td>{dds.cidade_nome}</td>
                  <td>{dds.data_dds}</td>
                  <td>{dds.status}</td>
                  <td>{dds.conferido ? 'Sim' : 'Não'}</td>
                  <td>
                    {!dds.conferido && (
                      <button className="small-button" onClick={(e) => { e.stopPropagation(); onMarkConferido(dds); }}>
                        Marcar
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        className="small-button danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDds(dds.id);
                        }}
                        style={{ marginLeft: '10px' }}
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DdsList;
