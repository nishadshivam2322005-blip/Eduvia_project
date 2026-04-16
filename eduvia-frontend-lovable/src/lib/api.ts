import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduvia_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const loginUser = (data: {email: string, password: string}) =>
  API.post('/auth/login', data)

export const registerUser = (data: {name: string, email: string, password: string, career_goal: string}) =>
  API.post('/auth/register', data)

export const uploadPDF = (formData: FormData, careerGoal: string) =>
  API.post(`/upload/pdf?career_goal=${encodeURIComponent(careerGoal)}`, formData)

export const getMySkills = () => API.get('/upload/my-skills')
export const getMyRoadmap = () => API.get('/upload/my-roadmap')

export default API