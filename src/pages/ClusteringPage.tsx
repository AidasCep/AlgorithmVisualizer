import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Chart from 'react-apexcharts';
import { kMeans, generateClusterData } from '../algorithms/ClusteringAlgorithm';
import type { ClusteringStep, Point } from '../algorithms/ClusteringAlgorithm';

const DEFAULT_SPEED = 50;
const DEFAULT_NUM_CLUSTERS = 3;
const DEFAULT_NUM_POINTS = 100;

const ClusteringPage = () => {
    const [points, setPoints] = useState<Point[]>([]);
    const [clusteringSteps, setClusteringSteps] = useState<ClusteringStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [numClusters, setNumClusters] = useState(DEFAULT_NUM_CLUSTERS);
    const [numPoints, setNumPoints] = useState(DEFAULT_NUM_POINTS);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_SPEED);

    const colors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#96CEB4',
        '#FFEAA7',
        '#DDA0DD',
        '#F7DC6F',
        '#85C1E9',
        '#F8C471',
        '#BB8FCE',
    ];

    const resetData = () => {
        const newPoints = generateClusterData(numPoints, numClusters);
        setPoints(newPoints);
        setClusteringSteps([]);
        setCurrentStep(0);
        setIsAnimating(false);
    };

    const startClustering = () => {
        if (points.length === 0) return;

        const steps = kMeans(points, numClusters);
        setClusteringSteps(steps);
        setCurrentStep(0);
        setIsAnimating(true);
    };

    useEffect(() => {
        if (isAnimating && currentStep < clusteringSteps.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 110 - animationSpeed);
            return () => clearTimeout(timer);
        } else if (currentStep >= clusteringSteps.length - 1) {
            setIsAnimating(false);
        }
    }, [isAnimating, currentStep, clusteringSteps.length, animationSpeed]);

    useEffect(() => {
        resetData();
    }, [numPoints, numClusters]);

    const getCurrentData = () => {
        if (clusteringSteps.length === 0) {
            return {
                points: points.map(p => ({ ...p, cluster: undefined })),
                centers: [],
                iteration: 0,
                converged: false,
            };
        }
        return clusteringSteps[currentStep];
    };

    const getChartSeries = () => {
        const currentData = getCurrentData();
        const series = [];

        const clusteredPoints: { [key: number]: Point[] } = {};
        const unclusteredPoints: Point[] = [];

        currentData.points.forEach(point => {
            if (point.cluster !== undefined) {
                if (!clusteredPoints[point.cluster]) {
                    clusteredPoints[point.cluster] = [];
                }
                clusteredPoints[point.cluster].push(point);
            } else {
                unclusteredPoints.push(point);
            }
        });

        // Add unclustered points
        if (unclusteredPoints.length > 0) {
            series.push({
                name: 'Unclustered',
                type: 'scatter',
                data: unclusteredPoints.map(point => ({
                    x: point.x,
                    y: point.y,
                })),
                color: '#95A5A6',
            });
        }

        // Add clustered points
        Object.entries(clusteredPoints).forEach(([cluster, clusterPoints]) => {
            const clusterNum = parseInt(cluster);
            series.push({
                name: `Cluster ${clusterNum + 1}`,
                type: 'scatter',
                data: clusterPoints.map(point => ({
                    x: point.x,
                    y: point.y,
                })),
                color: colors[clusterNum % colors.length],
            });
        });

        // Add cluster centers
        if (currentData.centers.length > 0) {
            series.push({
                name: 'Cluster Centers',
                type: 'scatter',
                data: currentData.centers.map(center => ({
                    x: center.x,
                    y: center.y,
                })),
                color: '#2C3E50',
            });
        }

        return series;
    };

    const currentData = getCurrentData();

    return (
        <div className="h-screen w-full bg-base-200 p-4 overflow-hidden">
            <NavBar />
            <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100% - 4rem)' }}>
                <div className="w-full lg:w-80 bg-base-100 rounded-lg shadow-lg p-6 flex-shrink-0">
                    <div className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Number of Points: {numPoints}</span>
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="500"
                                value={numPoints}
                                className="range range-primary"
                                onChange={e => setNumPoints(parseInt(e.target.value))}
                                disabled={isAnimating}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Number of Clusters: {numClusters}</span>
                            </label>
                            <input
                                type="range"
                                min="2"
                                max="10"
                                value={numClusters}
                                className="range range-secondary"
                                onChange={e => setNumClusters(parseInt(e.target.value))}
                                disabled={isAnimating}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Animation Speed: {animationSpeed}</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                step="1"
                                value={animationSpeed}
                                className="range range-accent"
                                onChange={e => setAnimationSpeed(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="space-y-3">
                        <button
                            className="btn btn-outline btn-primary w-full"
                            onClick={resetData}
                            disabled={isAnimating}
                        >
                            Generate New Data
                        </button>

                        <button
                            className="btn btn-secondary w-full"
                            onClick={startClustering}
                            disabled={isAnimating || points.length === 0}
                        >
                            {isAnimating ? 'Clustering...' : 'Start K-Means'}
                        </button>

                        {clusteringSteps.length > 0 && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">
                                        Step: {currentStep + 1} / {clusteringSteps.length}
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max={clusteringSteps.length - 1}
                                    value={currentStep}
                                    className="range range-info"
                                    onChange={e => {
                                        if (!isAnimating) {
                                            setCurrentStep(parseInt(e.target.value));
                                        }
                                    }}
                                    disabled={isAnimating}
                                />
                            </div>
                        )}

                        <div className="stats stats-vertical">
                            <div className="stat">
                                <div className="stat-title">Iteration</div>
                                <div className="stat-value text-sm">{currentData.iteration}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Status</div>
                                <div className="stat-value text-sm">
                                    {currentData.converged ? 'Converged' : 'Running'}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Points</div>
                                <div className="stat-value text-sm">{points.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-base-100 rounded-lg shadow-lg p-6">
                    <div className="h-full flex items-center justify-center">
                        <Chart
                            options={{
                                chart: {
                                    id: 'clustering-chart',
                                    type: 'scatter',
                                    animations: {
                                        enabled: false,
                                    },
                                },
                                xaxis: {
                                    type: 'numeric',
                                    labels: {
                                        show: false,
                                    },
                                    min: 0,
                                    max: 100,
                                },
                                yaxis: {
                                    title: {},
                                    labels: {
                                        show: false,
                                    },
                                    min: 0,
                                    max: 100,
                                },
                                markers: {
                                    size: [4, 4, 4, 4, 4, 4, 4, 4, 4, 5], // Larger size for centers
                                    strokeWidth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Border for centers
                                    strokeColors: ['#fff'],
                                },
                                legend: {
                                    show: false,
                                    position: 'top',
                                },
                                tooltip: {
                                    shared: false,
                                    intersect: true,
                                },
                            }}
                            series={getChartSeries()}
                            type="scatter"
                            height={500}
                            width={600}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClusteringPage;
