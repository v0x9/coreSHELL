import sys
import os
import subprocess
import shlex
import readline

from core.utils import find_in_path
from core.completer import completer
from core.executor import run_pipe
from builtins.commands import echo, type_cmd

def main():
    history = []
    hist_index = 0
    readline.set_completer(completer)
    readline.parse_and_bind("tab: complete")

    histfile = os.environ.get("HISTFILE")
    if histfile is not None:
        with open(histfile, "r") as f:
            for line in f:
                line = line.rstrip("\n")
                history.append(line)
        hist_index = len(history)

    while True:
        try:
            command = input("$ ")
        except (EOFError, KeyboardInterrupt):
            print()
            continue

        list_command = shlex.split(command)
        if not list_command:
            continue

        history.append(command)
        pipeflag = False
        sort_inputf1 = []
        temp_input = []
        
        for x in list_command:
            if x == "|":
                pipeflag = True
                sort_inputf1.append(temp_input)
                temp_input = []
                continue
            temp_input.append(x)
        sort_inputf1.append(temp_input)     
            
        if list_command[0] == "exit":
            if histfile is not None:
                with open(histfile, "a") as f:
                    for i in range(hist_index, len(history)):
                        f.write(f"{history[i]}\n") 
                    hist_index = len(history)  
            break
        
        elif pipeflag:
            run_pipe(sort_inputf1)
            pipeflag = False
            
        elif list_command[0] == "history":
            if len(list_command) == 1:
                i = 0
                for x in history:
                    print(f'  {i} {x}')
                    i = i + 1
            elif len(list_command) == 3 and list_command[1] == "-r":
                with open(list_command[2], "r") as f:
                    for line in f:
                        line = line.rstrip("\n")
                        history.append(line)
            elif len(list_command) == 3 and list_command[1] == "-w":
                with open(list_command[2], "w") as f:
                    for x in history:
                        f.write(f"{x}\n")
            elif len(list_command) == 3 and list_command[1] == "-a":
                with open(list_command[2], "a") as f:
                    for i in range(hist_index, len(history)):
                        f.write(f"{history[i]}\n") 
                    hist_index = len(history)  
            elif len(list_command) == 2:
                i = len(history) - int(list_command[1])
                for idx in range(i, len(history)):
                    print(f'  {idx} {history[idx]}')

        elif list_command[0] == "ls":
            exec_path = find_in_path(list_command[0])
            if exec_path:
                sort_inputls = []
                sort_outputls = []
                aeflag = False
                eflag = False
                aflag = False
                f_switch = False

                for x in list_command:
                    if x in (">", "1>", "2>", "1>>", ">>", "2>>"):
                        if x == "2>":
                            eflag = True
                        if x in ("1>>", ">>"):
                             aflag = True
                        if x == "2>>":
                             aeflag = True         
                        f_switch = True
                        continue
                    if not f_switch:
                        sort_inputls.append(x)
                    else:
                        sort_outputls.append(x)

                if f_switch:
                    result = subprocess.run(
                        sort_inputls,
                        executable=exec_path,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                    if eflag:
                        if result.stdout:
                             print(result.stdout, end="")
                        with open(sort_outputls[0], "w") as f:
                             f.write(result.stderr)  
                    elif aeflag:
                         if result.stdout:
                             print(result.stdout, end="")
                         with open(sort_outputls[0], "a") as f:
                             f.write(result.stderr)            
                    elif aflag:
                        if result.stderr:
                             print(result.stderr, end="")
                        with open(sort_outputls[0], "a") as f:
                             f.write(result.stdout)               
                    else:
                        if result.stderr:
                             print(result.stderr, end="")
                        with open(sort_outputls[0], "w") as f:
                             f.write(result.stdout)
                else:  
                    subprocess.run(sort_inputls, executable=exec_path)
            else:      
                print(f"{list_command[0]}: command not found")

        elif list_command[0] in ("cat", "tail"):
            tswitch = list_command[0] == "tail"
            exec_path = find_in_path(list_command[0])
            if exec_path:
                aeflag = False
                eflag = False
                piflag = False
                f_switch = False
                sort_inputf = []
                sort_outputf = []
                for x in list_command:
                    if x in (">", "1>", "2>", "2>>", "|"):
                        if x == "2>":
                             eflag = True
                        if x == "2>>":
                             aeflag = True  
                        if x == "|":
                             piflag = True       
                        f_switch = True
                        continue
                    if not f_switch:
                        sort_inputf.append(x)
                    else:
                        sort_outputf.append(x)   
                    
                if piflag:
                   run_pipe(sort_inputf) 
                   continue

                if f_switch:
                    result = subprocess.run(
                        sort_inputf,
                        executable=exec_path,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                    if eflag:
                        if result.stdout:
                             print(result.stdout, end="")
                        with open(sort_outputf[0], "w") as f:
                             f.write(result.stderr)     
                    elif aeflag:
                         if result.stdout:
                             print(result.stdout, end="")
                         with open(sort_outputf[0], "a") as f:
                             f.write(result.stderr)              
                    else:
                        if result.stderr:
                            print(result.stderr, end="")
                        with open(sort_outputf[0], "w") as f:
                            f.write(result.stdout)
                else:  
                    subprocess.run(sort_inputf, executable=exec_path)
            else:      
                print(f"{list_command[0]}: command not found")

        elif list_command[0] == "cd":
            if len(list_command) > 1 and list_command[1] == '~':
                x = os.path.expanduser("~")
                os.chdir(x)
                continue

            if len(list_command) == 1:
                os.chdir(os.path.expanduser("~"))
                continue
            if os.path.isdir(list_command[1]):
                os.chdir(list_command[1])
            else:
                print(f'cd: {list_command[1]}: No such file or directory')    

        elif list_command[0] == "pwd":
            print(os.getcwd())

        elif list_command[0] == "echo":
            y = shlex.split(command)
            y1 = y[1:]
            y1 = (" ").join(y1)
            
            if len(y) > 2 and y[2] in (">", "1>", "2>", "1>>", ">>", "2>>"):
                if y[2] == "2>":
                         print(y[1])
                         with open(y[3], "w") as f:
                            f.write("")        
                elif y[2] == "2>>":
                         print(y[1])
                         with open(y[3], "a") as f:
                            f.write("")                                
                elif y[2] in ("1>>", ">>"):
                    with open(y[3], "a") as f:
                         f.write(y[1] + "\n")           
                else:
                    with open(y[3], "w") as f:
                        f.write(y[1] + "\n")
            else:
                print(y1)
                        
        elif list_command[0] == "type":
            type_cmd(list_command)

        else:
            exec_path = find_in_path(list_command[0])
            if exec_path:
                subprocess.run(list_command, executable=exec_path)
            else:      
                print(f"{list_command[0]}: command not found")

if __name__ == "__main__":
    main()
