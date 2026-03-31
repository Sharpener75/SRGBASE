import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Categories from './pages/Categories'
import Top50 from './pages/Top50'
import DiffExpression from './pages/DiffExpression'
import Targets from './pages/Targets'
import RawData from './pages/RawData'
import Contact from './pages/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background font-body">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories/:subclass" element={<Categories />} />
            <Route path="/categories" element={<Navigate to="/categories/miRNA" replace />} />
            <Route path="/top50/:subclass" element={<Top50 />} />
            <Route path="/top50" element={<Navigate to="/top50/miRNA" replace />} />
            <Route path="/diff-expression/:subclass" element={<DiffExpression />} />
            <Route path="/diff-expression" element={<Navigate to="/diff-expression/miRNA" replace />} />
            <Route path="/targets/:subclass" element={<Targets />} />
            <Route path="/targets" element={<Navigate to="/targets/miRNA_RNA_body" replace />} />
            <Route path="/raw-data" element={<RawData />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
