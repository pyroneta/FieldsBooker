import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import '../css/UserPopup.css'

const EMPTY_FORM = { name: '', lastname: '', email: '', phoneNumber: '', password: '' }

function validate(form, mode) {
  const e = {}
  if (mode === 'registro') {
    if (!form.name.trim())        e.name        = 'El nombre es requerido'
    if (!form.lastname.trim())    e.lastname    = 'El apellido es requerido'
    if (!form.phoneNumber.trim()) e.phoneNumber = 'El teléfono es requerido'
  }
  if (!form.email.trim())              e.email    = 'El correo es requerido'
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'El correo no es válido'
  if (!form.password.trim())           e.password = 'La contraseña es requerida'
  else if (form.password.length < 6)   e.password = 'Mínimo 6 caracteres'
  return e
}

export default function UserPopup({ onLogin }) {
  const [open, setOpen]         = useState(false)
  const [mode, setMode]         = useState('login')
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cliente')
    return saved ? JSON.parse(saved) : null
  })
  const [form, setForm] = useState(EMPTY_FORM)

  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Cerrar menú de usuario al click afuera
  useEffect(() => {
    if (!open || !user) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, user])

  // Cerrar modal con ESC
  useEffect(() => {
    if (!open || user) return
    function handleKey(e) { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, user])

  const closeModal = () => {
    setOpen(false)
    setApiError('')
    setFieldErrors({})
    setForm(EMPTY_FORM)
  }

  const switchMode = (next) => {
    setMode(next)
    setApiError('')
    setFieldErrors({})
    setForm(EMPTY_FORM)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(fe => ({ ...fe, [name]: '' }))
  }

  const handleLogin = async e => {
    e.preventDefault()
    const errs = validate(form, 'login')
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setLoading(true)
    setApiError('')
    try {
      const { data } = await api.post('/api/auth/login', {
        email: form.email,
        password: form.password,
      })
      localStorage.setItem('cliente', JSON.stringify(data))
      setUser(data)
      closeModal()
      if (onLogin) onLogin(data)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistro = async e => {
    e.preventDefault()
    const errs = validate(form, 'registro')
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setLoading(true)
    setApiError('')
    try {
      const { data } = await api.post('/api/auth/register', form)
      localStorage.setItem('cliente', JSON.stringify(data))
      setUser(data)
      closeModal()
      if (onLogin) onLogin(data)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('cliente')
    setUser(null)
    setOpen(false)
    navigate('/')
  }

  const iniciales = user
    ? `${user.name?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase()
    : null

  return (
    <div className="up-wrapper" ref={user ? menuRef : null}>

      <button
        className="up-trigger"
        onClick={() => setOpen(o => !o)}
        aria-label="Cuenta"
      >
        {user ? (
          <span className="up-avatar up-avatar--sm">{iniciales}</span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        )}
      </button>

      {/* ── Menú usuario logueado (dropdown pequeño) ── */}
      {open && user && (
        <div className="up-menu">
          <div className="up-user-header">
            <span className="up-avatar up-avatar--lg">{iniciales}</span>
            <div>
              <p className="up-user-name">{user.name} {user.lastname}</p>
              <p className="up-user-email">{user.email}</p>
            </div>
          </div>
          <div className="up-divider" />
          <button className="up-menu-btn" onClick={() => { navigate('/mybookings'); setOpen(false) }}>
            Mis reservas
          </button>
          <button className="up-menu-btn up-menu-btn--danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}

      {/* ── Modal login / registro ── */}
      {open && !user && (
        <div className="up-backdrop" onMouseDown={closeModal}>
          <div className="up-modal" onMouseDown={e => e.stopPropagation()}>

            <div className="up-modal-header">
              <h2 className="up-modal-title">
                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </h2>
              <button className="up-close" onClick={closeModal} aria-label="Cerrar">✕</button>
            </div>

            {apiError && <p className="up-api-error">{apiError}</p>}

            <form onSubmit={mode === 'login' ? handleLogin : handleRegistro} noValidate>

              {mode === 'registro' && (
                <div className="up-row">
                  <div className="up-field">
                    {fieldErrors.name && <span className="up-field-error">{fieldErrors.name}</span>}
                    <input
                      className={`up-input${fieldErrors.name ? ' up-input--error' : ''}`}
                      name="name" placeholder="Nombre"
                      value={form.name} onChange={handleChange}
                    />
                  </div>
                  <div className="up-field">
                    {fieldErrors.lastname && <span className="up-field-error">{fieldErrors.lastname}</span>}
                    <input
                      className={`up-input${fieldErrors.lastname ? ' up-input--error' : ''}`}
                      name="lastname" placeholder="Apellido"
                      value={form.lastname} onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {mode === 'registro' && (
                <div className="up-field">
                  {fieldErrors.phoneNumber && <span className="up-field-error">{fieldErrors.phoneNumber}</span>}
                  <input
                    className={`up-input${fieldErrors.phoneNumber ? ' up-input--error' : ''}`}
                    name="phoneNumber" placeholder="Teléfono"
                    value={form.phoneNumber} onChange={handleChange}
                  />
                </div>
              )}

              <div className="up-field">
                {fieldErrors.email && <span className="up-field-error">{fieldErrors.email}</span>}
                <input
                  className={`up-input${fieldErrors.email ? ' up-input--error' : ''}`}
                  name="email" type="email" placeholder="Correo electrónico"
                  value={form.email} onChange={handleChange}
                />
              </div>

              <div className="up-field">
                {fieldErrors.password && <span className="up-field-error">{fieldErrors.password}</span>}
                <input
                  className={`up-input${fieldErrors.password ? ' up-input--error' : ''}`}
                  name="password" type="password" placeholder="Contraseña"
                  value={form.password} onChange={handleChange}
                />
              </div>

              <button type="submit" className="up-btn" disabled={loading}>
                {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
              </button>
            </form>

            <p className="up-switch">
              {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
              <span className="up-switch-link" onClick={() => switchMode(mode === 'login' ? 'registro' : 'login')}>
                {mode === 'login' ? 'Créala aquí' : 'Iniciá sesión'}
              </span>
            </p>

          </div>
        </div>
      )}

    </div>
  )
}
