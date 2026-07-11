import os
from core.utils import find_in_path

my_map = {"echo": True, "exit": True, "type": True, "pwd": True, "history": True}

def echo(command):
    y1 = command[1:]
    y1 = (" ").join(y1)
    print(y1)
                
def type_cmd(list_command):
    if len(list_command) < 2:
        return
    if list_command[1] in my_map:
        print(f"{list_command[1]} is a shell builtin")
    else:
        exec_path = find_in_path(list_command[1])
        if exec_path:
            print(f"{list_command[1]} is {exec_path}")
        else:      
            print(f"{list_command[1]}: not found")
