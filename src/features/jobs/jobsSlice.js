import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as jobsService from '../../api/jobsService'

const PAGE_SIZE = 10

export const searchJobs = createAsyncThunk(
  'jobs/searchJobs',
  async (query, { rejectWithValue }) => {
    try {
      const jobs = await jobsService.searchJobs(query)
      return { jobs, query }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  query: '',
  items: [],
  visibleCount: PAGE_SIZE,
  status: 'idle',
}

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    showMoreJobs(state) {
      state.visibleCount += PAGE_SIZE
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchJobs.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.query = action.payload.query
        state.items = action.payload.jobs
        state.visibleCount = PAGE_SIZE
      })
      .addCase(searchJobs.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export const { showMoreJobs } = jobsSlice.actions
export default jobsSlice.reducer

export const selectJobsQuery = (state) => state.jobs.query
export const selectVisibleJobs = (state) => state.jobs.items.slice(0, state.jobs.visibleCount)
export const selectJobsHasMore = (state) => state.jobs.items.length > state.jobs.visibleCount
export const selectJobsTotal = (state) => state.jobs.items.length
export const selectJobsStatus = (state) => state.jobs.status
