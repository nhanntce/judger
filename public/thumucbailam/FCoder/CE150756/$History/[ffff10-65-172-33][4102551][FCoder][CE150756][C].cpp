#include <stdio.h>

int main() {
	freopen("C.inp", "r", stdin);
	freopen("C.out", "w", stdout);
	// Your code
    int A_x1, A_y1, A_x2, A_y2;
    scanf("%d %d %d %d", &A_x1, &A_y1, &A_x2, &A_y2);
    int B_x1, B_y1, B_x2, B_y2;
    scanf("%d %d %d %d", &B_x1, &B_y1, &B_x2, &B_y2);
    long long sum = 0;
    sum = (A_x2 - A_x1)*(A_y2 - A_y1) + (B_x2 - B_x1)*(B_y2 - B_y1);
    long long x = 0;
    long long y = 0;
    // x trung
    if (B_x2 >= A_x2)
    {
        if (B_x1 <= A_x1)
        {
            x = A_x2 - A_x1;
        }
        if (B_x1 > A_x1)
        {
            x = A_x2 - B_x1;
        }
    }
    else
    {
        if (A_x1 <= B_x1)
        {
            x = B_x2 - B_x1;
        }
        if (A_x1 > B_x1)
        {
            x = B_x2 - A_x1;
        }
    }
    // y trung
    if (B_y2 >= A_y2)
    {
        if (B_y1 <= A_y1)
        {
            y = A_y2 - A_y1;
        }
        if (B_y1 > A_y1)
        {
            y = A_y2 - B_y1;
        }
    }
    else
    {
        if (A_y1 <= B_y1)
        {
            y = B_y2 - B_y1;
        }
        if (A_y1 > B_y1)
        {
            y = B_y2 - A_y1;
        }
    }
    sum -= (x * y)*2;
    printf("%lld", sum);
	return 0;
}

