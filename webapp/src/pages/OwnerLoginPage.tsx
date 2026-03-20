import { FormEvent, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { PageHeader } from '../components/layout/PageHeader';

export function OwnerLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const nextPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/owner';
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.ownerLogin(password);
      navigate(nextPath, { replace: true });
    } catch {
      setError('Неверный пароль владельца. Проверь значение и попробуй снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack owner-auth-page">
      <PageHeader
        title="Owner login"
        subtitle="Пароль теперь проверяется на сервере, а не во фронтенде. После входа создаётся owner-сессия."
        badgeLabel="Hidden route"
      />

      <section className="panel owner-auth-card">
        <div>
          <span className="pill pill--ghost">Server auth</span>
          <h2>Вход в owner-CMS</h2>
          <p>Ссылка остаётся скрытой от публичной навигации. CRUD-операции и загрузка фото защищены сессией.</p>
        </div>

        <form className="owner-auth-form" onSubmit={handleSubmit}>
          <label className="field field--grow">
            <span>Пароль</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите owner-пароль" autoComplete="current-password" />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Входим…' : 'Открыть owner-CMS'}
          </button>
        </form>
      </section>
    </div>
  );
}
