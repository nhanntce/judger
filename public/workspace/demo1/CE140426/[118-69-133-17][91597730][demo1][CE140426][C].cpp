
// C code to linearly search x in arr[]. If x
// is present then return its location, otherwise
// return -1
//d
#include <stdio.h>

int search(int arr[], int n, int x)
{
    int i;
    for (i = 0; i < n; i++)
        if (arr[i] == x)
            return i;
    return -1;
}

// Driver code
int main(void)
{
    int n, x;
    int arr[100];
    scanf("%d", &n);
    scanf("%d", &x);
    for (int i=0; i<n; ++i)
        scanf("%d", &arr[i]);
    // Function call
    int result = search(arr, n, x);
    printf("%d", result);

    return 0;
}
