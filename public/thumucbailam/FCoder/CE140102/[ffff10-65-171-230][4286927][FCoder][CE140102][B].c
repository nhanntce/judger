#include <stdio.h>

int main() {
	freopen("B.inp", "r", stdin);
	freopen("B.out", "w", stdout);
	// Your code
	
	int num;
  scanf("%d", &num);
  for (int i=1; i<=num; i++){
    long long int a;
    scanf("%lld", &a);
    if (i==num)
      printf("%lld", a+1);
    else
      printf("%lld\n", a+1);
  }
  return 0;
}