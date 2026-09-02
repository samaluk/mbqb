'use client'

import { FormEvent, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

type CheckStatus = 'active' | 'invalid_identifier' | 'not_found' | 'rate_limited'

type CheckResponse = {
  message: string
  status: CheckStatus
}

function isCheckStatus(status: unknown): status is CheckStatus {
  return (
    status === 'active' ||
    status === 'invalid_identifier' ||
    status === 'not_found' ||
    status === 'rate_limited'
  )
}

function parseCheckResponse(data: unknown): CheckResponse {
  if (typeof data !== 'object' || data === null) {
    return { message: 'Invalid response.', status: 'not_found' }
  }

  return { message: parseResponseMessage(data), status: parseResponseStatus(data) }
}

function parseResponseMessage(data: object): string {
  const fallback = 'Invalid response.'

  return 'message' in data && typeof data.message === 'string' ? data.message : fallback
}

function parseResponseStatus(data: object): CheckStatus {
  const status = 'status' in data ? data.status : null

  return isCheckStatus(status) ? status : 'not_found'
}

export function VerifyForm() {
  const [identifier, setIdentifier] = useState('')
  const [result, setResult] = useState<CheckResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await fetch('/api/verify', {
        body: JSON.stringify({ identifier }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const data: unknown = await response.json()
        setResult(parseCheckResponse(data))
        return
      }

      const data: unknown = await response.json()
      setResult(parseCheckResponse(data))
    } catch (error) {
      console.error('Failed to verify membership', error)
    }

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
              <FieldLabel className="font-bold" htmlFor="identifier">
                Member identifier
              </FieldLabel>
              <Input
                className="min-h-10 bg-paper px-3"
                autoCapitalize="none"
                autoComplete="off"
                id="identifier"
                inputMode="text"
                name="identifier"
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="e.g. MEMBER-1234"
                required
                value={identifier}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 border-t-0 bg-transparent">
          <Button className="min-h-10 w-full font-extrabold" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Verifying...
              </>
            ) : (
              'Verify membership'
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
