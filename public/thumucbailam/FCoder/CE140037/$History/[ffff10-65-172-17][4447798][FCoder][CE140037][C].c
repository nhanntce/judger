#include <stdio.h>

void flushstdin(void) {
    int c;
    while((c = getchar()) != '\n' && c != EOF);
}

int main() {
    freopen("C.inp", "r", stdin);
    freopen("C.out", "w", stdout);

    /* CODE */

    int x1, y1, x2, y2;
    int x11, y11, x22, y22;

    scanf("%d %d %d %d", &x1, &y1, &x2, &y2);
    flushstdin();

    scanf("%d %d %d %d", &x11, &y11, &x22, &y22);

    int rec1 = abs((x2 - x1))*abs((y2 - y1));
    int rec2 = abs((x22 - x11))*abs((y22 - y11));
    int overlap;

    if (x2 > y11 && y2 > y11)
        overlap = abs((x2 - x11))*abs((y2 - y11))*2;

    printf("%d", abs(rec1) + abs(rec2) - abs(overlap));

    return 0;
}
