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

  const resultClassName =
    result?.status === 'active'
      ? 'bg-lime/35 text-green'
      : 'bg-red/10 text-red'

  return (
    <form
      className="rounded-lg border border-line bg-white-soft p-6 shadow-[0_18px_60px_rgb(16_20_17_/_8%)] max-[760px]:p-4"
      onSubmit={onSubmit}
    >
      <div className="grid gap-2">
        <label className="text-sm font-bold" htmlFor="rut">
          RUT
        </label>
        <input
          className="min-h-12 w-full rounded-md border border-line bg-paper px-3.5 text-ink uppercase focus:border-green focus:outline-[3px] focus:outline-lime/40"
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
      <button
        className="mt-4 min-h-12 w-full cursor-pointer rounded-md bg-green font-extrabold text-white-soft disabled:cursor-wait disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Revisando...' : 'Revisar membresia'}
      </button>
      {result ? (
        <div className={`mt-4 rounded-md px-3.5 py-3 text-[15px] font-bold ${resultClassName}`}>
          {result.message}
        </div>
      ) : null}
    </form>
  )
}
