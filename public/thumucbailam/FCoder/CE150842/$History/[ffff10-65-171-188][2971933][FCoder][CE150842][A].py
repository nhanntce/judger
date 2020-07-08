import sys
sys.stdin = open('A.inp', 'r')
sys.stdout = open('A.out', 'w')

something = [8,4,2,6]
a = int(input())
while a > 4:
    a -= 4
a -= 1
print(something[a], end='')