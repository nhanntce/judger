#include <stdio.h>

int main() {
	freopen("B.inp", "r", stdin);
	freopen("B.out", "w", stdout);
	// Your code
	
	int num;
  scanf("%d", &num);
  for (int i=1; i<=num; i++){
    int a;
    scanf("%d", &a);
    if (i==num)
      printf("%d", a+1);
    else
      printf("%d\n", a+1);
	return 0;
}