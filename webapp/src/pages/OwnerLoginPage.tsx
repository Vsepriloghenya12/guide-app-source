import { FormEvent, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { loginOwner } from '../utils/ownerAuth';
import { loginOwnerRequest } from '../lib/api';

export function OwnerLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/owner';
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      const token = await loginOwnerRequest(password.trim());
      loginOwner(token);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти в owner-CMS.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack owner-login-page">
      <PageHeader
        title="Вход для владельца"
        subtitle="Отдельная ссылка для закрытой mini-CMS. В публичном приложении кнопок сюда нет. Авторизация уже вынесена на сервер."
        badgeLabel="Owner CMS"
      />

      <section className="owner-login-card">
        <div className="owner-login-card__intro">
          <span className="eyebrow">Owner access</span>
          <h2>Управление наполнением приложения</h2>
          <p>
            После входа откроется отдельная CMS, где можно добавлять рестораны, СПА,
            загружать фото и менять блоки главной страницы без перехода в публичное приложение.
          </p>
        </div>

        <form className="owner-login-form" onSubmit={handleSubmit}>
          <label className="field owner-login-form__field">
            <span>Пароль владельца</span>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError('');
              }}
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
          </label>

          {error ? <div className="owner-login-form__error">{error}</div> : null}

          <div className="owner-login-form__actions">
            <button className="button button--primary" type="submit" disabled={submitting}>
              {submitting ? 'Входим...' : 'Войти в owner-CMS'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
