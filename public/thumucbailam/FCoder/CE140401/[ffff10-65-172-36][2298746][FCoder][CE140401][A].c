import sys
sys.stdin = open('A.inp', 'r')
sys.stdout = open('A.out', 'w')

i=int(input())
if(i==0):
  print(1)
if(i%4==0):
  print(6)
elif(i%3==0):
  print(2)
elif(i%2==0):
  print(4)
else:
  print(8)