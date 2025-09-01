'use client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export async function fetchResearch(topic: string, maxResults = 10) {
  const res = await fetch(`${API_BASE_URL}/api/v1/sage/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, max_results: maxResults })
  })
  if (!res.ok) throw new Error(`Research error ${res.status}`)
  return res.json()
}

export async function fetchDosage(compound: string, condition: string, experienceLevel = 'curious') {
  const res = await fetch(`${API_BASE_URL}/api/v1/sage/dosage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compound, condition, experience_level: experienceLevel })
  })
  if (!res.ok) throw new Error(`Dosage error ${res.status}`)
  return res.json()
}

export async function fetchInteractions(compounds: string[], medications: string[] = []) {
  const res = await fetch(`${API_BASE_URL}/api/v1/sage/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compounds, medications })
  })
  if (!res.ok) throw new Error(`Interactions error ${res.status}`)
  return res.json()
}

export async function fetchLegal(location = 'federal', productType?: string, compounds?: string[]) {
  const res = await fetch(`${API_BASE_URL}/api/v1/sage/legal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, product_type: productType, compounds })
  })
  if (!res.ok) throw new Error(`Legal status error ${res.status}`)
  return res.json()
}

export async function fetchMechanism(compound: string, targetSystem = 'endocannabinoid', detailLevel = 'intermediate') {
  const res = await fetch(`${API_BASE_URL}/api/v1/sage/mechanism`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compound, target_system: targetSystem, detail_level: detailLevel })
  })
  if (!res.ok) throw new Error(`Mechanism error ${res.status}`)
  return res.json()
}

