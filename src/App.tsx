import { HashRouter, Routes, Route } from "react-router-dom"
import Prereq from "./screens/Preqreq"
import Database from "./screens/Database"
import Students from "./screens/Students"
import Sidebar from "./components/Sidebar"

export default function App() {
  return (
    <HashRouter>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Prereq />} />
          <Route path="/db" element={<Database />} />
          <Route path="/students" element={<Students />} /> {/* NEW TAB */}
        </Routes>
      </Sidebar>
    </HashRouter>
  )
}
