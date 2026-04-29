import { LlmAgent } from '@google/adk'
import { buildTeluguSystemPrompt, createTeluguAgent } from './teluguAgent'
import { buildHindiSystemPrompt, createHindiAgent } from './hindiAgent'
import { buildTamilSystemPrompt, createTamilAgent } from './tamilAgent'
import { buildKannadaSystemPrompt, createKannadaAgent } from './kannadaAgent'
import { buildMarathiSystemPrompt, createMarathiAgent } from './marathiAgent'

export function buildNativeLingoSystemPrompt(
  nativeLanguage: string,
  jobType: string,
  country: string,
): string {
  switch (nativeLanguage) {
    case 'te': return buildTeluguSystemPrompt(jobType, country)
    case 'hi': return buildHindiSystemPrompt(jobType, country)
    case 'ta': return buildTamilSystemPrompt(jobType, country)
    case 'kn': return buildKannadaSystemPrompt(jobType, country)
    case 'mr': return buildMarathiSystemPrompt(jobType, country)
    default:   return buildHindiSystemPrompt(jobType, country)
  }
}

export function createNativeLingoAgent(
  nativeLanguage: string,
  jobType: string,
  country: string,
): LlmAgent {
  switch (nativeLanguage) {
    case 'te': return createTeluguAgent(jobType, country)
    case 'hi': return createHindiAgent(jobType, country)
    case 'ta': return createTamilAgent(jobType, country)
    case 'kn': return createKannadaAgent(jobType, country)
    case 'mr': return createMarathiAgent(jobType, country)
    default:   return createHindiAgent(jobType, country)
  }
}
