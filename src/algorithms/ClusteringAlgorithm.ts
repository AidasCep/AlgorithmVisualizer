export interface Point {
    x: number;
    y: number;
    cluster?: number;
}

export interface ClusterCenter {
    x: number;
    y: number;
    cluster: number;
}

export interface ClusteringStep {
    points: Point[];
    centers: ClusterCenter[];
    iteration: number;
    converged: boolean;
}

function distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function findNearestCenter(point: Point, centers: ClusterCenter[]): number {
    let minDistance = Infinity;
    let nearestCluster = 0;

    for (let i = 0; i < centers.length; i++) {
        const dist = distance(point, centers[i]);
        if (dist < minDistance) {
            minDistance = dist;
            nearestCluster = i;
        }
    }

    return nearestCluster;
}

function calculateNewCenter(points: Point[], cluster: number): Point {
    const clusterPoints = points.filter(p => p.cluster === cluster);

    if (clusterPoints.length === 0) {
        return { x: Math.random() * 100, y: Math.random() * 100 };
    }

    const avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
    const avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;

    return { x: avgX, y: avgY };
}

function centersConverged(oldCenters: ClusterCenter[], newCenters: ClusterCenter[], threshold: number = 0.01): boolean {
    for (let i = 0; i < oldCenters.length; i++) {
        const dist = distance(oldCenters[i], newCenters[i]);
        if (dist > threshold) {
            return false;
        }
    }
    return true;
}

export function kMeans(points: Point[], k: number, maxIterations: number = 100): ClusteringStep[] {
    const steps: ClusteringStep[] = [];

    // Initialize random centers
    let centers: ClusterCenter[] = [];
    for (let i = 0; i < k; i++) {
        centers.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            cluster: i,
        });
    }

    let currentPoints = points.map(p => ({ ...p }));
    let iteration = 0;

    // Initial step
    steps.push({
        points: currentPoints.map(p => ({ ...p })),
        centers: centers.map(c => ({ ...c })),
        iteration: 0,
        converged: false,
    });

    while (iteration < maxIterations) {
        // Assign points to nearest centers
        for (let i = 0; i < currentPoints.length; i++) {
            const newCluster = findNearestCenter(currentPoints[i], centers);
            currentPoints[i].cluster = newCluster;
        }

        iteration++;

        // Calculate new centers
        const newCenters: ClusterCenter[] = [];
        for (let i = 0; i < k; i++) {
            const newCenter = calculateNewCenter(currentPoints, i);
            newCenters.push({
                x: newCenter.x,
                y: newCenter.y,
                cluster: i,
            });
        }

        const converged = centersConverged(centers, newCenters);
        centers = newCenters;

        steps.push({
            points: currentPoints.map(p => ({ ...p })),
            centers: centers.map(c => ({ ...c })),
            iteration: iteration,
            converged: converged,
        });

        if (converged) {
            break;
        }
    }

    return steps;
}

export function generateClusterData(numPoints: number, numClusters: number): Point[] {
    const points: Point[] = [];
    const clusterCenters = [];

    // Generate random cluster centers
    for (let i = 0; i < numClusters; i++) {
        clusterCenters.push({
            x: Math.random() * 80 + 10, // Keep centers away from edges
            y: Math.random() * 80 + 10,
        });
    }

    // Generate points around cluster centers
    for (let i = 0; i < numPoints; i++) {
        const clusterIndex = Math.floor(Math.random() * numClusters);
        const center = clusterCenters[clusterIndex];

        // Generate point with some spread around the center
        const spread = 15;
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * spread;

        points.push({
            x: Math.max(0, Math.min(100, center.x + radius * Math.cos(angle))),
            y: Math.max(0, Math.min(100, center.y + radius * Math.sin(angle))),
        });
    }

    return points;
}
