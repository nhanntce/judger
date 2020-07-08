#include <stdio.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	int n,m,i,h;
	scanf("%d", &n);
	for(i=0,h=8;i<=n;++i)
        m=h*h;
    printf("%d", m);
	return 0;
}

