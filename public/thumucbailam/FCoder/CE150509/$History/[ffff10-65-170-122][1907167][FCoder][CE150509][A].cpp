#include <stdio.h>

using namespace std;

int main() {
    
    freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);

    long n;
    scanf("%ld", &n);

    if (n == 0)
        printf("1");
    else if (n == 1)
        printf("8");
    else
    {

        long long total = 8;

        for (int i = 1; i < n; ++i)
            total *= 8;

        printf("%d", total % 10);
    }

    return 0;
}
