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

    long int y;

    scanf("%d", &t);
    flushstdin();

    for (int i = 0; i < t; i++) {
        scanf("%ld", &y);
        flushstdin();

        printf("%ld\n", y+1);
    }

    return 0;
}

