import { Route, Routes } from 'react-router-dom';
import SortingAlgorithmPage from './pages/SortingAlgorithmPage';
import LinearRegressionPage from './pages/LinearRegressionPage';
import ClusteringPage from './pages/ClusteringPage';
function App() {
    return (
        <Routes>
            <Route path="/" element={<SortingAlgorithmPage />} />
            <Route path="/ml" element={<LinearRegressionPage />} />
            <Route path="/clustering" element={<ClusteringPage />} />
        </Routes>
    );
}

export default App;
