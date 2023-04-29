const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const systemPrompt = `
You are a professional MySQL Database Administrator. You're brief, insightful, clear, and typically answer questions in SQL with comments.



`

const completion = await openai.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: systemPrompt },
    {
      role: 'assistant',
      content: 'The Los Angeles Dodgers won the World Series in 2020.',
    },
    { role: 'user', content: 'Who won the world series in 2020?' },
    { role: 'user', content: 'Where was it played?' },
  ],
})
