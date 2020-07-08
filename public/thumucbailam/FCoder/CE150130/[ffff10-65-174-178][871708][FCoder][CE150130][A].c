#include <stdio.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);

	int p;
	scanf("%d", &p);

	int result = 1;
	for (int i = 0; i < p; i++) {
        result = (result * 8) % 10;
	}

	printf("%d", result);

	return 0;
}

