import { HashRouter, Routes, Route } from "react-router-dom"
import Prereq from "./screens/Preqreq"
import Database from "./screens/Database"
import Sidebar from "./components/Sidebar"

export default function App() {
  return (
    <HashRouter>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Prereq />} />
          <Route path="/db" element={<Database />} />
        </Routes>
      </Sidebar>
    </HashRouter>
  )
}