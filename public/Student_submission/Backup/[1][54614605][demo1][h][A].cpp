#include <stdio.h>

using namespace std;

int main()
{
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
    float L, R, K;

    scanf("%f %f %f", &L, &R, &K);

    if (L>=R && R>=K)
        printf("Leonardo\nRemi\nKen");
    else if (L>=K && K>=R)
        printf("Leonardo\nKen\nRemi");
    else if (R>=L && L>=K)
        printf("Remi\nLeonardo\nKen");
    else if (R>=K && K>=L)
        printf("Remi\nKen\nLeonardo");
    else if (K>=R && R>=L)
        printf("Ken\nRemi\nLeonardo");
    else if (K>=L && L>=R)
        printf("Ken\nLeonardo\nRemi");


    return 0;
}
