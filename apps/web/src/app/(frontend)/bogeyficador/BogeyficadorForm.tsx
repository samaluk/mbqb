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
    <form onSubmit={onSubmit}>
      <Card className="shadow-[0_18px_60px_rgb(16_20_17_/_8%)]">
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel className="font-bold" htmlFor="rut">
                RUT
              </FieldLabel>
              <Input
                className="min-h-12 bg-paper px-3.5 uppercase"
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
        <CardFooter className="flex-col items-stretch gap-4 border-t-0 bg-transparent">
          <Button className="min-h-12 w-full font-extrabold" disabled={isSubmitting} type="submit">
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
              className="h-auto justify-start whitespace-normal px-3.5 py-3 text-[15px] font-bold"
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
