
#include <cmath>
#include <vector>
using namespace std;

class CircularArray {

public:
    vector<int> container;
    int startIndex{};
    int endIndex{};
    int size{};

    CircularArray() = default;

    CircularArray(int size) :size{ size } {
        container.resize(size);
        startIndex = 0;
        endIndex = size - 1;
    }

    void updateStartIndex() {
        startIndex = (startIndex + 1) % size;
    }

    void updateEndIndex() {
        endIndex = (endIndex + 1) % size;
    }

    void moveElementsOneStepTowardsIndexRemoved(int indexRemoved) {
        while (indexRemoved != endIndex) {
            int i = (indexRemoved + 1) % size;
            container[indexRemoved] = container[i];
            indexRemoved = (indexRemoved + 1) % size;
        }
    }
};

class MRUQueue {

    // 'normalSizeOfCompressedSection': prefix 'normal' because if the square root of 'upperLimit' has a remainder, 
    // then the last compressed section will have a size smaller than the size of the previous sections.
    int normalSizeOfCompressedSection;
    int numberOfCompressedSections;
    vector<CircularArray> compressedQueue;

public:
    MRUQueue(int upperLimit) {
        normalSizeOfCompressedSection = ceil(sqrt(upperLimit));
        numberOfCompressedSections = ceil(static_cast<double>(upperLimit) / normalSizeOfCompressedSection);
        compressedQueue.resize(numberOfCompressedSections);
        initializeCompressedQueue(upperLimit);
    }

    int fetch(int oneBasedIndex) {
        int compressedSection = (oneBasedIndex - 1) / normalSizeOfCompressedSection;
        int compressedSectionSize = compressedQueue[compressedSection].size;

        int circularStartIndex = compressedQueue[compressedSection].startIndex;
        int nonRelativeIndexRemoved = (oneBasedIndex - 1) % normalSizeOfCompressedSection;
        int circularIndexRemoved = (circularStartIndex + nonRelativeIndexRemoved) % compressedSectionSize;

        int fetchedValue = compressedQueue[compressedSection].container[circularIndexRemoved];
        updateCompressedQueue(compressedSection, circularIndexRemoved, fetchedValue);

        return fetchedValue;
    }

private:
    void initializeCompressedQueue(int upperLimit) {
        for (int n = 1; n <= upperLimit; ++n) {
            int indexCompressedSection = (n - 1) / normalSizeOfCompressedSection;
            int indexInsideCompressedSection = (n - 1) % normalSizeOfCompressedSection;

            if (indexInsideCompressedSection == 0) {
                int compressedSectionSize = getCompressedSectionSize(indexCompressedSection, upperLimit);
                compressedQueue[indexCompressedSection] = CircularArray(compressedSectionSize);
            }
            compressedQueue[indexCompressedSection].container[indexInsideCompressedSection] = n;
        }
    }

    int getCompressedSectionSize(int indexCompressedSection, int upperLimit) const {
        if (indexCompressedSection < numberOfCompressedSections - 1 || upperLimit % normalSizeOfCompressedSection == 0) {
            return normalSizeOfCompressedSection;
        }
        return upperLimit % normalSizeOfCompressedSection;
    }

    void updateCompressedQueue(int compressedSection, int circularIndexRemoved, int fetchedValue) {
        compressedQueue[compressedSection].moveElementsOneStepTowardsIndexRemoved(circularIndexRemoved);

        for (int i = compressedSection; i < numberOfCompressedSections - 1; ++i) {
            int startIndex = compressedQueue[i + 1].startIndex;
            int endIndex = compressedQueue[i].endIndex;

            compressedQueue[i].container[endIndex] = compressedQueue[i + 1].container[startIndex];
            compressedQueue[i + 1].updateStartIndex();
            compressedQueue[i + 1].updateEndIndex();
        }
        int endIndex = compressedQueue[numberOfCompressedSections - 1].endIndex;
        compressedQueue[numberOfCompressedSections - 1].container[endIndex] = fetchedValue;
    }
};
