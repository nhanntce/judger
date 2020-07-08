#include <stdio.h>

using namespace std;

int main() {

    freopen("A.inp", "r", stdin);
    freopen("A.out", "w", stdout);

    long long n;
    scanf("%lld", &n);
    long long total = 8;

    for (int i = 1; i < n; ++i)
        total *= 8;

    printf("%d", total % 10);

    return 0;
}
