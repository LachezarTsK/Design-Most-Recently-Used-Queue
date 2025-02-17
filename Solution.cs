
using System;

public class MRUQueue
{
    // 'normalSizeOfCompressedSection': prefix 'normal' because if the square root of 'upperLimit' has a remainder, 
    // then the last compressed section will have a size smaller than the size of the previous sections.
    private readonly int normalSizeOfCompressedSection;
    private readonly int numberOfCompressedSections;
    private readonly CircularArray[] compressedQueue;

    public MRUQueue(int upperLimit)
    {
        normalSizeOfCompressedSection = (int)Math.Ceiling(Math.Sqrt(upperLimit));
        numberOfCompressedSections = (int)Math.Ceiling((double)upperLimit / normalSizeOfCompressedSection);
        compressedQueue = new CircularArray[numberOfCompressedSections];
        InitializeCompressedQueue(upperLimit);
    }

    private void InitializeCompressedQueue(int upperLimit)
    {
        for (int n = 1; n <= upperLimit; ++n)
        {
            int indexCompressedSection = (n - 1) / normalSizeOfCompressedSection;
            int indexInsideCompressedSection = (n - 1) % normalSizeOfCompressedSection;

            if (indexInsideCompressedSection == 0)
            {
                int compressedSectionSize = GetCompressedSectionSize(indexCompressedSection, upperLimit);
                compressedQueue[indexCompressedSection] = new CircularArray(compressedSectionSize);
            }
            compressedQueue[indexCompressedSection].container[indexInsideCompressedSection] = n;
        }
    }

    private int GetCompressedSectionSize(int indexCompressedSection, int upperLimit)
    {
        if (indexCompressedSection < numberOfCompressedSections - 1 || upperLimit % normalSizeOfCompressedSection == 0)
        {
            return normalSizeOfCompressedSection;
        }
        return upperLimit % normalSizeOfCompressedSection;
    }


    public int Fetch(int oneBasedIndex)
    {
        int compressedSection = (oneBasedIndex - 1) / normalSizeOfCompressedSection;
        int compressedSectionSize = compressedQueue[compressedSection].size;

        int circularStartIndex = compressedQueue[compressedSection].startIndex;
        int nonRelativeIndexRemoved = (oneBasedIndex - 1) % normalSizeOfCompressedSection;
        int circularIndexRemoved = (circularStartIndex + nonRelativeIndexRemoved) % compressedSectionSize;

        int fetchedValue = compressedQueue[compressedSection].container[circularIndexRemoved];
        UpdateCompressedQueue(compressedSection, circularIndexRemoved, fetchedValue);

        return fetchedValue;
    }

    private void UpdateCompressedQueue(int compressedSection, int circularIndexRemoved, int fetchedValue)
    {
        compressedQueue[compressedSection].MoveElementsOneStepTowardsIndexRemoved(circularIndexRemoved);
        int endIndex;

        for (int i = compressedSection; i < numberOfCompressedSections - 1; ++i)
        {
            int startIndex = compressedQueue[i + 1].startIndex;
            endIndex = compressedQueue[i].endIndex;

            compressedQueue[i].container[endIndex] = compressedQueue[i + 1].container[startIndex];
            compressedQueue[i + 1].UpdateStartIndex();
            compressedQueue[i + 1].UpdateEndIndex();
        }
        endIndex = compressedQueue[numberOfCompressedSections - 1].endIndex;
        compressedQueue[numberOfCompressedSections - 1].container[endIndex] = fetchedValue;
    }
}

class CircularArray
{
    public int[] container;
    public int startIndex;
    public int endIndex;
    public int size;

    public CircularArray(int size)
    {
        container = new int[size];
        endIndex = size - 1;
        this.size = size;
    }

    public void UpdateStartIndex()
    {
        startIndex = (startIndex + 1) % size;
    }

    public void UpdateEndIndex()
    {
        endIndex = (endIndex + 1) % size;
    }

    public void MoveElementsOneStepTowardsIndexRemoved(int indexRemoved)
    {
        while (indexRemoved != endIndex)
        {
            int i = (indexRemoved + 1) % size;
            container[indexRemoved] = container[i];
            indexRemoved = (indexRemoved + 1) % size;
        }
    }
}
