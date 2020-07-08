#include <stdio.h>

int main() {
	freopen("C.inp", "r", stdin);
	freopen("C.out", "w", stdout);

	int x11, x21, y11, y21;
	int x12, x22, y12, y22;

	scanf("%d %d %d %d", &x11, &y11, &x21, &y21);
	scanf("%d %d %d %d", &x12, &y12, &x22, &y22);

	int area1 = (x21 - x11) * (y21 - y11);
	int area2 = (x22 - x12) * (y22 - y12);

	int overlapX = 0;
	int overlapY = 0;
	if (x12 > x11 && x21 > x12) {
        overlapX = x21 - x12;
	} else if (x11 > x12 && x11 < x22) {
        overlapX = x22 - x11;
	}

	if (y12 > y11 && y21 > y12) {
        overlapY = y21 - y12;
	} else if (y11 > y12 && y11 < y22) {
        overlapY = y22 - y11;
	}

	int overlapArea = overlapX * overlapY;

	printf("%d", (area1 - overlapArea) + (area2 - overlapArea));

	return 0;
}
