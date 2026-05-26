function SidebarAttachments({ dds, attachments, onUpload, onDeleteAttachment }) {
  return (
    <div className="sidebar-attachments">
      <h2>Anexos</h2>

      {!dds ? (
        <div className="attachment-card">
          <p>Selecione um DDS para ver anexos.</p>
        </div>
      ) : (
        <div className="attachment-card">
          <div className="attachment-header">
            <span>{dds.cidade_nome || 'Cidade não definida'}</span>
            <label className="upload-button">
              Adicionar novo anexo
              <input
                type="file"
                multiple
                accept="application/pdf,video/*"
                onChange={(e) => onUpload(e.target.files)}
              />
            </label>
          </div>

          {attachments.length === 0 ? (
            <p>Nenhum anexo cadastrado.</p>
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
                  <button
                    className="small-button"
                    onClick={() => onDeleteAttachment(attachment.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SidebarAttachments;
