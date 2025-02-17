# Design-Most-Recently-Used-Queue
Challenge at LeetCode.com. Tags: Square Root Decomposition Technique, Design, Circular Array, Compressed Queue.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

The purpose of the presented solutions is to demonstrate the Square Root Decomposition Technique. Thus, we design chained compressed sections (buckets), whose number is equal to the square root of the input upper limit. If the square root has a remainder, then the size of the last compressed section<br/> will be less than the size of the previous compressed sections.

By this problem we have to remove a random element from a certain compressed section as well as move the first element of the subsequent compressed section to the last elements of the previous compressed section in order to restore the original length of the compressed sections.

One way to do this efficiently is by representing each compressed section with a Linked List. Another possibility is to create a customizedCircular Array, where instead of  physically removing an element, we only shift the start index and the end index of the arrayin a circular manner. The solutions here apply the latter approach, namely, representing each compressed section with a Circular Array. 

An important note about this problem: since the input range is very small [1, 2000], as of February 2025, a brute force solution, which is the easiest thing to do, and takes far less lines of code, can be as fast or even faster than an efficient solution. This, however, will not be the case at all with a large amount of input. With many efficient algorithms for large amounts of data, it takes some time, however small it might be, to initialize all the data structures that will make the algorithm efficient. It is like a person running along a train that is just starting: at the beginning, surely, you can outrun the train. 

Of course, an important consideration by designing software solutions is to take into account the range of input, and if not necessary, not to complicatethe solutions with complex algorithms. However, the purpose here is to demonstrate a scalable approach to the problem. 
