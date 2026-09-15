import pg from 'pg';

const pgSsl = process.env.POSTGRES_SSL === 'true'
  ? { rejectUnauthorized: false }
  : false;

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 5,
  ssl: pgSsl,
});

export async function sql(strings, ...values) {
  let text = strings[0];
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}` + strings[i + 1];
  }
  const client = await pool.connect();
  try {
    return await client.query({ text, values });
  } finally {
    client.release();
  }
}

sql.unsafe = async (query, values) => {
  const client = await pool.connect();
  try {
    return values !== undefined && values !== null
      ? await client.query({ text: query, values })
      : await client.query(query);
  } finally {
    client.release();
  }
};
