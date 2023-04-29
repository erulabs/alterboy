require('dotenv').config()
const Knex = require('knex')

const databases = [
  {
    name: 'Mariadb 10',
    driver: 'mysql2',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: 3306,
  },
  {
    name: 'MySQL 8',
    driver: 'mysql2',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: 3307,
  },
  {
    name: 'PostgreSQL 13',
    driver: 'pg',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: 5432,
  },
]

for (const database of databases) {
  const knex = Knex({
    client: database.driver,
    connection: {
      host: '127.0.0.1',
      ...database,
    },
  })

  knex.schema.createTableLike('new_users', 'users', t => {
    t.increments('id').primary()
    t.string('first_name', 100)
    t.string('last_name', 100)
    t.text('bio')
  })
}
