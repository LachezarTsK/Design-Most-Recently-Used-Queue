
import kotlin.math.ceil
import kotlin.math.sqrt

class MRUQueue(upperLimit: Int) {

    // 'normalSizeOfCompressedSection': prefix 'normal' because if the square root of 'upperLimit' has a remainder,
    // then the last compressed section will have a size smaller than the size of the previous sections.
    private val normalSizeOfCompressedSection: Int = ceil(sqrt(upperLimit.toDouble())).toInt()
    private val numberOfCompressedSections: Int = ceil(upperLimit.toDouble() / normalSizeOfCompressedSection).toInt()
    private val compressedQueue = arrayOfNulls<CircularArray>(numberOfCompressedSections)

    init {
        initializeCompressedQueue(upperLimit)
    }

    private fun initializeCompressedQueue(upperLimit: Int) {
        for (n in 1..upperLimit) {
            val indexCompressedSection = (n - 1) / normalSizeOfCompressedSection
            val indexInsideCompressedSection = (n - 1) % normalSizeOfCompressedSection

            if (indexInsideCompressedSection == 0) {
                val compressedSectionSize = getCompressedSectionSize(indexCompressedSection, upperLimit)
                compressedQueue[indexCompressedSection] = CircularArray(compressedSectionSize)
            }
            compressedQueue[indexCompressedSection]!!.container[indexInsideCompressedSection] = n
        }
    }

    private fun getCompressedSectionSize(indexCompressedSection: Int, upperLimit: Int): Int {
        if (indexCompressedSection < numberOfCompressedSections - 1 || upperLimit % normalSizeOfCompressedSection == 0) {
            return normalSizeOfCompressedSection
        }
        return upperLimit % normalSizeOfCompressedSection
    }

    fun fetch(oneBasedIndex: Int): Int {
        val compressedSection = (oneBasedIndex - 1) / normalSizeOfCompressedSection
        val compressedSectionSize = compressedQueue[compressedSection]!!.size

        val circularStartIndex = compressedQueue[compressedSection]!!.startIndex
        val nonRelativeIndexRemoved = (oneBasedIndex - 1) % normalSizeOfCompressedSection
        val circularIndexRemoved = (circularStartIndex + nonRelativeIndexRemoved) % compressedSectionSize

        val fetchedValue = compressedQueue[compressedSection]!!.container[circularIndexRemoved]
        updateCompressedQueue(compressedSection, circularIndexRemoved, fetchedValue)

        return fetchedValue
    }

    private fun updateCompressedQueue(compressedSection: Int, circularIndexRemoved: Int, fetchedValue: Int) {
        compressedQueue[compressedSection]!!.moveElementsOneStepTowardsIndexRemoved(circularIndexRemoved)

        for (i in compressedSection..<numberOfCompressedSections - 1) {
            val startIndex = compressedQueue[i + 1]!!.startIndex
            val endIndex = compressedQueue[i]!!.endIndex

            compressedQueue[i]!!.container[endIndex] = compressedQueue[i + 1]!!.container[startIndex]
            compressedQueue[i + 1]!!.updateStartIndex()
            compressedQueue[i + 1]!!.updateEndIndex()
        }
        val endIndex = compressedQueue[numberOfCompressedSections - 1]!!.endIndex
        compressedQueue[numberOfCompressedSections - 1]!!.container[endIndex] = fetchedValue
    }
}

class CircularArray(val size: Int) {

    val container = IntArray(size)
    var startIndex = 0
    var endIndex = size - 1


    fun updateStartIndex() {
        startIndex = (startIndex + 1) % size
    }

    fun updateEndIndex() {
        endIndex = (endIndex + 1) % size
    }

    fun moveElementsOneStepTowardsIndexRemoved(indexRemoved: Int) {
        var indexRemoved = indexRemoved

        while (indexRemoved != endIndex) {
            val i = (indexRemoved + 1) % size
            container[indexRemoved] = container[i]
            indexRemoved = (indexRemoved + 1) % size
        }
    }
}
