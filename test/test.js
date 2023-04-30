require('dotenv').config()
const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const fastDDL = ({ databaseType, databaseVersion }) => {
  if (databaseType === 'Aurora') {
    if (databaseVersion[0] === '2') {
      return true
    }
  }
  return false
}
const instantDDL = ({ databaseType, databaseVersion }) => {
  if (databaseType === 'Aurora') {
    if (databaseVersion[0] === '3') {
      return true
    }
  }
  return false
}

const generateSystemPrompt = ({ databaseBrand = 'MySQL' }) => {
  return [
    `You are an expert ${databaseBrand} database admin.`,
    `Reply with an improved version of the given ALTER statement.`,
    `Avoid downtime and table-locking, and aim for zero-impact.`,
    `Using Instant DDL or Fast DDL would be preferred if possible, or other tools like pt-online-schema-change and gh-ost.`,
    `Feel free to ask additional questions if more information is needed.`,
  ]
    .filter(Boolean)
    .join(' ')
}

const generateAssistantPrompt = ({
  databaseBrand = 'MySQL',
  databaseType = 'Aurora',
  databaseVersion = '3.02',
  hostedType = 'AWS',
  alterStatement,
  tableDefinitions,
}) => {
  return (
    alterStatement
      ? [
          databaseType === 'Aurora' && databaseVersion[0] === '3' && 'This database is MySQL 8.0 compatible.',
          `Other options like ALGORITHM=INPLACE, LOCK=NONE might be worth considering too.`,
          `innodb-online-ddl-operations documentation is relevant.`,
          ...(instantDDL({ databaseType, databaseVersion })
            ? [
                'Adding, dropping, or renaming columns can use INSTANT algorithm.',
                'Adding and dropping foreign key constraints, secondary indexes, dropping or renaming indexes, and changing index types can use INPLACE.',
                'Adding a FULLTEXT or SPATIAL indexes will block concurrent DML.',
              ]
            : []),
        ]
      : []
  )
    .filter(Boolean)
    .join(' ')
}

const alterStatement = 'ALTER TABLE `users` ADD COLUMN `bio` TEXT;'
const databaseType = 'Aurora'
const databaseVersion = '3.02'
const hostedType = 'AWS'

const main = async () => {
  const messages = [
    {
      role: 'system',
      content: generateSystemPrompt({ alterStatement }),
    },
    {
      role: 'assistant',
      content: generateAssistantPrompt({ alterStatement }),
    },
    {
      role: 'user',
      content: [
        `We are making an ALTER to a busy ${databaseType} ${databaseVersion} db hosted on ${hostedType}:\n`,
        alterStatement + '\n',
        `Can we use an ALGORITHM or LOCK option? How would you write this ALTER.`,
      ].join(''),
    },
  ]

  console.log({ messages })

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
  })

  const { usage, choices } = completion.data

  console.log([usage, ...choices])
}

main()
