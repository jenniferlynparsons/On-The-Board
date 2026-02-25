const fetch = require('node-fetch')

const BASE = 'https://lscluster.hockeytech.com/feed/index.php'
const KEY = '446521baf8c38984'
const CLIENT = 'pwhl'

exports.handler = async (event) => {
  try {
    const params = new URLSearchParams(event.queryStringParameters || {})
    params.set('key', KEY)
    params.set('client_code', CLIENT)

    const res = await fetch(`${BASE}?${params}`)
    const data = await res.json()

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  } catch (err) {
    console.error('PWHL proxy error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch PWHL data' }),
    }
  }
}
