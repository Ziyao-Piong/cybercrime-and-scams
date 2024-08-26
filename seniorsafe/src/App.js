import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from './components/ui/Navbar/Navbar';
import MyFooter from './components/ui/Footer/Footer';
import LandingSection from './pages/Home/LandingSection';

function App() {
  return (
    <div className="App">
      <MyNavbar />
      <LandingSection />
      <MyFooter />
    </div>
  );
}

export default App;
