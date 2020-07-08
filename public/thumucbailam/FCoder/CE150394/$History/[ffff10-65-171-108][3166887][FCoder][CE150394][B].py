import sys
sys.stdin = open('B.inp', 'r')
sys.stdout = open('B.out', 'w')

n = int(input())

for i in range(n):
    y = int(input())
    x = 2**y
    if y == 0:
        count = 1
    else:
        count = 0
    for j in range(1, x // 2 + 1):
        if x % j == 0:
            if x == j*j:
                count += 1
            else:
                count += 2
    print(count)