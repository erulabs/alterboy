require('dotenv').config()
const Knex = require('knex')

const databases = [
  // {
  //   name: 'Mariadb 10',
  //   driver: 'mysql2',
  //   user: process.env.MYSQL_USER,
  //   password: process.env.MYSQL_PASSWORD,
  //   database: process.env.MYSQL_DATABASE,
  //   port: 3306,
  // },
  {
    name: 'MySQL 8',
    driver: 'mysql2',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: 3307,
  },
  // {
  //   name: 'PostgreSQL 13',
  //   driver: 'pg',
  //   user: process.env.POSTGRES_USER,
  //   password: process.env.POSTGRES_PASSWORD,
  //   database: process.env.POSTGRES_DB,
  //   port: 5432,
  // },
]

async function main() {
  for (const database of databases) {
    await setupDatabase(database)
  }
}

async function setupDatabase(database) {
  const db = Knex({
    client: database.driver,
    connection: {
      host: '127.0.0.1',
      port: database.port,
      user: database.user,
      password: database.password,
      database: database.database,
    },
  })

  const tables = {
    ab_users: t => {
      t.increments('id').primary()
      t.string('first_name', 100)
      t.string('last_name', 100)
      t.text('bio')
    },
    ab_receipts: t => {
      t.increments('id').primary()
      t.integer('userId').unsigned().notNullable()
      t.foreign('userId').references('ab_users.id').withKeyName('ab_receipts_user_id_foreign')
      t.string('first_name', 100)
      t.string('last_name', 100)
      t.text('text_data')
    },
  }

  for (const table of Object.keys(tables).reverse()) {
    await db.schema.dropTableIfExists(table)
  }

  for (const table in tables) {
    await db.schema.createTable(table, tables[table])
  }

  await db.context.destroy()
}

main()
