#include <stdio.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);

    /* CODE */

	int num;

	scanf("%d", &num);

    if (num == 0) printf("1");
    else if ((num + 1) % 4 == 0) printf("2");
    else if ((num + 2) % 4 == 0) printf("4");
    else if ((num + 3) % 4 == 0) printf("8");

	return 0;
}

