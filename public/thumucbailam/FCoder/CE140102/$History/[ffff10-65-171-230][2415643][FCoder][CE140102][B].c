#include <stdio.h>

int main() {
    freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	
  int num;
  scanf("%d", &num);
  for (int i=1; i<=num; i++){
    int a;
    scanf("%d", &a);
    printf("%d\n", a+1);
    //0: 1
    //1: 2
    //2: 3
    //3: 4
    //4: 5 
  }
  return 0;
}