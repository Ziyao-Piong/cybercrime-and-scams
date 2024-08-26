import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from './components/ui/Navbar/Navbar';
import MyFooter from './components/ui/Footer/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
// import LandingPage from './pages/Home/LandingSection';

function App() {
  return (
    <div className="App">
      <MyNavbar />
      {/* <LandingPage /> */}
      <MyFooter />
    </div>
  );
}

export default App;
