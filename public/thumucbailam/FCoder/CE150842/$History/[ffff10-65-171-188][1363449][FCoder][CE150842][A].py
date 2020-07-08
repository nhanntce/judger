import sys
sys.stdin = open('A.inp', 'r')
sys.stdout = open('A.out', 'w')

a = int(input())
print(8**a % 10)