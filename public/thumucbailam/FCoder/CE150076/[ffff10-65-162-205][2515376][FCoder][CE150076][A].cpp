#include <bits/stdc++.h>

using namespace std;

long n;
int mu(int x, int y)
{
   int res=1;
   for (int i=1; i<=y;i++)  res = (res*x)%10;
   return res;
}  
int main()
{
    freopen("A.inp", "r", stdin);
    freopen("A.out", "w", stdout);
    cin>>n;
    cout<< mu(8,n);
    return 0;
}
