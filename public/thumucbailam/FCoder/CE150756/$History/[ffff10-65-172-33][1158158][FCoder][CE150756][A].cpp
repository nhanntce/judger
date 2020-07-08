#include <stdio.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	// Your code
	int n;
	scanf("%d", &n);
	int remain = n % 4;
	if (n == 1)
    {
        printf("8");
    }
    else if (n == 2)
    {
        printf("4");
    }
    else if (n == 3)
    {
        printf("2");
    }
    else if (n == 0)
    {
        printf("6");
    }
	return 0;
}
