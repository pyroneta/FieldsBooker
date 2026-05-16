import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Fields from "./pages/Fields";
import FieldDetail from "./pages/FieldDetail";
import Bookings from "./pages/Bookings";
import MyBookings from "./pages/MyBookings";
import NewBooking from "./pages/NewBooking";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/fields"              element={<Fields />} />
        <Route path="/fields/:id"          element={<FieldDetail />} />
        <Route path="/bookings"             element={<Bookings />} />
        <Route path="/bookings/new"         element={<NewBooking />} />
        <Route path="/mybookings"           element={<MyBookings />} />
      </Routes>
    </BrowserRouter>
  );
}
