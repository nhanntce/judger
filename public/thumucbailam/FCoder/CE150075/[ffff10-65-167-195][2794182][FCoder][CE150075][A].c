#include <stdio.h>
#include <math.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	int n;
	scanf("%d",&n);
	int v = ((int)pow(8,n))%10;
	printf("%d",v);
	return 0;
}