import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CityButtons from '../components/CityButtons.jsx';
import DdsList from '../components/DdsList.jsx';
import SidebarAttachments from '../components/SidebarAttachments.jsx';

const cidadesPadrao = [
  'Açailândia', 'Amarante do Maranhão', 'Campestre do Maranhão', 'Cidelândia',
  'Davinópolis', 'Estreito', 'Governador Edison Lobão', 'Grajaú', 'Imperatriz',
  'João Lisboa', 'Marabá', 'Parauapebas', 'Porto Franco', 'Ribamar Fiquene',
  'São Francisco do Brejão', 'São Pedro da Água Branca', 'Senador La Rocque',
  'Sítio Novo', 'Vila Nova dos Martírios'
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

  const authHeader = () => {
    const token = localStorage.getItem('dds_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('dds_user');
    localStorage.removeItem('dds_token');
    navigate('/login');
  };

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
    await Promise.all([loadCities(), loadOperators()]);
    loadDds();
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
        <div>CADASTRO</div>
        <div>LANÇAR DDS</div>
        <div>CONSULTAR DDS</div>
        <div>RELATÓRIOS</div>
        <div className="topbar-user">
          {user?.nome}
          <button className="small-button" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main className="main-layout">
        <section className="form-panel">
          <h1>Cadastro de DDS</h1>
          {message && <div className="message-box">{message}</div>}

          <label>
            Título do DDS
            <input value={ddsTitle} onChange={(e) => setDdsTitle(e.target.value)} />
          </label>

          <label>
            Descrição do tema
            <textarea value={ddsDescription} onChange={(e) => setDdsDescription(e.target.value)} />
          </label>

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

          <label className="checkbox-label">
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

          <div className="filters-panel">
            <h2>Filtros</h2>
            <div className="filter-grid">
              <label>
                Operador
                <input
                  value={filter.operador}
                  onChange={(e) => setFilter({ ...filter, operador: e.target.value })}
                  placeholder="Operador"
                />
              </label>
              <label>
                Dia
                <input
                  value={filter.dia}
                  onChange={(e) => setFilter({ ...filter, dia: e.target.value })}
                  placeholder="Dia"
                />
              </label>
              <label>
                Mês
                <input
                  value={filter.mes}
                  onChange={(e) => setFilter({ ...filter, mes: e.target.value })}
                  placeholder="Mês"
                />
              </label>
              <label>
                Ano
                <input
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
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filter.incluirDesabilitados}
                  onChange={(e) => setFilter({ ...filter, incluirDesabilitados: e.target.checked })}
                />
                Incluir desabilitados
              </label>
              <label>
                DDS conferido
                <select
                  value={filter.conferido}
                  onChange={(e) => setFilter({ ...filter, conferido: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </label>
              <button className="secondary-button" onClick={handleApplyFilters}>Aplicar filtros</button>
            </div>
          </div>
        </section>

        <section className="side-panel">
          <CityButtons cidades={currentCityNames} selectedCity={selectedCity} onSelect={setSelectedCity} />
          <DdsList ddsList={ddsList} selectedDds={selectedDds} onSelect={setSelectedDds} onMarkConferido={handleMarkConferido} />
          <SidebarAttachments
            dds={selectedDds}
            attachments={attachments}
            onUpload={handleUploadAttachments}
            onDeleteAttachment={handleDeleteAttachment}
          />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
