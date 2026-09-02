import { formatRutInput } from './rut'

export type MemberIdentifierType = 'generic' | 'cl_rut'

export interface MemberIdentifierConfig {
  type: MemberIdentifierType
  label: string
  placeholder: string
  helpText: string
  formatInput?: (value: string) => string
}

export const MEMBER_IDENTIFIER_CONFIGS: Record<MemberIdentifierType, MemberIdentifierConfig> = {
  generic: {
    type: 'generic',
    label: 'Member identifier',
    placeholder: 'e.g. MEMBER-1234',
    helpText: 'Enter your member identifier.',
  },
  cl_rut: {
    type: 'cl_rut',
    label: 'RUT',
    placeholder: '12.345.678-5',
    helpText: 'Enter your Chilean RUT.',
    formatInput: formatRutInput,
  },
}

export function getMemberIdentifierConfig(type?: string | null): MemberIdentifierConfig {
  if (type === 'cl_rut') {
    return MEMBER_IDENTIFIER_CONFIGS.cl_rut
  }

  return MEMBER_IDENTIFIER_CONFIGS.generic
}
