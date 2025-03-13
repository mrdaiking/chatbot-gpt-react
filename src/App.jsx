import OpenAI from 'openai'
import { useState } from 'react'

const openai = new OpenAI({
  apiKey: 'x',
  dangerouslyAllowBrowser: true,
})

const isBotMessage = (chatMessage) => {
  return chatMessage.role === 'assistant'
}

function App() {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  const submitForm = async (e) => {
    e.preventDefault()

    // Add user message to chat message
    const userMessage = { role: 'user', content: message }
    const waitingBotMessage = {
      role: 'assistant',
      content: 'Vui long cho bot tra loi',
    }

    setChatHistory([...chatHistory, userMessage, waitingBotMessage])

    try {
      const responseStream = await openai.chat.completions.create({
        messages: [...chatHistory, userMessage],
        model: 'gpt-4o-mini',
        stream: true,
      })

      let botMessageContent = ''
      for await (const chunk of responseStream) {
        botMessageContent += chunk.choices[0].delta.content || ''
        const botMessage = { role: 'assistant', content: botMessageContent }
        setChatHistory((prevChatHistory) => [
          ...prevChatHistory.slice(0, -1),
          botMessage,
        ])
      }
    } catch (error) {
      console.error('Error fetching chat completion:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
      }
      setChatHistory([...chatHistory, userMessage, errorMessage])
    }

    setMessage('')
  }

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <div className="container mx-auto p-4 flex flex-col h-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">ChatUI với React + OpenAI</h1>
        <form className="flex" onSubmit={submitForm}>
          <input
            type="text"
            placeholder="Tin nhắn của bạn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-2 rounded-l border border-gray-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            Gửi tin nhắn
          </button>
        </form>

        <div className="flex-grow overflow-y-auto mt-4 bg-white-custom rounded shadow p-4">
          {chatHistory.map((chatMessage, index) => (
            <div
              key={index}
              className={`mb-2 ${
                isBotMessage(chatMessage) ? 'text-right' : ''
              }`}
            >
              <p className="text-gray-600 text-sm">
                {isBotMessage(chatMessage) ? 'Bot' : 'User'}
              </p>
              <p
                className={`p-2 bg-gray-200 rounded-lg inline-block ${
                  isBotMessage(chatMessage) ? 'bg-green-100' : 'bg-blue-100'
                }`}
              >
                {chatMessage.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default App
