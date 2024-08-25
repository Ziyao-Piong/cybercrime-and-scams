import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/ui/Navbar/Navbar';
import Footer from './components/ui/Footer/Footer';
// import LandingPage from './pages/Home/LandingSection';

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
