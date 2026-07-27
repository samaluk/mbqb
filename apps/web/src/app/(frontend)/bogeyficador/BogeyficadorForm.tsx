'use client'

import { FormEvent, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

type CheckStatus = 'active' | 'invalid_rut' | 'not_found' | 'rate_limited'

type CheckResponse = {
  message: string
  status: CheckStatus
}

function isCheckStatus(status: unknown): status is CheckStatus {
  return (
    status === 'active' ||
    status === 'invalid_rut' ||
    status === 'not_found' ||
    status === 'rate_limited'
  )
}

function parseCheckResponse(data: unknown): CheckResponse {
  if (typeof data !== 'object' || data === null) {
    return { message: 'Respuesta invalida.', status: 'not_found' }
  }

  const message =
    'message' in data && typeof data.message === 'string' ? data.message : 'Respuesta invalida.'
  const status = 'status' in data ? data.status : null

  if (isCheckStatus(status)) {
    return { message, status }
  }

  return { message, status: 'not_found' }
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

    const data: unknown = await response.json()
    setResult(parseCheckResponse(data))
    setIsSubmitting(false)
  }

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event)
      }}
    >
      <Card className="shadow-card" size="sm">
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel className="font-bold" htmlFor="rut">
                RUT
              </FieldLabel>
              <Input
                className="min-h-10 bg-paper px-3 uppercase"
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
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 border-t-0 bg-transparent">
          <Button className="min-h-10 w-full font-extrabold" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Revisando...
              </>
            ) : (
              'Revisar membresia'
            )}
          </Button>
          {result ? (
            <Badge
              className="h-auto justify-start px-3 py-2.5 text-sm font-bold whitespace-normal"
              variant={result.status === 'active' ? 'secondary' : 'destructive'}
            >
              {result.message}
            </Badge>
          ) : null}
        </CardFooter>
      </Card>
    </form>
  )
}
