import { ref } from 'vue'
import { chatStream } from '@/api/agent'

export function useChat() {
  const WELCOME_MESSAGE = {
    role: 'assistant',
    content: '**有什么我能帮你的吗？**\n\n告诉我\~ 你可以直接问我问题，或者发送一段内容让我帮你处理。'
  }
  const messages = ref([])
  const isStreaming = ref(false)
  const currentContent = ref('')
  let abortController = null

  function ensureWelcome() {
    if (!messages.value.length) {
      messages.value = [WELCOME_MESSAGE]
    }
  }

  function getHistory() {
    const raw = localStorage.getItem('agent_history')
    return raw ? JSON.parse(raw) : []
  }

  function saveHistory() {
    const msgs = messages.value.map(m => ({
      role: m.role,
      content: m.content.slice(0, 2000)
    })).slice(-40)
    localStorage.setItem('agent_history', JSON.stringify(msgs))
  }

  async function send(userText) {
    if (!userText.trim() || isStreaming.value) return
    messages.value.push({ role: 'user', content: userText })
    isStreaming.value = true
    currentContent.value = ''
    messages.value.push({ role: 'assistant', content: '' })
    const idx = messages.value.length - 1
    abortController = new AbortController()

    try {
      const payload = messages.value
        .filter(m => !m.content.startsWith('[error]'))
        .slice(0, -1)
        .map(m => ({
          role: m.role,
          content: m.content
        }))
      const stream = await chatStream(payload, abortController.signal)
      const reader = stream.pipeThrough(new TextDecoderStream()).getReader()

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += value
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
          try {
            const json = JSON.parse(line.slice(6))
            const delta = json.choices?.[0]?.delta?.content || ''
            currentContent.value += delta
            messages.value[idx].content = currentContent.value
          } catch (e) {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        messages.value[idx].content = '[error] ' + (e.message || 'request failed')
      }
    } finally {
      isStreaming.value = false
      abortController = null
      saveHistory()
    }
  }

  function stop() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  function clearHistory() {
    messages.value = [WELCOME_MESSAGE]
    localStorage.removeItem('agent_history')
  }

  function loadHistory() {
    const msgs = getHistory()
    if (msgs.length) {
      messages.value = msgs
    } else {
      ensureWelcome()
    }
  }

  function replaceWithWelcome() {
    messages.value = [WELCOME_MESSAGE]
  }

  return {
    messages,
    isStreaming,
    currentContent,
    send,
    stop,
    clearHistory,
    loadHistory,
    ensureWelcome,
    replaceWithWelcome
  }
}
