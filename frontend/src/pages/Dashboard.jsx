import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CityButtons from '../components/CityButtons.jsx';
import DdsList from '../components/DdsList.jsx';
import SidebarAttachments from '../components/SidebarAttachments.jsx';

const cidadesPadrao = [
  { nome: 'Açailândia', estado: 'Maranhão' },
  { nome: 'Amarante do Maranhão', estado: 'Maranhão' },
  { nome: 'Campestre do Maranhão', estado: 'Maranhão' },
  { nome: 'Cidelândia', estado: 'Maranhão' },
  { nome: 'Davinópolis', estado: 'Maranhão' },
  { nome: 'Estreito', estado: 'Maranhão' },
  { nome: 'Governador Edison Lobão', estado: 'Maranhão' },
  { nome: 'Grajaú', estado: 'Maranhão' },
  { nome: 'Imperatriz', estado: 'Maranhão' },
  { nome: 'João Lisboa', estado: 'Maranhão' },
  { nome: 'Marabá', estado: 'Pará' },
  { nome: 'Parauapebas', estado: 'Pará' },
  { nome: 'Porto Franco', estado: 'Maranhão' },
  { nome: 'Ribamar Fiquene', estado: 'Maranhão' },
  { nome: 'São Francisco do Brejão', estado: 'Maranhão' },
  { nome: 'São Pedro da Água Branca', estado: 'Maranhão' },
  { nome: 'Senador La Rocque', estado: 'Maranhão' },
  { nome: 'Sítio Novo', estado: 'Maranhão' },
  { nome: 'Vila Nova dos Martírios', estado: 'Maranhão' }
];

