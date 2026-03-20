import { FormEvent, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { getOwnerPassword, loginOwner } from '../utils/ownerAuth';

export function OwnerLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/owner';
  }, [location.state]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.trim() === getOwnerPassword()) {
      loginOwner();
      navigate(nextPath, { replace: true });
      return;
    }

    setError('Неверный пароль. Проверь значение и попробуй снова.');
  };

  return (
    <div className="page-stack owner-login-page">
      <PageHeader
        title="Вход для владельца"
        subtitle="Отдельная страница входа в owner-раздел. Позже сюда можно подключить полноценную серверную авторизацию."
        showBack
      />

      <section className="owner-login-card">
        <div className="owner-login-card__intro">
          <span className="eyebrow">Owner access</span>
          <h2>Управление наполнением приложения</h2>
          <p>
            Сейчас вход защищён паролем на фронтенде. Для продакшена лучше вынести проверку на сервер и
            хранить пароль в переменной Railway `VITE_OWNER_PASSWORD`.
          </p>
        </div>

        <form className="owner-login-form" onSubmit={handleSubmit}>
          <label className="field owner-login-form__field">
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError('');
              }}
              placeholder="Введите пароль владельца"
              autoComplete="current-password"
            />
          </label>

          {error ? <div className="owner-login-form__error">{error}</div> : null}

          <div className="owner-login-form__actions">
            <button className="button button--primary" type="submit">
              Войти в owner-page
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
