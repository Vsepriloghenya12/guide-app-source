import { FormEvent, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { loginOwner } from '../utils/ownerAuth';

export function OwnerLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/owner';
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const authenticated = await loginOwner(password);
      if (!authenticated) {
        setError('Не удалось открыть owner-CMS. Попробуй ещё раз.');
        return;
      }

      navigate(nextPath, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось выполнить вход.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-stack owner-login-page">
      <PageHeader
        title="Вход для владельца"
        subtitle="Это отдельная ссылка для входа в закрытую owner-CMS. В публичном приложении кнопок сюда нет. Вход теперь проверяется на сервере, а не во фронтенде."
        badgeLabel="Owner CMS"
      />

      <section className="owner-login-card">
        <div className="owner-login-card__intro">
          <span className="eyebrow">Owner access</span>
          <h2>Управление наполнением приложения</h2>
          <p>
            Пароль хранится на сервере через Railway Variables. После входа открывается защищённая owner-сессия,
            а CRUD-операции больше не доступны из публичной части.
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
            <button className="button button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Проверяем…' : 'Войти в owner-CMS'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
