import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'; // New import
import ResetPassword from './pages/ResetPassword/ResetPassword'; // New import
import Home from './pages/Home/Home';
import Activate from './pages/Activate/Activate';
import Profile from './pages/Profile/Profile';
import styles from './App.module.css';
import ProjectDetails from './pages/Home/ProjectDetails';
import CreateProject from './pages/Home/CreateProject';
import ProjectUpdate from './pages/Home/ProjectUpdate';
import DonationPage from './pages/Home/DonationPage';
import TopRatedSlider from './pages/Home/Home';
import Projects from './pages/Home/Projects';

function App() {
  return (
    <BrowserRouter>
      <div className={styles.appContainer}>
        <Navbar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} /> {/* New route */}
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} /> {/* New route */}
            <Route path="/activate/:uidb64/:token" element={<Activate />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/projects/:id/update" element={<ProjectUpdate />} />
            <Route path="/projects/:id/donate" element={<DonationPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;