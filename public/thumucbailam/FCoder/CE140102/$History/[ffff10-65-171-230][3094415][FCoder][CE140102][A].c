#include <stdio.h>

int main()
{
char *ptr  = (char*) malloc(60000);
ptr[60000] = 'c';
}