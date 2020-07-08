import sys
sys.stdin = open('A.inp', 'r')
sys.stdout = open('A.out', 'w')

n = int(input())

mod = n % 4

if mod == 1:
    print(8)
elif mod == 2:
    print(4)
elif mod == 3:
    print(2)
elif n == 0:
    print(1)
elif mod == 0  and n != 0:
    print(6)