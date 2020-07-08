#include <stdio.h>

using namespace std;

int main() {

    freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);

    int n;
    scanf("%d", &n);

    while (n > 4)
    {
        n -= 4;
    }

    if (n == 0)
        printf("1");
    else if (n == 1)
        printf("8");
    else if (n == 2)
        printf("4");
    else if (n == 3)
        printf("2");
    else
        printf("6");

    return 0;
}
