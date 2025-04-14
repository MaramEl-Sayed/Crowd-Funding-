import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Activate from './pages/Activate/Activate';
import Profile from './pages/Profile/Profile'; // New import
import styles from './App.module.css';
import ProjectDetails from './pages/Home/ProjectDetails';
import CreateProject from './pages/Home/CreateProject';
import ProjectUpdate from './pages/Home/ProjectUpdate';
import DonationPage from './pages/Home/DonationPage';

function App() {
  return (
    <BrowserRouter>
      <div className={styles.appContainer}>
        <Navbar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activate/:uidb64/:token" element={<Activate />} />
            <Route path="/home" element={<Home />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/projects/:id/update" element={<ProjectUpdate />} />
            <Route path="/projects/:id/donate" element={<DonationPage />} />
            <Route path="/profile" element={<Profile />} /> {/* New route */}
            <Route path="/" element={<Login />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;