#include <stdio.h>

int main()
{
char *ptr  = (char*) malloc(10);
ptr[10] = 'c';
char buff[10] = {0};
strcpy(buff, "This String Will Overflow the Buffer");
}
