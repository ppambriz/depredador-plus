import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { CategoryType } from '@/types'
import { categoryService } from '@/services/categoryService'
import { codeService } from '@/services/codeService'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Seo } from '@/seo/Seo'
import { generateSlug } from '@/lib/slug'
import { CATEGORY_TYPE_LABELS } from '@/lib/labels'

export function CategoryFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [type, setType] = useState<CategoryType>('insect')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (isEdit && id) {
        const cat = await categoryService.getById(id)
        if (cancelled) return
        if (!cat) {
          setError('La categoría no existe.')
          setLoading(false)
          return
        }
        setCode(cat.code)
        setName(cat.name)
        setSlug(cat.slug)
        setSlugTouched(true)
        setType(cat.type)
      } else {
        const suggested = await codeService.suggestNextCode('category')
        if (cancelled) return
        setCode(suggested)
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [id, isEdit])

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) setSlug(generateSlug(value))
  }

  async function validateCode(): Promise<boolean> {
    if (isEdit) return true

    const trimmed = code.trim()
    if (!trimmed) {
      setCodeError('El código es obligatorio.')
      return false
    }

    const available = await codeService.isCodeAvailable('category', trimmed)
    if (!available) {
      setCodeError(`El código ${trimmed} ya existe (puede estar desactivado).`)
      return false
    }

    setCodeError('')
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !slug.trim()) {
      setError('El nombre y el slug son obligatorios.')
      return
    }

    setSaving(true)
    try {
      if (!(await validateCode())) return

      if (isEdit && id) {
        await categoryService.update(id, { name: name.trim(), slug: slug.trim(), type })
      } else {
        await categoryService.create({ code: code.trim(), name: name.trim(), slug: slug.trim(), type })
      }
      navigate('/admin/categorias')
    } catch (err) {
      const dbError = err as { code?: string; message?: string }
      if (dbError.code === '23505') {
        setError(dbError.message?.includes('slug')
          ? 'Ese slug ya está en uso por otra categoría.'
          : 'Ese código ya está en uso.')
      } else {
        setError('No se pudo guardar la categoría.')
      }
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-verde focus:ring-1 focus:ring-verde disabled:bg-fondo disabled:text-gris'

  return (
    <>
      <Seo title={`${isEdit ? 'Editar' : 'Nueva'} categoría | Admin`} description="Formulario de categoría" noindex />
      <AdminLayout title={isEdit ? 'Editar categoría' : 'Nueva categoría'}>
        {loading ? (
          <p className="text-sm text-gris">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl rounded-xl border border-black/5 bg-white p-6">
            {error && (
              <p className="mb-4 rounded-lg bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>
            )}

            <label className="block">
              <span className="text-sm font-medium">Código</span>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError('') }}
                onBlur={validateCode}
                disabled={isEdit}
                className={`${inputClass} font-mono`}
              />
              <span className="mt-1 block text-xs text-gris">
                {isEdit
                  ? 'El código no se puede modificar una vez creado.'
                  : 'Sugerido automáticamente. Puedes cambiarlo.'}
              </span>
              {codeError && <span className="mt-1 block text-xs text-rojo">{codeError}</span>}
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium">Nombre</span>
              <input
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium">Slug (URL)</span>
              <input
                value={slug}
                onChange={e => { setSlug(generateSlug(e.target.value)); setSlugTouched(true) }}
                required
                className={`${inputClass} font-mono`}
              />
              <span className="mt-1 block text-xs text-gris">
                Se genera del nombre. Aparecerá como /catalogo/{slug || '...'}
              </span>
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium">Tipo</span>
              <select
                value={type}
                onChange={e => setType(e.target.value as CategoryType)}
                className={inputClass}
              >
                {Object.entries(CATEGORY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-verde px-5 py-2.5 text-sm font-medium text-white transition hover:bg-verde-oscuro disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <Link
                to="/admin/categorias"
                className="rounded-lg border border-black/10 px-5 py-2.5 text-sm font-medium text-gris transition hover:bg-fondo"
              >
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </AdminLayout>
    </>
  )
}