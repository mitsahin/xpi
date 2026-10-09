import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { LearnPage } from "./pages/LearnPage";
import { LessonPage } from "./pages/LessonPage";
import { VoicePage } from "./pages/VoicePage";

export default function App() {
  return (
    <div className="min-h-full bg-wt-surface">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/voice" element={<VoicePage />} />
      </Routes>
    </div>
  );
}
