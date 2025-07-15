import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SortingAlgorithmPage from './pages/SortingAlgorithmPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<SortingAlgorithmPage />} />
        </Routes>
    );
}

export default App;
