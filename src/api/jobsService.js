import axios from 'axios'

const JOBS_API_URL = 'https://strive-benchmark.herokuapp.com/api/jobs'

// L'API ignora i parametri page/pageSize (verificato con richieste dirette:
// tornano sempre tutti i risultati che matchano `search`, fino a 1900 senza
// query) - la paginazione visibile in UI e' quindi tutta client-side su
// questo array gia' completo, non richieste ripetute al backend.
export async function searchJobs(query) {
  const { data } = await axios.get(JOBS_API_URL, {
    params: { search: query },
  })
  return data.data || []
}
