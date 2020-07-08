#include <stdio.h>

int main() {
	freopen("B.inp", "r", stdin);
	freopen("B.out", "w", stdout);

	int step;
	scanf("%d", &step);

	for (int s = 0; s < step; s++) {
        int raw;
        scanf("%d", &raw);

        int pow = powOf2(raw);

        int sum = 0;
        for (int i = 1; i <= pow; i*=2) {
            if (pow % i == 0) {
                sum += i;
            }
        }
        printf("%d\n", sum);
	}

	return 0;
}

int powOf2(int num) {
    int pow = 1;
    for (int i = 0; i < num; i++) {
        pow *= 2;
    }
    return pow;
}
