#include <stdio.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	int n,s,i,h;
	scanf("%d", &n);
	for( i=1,s=1,h=8; i<=n; ++i)
        {
            s=s*h;
        }
        printf("%d", s);
	return 0;
}

