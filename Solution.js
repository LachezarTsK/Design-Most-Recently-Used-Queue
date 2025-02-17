
class MRUQueue {

    // 'normalSizeOfCompressedSection': prefix 'normal' because if the square root of 'upperLimit' has a remainder, 
    // then the last compressed section will have a size smaller than the size of the previous sections.
    #normalSizeOfCompressedSection;
    #numberOfCompressedSections;
    #compressedQueue;

    /** 
     * @param {number} upperLimit
     */
    constructor(upperLimit) {
        this.#normalSizeOfCompressedSection = Math.ceil(Math.sqrt(upperLimit));
        this.#numberOfCompressedSections = Math.ceil(upperLimit / this.#normalSizeOfCompressedSection);
        this.#compressedQueue = new Array(this.#numberOfCompressedSections);
        this.#initializeCompressedQueue(upperLimit);
    }

    /** 
     * @param {number} upperLimit
     * @return {void}
     */
    #initializeCompressedQueue(upperLimit) {
        for (let n = 1; n <= upperLimit; ++n) {
            let indexCompressedSection = Math.floor((n - 1) / this.#normalSizeOfCompressedSection);
            let indexInsideCompressedSection = (n - 1) % this.#normalSizeOfCompressedSection;

            if (indexInsideCompressedSection === 0) {
                const compressedSectionSize = this.#getCompressedSectionSize(indexCompressedSection, upperLimit);
                this.#compressedQueue[indexCompressedSection] = new CircularArray(compressedSectionSize);
            }
            this.#compressedQueue[indexCompressedSection].container[indexInsideCompressedSection] = n;
        }
    }

    /** 
     * @param {number} indexCompressedSection
     * @param {number} upperLimit
     * @return {number}
     */
    #getCompressedSectionSize(indexCompressedSection, upperLimit) {
        if (indexCompressedSection < this.#numberOfCompressedSections - 1 || upperLimit % this.#normalSizeOfCompressedSection === 0) {
            return this.#normalSizeOfCompressedSection;
        }
        return upperLimit % this.#normalSizeOfCompressedSection;
    }

    /** 
     * @param {number} oneBasedIndex
     * @return {number}
     */
    fetch(oneBasedIndex) {
        const compressedSection = Math.floor((oneBasedIndex - 1) / this.#normalSizeOfCompressedSection);
        const compressedSectionSize = this.#compressedQueue[compressedSection].size;

        const circularStartIndex = this.#compressedQueue[compressedSection].startIndex;
        const nonRelativeIndexRemoved = (oneBasedIndex - 1) % this.#normalSizeOfCompressedSection;
        const circularIndexRemoved = (circularStartIndex + nonRelativeIndexRemoved) % compressedSectionSize;

        const fetchedValue = this.#compressedQueue[compressedSection].container[circularIndexRemoved];
        this.#updateCompressedQueue(compressedSection, circularIndexRemoved, fetchedValue);

        return fetchedValue;
    }

    /** 
     * @param {number} compressedSection
     * @param {number} circularIndexRemoved
     * @param {number} fetchedValue
     * @return {void}
     */
    #updateCompressedQueue(compressedSection, circularIndexRemoved, fetchedValue) {
        this.#compressedQueue[compressedSection].moveElementsOneStepTowardsIndexRemoved(circularIndexRemoved);

        for (let i = compressedSection; i < this.#numberOfCompressedSections - 1; ++i) {
            const startIndex = this.#compressedQueue[i + 1].startIndex;
            const endIndex = this.#compressedQueue[i].endIndex;

            this.#compressedQueue[i].container[endIndex] = this.#compressedQueue[i + 1].container[startIndex];
            this.#compressedQueue[i + 1].updateStartIndex();
            this.#compressedQueue[i + 1].updateEndIndex();
        }
        const endIndex = this.#compressedQueue[ this.#numberOfCompressedSections - 1].endIndex;
        this.#compressedQueue[this.#numberOfCompressedSections - 1].container[endIndex] = fetchedValue;
    }
}


class CircularArray {

    /** 
     * @param {number} size
     */
    constructor(size) {
        this.container = new Array(size);
        this.startIndex = 0;
        this.endIndex = size - 1;
        this.size = size;
    }

    /** 
     * @return {void}
     */
    updateStartIndex() {
        this.startIndex = (this.startIndex + 1) % this.size;
    }

    /** 
     * @return {void}
     */
    updateEndIndex() {
        this.endIndex = (this.endIndex + 1) % this.size;
    }

    /** 
     * @param {number} indexRemoved
     * @return {void}
     */
    moveElementsOneStepTowardsIndexRemoved(indexRemoved) {
        while (indexRemoved !== this.endIndex) {
            const i = (indexRemoved + 1) % this.size;
            this.container[indexRemoved] = this.container[i];
            indexRemoved = (indexRemoved + 1) % this.size;
        }
    }
}