function Dashboard() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [operators, setOperators] = useState([]);
  const [ddsList, setDdsList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(cidadesPadrao[0]);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedDds, setSelectedDds] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const [ddsTitle, setDdsTitle] = useState('');
  const [ddsDescription, setDdsDescription] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [dataDds, setDataDds] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('ativo');
  const [conferido, setConferido] = useState(false);
  const [anexoPdf, setAnexoPdf] = useState(null);
  const [anexoVideo, setAnexoVideo] = useState(null);

  const [filter, setFilter] = useState({
    operador: '',
    dia: '',
    mes: '',
    ano: '',
    estado: '',
    cidade: '',
    incluirDesabilitados: false,
    conferido: ''
  });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [selectedSection, setSelectedSection] = useState('cadastro');
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPerfil, setNewUserPerfil] = useState('visualizador');

  const authHeader = () => {
    const token = localStorage.getItem('dds_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('dds_user');
    localStorage.removeItem('dds_token');
    navigate('/login');
  };

  const isAdmin = user?.perfil === 'admin';
  const perfilDescricao = user?.perfil === 'admin' ? 'Administrador' : 'Visualizador';

  useEffect(() => {
    const storedUser = localStorage.getItem('dds_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    document.title = 'Plataforma DDS';
    loadInitialData();
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      const found = cities.find((city) => city.nome === selectedCity);
      if (found) {
        setSelectedCityId(found.id);
      }
    }
  }, [cities, selectedCity]);

  useEffect(() => {
    if (selectedDds) {
      loadAttachments(selectedDds.id);
      setSelectedCity(selectedDds.cidade_nome);
    } else {
      setAttachments([]);
    }
  }, [selectedDds]);

  const loadInitialData = async () => {
    await Promise.all([loadCities(), loadOperators(), loadUsers()]);
    loadDds();
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users', { headers: authHeader() });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Falha ao carregar usuários', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setMessage('Preencha nome, e-mail e senha do usuário.');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          nome: newUserName,
          email: newUserEmail,
          senha: newUserPassword,
          perfil: newUserPerfil
        })
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || 'Erro ao cadastrar usuário.');
        return;
      }

      setMessage(`Usuário ${result.nome} cadastrado com sucesso.`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserPerfil('visualizador');
      loadUsers();
    } catch (error) {
      console.error('Erro ao cadastrar usuário', error);
      setMessage('Erro ao cadastrar usuário. Veja o console.');
    }
  };

  const loadCities = async () => {
    try {
      const response = await fetch('/api/cities', { headers: authHeader() });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setCities(data);
        setSelectedCity(data[0].nome);
      } else {
        setCities(cidadesPadrao.map((nome) => ({ id: null, nome, estado: 'Maranhão' })));
      }
    } catch (error) {
      console.error('Falha ao carregar cidades', error);
      setCities(cidadesPadrao.map((nome) => ({ id: null, nome, estado: 'Maranhão' })));
    }
  };

  const loadOperators = async () => {
    try {
      const response = await fetch('/api/operators', { headers: authHeader() });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      setOperators(data);
      if (data.length > 0) {
        setOperatorId(data[0].id);
      }
    } catch (error) {
      console.error('Falha ao carregar operadores', error);
    }
  };

  const loadDds = async (params = {}) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          query.append(key, value);
        }
      });
      const response = await fetch(`/api/dds?${query.toString()}`, { headers: authHeader() });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      setDdsList(data);
      if (data.length > 0) {
        if (!selectedDds || data.every((item) => item.id !== selectedDds.id)) {
          setSelectedDds(data[0]);
        } else {
          setSelectedDds(data.find((item) => item.id === selectedDds.id));
        }
      } else {
        setSelectedDds(null);
      }
    } catch (error) {
      console.error('Falha ao carregar DDS', error);
    }
  };

  const loadAttachments = async (ddsId) => {
    try {
      const response = await fetch(`/api/dds/${ddsId}/anexos`, { headers: authHeader() });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      setAttachments(data);
    } catch (error) {
      console.error('Falha ao carregar anexos', error);
    }
  };

  const handleSaveDds = async () => {
    if (!ddsTitle.trim() || !operatorId || !selectedCityId) {
      setMessage('Preencha título, operador e cidade antes de salvar.');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', ddsTitle);
    formData.append('descricao', ddsDescription);
    formData.append('operador_id', operatorId);
    formData.append('cidade_id', selectedCityId);
    formData.append('data_dds', dataDds);
    formData.append('status', status);
    formData.append('conferido', conferido ? '1' : '0');

    if (anexoPdf) formData.append('anexos', anexoPdf);
    if (anexoVideo) formData.append('anexos', anexoVideo);

    try {
      const response = await fetch('/api/dds', {
        method: 'POST',
        headers: authHeader(),
        body: formData
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || 'Erro ao salvar DDS.');
        return;
      }

      setMessage(`DDS salvo com sucesso: ${result.titulo}`);
      setDdsTitle('');
      setDdsDescription('');
      setAnexoPdf(null);
      setAnexoVideo(null);
      setConferido(false);
      loadDds(filter);
    } catch (error) {
      console.error('Erro ao salvar DDS', error);
      setMessage('Erro ao salvar DDS. Veja o console.');
    }
  };

  const handleApplyFilters = () => {
    const params = {
      operador: filter.operador,
      dia: filter.dia,
      mes: filter.mes,
      ano: filter.ano,
      estado: filter.estado,
      cidade: filter.cidade,
      incluirDesabilitados: filter.incluirDesabilitados ? '1' : '',
      conferido: filter.conferido
    };
    loadDds(params);
  };

  const handleMarkConferido = async (dds) => {
    try {
      const response = await fetch(`/api/dds/${dds.id}/conferir`, {
        method: 'PATCH',
        headers: authHeader()
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (response.ok) {
        loadDds(filter);
        setMessage('DDS marcado como conferido.');
      }
    } catch (error) {
      console.error('Falha ao marcar conferido', error);
    }
  };

  const handleUploadAttachments = async (files) => {
    if (!selectedDds || !files.length) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('anexos', file));

    try {
      const response = await fetch(`/api/dds/${selectedDds.id}/anexos`, {
        method: 'POST',
        headers: authHeader(),
        body: formData
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.ok) {
        loadAttachments(selectedDds.id);
        setMessage('Anexos enviados com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao enviar anexos', error);
    }
  };

  const handleDeleteAttachment = async (id) => {
    try {
      const response = await fetch(`/api/dds/anexos/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (response.ok) {
        loadAttachments(selectedDds.id);
        setMessage('Anexo removido.');
      }
    } catch (error) {
      console.error('Falha ao remover anexo', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dds_user');
    localStorage.removeItem('dds_token');
    navigate('/login');
  };

  const currentCityNames = cities.length > 0 ? cities.map((city) => city.nome) : cidadesPadrao;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Júpiter DDS</div>
        <div className="topbar-nav">
          <button
            className={`nav-button ${selectedSection === 'cadastro' ? 'active' : ''}`}
            onClick={() => setSelectedSection('cadastro')}
          >
            Cadastro
          </button>
          <button
            className={`nav-button ${selectedSection === 'usuarios' ? 'active' : ''}`}
            onClick={() => setSelectedSection('usuarios')}
          >
            Usuários
          </button>
        </div>
        <div className="topbar-user">
          <span>{user?.nome} ({perfilDescricao})</span>
          <button className="small-button" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <section className="page-header">
        <div>
          <h1>Controle de DDS</h1>
          <p>Use os filtros abaixo e selecione a cidade para ver ou registrar novos relatórios.</p>
        </div>
      </section>

      <section className="filter-panel">
        <div className="filter-grid filter-grid-top">
          <label>
            Operador
            <select value={filter.operador} onChange={(e) => setFilter({ ...filter, operador: e.target.value })}>
              <option value="">Todos</option>
              {operators.map((operator) => (
                <option key={operator.id} value={operator.nome}>{operator.nome}</option>
              ))}
            </select>
          </label>
          <label>
            Mês
            <input
              type="number"
              min="1"
              max="12"
              value={filter.mes}
              onChange={(e) => setFilter({ ...filter, mes: e.target.value })}
              placeholder="Mês"
            />
          </label>
          <label>
            Ano
            <input
              type="number"
              min="2020"
              value={filter.ano}
              onChange={(e) => setFilter({ ...filter, ano: e.target.value })}
              placeholder="Ano"
            />
          </label>
          <label>
            Estado
            <input
              value={filter.estado}
              onChange={(e) => setFilter({ ...filter, estado: e.target.value })}
              placeholder="Estado"
            />
          </label>
          <label>
            Cidade
            <input
              value={filter.cidade}
              onChange={(e) => setFilter({ ...filter, cidade: e.target.value })}
              placeholder="Cidade"
            />
          </label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter.conferido === 'sim'}
                onChange={(e) => setFilter({ ...filter, conferido: e.target.checked ? 'sim' : '' })}
              />
              Relatórios conferidos
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter.incluirDesabilitados}
                onChange={(e) => setFilter({ ...filter, incluirDesabilitados: e.target.checked })}
              />
              Incluir desabilitadas
            </label>
          </div>
          <button className="secondary-button filter-apply" onClick={handleApplyFilters}>Filtrar</button>
        </div>
      </section>

      <CityButtons cidades={currentCityNames} selectedCity={selectedCity} onSelect={setSelectedCity} />

      <main className="main-layout">
        <section className="main-content">
          {selectedSection === 'cadastro' ? (
            <>              
              <div className="form-card">
                <div className="panel-header">
                  <div>
                    <h2>Cadastro de DDS</h2>
                    <p>Registre um novo DDS para a cidade selecionada.</p>
                  </div>
                </div>

                {message && <div className="message-box">{message}</div>}

                <label>
                  Título do DDS
                  <input value={ddsTitle} onChange={(e) => setDdsTitle(e.target.value)} />
                </label>

                <label>
                  Descrição do tema
                  <textarea value={ddsDescription} onChange={(e) => setDdsDescription(e.target.value)} />
                </label>

                <div className="form-grid">
                  <label>
                    Operador responsável
                    <select value={operatorId} onChange={(e) => setOperatorId(e.target.value)}>
                      {operators.map((operator) => (
                        <option key={operator.id} value={operator.id}>{operator.nome}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Data do DDS
                    <input type="date" value={dataDds} onChange={(e) => setDataDds(e.target.value)} />
                  </label>
                  <label>
                    Cidade / escritório selecionada
                    <input value={selectedCity} disabled />
                  </label>
                  <label>
                    Status
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="ativo">Ativo</option>
                      <option value="desabilitado">Desabilitado</option>
                    </select>
                  </label>
                </div>

                <label className="checkbox-label compact">
                  <input type="checkbox" checked={conferido} onChange={(e) => setConferido(e.target.checked)} />
                  DDS conferido
                </label>

                <div className="attachments-inputs">
                  <label>
                    Anexo PDF
                    <input type="file" accept="application/pdf" onChange={(e) => setAnexoPdf(e.target.files[0])} />
                  </label>
                  <label>
                    Anexo de vídeo
                    <input type="file" accept="video/*" onChange={(e) => setAnexoVideo(e.target.files[0])} />
                  </label>
                </div>

                <button className="primary-button" onClick={handleSaveDds}>Salvar DDS</button>
              </div>

              <DdsList ddsList={ddsList} selectedDds={selectedDds} onSelect={setSelectedDds} onMarkConferido={handleMarkConferido} />
            </>
          ) : (
            <div className="form-card">
              <div className="panel-header">
                <div>
                  <h2>Área de Usuários</h2>
                  <p>Cadastre novos acessos e visualize perfis de administrador e visualizador.</p>
                </div>
              </div>

              {message && <div className="message-box">{message}</div>}

              {isAdmin ? (
                <div className="form-grid">
                  <label>
                    Nome do usuário
                    <input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Nome completo" />
                  </label>
                  <label>
                    E-mail
                    <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@dominio.com" />
                  </label>
                  <label>
                    Senha
                    <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Senha" />
                  </label>
                  <label>
                    Perfil
                    <select value={newUserPerfil} onChange={(e) => setNewUserPerfil(e.target.value)}>
                      <option value="visualizador">Visualizador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </label>
                </div>
              ) : (
                <div className="message-box">Apenas administradores podem cadastrar novos usuários.</div>
              )}

              {isAdmin && (
                <button className="primary-button" onClick={handleCreateUser}>Cadastrar usuário</button>
              )}

              <div className="dds-list" style={{ marginTop: '24px' }}>
                <div className="panel-header">
                  <div>
                    <h2>Usuários cadastrados</h2>
                    <p>Veja os perfis de cada usuário do sistema.</p>
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="dds-table user-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Perfil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item.id}>
                          <td>{item.nome}</td>
                          <td>{item.email}</td>
                          <td>{item.perfil === 'admin' ? 'Administrador' : 'Visualizador'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>

        {selectedSection === 'cadastro' && (
          <aside className="side-panel">
            <SidebarAttachments
              dds={selectedDds}
              attachments={attachments}
              onUpload={handleUploadAttachments}
              onDeleteAttachment={handleDeleteAttachment}
            />
          </aside>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
