type Animation = {
    type: 'compare' | 'overwrite';
    indices: number[];
    values?: number[];
};

export function GetBubbleSortAnimations(array: number[]): { type: string; indices: number[] }[] {
    let len = array.length;
    let flag: boolean;
    const animations: Array<{ type: string; indices: number[] }> = [];

    do {
        flag = false;
        for (let i = 0; i < len - 1; i++) {
            animations.push({ type: 'compare', indices: [i, i + 1] });

            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];

                animations.push({ type: 'swap', indices: [i, i + 1] });
                flag = true;
            }
        }
        len--;
    } while (flag);

    return animations;
}

export function GetSelectionSortAnimations(array: number[]): { type: string; indices: number[] }[] {
    const animations: Array<{ type: string; indices: number[] }> = [];
    const len = array.length;

    for (let i = 0; i < len; i++) {
        let min_idx = i;

        for (let j = i + 1; j < len; j++) {
            animations.push({ type: 'compare', indices: [i, j] });

            if (array[j] < array[min_idx]) {
                min_idx = j;
            }
        }

        if (min_idx !== i) {
            animations.push({ type: 'swap', indices: [i, min_idx] });
            swap(array, min_idx, i);
        }
    }

    return animations;
}

function swap(array: number[], xp: number, yp: number) {
    var temp = array[xp];
    array[xp] = array[yp];
    array[yp] = temp;
}

export function GetInsertionSortAnimations(array: number[]): { type: string; indices: number[] }[] {
    const animations: Array<{ type: string; indices: number[] }> = [];

    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;

        while (j >= 0 && array[j] > key) {
            animations.push({ type: 'compare', indices: [j, j + 1] });
            animations.push({ type: 'swap', indices: [j, j + 1] });

            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
    }
    return animations;
}
function partition(
    array: number[],
    low: number,
    high: number,
    animations: Array<{ type: string; indices: number[] }>
): number {
    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        animations.push({ type: 'compare', indices: [j, high] });

        if (array[j] <= pivot) {
            i++;
            if (i !== j) {
                animations.push({ type: 'swap', indices: [i, j] });
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
    }

    animations.push({ type: 'swap', indices: [i + 1, high] });
    [array[i + 1], array[high]] = [array[high], array[i + 1]];

    return i + 1;
}

function quickSort(array: number[], low: number, high: number, animations: Array<{ type: string; indices: number[] }>) {
    if (low < high) {
        const pi = partition(array, low, high, animations);

        if (pi - 1 > low) quickSort(array, low, pi - 1, animations);
        if (pi + 1 < high) quickSort(array, pi + 1, high, animations);
    }
}

export function GetQuickSortAnimations(array: number[]): { type: string; indices: number[] }[] {
    const animations: Array<{ type: string; indices: number[] }> = [];
    quickSort(array, 0, array.length - 1, animations);
    return animations;
}

function merge(arr: number[], left: number, mid: number, right: number, animations: Animation[]) {
    const n1 = mid - left + 1;
    const n2 = right - mid;

    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[left + i];
    for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    let i = 0,
        j = 0;
    let k = left;

    while (i < n1 && j < n2) {
        animations.push({ type: 'compare', indices: [left + i, mid + 1 + j] });

        if (L[i] <= R[j]) {
            animations.push({
                type: 'overwrite',
                indices: [k],
                values: [L[i]],
            });
            arr[k] = L[i];
            i++;
        } else {
            animations.push({
                type: 'overwrite',
                indices: [k],
                values: [R[j]],
            });
            arr[k] = R[j];
            j++;
        }
        k++;
    }

    while (i < n1) {
        animations.push({
            type: 'overwrite',
            indices: [k],
            values: [L[i]],
        });
        arr[k] = L[i];
        i++;
        k++;
    }

    while (j < n2) {
        animations.push({
            type: 'overwrite',
            indices: [k],
            values: [R[j]],
        });
        arr[k] = R[j];
        j++;
        k++;
    }
}

export function GetMergeSortAnimations(
    array: number[],
    left = 0,
    right = array.length - 1,
    animations: Animation[] = []
): Animation[] {
    if (left >= right) return animations;

    const mid = Math.floor(left + (right - left) / 2);
    GetMergeSortAnimations(array, left, mid, animations);
    GetMergeSortAnimations(array, mid + 1, right, animations);
    merge(array, left, mid, right, animations);

    return animations;
}

export function GetHeapSortAnimations(array: number[]): { type: string; indices: number[]; values?: number[] }[] {
    const animations: Array<{
        type: string;
        indices: number[];
        values?: number[];
    }> = [];
    const n = array.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(array, n, i, animations);
    }

    for (let i = n - 1; i > 0; i--) {
        animations.push({ type: 'swap', indices: [0, i] });
        swap(array, 0, i);
        heapify(array, i, 0, animations);
    }

    return animations;
}

function heapify(
    array: number[],
    n: number,
    i: number,
    animations: Array<{ type: string; indices: number[]; values?: number[] }>
) {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    if (l < n) {
        animations.push({ type: 'compare', indices: [l, largest] });
        if (array[l] > array[largest]) {
            largest = l;
        }
    }

    if (r < n) {
        animations.push({ type: 'compare', indices: [r, largest] });
        if (array[r] > array[largest]) {
            largest = r;
        }
    }

    if (largest !== i) {
        animations.push({ type: 'swap', indices: [i, largest] });
        swap(array, i, largest);

        heapify(array, n, largest, animations);
    }
}

export function GetGnomeSortAnimations(array: number[]): { type: string; indices: number[]; values?: number[] }[] {
    const animations: Array<{
        type: string;
        indices: number[];
        values?: number[];
    }> = [];
    let index = 0;
    const n = array.length;

    while (index < n) {
        if (index === 0) {
            index++;
        } else {
            animations.push({ type: 'compare', indices: [index, index - 1] });

            if (array[index] >= array[index - 1]) {
                index++;
            } else {
                animations.push({ type: 'swap', indices: [index, index - 1] });
                swap(array, index, index - 1);
                index--;
            }
        }
    }

    return animations;
}

export function GetRadixSortAnimations(array: number[]): { type: string; indices: number[]; values?: number[] }[] {
    const animations: Array<{
        type: string;
        indices: number[];
        values?: number[];
    }> = [];

    const max = Math.max(...array);

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        countingSort(array, exp, animations);
    }

    return animations;
}

function countingSort(
    array: number[],
    exp: number,
    animations: Array<{ type: string; indices: number[]; values?: number[] }>
) {
    const n = array.length;
    const output = new Array(n);
    const count = new Array(10).fill(0);

    for (let i = 0; i < n; i++) {
        const digit = Math.floor(array[i] / exp) % 10;
        count[digit]++;
        animations.push({ type: 'compare', indices: [i, i] });
    }

    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }

    for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(array[i] / exp) % 10;
        output[count[digit] - 1] = array[i];
        count[digit]--;

        animations.push({
            type: 'overwrite',
            indices: [count[digit]],
            values: [array[i]],
        });
    }

    for (let i = 0; i < n; i++) {
        animations.push({
            type: 'overwrite',
            indices: [i],
            values: [output[i]],
        });
        array[i] = output[i];
    }
}
