
public class MRUQueue {

    // 'normalSizeOfCompressedSection': prefix 'normal' because if the square root of 'upperLimit' has a remainder, 
    // then the last compressed section will have a size smaller than the size of the previous sections.
    private final int normalSizeOfCompressedSection;
    private final int numberOfCompressedSections;
    private final CircularArray[] compressedQueue;

    public MRUQueue(int upperLimit) {
        normalSizeOfCompressedSection = (int) Math.ceil(Math.sqrt(upperLimit));
        numberOfCompressedSections = (int) Math.ceil((double) upperLimit / normalSizeOfCompressedSection);
        compressedQueue = new CircularArray[numberOfCompressedSections];
        initializeCompressedQueue(upperLimit);
    }

    private void initializeCompressedQueue(int upperLimit) {
        for (int n = 1; n <= upperLimit; ++n) {
            int indexCompressedSection = (n - 1) / normalSizeOfCompressedSection;
            int indexInsideCompressedSection = (n - 1) % normalSizeOfCompressedSection;

            if (indexInsideCompressedSection == 0) {
                int compressedSectionSize = getCompressedSectionSize(indexCompressedSection, upperLimit);
                compressedQueue[indexCompressedSection] = new CircularArray(compressedSectionSize);
            }
            compressedQueue[indexCompressedSection].container[indexInsideCompressedSection] = n;
        }
    }

    private int getCompressedSectionSize(int indexCompressedSection, int upperLimit) {
        if (indexCompressedSection < numberOfCompressedSections - 1 || upperLimit % normalSizeOfCompressedSection == 0) {
            return normalSizeOfCompressedSection;
        }
        return upperLimit % normalSizeOfCompressedSection;
    }

    public int fetch(int oneBasedIndex) {
        int compressedSection = (oneBasedIndex - 1) / normalSizeOfCompressedSection;
        int compressedSectionSize = compressedQueue[compressedSection].size;

        int circularStartIndex = compressedQueue[compressedSection].startIndex;
        int nonRelativeIndexRemoved = (oneBasedIndex - 1) % normalSizeOfCompressedSection;
        int circularIndexRemoved = (circularStartIndex + nonRelativeIndexRemoved) % compressedSectionSize;

        int fetchedValue = compressedQueue[compressedSection].container[circularIndexRemoved];
        updateCompressedQueue(compressedSection, circularIndexRemoved, fetchedValue);

        return fetchedValue;
    }

    private void updateCompressedQueue(int compressedSection, int circularIndexRemoved, int fetchedValue) {
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
}

class CircularArray {

    int[] container;
    int startIndex;
    int endIndex;
    int size;

    CircularArray(int size) {
        container = new int[size];
        endIndex = size - 1;
        this.size = size;
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
}
