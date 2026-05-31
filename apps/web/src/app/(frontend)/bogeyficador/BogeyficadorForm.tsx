'use client'

import { FormEvent, useState } from 'react'

type CheckStatus = 'active' | 'invalid_rut' | 'not_found' | 'rate_limited'

type CheckResponse = {
  message: string
  status: CheckStatus
}

const formatRutInput = (value: string) => {
  const cleaned = value.replace(/[.\-\s]/g, '').toUpperCase()
  const body = cleaned.slice(0, -1).replace(/\D/g, '')
  const checkDigit = cleaned.slice(-1).replace(/[^0-9K]/g, '')

  if (!body && !checkDigit) return ''
  if (!body) return checkDigit

  return `${new Intl.NumberFormat('es-CL').format(Number(body))}${checkDigit ? `-${checkDigit}` : ''}`
}

export function BogeyficadorForm() {
  const [rut, setRut] = useState('')
  const [result, setResult] = useState<CheckResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    const response = await fetch('/api/bogeyficador/check', {
      body: JSON.stringify({ rut }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    })

    const data = (await response.json()) as CheckResponse
    setResult(data)
    setIsSubmitting(false)
  }

  return (
    <form className="check-panel" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="rut">RUT</label>
        <input
          autoComplete="off"
          id="rut"
          inputMode="text"
          maxLength={12}
          name="rut"
          onChange={(event) => setRut(formatRutInput(event.target.value))}
          placeholder="12.345.678-5"
          required
          value={rut}
        />
      </div>
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Revisando...' : 'Revisar membresia'}
      </button>
      {result ? <div className={`result ${result.status}`}>{result.message}</div> : null}
    </form>
  )
}
