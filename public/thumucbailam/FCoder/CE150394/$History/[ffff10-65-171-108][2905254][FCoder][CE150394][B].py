import sys
sys.stdin = open('B.inp', 'r')
sys.stdout = open('B.out', 'w')

n = int(input())

for i in range(n):
    y = int(input())
    if y == 0:
        print(1)
        break
    x = 2**y
    count = 0
    for j in range(1, x + 1):
        if x % j == 0:
            count += 1
    print(count)