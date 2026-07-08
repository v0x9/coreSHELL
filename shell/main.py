import sys
import os
import subprocess
import shlex
import readline

my_map = {"echo": True, "exit": True, "type": True, "pwd": True, "history": True}
last_was_ambiguous = False
last_text = ""
commands = ["echo", "exit"]

def find_in_path(cmd_name):
    """
    Unified helper to search for an executable in the system's PATH.
    """
    pwd = os.environ.get('PATH', '').split(":")
    for directory in pwd:
        if not directory:
            continue
        full_path = os.path.join(directory, cmd_name)
        if os.path.isfile(full_path) and os.access(full_path, os.X_OK):
            return full_path
    return None

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

def run_pipe(cmd1):
    prev_read = None # store the old command stdout to route to current pipe write
    pids = []
    for i, cmd in enumerate(cmd1):
        if i < len(cmd1) - 1:
            read_fd, write_fd = os.pipe()
        else:
            read_fd, write_fd = None, None    

        pid = os.fork()
        if pid == 0:
            if prev_read is not None:
                os.dup2(prev_read, 0)

            if write_fd is not None:
                os.dup2(write_fd, 1)

            if prev_read is not None:
                os.close(prev_read)

            if read_fd is not None:
                os.close(read_fd)
            if write_fd is not None:
                os.close(write_fd)
            if cmd[0] == "echo":
                echo(cmd)
                os._exit(0)     
            elif cmd[0] == "type":
                type_cmd(cmd)
                os._exit(0)    
            else:
                exec_path = find_in_path(cmd[0])
                if exec_path:
                    os.execvp(exec_path, cmd)
                else:
                    print(f"{cmd[0]}: command not found", file=sys.stderr)
                    os._exit(127)
                             
        pids.append(pid)

        if prev_read is not None:
            os.close(prev_read)
        if write_fd is not None:
            os.close(write_fd)

        prev_read = read_fd

    for a in pids:
        os.waitpid(a, 0)
                
def longest_common_prefix(matches):
    if not matches:
        return ""

    min_len = min(len(s) for s in matches)
    prefix = ""

    for i in range(min_len):
        ch = matches[0][i]

        for s in matches:
            if s[i] != ch:
                return prefix

        prefix += ch

    return prefix

def completer(text, state):
    global last_was_ambiguous, last_text
    cmd_matches = commands
    if state == 0:
        cmd_matches = [c for c in commands if c.startswith(text)]
        exe_matches = get_executables(text)
        matches = cmd_matches + exe_matches
        matches = sorted(set(matches))
        if not matches:
            last_was_ambiguous = False
            return None

        if len(matches) == 1:
            last_was_ambiguous = False
            return matches[0] + " "
        if last_was_ambiguous and last_text == text:
            print()
            print("  ".join(matches))
            print("$ " + readline.get_line_buffer(), end="", flush=True)
            last_was_ambiguous = False
        else:
            lcp = longest_common_prefix(matches)
            if len(lcp) > len(text):
               return lcp  
            
            sys.stdout.write("\x07")
            sys.stdout.flush()
            last_was_ambiguous = True
            last_text = text

        return None

    return None

def get_executables(prefix):
    matches = set()
    paths = os.environ.get("PATH", "").split(":")

    for p in paths:
        try:
            for name in os.listdir(p):
                if name.startswith(prefix):
                    full = os.path.join(p, name)
                    if os.access(full, os.X_OK) and not os.path.isdir(full):
                        matches.add(name)
        except FileNotFoundError:
            pass

    return sorted(matches)

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
