import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(config => {
  const cliente = JSON.parse(localStorage.getItem('cliente') || '{}')
  if (cliente?.token) {
    config.headers.Authorization = `Bearer ${cliente.token}`
  }
  return config
});

export const getFields        = () => api.get("/fields").then(r => r.data);
export const getFieldById     = (id) => api.get(`/fields/${id}`).then(r => r.data);

export const createClient     = (payload) => api.post("/clients", payload).then(r => r.data);

export const getBookings      = () => api.get("/bookings").then(r => r.data);
export const getMyBookings    = () => api.get("/bookings/my").then(r => r.data);
export const createBooking    = (payload) => api.post("/bookings", payload).then(r => r.data);
export const cancelBooking    = (id) => api.put(`/bookings/${id}/cancel`).then(r => r.data);
export const updateBooking    = (id, dateStart, dateEnd, additionalAmount) => {
  let url = `/bookings/${id}?dateStart=${encodeURIComponent(dateStart)}&dateEnd=${encodeURIComponent(dateEnd)}`;
  if (additionalAmount != null) url += `&amount=${additionalAmount}`;
  return api.put(url).then(r => r.data);
};
export const getSports        = () => api.get("/sports").then(r => r.data);

export default api;