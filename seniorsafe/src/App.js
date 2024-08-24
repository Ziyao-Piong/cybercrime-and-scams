import './App.css';
import Navbar from './components/ui/Navbar/Navbar';
import Footer from './pages/Home/Footer';
import LandingPage from './pages/Home/LandingSection';

function App() {
  return (
    <div className="App">
      <Navbar />
      {/* <LandingPage /> */}
      <Footer />
    </div>
  );
}

export default App;
