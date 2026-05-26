function SidebarAttachments({ dds, attachments, onUpload, onDeleteAttachment }) {
  return (
    <div className="sidebar-attachments">
      <div className="sidebar-header">
        <div>
          <h2>Anexos</h2>
          <p>{dds ? dds.cidade_nome : 'Selecione um DDS para ver anexos'}</p>
        </div>
        {dds && (
          <label className="upload-button">
            Adicionar anexo
            <input
              type="file"
              multiple
              accept="application/pdf,video/*"
              onChange={(e) => onUpload(e.target.files)}
            />
          </label>
        )}
      </div>

      <div className="attachment-card">
        {dds ? (
          attachments.length === 0 ? (
            <p className="empty-state">Nenhum anexo cadastrado.</p>
          ) : (
            attachments.map((attachment) => (
              <div key={attachment.id} className="attachment-item">
                <div>
                  <strong>{attachment.nome_arquivo}</strong>
                  <p>{new Date(attachment.criado_em).toLocaleString()}</p>
                </div>
                <div className="attachment-actions">
                  <a
                    className="small-button"
                    href={`/${attachment.url}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visualizar
                  </a>
                  <a
                    className="small-button"
                    href={`/${attachment.url}`}
                    download={attachment.nome_arquivo}
                  >
                    Baixar
                  </a>
                  <button
                    className="small-button danger"
                    onClick={() => onDeleteAttachment(attachment.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          <p className="empty-state">Selecione um DDS para ver anexos.</p>
        )}
      </div>
    </div>
  );
}

export default SidebarAttachments;
