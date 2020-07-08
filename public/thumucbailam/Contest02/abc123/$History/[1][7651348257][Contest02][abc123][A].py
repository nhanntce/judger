import sys
sys.stdin = open('A.inp', 'r')
sys.stdout = open('A.out', 'w')

n = int(input())
for _ in range(n):
    t = int(input())
    print(t+1)
