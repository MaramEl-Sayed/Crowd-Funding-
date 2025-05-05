import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Home from './pages/Home/Home';
import Activate from './pages/Activate/Activate';
import Profile from './pages/Profile/Profile';
import styles from './App.module.css';
import ProjectDetails from './pages/Home/ProjectDetails';
import CreateProject from './pages/Home/CreateProject';
import ProjectUpdate from './pages/Home/ProjectUpdate';
import Projects from './pages/Home/Projects';
import AboutUs from './pages/Home/About.jsx'; 
import Footer from './components/Footer';
import DonationPage from './pages/Home/DonationPage';
import Categories from './pages/Categories/Categories.jsx'
import CategoryCampaigns from './pages/Categories/CategoryCampaigns.jsx';
import FinishedProjects from './pages/Home/FinishedProjects';
function App() {
  return (
    <BrowserRouter>
      <div className={styles.appContainer}>
        <Navbar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/activate/:uidb64/:token" element={<Activate />} />
            <Route path="/campaigns" element={<Projects />} />
            <Route path="/finished" element={<FinishedProjects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/create-campaign" element={<CreateProject />} />
            <Route path="/projects/:id/update" element={<ProjectUpdate />} />
            <Route path="/projects/:id/donate" element={<DonationPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Home />} /> {/* Changed from Login to Home */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:id" element={<CategoryCampaigns />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;