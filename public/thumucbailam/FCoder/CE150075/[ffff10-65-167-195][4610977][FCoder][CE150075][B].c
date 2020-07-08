#include <stdio.h>
#include <math.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	//Code
	int a[10];
	int sum = 0;
	int tc; //test case
	scanf("%d",&tc);
	for (int i=0;i<tc;i++){
        scanf("%d",&a[i]);
        int r = (int)pow(2,a[i]);
        for (int j=1;j<=r;j++){
            if ((r%j)==0) {
                sum ++;
            }
        }
        printf("%d\n",sum);
        sum = 0;
	}
	return 0;
}

