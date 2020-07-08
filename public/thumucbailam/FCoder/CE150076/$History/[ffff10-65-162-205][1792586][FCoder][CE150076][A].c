#include <bits/stdc++.h>

using namespace std;

long n;
int mu(int x, int y)
{
    if (y == 1) return x;
    if (y%2 == 0) return mu(x,y/2)* mu(x,y/2)
    else return mu(x,y/2)*mu(x,y/2)*8;
}
int main()
{
     freopen("A.inp", "r", stdin);
    freopen("A.out", "w", stdout);
    cin>>n;
    cout<< mu(8,n);
    return 0;
}
