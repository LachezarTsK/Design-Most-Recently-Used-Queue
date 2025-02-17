
class MRUQueue {

    // 'normalSizeOfCompressedSection': prefix 'normal' because if the square root of 'upperLimit' has a remainder, 
    // then the last compressed section will have a size smaller than the size of the previous sections.
    private normalSizeOfCompressedSection: number;
    private numberOfCompressedSections: number;
    private compressedQueue: CircularArray[];


    constructor(upperLimit: number) {
        this.normalSizeOfCompressedSection = Math.ceil(Math.sqrt(upperLimit));
        this.numberOfCompressedSections = Math.ceil(upperLimit / this.normalSizeOfCompressedSection);
        this.compressedQueue = new Array(this.numberOfCompressedSections);
        this.initializeCompressedQueue(upperLimit);
    }


    private initializeCompressedQueue(upperLimit: number): void {
        for (let n = 1; n <= upperLimit; ++n) {
            let indexCompressedSection = Math.floor((n - 1) / this.normalSizeOfCompressedSection);
            let indexInsideCompressedSection = (n - 1) % this.normalSizeOfCompressedSection;

            if (indexInsideCompressedSection === 0) {
                const compressedSectionSize = this.getCompressedSectionSize(indexCompressedSection, upperLimit);
                this.compressedQueue[indexCompressedSection] = new CircularArray(compressedSectionSize);
            }
            this.compressedQueue[indexCompressedSection].container[indexInsideCompressedSection] = n;
        }
    }

    private getCompressedSectionSize(indexCompressedSection: number, upperLimit: number): number {
        if (indexCompressedSection < this.numberOfCompressedSections - 1 || upperLimit % this.normalSizeOfCompressedSection === 0) {
            return this.normalSizeOfCompressedSection;
        }
        return upperLimit % this.normalSizeOfCompressedSection;
    }

    fetch(oneBasedIndex: number): number {
        const compressedSection = Math.floor((oneBasedIndex - 1) / this.normalSizeOfCompressedSection);
        const compressedSectionSize = this.compressedQueue[compressedSection].size;

        const circularStartIndex = this.compressedQueue[compressedSection].startIndex;
        const nonRelativeIndexRemoved = (oneBasedIndex - 1) % this.normalSizeOfCompressedSection;
        const circularIndexRemoved = (circularStartIndex + nonRelativeIndexRemoved) % compressedSectionSize;

        const fetchedValue = this.compressedQueue[compressedSection].container[circularIndexRemoved];
        this.updateCompressedQueue(compressedSection, circularIndexRemoved, fetchedValue);

        return fetchedValue;
    }

    private updateCompressedQueue(compressedSection: number, circularIndexRemoved: number, fetchedValue: number): void {
        this.compressedQueue[compressedSection].moveElementsOneStepTowardsIndexRemoved(circularIndexRemoved);

        for (let i = compressedSection; i < this.numberOfCompressedSections - 1; ++i) {
            const startIndex = this.compressedQueue[i + 1].startIndex;
            const endIndex = this.compressedQueue[i].endIndex;

            this.compressedQueue[i].container[endIndex] = this.compressedQueue[i + 1].container[startIndex];
            this.compressedQueue[i + 1].updateStartIndex();
            this.compressedQueue[i + 1].updateEndIndex();
        }
        const endIndex = this.compressedQueue[this.numberOfCompressedSections - 1].endIndex;
        this.compressedQueue[this.numberOfCompressedSections - 1].container[endIndex] = fetchedValue;
    }
}


class CircularArray {

    container: number[];
    startIndex: number;
    endIndex: number;
    size: number;


    constructor(size: number) {
        this.container = new Array(size);
        this.startIndex = 0;
        this.endIndex = size - 1;
        this.size = size;
    }

    updateStartIndex(): void {
        this.startIndex = (this.startIndex + 1) % this.size;
    }

    updateEndIndex(): void {
        this.endIndex = (this.endIndex + 1) % this.size;
    }

    moveElementsOneStepTowardsIndexRemoved(indexRemoved: number): void {
        while (indexRemoved !== this.endIndex) {
            const i = (indexRemoved + 1) % this.size;
            this.container[indexRemoved] = this.container[i];
            indexRemoved = (indexRemoved + 1) % this.size;
        }
    }
}
