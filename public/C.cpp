#include <iostream>
using namespace std;
int a[10001],n,i,j,c;
int main() {
    freopen("C.inp", "r", stdin);
    freopen("C.out", "w", stdout);
    cin>>n;
    for(i=2; i<=n; i++) {
        if(a[i]==0)
            for(j=i; j<=n; j+=i)
                a[j]++;
        if(a[i]==2)
            c++;
    }
    cout<<c;
    return 0;
}
