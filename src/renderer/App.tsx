import { MemoryRouter as Router, Routes, Route } from "react-router-dom";

import "tailwindcss/tailwind.css";

import Index from "./pages/index";
import Portfolio from "./pages/portfolio";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
        </Router>
    );
}
