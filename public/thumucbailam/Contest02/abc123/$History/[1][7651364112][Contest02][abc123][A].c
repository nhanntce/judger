#include <stdio.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	int test;
	scanf("%d", &test);
	while (test--) {
        long long n;
        scanf("%d", &n);
        printf("%d\n", n+1);
	}
	return 0;
}
