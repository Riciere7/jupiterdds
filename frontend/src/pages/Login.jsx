import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('admin@dds.com');
  const [senha, setSenha] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('dds_user')) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    if (event) event.preventDefault();
    setError('');
    try {
      const response = await fetch('https://api.jupiter.com.br/action/Usuario/logar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ usuario: email, senha })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Falha ao fazer login.');
        return;
      }

      const user = {
        nome: result.usuario || email,
        perfil: result.perfil || 'visualizador'
      };
      localStorage.setItem('dds_user', JSON.stringify(user));
      localStorage.setItem('dds_token', result.accessToken);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar ao servidor.');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-box">
        <h1>Login DDS</h1>
        <p>Entre com seu usuário para acessar a plataforma.</p>
        {error && <div className="message-box error-box">{error}</div>}
        <form onSubmit={handleLogin}>
          <label>
            E-mail
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@dds.com" />
          </label>
          <label>
            Senha
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="admin123" />
          </label>
          <button className="primary-button" type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
