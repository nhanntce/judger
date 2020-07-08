#include <stdio.h>
#include<math.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	long long n,s,i,h;
	scanf("%lld", &n);
	for( i=1,s=1,h=8; i<=n; ++i)
        {
            s=s*h;
        }
        printf("%lld", s);
	return 0;
}
