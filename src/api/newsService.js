import axios from 'axios'

const APITUBE_URL = 'https://api.apitube.io/v1/news/everything'
const API_KEY = import.meta.env.VITE_APITUBE_KEY

export async function fetchNews({ page = 1, perPage = 5 } = {}) {
  const { data } = await axios.get(APITUBE_URL, {
    params: {
      'language.code': 'en',
      per_page: perPage,
      page,
      api_key: API_KEY,
    },
  })
  return { results: data.results || [], hasMore: Boolean(data.has_next_pages) }
}
