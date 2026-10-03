// 鏈湴寮€鍙戣蛋 vite 浠ｇ悊锛?agnes-api 鈫?https://www.agentsapi.site/v1锛?// 鐢熶骇鐜鍙敼涓哄悗绔唬鐞嗗湴鍧€
const AGNES_BASE_URL = '/agnes-api'
const AGNES_API_KEY = 'sk-H6eiUwwkHjUrbKzS5mzrs0XnwMfdbjYXEUw5O2IcV7PZln16'

export async function chatStream(messages, signal) {
  const response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AGNES_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'agnes-3.0-flash',
      messages,
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errText}`)
  }

  return response.body
}

export async function chatNonStream(messages) {
  const response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AGNES_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'agnes-3.0-flash',
      messages,
      stream: false,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errText}`)
  }

  return response.json()
}
