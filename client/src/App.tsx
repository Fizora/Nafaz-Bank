import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./components/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/dashboard" element={<Home />} />
        <Route path="/customer" element={<Home />} />
        <Route path="/services" element={<Home />} />
        <Route path="/audit" element={<Home />} />
        <Route path="/employee" element={<Home />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
