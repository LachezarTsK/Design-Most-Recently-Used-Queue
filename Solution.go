
package main

import "math"

type MRUQueue struct {
    // 'normalSizeOfCompressedSection': prefix 'normal' because if the square root of 'upperLimit' has a remainder,
    // then the last compressed section will have a size smaller than the size of the previous sections.
    normalSizeOfCompressedSection int
    numberOfCompressedSections    int
    compressedQueue               []CircularArray
}

func Constructor(upperLimit int) MRUQueue {
    mruQueue := MRUQueue{
        normalSizeOfCompressedSection: int(math.Ceil(math.Sqrt(float64(upperLimit)))),
    }
    mruQueue.numberOfCompressedSections = int(math.Ceil(float64(upperLimit) / float64(mruQueue.normalSizeOfCompressedSection)))
    mruQueue.compressedQueue = make([]CircularArray, mruQueue.numberOfCompressedSections)
    mruQueue.initializeCompressedQueue(upperLimit)
    return mruQueue
}

func (this *MRUQueue) initializeCompressedQueue(upperLimit int) {
    for n := 1; n <= upperLimit; n++ {
        indexCompressedSection := (n - 1) / this.normalSizeOfCompressedSection
        indexInsideCompressedSection := (n - 1) % this.normalSizeOfCompressedSection

        if indexInsideCompressedSection == 0 {
            compressedSectionSize := this.getCompressedSectionSize(indexCompressedSection, upperLimit)
            this.compressedQueue[indexCompressedSection] = NewCircularArray(compressedSectionSize)
        }
        this.compressedQueue[indexCompressedSection].container[indexInsideCompressedSection] = n
    }
}

func (this *MRUQueue) getCompressedSectionSize(indexCompressedSection int, upperLimit int) int {
    if indexCompressedSection < this.numberOfCompressedSections - 1 || upperLimit%this.normalSizeOfCompressedSection == 0 {
        return this.normalSizeOfCompressedSection
    }
    return upperLimit % this.normalSizeOfCompressedSection
}

func (this *MRUQueue) Fetch(oneBasedIndex int) int {
    compressedSection := (oneBasedIndex - 1) / this.normalSizeOfCompressedSection
    compressedSectionSize := this.compressedQueue[compressedSection].size

    circularStartIndex := this.compressedQueue[compressedSection].startIndex
    nonRelativeIndexRemoved := (oneBasedIndex - 1) % this.normalSizeOfCompressedSection
    circularIndexRemoved := (circularStartIndex + nonRelativeIndexRemoved) % compressedSectionSize

    fetchedValue := this.compressedQueue[compressedSection].container[circularIndexRemoved]
    this.updateCompressedQueue(compressedSection, circularIndexRemoved, fetchedValue)

    return fetchedValue
}

func (this *MRUQueue) updateCompressedQueue(compressedSection int, circularIndexRemoved int, fetchedValue int) {
    this.compressedQueue[compressedSection].moveElementsOneStepTowardsIndexRemoved(circularIndexRemoved)

    for i := compressedSection; i < this.numberOfCompressedSections - 1; i++ {
        startIndex := this.compressedQueue[i + 1].startIndex
        endIndex := this.compressedQueue[i].endIndex

        this.compressedQueue[i].container[endIndex] = this.compressedQueue[i + 1].container[startIndex]
        this.compressedQueue[i + 1].updateStartIndex()
        this.compressedQueue[i + 1].updateEndIndex()
    }
    endIndex := this.compressedQueue[this.numberOfCompressedSections - 1].endIndex
    this.compressedQueue[this.numberOfCompressedSections - 1].container[endIndex] = fetchedValue
}

type CircularArray struct {
    container  []int
    startIndex int
    endIndex   int
    size       int
}

func NewCircularArray(size int) CircularArray {
    circularArray := CircularArray{
        container:  make([]int, size),
        startIndex: 0,
        endIndex:   size - 1,
        size:       size,
    }
    return circularArray
}

func (this *CircularArray) updateStartIndex() {
    this.startIndex = (this.startIndex + 1) % this.size
}

func (this *CircularArray) updateEndIndex() {
    this.endIndex = (this.endIndex + 1) % this.size
}

func (this *CircularArray) moveElementsOneStepTowardsIndexRemoved(indexRemoved int) {
    for indexRemoved != this.endIndex {
        i := (indexRemoved + 1) % this.size
        this.container[indexRemoved] = this.container[i]
        indexRemoved = (indexRemoved + 1) % this.size
    }
}
