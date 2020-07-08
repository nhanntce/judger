#include <stdio.h>

int main() {
	freopen("A.inp", "r", stdin);
	freopen("A.out", "w", stdout);
	// Your code
	
	int num;
  scanf("%d", &num);
  if (num==0){
    printf("%d", 1);
  }
  else {
    // 1: 8
    // 2: 4
    // 3: 2
    // 4: 6
    // 5: 8
    // 6: 4
    if (num%4==1){
      printf("%d", 8);
    }
    else if(num%4==2){
      printf("%d", 4);
    }
    else if (num%4==3){
      printf("%d", 2);
    }
    else {
      printf("%d", 6);
    }
  }
	return 0;
}