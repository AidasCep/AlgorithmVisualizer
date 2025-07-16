import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Chart from 'react-apexcharts';
import { linearRegression } from '../algorithms/MachineLearningAlgorithms';

const DEFAULT_ARRAY_SIZE = 50;
const DEFAULT_NOISE = 3;

const LinearRegressionPage = () => {
    const [array, setArray] = useState<Array<{ x: number; y: number }>>([]);
    const [noise, setNoise] = useState(DEFAULT_NOISE);
    const [arraySize, setArraySize] = useState(DEFAULT_ARRAY_SIZE);
    const [animationIndex, setAnimationIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const resetArray = () => {
        const newArray = [];
        for (let i = 0; i < arraySize; i++) {
            let r = Math.random() * 100;
            let y = r + (Math.random() * 2 - 1) * noise * noise;
            newArray.push({ x: r, y: y });
        }
        setArray(newArray);
        setAnimationIndex(0);
        setIsAnimating(false);
    };

    const startAnimation = () => {
        if (array.length < 2) return;
        setIsAnimating(true);
        setAnimationIndex(2);
    };

    useEffect(() => {
        if (isAnimating && animationIndex < array.length) {
            const timer = setTimeout(() => {
                setAnimationIndex(prev => prev + 1);
            }, 5);
            return () => clearTimeout(timer);
        } else if (animationIndex >= array.length) {
            setIsAnimating(false);
        }
    }, [isAnimating, animationIndex, array.length]);

    useEffect(() => {
        resetArray();
    }, [arraySize, noise]);

    const getVisiblePoints = () => {
        return isAnimating ? array.slice(0, animationIndex) : array;
    };

    const getRegressionLine = () => {
        const visiblePoints = getVisiblePoints();
        if (visiblePoints.length < 2) return [];

        const regression = linearRegression(visiblePoints);

        const minX = 0;
        const maxX = 100;

        return [
            { x: minX, y: regression.slope * minX + regression.intercept },
            { x: maxX, y: regression.slope * maxX + regression.intercept },
        ];
    };

    return (
        <div className="h-screen w-full bg-base-200 p-4 overflow-hidden col-span-2">
            <NavBar />
            <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100% - 4rem)' }}>
                <div className="w-full lg:w-80 bg-base-100 rounded-lg shadow-lg p-6 flex-shrink-0">
                    <div className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Array size: {arraySize}</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={arraySize}
                                className="range range-primary"
                                onChange={e => setArraySize(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Noise: {noise}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.1"
                                value={noise}
                                className="range range-secondary"
                                onChange={e => setNoise(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="space-y-3">
                        <button className="btn btn-outline btn-primary w-full" onClick={resetArray}>
                            Generate New Data
                        </button>

                        <button
                            className="btn btn-secondary w-full"
                            onClick={startAnimation}
                            disabled={isAnimating || array.length < 2}
                        >
                            {isAnimating ? 'Animating...' : 'Animate Regression'}
                        </button>

                        <div className="stats stats-vertical">
                            <div className="stat">
                                <div className="stat-title">Points</div>
                                <div className="stat-value text-sm">{isAnimating ? animationIndex : array.length}</div>
                            </div>
                            {getVisiblePoints().length >= 2 && (
                                <div className="stat">
                                    <div className="stat-title">Slope</div>
                                    <div className="stat-value text-sm">
                                        {linearRegression(getVisiblePoints()).slope.toFixed(3)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-base-100 rounded-lg shadow-lg p-6">
                    <div className="h-full flex items-center justify-center">
                        <Chart
                            options={{
                                chart: {
                                    id: 'ml-chart',
                                    type: 'scatter',
                                    animations: {
                                        enabled: false,
                                    },
                                },
                                xaxis: {
                                    type: 'numeric',
                                    title: {},
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
                                    size: [6, 0],
                                },
                                stroke: {
                                    width: [0, 3],
                                    curve: 'straight',
                                },
                                legend: {
                                    show: true,
                                },
                            }}
                            series={[
                                {
                                    name: 'Data Points',
                                    type: 'scatter',
                                    data: getVisiblePoints().map(point => ({
                                        x: point.x,
                                        y: point.y,
                                    })),
                                },
                                {
                                    name: 'Regression Line',
                                    type: 'line',
                                    data: getRegressionLine().map(point => ({
                                        x: point.x,
                                        y: point.y,
                                    })),
                                },
                            ]}
                            type="line"
                            height={350}
                            width={800}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinearRegressionPage;
