#include <stdio.h>
#include <math.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	int a[10];
	int sum = 0;
	int tc;
	scanf("%d",&tc);
	for (int i=0;i<tc;i++){
        scanf("%d",&a[i]);
        for (int j=1;j<=a[i];j++){
            if ((a[i]%j)==0) {
                sum += j;
            }
        }
        printf("%d\n",sum);
        sum = 0;
	}
	return 0;
}