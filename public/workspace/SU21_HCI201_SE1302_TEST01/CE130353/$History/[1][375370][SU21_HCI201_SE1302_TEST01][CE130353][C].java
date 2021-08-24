import java.util.Scanner;

public class TestFormat {
   
    /**
     * 
     * main  
     */
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        int n = s.nextInt();
        //input data
        long[] arr = new long[n];
        for (int i = 0; i < n; i++) {
            arr[i] = s.nextLong();
        }
        //call quicksort function
        quickSort(arr, 0, n - 1);
        //display data
        if (arr.length == 1) {// if arr have one element
            System.out.print(arr[arr.length - 1]);
        } else {
            for (int i = 0; i < arr.length - 1; i++) {
                System.out.print(arr[i] + " ");//print item
            }
            //print last element
            System.out.print(arr[arr.length - 1]);
        }
    }
    
    /**
     * 
     * quick sort
     */
    static void quickSort(long[] arr, int low, int high) {
        if (low < high) {

            // pi is partitioning index, arr[p]
            // is now at right place
            int pi = partition(arr, low, high);

            // Separately sort elements before
            // partition and after partition
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }

    /**
     * 
     * partition 
     */
    static int partition(long[] arr, int low, int high) {
        // pivot
        long pivot = arr[high];
        // indicates the right position
        // of pivot found so far
        int i = (low - 1);
        // Index of smaller element and
        for (int j = low; j <= high - 1; j++) {

            // If current element is smaller
            // than the pivot
            if (arr[j] < pivot) {
                // Increment index of
                // smaller element
                i++;
                swap(arr, i, j);
            }
        }
        swap(arr, i + 1, high);//swap it
        return (i + 1);//return value
    }

    /**
     * 
     * swap element 
     */
    static void swap(long[] arr, int i, int j) {
        //set element to tmp variable
        long temp = arr[i];
        //swap it
        arr[i] = arr[j];
        arr[j] = temp;
    }
}