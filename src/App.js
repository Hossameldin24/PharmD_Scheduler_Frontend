import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import StudentDashboard from "./components/StudentDashboard";
import PreceptorDashboard from "./components/PerceptorDashboard";
import AdminDashboard from "./components/AdminDashboard";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/StudentDashboard/*" element={<StudentDashboard />} />
                <Route path="/PreceptorDashboard" element={<PreceptorDashboard />} />
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;