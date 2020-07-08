#include <stdio.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	// Your code
	int n;
	scanf("%d", &n);
    if (n != 0)
    {
        int remain = n % 4;
        if (remain == 1)
        {
            printf("8");
        }
        else if (remain == 2)
        {
            printf("4");
        }
        else if (remain == 3)
        {
            printf("2");
        }
        else if (remain == 0)
        {
            printf("6");
        }
    }
    else
    {
        printf("1");
    }
	return 0;
}
