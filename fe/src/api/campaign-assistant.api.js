const STREAM_URL = "/api/v1/campaign-assistant/stream"

function parseEvent(block) {
  let event = "message"
  let data = ""

  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith("event:")) event = line.slice(6).trim()
    if (line.startsWith("data:")) data += line.slice(5).trim()
  }

  return { event, data: data ? JSON.parse(data) : null }
}

export async function streamCampaignAssistant({
  message,
  history,
  signal,
  onEvent,
}) {
  const token = localStorage.getItem("accessToken")
  const response = await fetch(STREAM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
    signal,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const error = new Error(
      payload.message || "Trợ lý đang bận, vui lòng thử lại sau"
    )
    error.code = payload.error
    throw error
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  const emitBlocks = (blocks) => {
    for (const block of blocks) {
      if (!block.trim()) continue
      const parsed = parseEvent(block)
      onEvent?.(parsed.event, parsed.data)
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() || ""
    emitBlocks(blocks)
  }

  buffer += decoder.decode()
  if (buffer.trim()) emitBlocks([buffer])
}