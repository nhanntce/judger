#include <stdio.h>

int main() {
	freopen("B.inp", "r", stdin);
	freopen("B.out", "w", stdout);
	// Your code
	int t;
	scanf("%d", &t);
	while (t--)
	{
	    long long y;
	    scanf("%lld", &y);
	    printf("%lld\n", y + 1);
	}
	return 0;
}
