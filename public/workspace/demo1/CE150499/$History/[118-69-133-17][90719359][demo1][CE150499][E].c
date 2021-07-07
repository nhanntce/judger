
//Min
//C code to linearly search x in arr[]. If x
// is present then return its location, otherwise
// return -1

#include <stdio.h>

int search(int arr[], int n)
{
    int i;
    int maxV = arr[0];
    for (i = 1; i < n; i++)
        if (arr[i] > maxV)
            maxV = arr[i];
    return maxV;
}

// Driver code
int main(void)
{
    int n;
    int arr[100];
    scanf("%d", &n);
    for (int i=0; i<n; ++i)
        scanf("%d", &arr[i]);
    // Function call
    int result = search(arr, n);
    printf("%d", result);

    return 0;
}
