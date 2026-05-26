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

  const handleLogin = async () => {
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Falha ao fazer login.');
        return;
      }

      localStorage.setItem('dds_user', JSON.stringify(result.user));
      localStorage.setItem('dds_token', result.token);
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
        <label>
          E-mail
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@dds.com" />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="admin123" />
        </label>
        <button className="primary-button" onClick={handleLogin}>Entrar</button>
      </div>
    </div>
  );
}

export default Login;
