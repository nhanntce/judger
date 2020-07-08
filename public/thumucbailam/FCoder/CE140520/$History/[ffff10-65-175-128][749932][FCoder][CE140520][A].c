
#include <stdio.h>

int main()
{   freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	int n = scanf(stdin);
    int b[] = {8,4,2,6};
    printf("%d",b[logcc(n)]);
    return 0;
}

int logcc(int a){
    int b = 0;
    if(a/8 > 0){
        b++;
        a/=8;
    }
    return b;
}
