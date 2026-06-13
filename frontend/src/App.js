import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home         from "./components/Home";
import UploadResume from "./components/UploadResume";
import Dashboard    from "./components/Dashboard";
import History      from "./components/History";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Home />}         />
        <Route path="/upload"    element={<UploadResume />} />
        <Route path="/dashboard" element={<Dashboard />}    />
        <Route path="/history"   element={<History />}      />
      </Routes>
    </Router>
  );
}

export default App;