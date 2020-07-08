#include <stdio.h>

void flushstdin(void) {
    int c;
    while((c = getchar()) != '\n' && c != EOF);
}

int main() {
    freopen("B.inp", "r", stdin);
    freopen("B.out", "w", stdout);

    /* CODE */

    int t;

    long long int y;

    scanf("%d", &t);
    flushstdin();

    for (int i = 0; i < t; i++) {
        scanf("%lld", &y);
        flushstdin();

        printf("%lld\n", y+1);
    }

    return 0;
}

