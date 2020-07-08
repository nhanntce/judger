#include <stdio.h>

int main()
{
char *ptr  = (char*) malloc(100);
ptr[100] = 'c';
}