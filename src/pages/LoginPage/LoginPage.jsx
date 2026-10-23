import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fieldErrors, validateLogin, validateRegister } from '../../utils/validation.js';
import './LoginPage.css';

// Demo accounts created by the backend seed
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@techstore.com', password: 'Admin123!' },
  { label: 'Usuario', email: 'user@techstore.com', password: 'User123!' },
];

const EMPTY = { name: '', email: '', password: '' };

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user && !submitting) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const isLogin = mode === 'login';

  function switchMode(next) {
    setMode(next);
    setErrors({});
    setFormError('');
  }

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((errs) => ({ ...errs, [field]: undefined }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const clientErrors = isLogin ? validateLogin(form) : validateRegister(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      const loggedIn = isLogin
        ? await login({ email: form.email, password: form.password })
        : await register(form);
      toast.success(isLogin ? `¡Hola de nuevo, ${loggedIn.name.split(' ')[0]}!` : '¡Cuenta creada! Ya puedes dejar reseñas.');
      const fallback = loggedIn.role === 'admin' ? '/admin' : '/';
      navigate(location.state?.from ?? fallback, { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(err.details ? 'Revisa los campos marcados.' : err.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth__card">
        <div className="auth__intro">
          <h1 className="auth__title">{isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}</h1>
          <p className="auth__subtitle">
            {isLogin ? 'Accede para dejar reseñas o administrar el catálogo.' : 'Regístrate para opinar sobre tus productos favoritos.'}
          </p>
        </div>

        <div className="auth__tabs" role="tablist" aria-label="Tipo de acceso">
          <button type="button" role="tab" aria-selected={isLogin} className={`auth__tab ${isLogin ? 'auth__tab--active' : ''}`} onClick={() => switchMode('login')}>
            Iniciar sesión
          </button>
          <button type="button" role="tab" aria-selected={!isLogin} className={`auth__tab ${!isLogin ? 'auth__tab--active' : ''}`} onClick={() => switchMode('register')}>
            Registrarse
          </button>
        </div>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          {formError && <p className="alert alert--error" role="alert">{formError}</p>}

          {!isLogin && (
            <div className="field">
              <label className="field__label" htmlFor="auth-name">Nombre</label>
              <input id="auth-name" className={`field__input ${errors.name ? 'field__input--invalid' : ''}`} value={form.name} onChange={update('name')} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'auth-name-error' : undefined} />
              {errors.name && <span id="auth-name-error" className="field__error">{errors.name}</span>}
            </div>
          )}

          <div className="field">
            <label className="field__label" htmlFor="auth-email">Correo electrónico</label>
            <input id="auth-email" type="email" className={`field__input ${errors.email ? 'field__input--invalid' : ''}`} value={form.email} onChange={update('email')} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'auth-email-error' : undefined} />
            {errors.email && <span id="auth-email-error" className="field__error">{errors.email}</span>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="auth-password">Contraseña</label>
            <input id="auth-password" type="password" className={`field__input ${errors.password ? 'field__input--invalid' : ''}`} value={form.password} onChange={update('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'auth-password-error' : 'auth-password-hint'} />
            {errors.password
              ? <span id="auth-password-error" className="field__error">{errors.password}</span>
              : !isLogin && <span id="auth-password-hint" className="field__hint">Mínimo 8 caracteres, una mayúscula y un número.</span>}
          </div>

          <button type="submit" className="button button--primary auth__submit" disabled={submitting}>
            {submitting ? 'Un momento…' : isLogin ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        {isLogin && (
          <aside className="auth__demo" aria-label="Cuentas de prueba">
            <p className="auth__demo-title">Cuentas de prueba</p>
            <div className="auth__demo-list">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="auth__demo-account"
                  onClick={() => { setForm({ ...EMPTY, email: account.email, password: account.password }); setErrors({}); setFormError(''); }}
                >
                  <strong>{account.label}</strong>
                  <span>{account.email}</span>
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
