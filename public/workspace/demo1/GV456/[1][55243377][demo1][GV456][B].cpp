#include <stdio.h>

using namespace std;

int main()
{

    int n, i, a[100], oldValue, newValue;

    scanf("%d", &n);
    scanf("%d %d", &oldValue, &newValue);
    for (i=0; i<n; ++i)
        scanf("%d", &a[i]);

    for (i=0; i<n; ++i)
        if (a[i] == oldValue)
            a[i] = newValue;

    for (i=0; i<n; ++i)
        printf("%d ", a[i]);

    return 0;
}
