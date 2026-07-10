import os
import sys
from core.utils import find_in_path
from builtins.commands import echo, type_cmd

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
